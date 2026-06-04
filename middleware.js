import crypto from "node:crypto";

const ACCESS_COOKIE = "mb_access";
const COOKIE_SECRET = process.env.ACCESS_COOKIE_SECRET || process.env.ACCESS_PASSWORD || "CE&EE2025-";

export const config = {
  runtime: "nodejs",
};

function sign(value) {
  return crypto.createHmac("sha256", COOKIE_SECRET).update(value).digest("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
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

function isAccessValid(request) {
  const cookies = parseCookies(request.headers.get("cookie") || "");
  const payload = decodeCookiePayload(cookies[ACCESS_COOKIE]);
  return Boolean(payload?.expiresAt && payload.expiresAt > Date.now());
}

function isAllowedWithoutAccess(pathname) {
  return (
    pathname === "/access.html" ||
    pathname === "/api/access" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_vercel")
  );
}

function getReturnTo(url) {
  const returnTo = `${url.pathname}${url.search}`;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return "/";
  if (returnTo.startsWith("/api/") || returnTo.startsWith("/access.html")) return "/";
  return returnTo;
}

export default function middleware(request) {
  const url = new URL(request.url);

  if (isAllowedWithoutAccess(url.pathname) || isAccessValid(request)) {
    return undefined;
  }

  const accessUrl = new URL("/access.html", request.url);
  accessUrl.searchParams.set("returnTo", getReturnTo(url));
  return Response.redirect(accessUrl, 303);
}
