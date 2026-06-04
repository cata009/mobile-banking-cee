import crypto from "node:crypto";

const ACCESS_COOKIE = "mb_access";
const ATTEMPTS_COOKIE = "mb_access_attempts";
const PASSWORD = process.env.ACCESS_PASSWORD || "CE&EE2025-";
const COOKIE_SECRET = process.env.ACCESS_COOKIE_SECRET || process.env.ACCESS_PASSWORD || "CE&EE2025-";
const ONE_MONTH_SECONDS = 60 * 60 * 24 * 31;
const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 183;
const BLOCK_SECONDS = 60 * 60 * 24;
const MAX_ATTEMPTS = 10;

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value) {
  return crypto.createHmac("sha256", COOKIE_SECRET).update(value).digest("base64url");
}

function encodeCookiePayload(payload) {
  const encoded = toBase64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function decodeCookiePayload(value) {
  if (!value || typeof value !== "string") return null;

  const [encoded, signature] = value.split(".");
  if (!encoded || !signature || sign(encoded) !== signature) return null;

  try {
    return JSON.parse(fromBase64Url(encoded));
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName) return cookies;
    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
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

function clearCookie(name, req) {
  return serializeCookie(name, "", 0, req);
}

function isAccessValid(cookies) {
  const payload = decodeCookiePayload(cookies[ACCESS_COOKIE]);
  return Boolean(payload?.expiresAt && payload.expiresAt > Date.now());
}

function getAttemptState(cookies) {
  const payload = decodeCookiePayload(cookies[ATTEMPTS_COOKIE]);
  if (!payload) return { count: 0, blockedUntil: 0 };

  return {
    count: Number.isFinite(payload.count) ? payload.count : 0,
    blockedUntil: Number.isFinite(payload.blockedUntil) ? payload.blockedUntil : 0,
  };
}

function safeReturnTo(value) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
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

function redirectToAccess(res, error, returnTo, cookies = []) {
  const target = new URL("/access.html", "https://local.app");
  target.searchParams.set("error", error);
  target.searchParams.set("returnTo", returnTo);
  if (cookies.length > 0) {
    res.setHeader("Set-Cookie", cookies);
  }
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
  const cookies = parseCookies(req.headers.cookie);

  if (req.method === "GET") {
    sendJson(res, 200, { authenticated: isAccessValid(cookies) });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    sendJson(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  const attemptState = getAttemptState(cookies);
  const now = Date.now();

  if (attemptState.blockedUntil > now) {
    sendJson(res, 423, {
      ok: false,
      blocked: true,
      message: "Access temporarily blocked. Please contact the local UX designer for support.",
    });
    return;
  }

  const body = await readRequestBody(req);
  const password = body.password;
  const remember = body.remember === true || body.remember === "on" || body.remember === "true";
  const returnTo = safeReturnTo(body.returnTo);

  if (password !== PASSWORD) {
    const nextCount = attemptState.count + 1;
    const blockedUntil = nextCount >= MAX_ATTEMPTS ? now + BLOCK_SECONDS * 1000 : 0;
    const attemptPayload = encodeCookiePayload({ count: nextCount, blockedUntil });
    const message =
      blockedUntil > 0
        ? "Access temporarily blocked. Please contact the local UX designer for support."
        : nextCount >= 7
          ? "Multiple failed attempts. Access will be temporarily blocked after 10 attempts."
          : "Incorrect password. Please check the password and try again.";

    const attemptsCookie = serializeCookie(ATTEMPTS_COOKIE, attemptPayload, ONE_MONTH_SECONDS, req);

    if (isFormRequest(req)) {
      redirectToAccess(res, blockedUntil > 0 ? "blocked" : "incorrect", returnTo, [attemptsCookie]);
      return;
    }

    sendJson(res, blockedUntil > 0 ? 423 : 401, {
      ok: false,
      blocked: blockedUntil > 0,
      remainingAttempts: Math.max(MAX_ATTEMPTS - nextCount, 0),
      message,
    }, [attemptsCookie]);
    return;
  }

  const maxAge = remember ? SIX_MONTHS_SECONDS : ONE_MONTH_SECONDS;
  const expiresAt = now + maxAge * 1000;
  const accessPayload = encodeCookiePayload({ expiresAt });

  const successCookies = [
    serializeCookie(ACCESS_COOKIE, accessPayload, maxAge, req),
    clearCookie(ATTEMPTS_COOKIE, req),
  ];

  if (isFormRequest(req)) {
    redirectAfterLogin(res, returnTo, successCookies);
    return;
  }

  sendJson(res, 200, { ok: true, expiresAt }, successCookies);
}
