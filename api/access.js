import crypto from "node:crypto";

const ACCESS_COOKIE = "mb_access";
const ONE_MONTH_SECONDS = 60 * 60 * 24 * 31;
const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 183;
const SHARE_TOKEN_SECONDS = 60 * 60 * 24 * 7;
const SHARE_TOKEN_PURPOSE = "demo-share-access";
const MIN_COOKIE_SECRET_LENGTH = 32;

function readConfiguration() {
  const password = process.env.ACCESS_PASSWORD;
  const cookieSecret = process.env.ACCESS_COOKIE_SECRET;

  if (
    typeof password !== "string" ||
    password.length === 0 ||
    typeof cookieSecret !== "string" ||
    cookieSecret.length < MIN_COOKIE_SECRET_LENGTH
  ) {
    return null;
  }

  return { password, cookieSecret };
}

function safeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;

  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function encodeSignedPayload(payload, secret) {
  const encoded = toBase64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded, secret)}`;
}

function decodeSignedPayload(value, secret) {
  if (!value || typeof value !== "string") return null;

  const parts = value.split(".");
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  if (!encoded || !signature || !safeEqual(sign(encoded, secret), signature)) return null;

  try {
    return JSON.parse(fromBase64Url(encoded));
  } catch {
    return null;
  }
}

function encodeAccessCookie(expiresAt, secret) {
  return encodeSignedPayload({ expiresAt }, secret);
}

function encodeShareToken(secret) {
  return encodeSignedPayload(
    {
      purpose: SHARE_TOKEN_PURPOSE,
      expiresAt: Date.now() + SHARE_TOKEN_SECONDS * 1000,
    },
    secret,
  );
}

function isShareTokenValid(token, secret) {
  const payload = decodeSignedPayload(token, secret);
  return Boolean(
    payload?.purpose === SHARE_TOKEN_PURPOSE &&
      Number.isFinite(payload.expiresAt) &&
      payload.expiresAt > Date.now(),
  );
}

function parseCookies(cookieHeader = "") {
  const cookies = {};

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName) continue;

    try {
      cookies[rawName] = decodeURIComponent(rawValue.join("="));
    } catch {
      // Ignore malformed values. A broken cookie must never crash the access endpoint.
    }
  }

  return cookies;
}

function serializeCookie(name, value, maxAge, req) {
  const secure =
    Boolean(process.env.VERCEL) ||
    req.headers["x-forwarded-proto"] === "https" ||
    req.headers["x-forwarded-ssl"] === "on";
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];

  if (secure) parts.push("Secure");

  return parts.join("; ");
}

function isAccessValid(cookies, secret) {
  const payload = decodeSignedPayload(cookies[ACCESS_COOKIE], secret);
  return Boolean(Number.isFinite(payload?.expiresAt) && payload.expiresAt > Date.now());
}

function safeReturnTo(value) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  if (
    value.includes("\\") ||
    Array.from(value).some((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint !== undefined && (codePoint <= 31 || codePoint === 127);
    })
  ) {
    return "/";
  }
  if (value.startsWith("/api/") || value.startsWith("/access.html")) return "/";
  return value;
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  const rawBody = req.body && typeof req.body === "string" ? req.body : await readStream(req);
  const contentType = req.headers["content-type"] || "";

  if (!rawBody) return {};

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(rawBody));
  }

  return {};
}

function readStream(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding?.("utf8");
    req.on?.("data", (chunk) => {
      data += chunk;
    });
    req.on?.("end", () => resolve(data));
    req.on?.("error", reject);

    if (!req.on) resolve("");
  });
}

function isFormRequest(req) {
  const contentType = req.headers["content-type"] || "";
  return contentType.includes("application/x-www-form-urlencoded");
}

function redirectToAccess(res, returnTo) {
  const target = new URL("/access.html", "https://local.app");
  target.searchParams.set("error", "incorrect");
  target.searchParams.set("returnTo", returnTo);
  res.statusCode = 303;
  res.setHeader("Location", `${target.pathname}${target.search}`);
  res.end();
}

function redirectAfterLogin(res, returnTo, cookies = []) {
  if (cookies.length > 0) {
    res.setHeader("Set-Cookie", cookies);
  }
  res.statusCode = 303;
  res.setHeader("Location", returnTo);
  res.end();
}

function sendJson(res, status, payload, cookies = []) {
  if (cookies.length > 0) {
    res.setHeader("Set-Cookie", cookies);
  }
  res.status(status).json(payload);
}

export default async function handler(req, res) {
  const configuration = readConfiguration();
  if (!configuration) {
    sendJson(res, 503, { ok: false, message: "Access service is not configured." });
    return;
  }

  const { password: configuredPassword, cookieSecret } = configuration;
  const cookies = parseCookies(req.headers.cookie);

  if (req.method === "GET") {
    const url = new URL(req.url || "/api/access", "https://local.app");
    const mode = url.searchParams.get("mode");

    if (mode === "share-token") {
      if (!isAccessValid(cookies, cookieSecret)) {
        sendJson(res, 401, { ok: false, message: "Access required." });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        token: encodeShareToken(cookieSecret),
        expiresIn: SHARE_TOKEN_SECONDS,
      });
      return;
    }

    sendJson(res, 200, { authenticated: isAccessValid(cookies, cookieSecret) });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    sendJson(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  const body = await readRequestBody(req);
  const shareToken = body.shareToken;
  const now = Date.now();
  if (typeof shareToken === "string" && isShareTokenValid(shareToken, cookieSecret)) {
    const maxAge = SIX_MONTHS_SECONDS;
    const expiresAt = now + maxAge * 1000;
    const accessCookie = serializeCookie(
      ACCESS_COOKIE,
      encodeAccessCookie(expiresAt, cookieSecret),
      maxAge,
      req,
    );

    sendJson(res, 200, { ok: true, expiresAt, tokenAccess: true }, [accessCookie]);
    return;
  }

  const submittedPassword = body.password;
  const remember = body.remember === true || body.remember === "on" || body.remember === "true";
  const returnTo = safeReturnTo(body.returnTo);

  if (!safeEqual(submittedPassword, configuredPassword)) {
    if (isFormRequest(req)) {
      redirectToAccess(res, returnTo);
      return;
    }

    sendJson(res, 401, {
      ok: false,
      message: "Incorrect password. Please check the password and try again.",
    });
    return;
  }

  const maxAge = remember ? SIX_MONTHS_SECONDS : ONE_MONTH_SECONDS;
  const expiresAt = now + maxAge * 1000;
  const accessCookie = serializeCookie(
    ACCESS_COOKIE,
    encodeAccessCookie(expiresAt, cookieSecret),
    maxAge,
    req,
  );

  if (isFormRequest(req)) {
    redirectAfterLogin(res, returnTo, [accessCookie]);
    return;
  }

  sendJson(res, 200, { ok: true, expiresAt }, [accessCookie]);
}
