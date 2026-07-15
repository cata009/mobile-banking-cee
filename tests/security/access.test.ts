import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

type RequestHarness = {
  method: string;
  headers: Record<string, string | undefined>;
  url?: string;
  body?: unknown;
};

type ResponseHarness = {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: unknown;
  ended: boolean;
  setHeader(name: string, value: string | string[]): void;
  status(code: number): ResponseHarness;
  json(payload: unknown): ResponseHarness;
  end(): ResponseHarness;
};

type AccessHandler = (request: RequestHarness, response: ResponseHarness) => Promise<void>;

const ACCESS_ENV_KEYS = ["ACCESS_PASSWORD", "ACCESS_COOKIE_SECRET"] as const;
const originalAccessEnv = Object.fromEntries(
  ACCESS_ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ACCESS_ENV_KEYS)[number], string | undefined>;

function restoreAccessEnvironment() {
  for (const key of ACCESS_ENV_KEYS) {
    const originalValue = originalAccessEnv[key];
    if (originalValue === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalValue;
    }
  }
}

function configureAccess() {
  process.env.ACCESS_PASSWORD = "test-password";
  process.env.ACCESS_COOKIE_SECRET = "test-cookie-secret-0123456789abcdef";
}

async function loadHandler(): Promise<AccessHandler> {
  vi.resetModules();
  // @ts-expect-error The Vercel handler is JavaScript and has no declaration file.
  const module = (await import("../../api/access.js")) as { default: AccessHandler };
  return module.default;
}

function createResponse(): ResponseHarness {
  const response: ResponseHarness = {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(name, value) {
      response.headers[name] = value;
    },
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(payload) {
      response.body = payload;
      response.ended = true;
      return response;
    },
    end() {
      response.ended = true;
      return response;
    },
  };

  return response;
}

async function invoke(
  handler: AccessHandler,
  request: Partial<RequestHarness> = {},
): Promise<ResponseHarness> {
  const response = createResponse();
  await handler(
    {
      method: "GET",
      url: "/api/access",
      ...request,
      headers: { ...(request.headers ?? {}) },
    },
    response,
  );
  return response;
}

function header(response: ResponseHarness, name: string) {
  const match = Object.entries(response.headers).find(
    ([headerName]) => headerName.toLowerCase() === name.toLowerCase(),
  );
  return match?.[1];
}

function cookieValues(response: ResponseHarness) {
  const setCookie = header(response, "Set-Cookie");
  if (setCookie === undefined) return [];
  return Array.isArray(setCookie) ? setCookie : [setCookie];
}

function cookiePair(response: ResponseHarness, name: string) {
  return cookieValues(response)
    .find((value) => value.startsWith(`${name}=`))
    ?.split(";")[0];
}

function forgeSignedPayload(payload: object, secret: string) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function forgeAccessCookie(secret: string) {
  const value = forgeSignedPayload(
    { expiresAt: Date.now() + 60_000 },
    secret,
  );
  return `mb_access=${encodeURIComponent(value)}`;
}

function forgeShareToken(secret: string) {
  return forgeSignedPayload(
    {
      purpose: "demo-share-access",
      expiresAt: Date.now() + 60_000,
    },
    secret,
  );
}

beforeEach(() => {
  delete process.env.ACCESS_PASSWORD;
  delete process.env.ACCESS_COOKIE_SECRET;
  vi.resetModules();
});

afterEach(() => {
  restoreAccessEnvironment();
  vi.resetModules();
});

describe("stakeholder access gate security contract", () => {
  test.each([
    ["configuration is entirely missing", undefined, undefined],
    ["password is missing", undefined, "test-cookie-secret-0123456789abcdef"],
    ["cookie secret is missing", "test-password", undefined],
    ["cookie secret is shorter than 32 characters", "test-password", "too-short"],
  ])("fails closed when the %s", async (_label, password, cookieSecret) => {
    if (password !== undefined) process.env.ACCESS_PASSWORD = password;
    if (cookieSecret !== undefined) process.env.ACCESS_COOKIE_SECRET = cookieSecret;
    const handler = await loadHandler();
    const response = await invoke(handler);

    expect.soft(response.statusCode).toBe(503);
    expect.soft(cookiePair(response, "mb_access")).toBeUndefined();
  });

  test("fails closed for an unconfigured login without issuing access", async () => {
    const handler = await loadHandler();
    const response = await invoke(handler, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: { password: "CE&EE2025-" },
    });

    expect.soft(response.statusCode).toBe(503);
    expect.soft(cookiePair(response, "mb_access")).toBeUndefined();
  });

  test("rejects an access cookie forged with the former fallback secret", async () => {
    configureAccess();
    const handler = await loadHandler();
    const response = await invoke(handler, {
      headers: { cookie: forgeAccessCookie("CE&EE2025-") },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ authenticated: false });
  });

  test.each([
    ["malformed payload", "not-a-valid-payload.not-a-valid-signature"],
    [
      "malformed signature",
      `${Buffer.from(JSON.stringify({ expiresAt: Date.now() + 60_000 })).toString("base64url")}.%%%`,
    ],
    [
      "unequal-length signature",
      `${Buffer.from(JSON.stringify({ expiresAt: Date.now() + 60_000 })).toString("base64url")}.x`,
    ],
  ])("treats a cookie with a %s as unauthenticated", async (_label, value) => {
    configureAccess();
    const handler = await loadHandler();
    const response = await invoke(handler, {
      headers: { cookie: `mb_access=${encodeURIComponent(value)}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ authenticated: false });
  });

  test("treats malformed cookie percent-encoding as unauthenticated", async () => {
    configureAccess();
    const handler = await loadHandler();
    const response = await invoke(handler, {
      headers: { cookie: "mb_access=%E0%A4%A" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ authenticated: false });
  });

  test.each([
    ["backslash", "/\\evil.example"],
    ["embedded backslash", "/dashboard\\evil.example"],
    ["CRLF control characters", "/dashboard\r\nX-Test: injected"],
    ["null control character", "/dashboard\u0000details"],
    ["absolute URL", "https://evil.example/phish"],
    ["protocol-relative URL", "//evil.example/phish"],
    ["API route", "/api/access"],
    ["access page", "/access.html?error=incorrect"],
  ])("normalizes a malicious %s return target", async (_label, returnTo) => {
    configureAccess();
    const handler = await loadHandler();
    const response = await invoke(handler, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: { password: "test-password", returnTo },
    });

    expect(response.statusCode).toBe(303);
    expect(header(response, "Location")).toBe("/");
  });

  test("returns a uniform 401 without client-controlled attempt state", async () => {
    configureAccess();
    const handler = await loadHandler();
    const response = await invoke(handler, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: { password: "incorrect-password" },
    });

    expect.soft(response.statusCode).toBe(401);
    expect.soft(response.body).not.toHaveProperty("remainingAttempts");
    expect.soft(cookieValues(response)).toEqual([]);
  });

  test("authenticates with independently configured credentials", async () => {
    configureAccess();
    const handler = await loadHandler();
    const login = await invoke(handler, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: { password: "test-password" },
    });

    expect(login.statusCode).toBe(200);
    expect(login.body).toMatchObject({ ok: true });

    const accessCookie = cookiePair(login, "mb_access");
    expect(accessCookie).toBeDefined();

    const authenticated = await invoke(handler, {
      headers: { cookie: accessCookie },
    });
    expect(authenticated.statusCode).toBe(200);
    expect(authenticated.body).toEqual({ authenticated: true });
  });

  test("issues and consumes a share token under independent configuration", async () => {
    configureAccess();
    const handler = await loadHandler();
    const login = await invoke(handler, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: { password: "test-password" },
    });
    const accessCookie = cookiePair(login, "mb_access");
    expect(accessCookie).toBeDefined();

    const issued = await invoke(handler, {
      url: "/api/access?mode=share-token",
      headers: { cookie: accessCookie },
    });
    const shareToken = (issued.body as { token?: unknown }).token;
    expect(issued.statusCode).toBe(200);
    expect(typeof shareToken).toBe("string");

    const consumed = await invoke(handler, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: { shareToken },
    });
    expect(consumed.statusCode).toBe(200);
    expect(consumed.body).toMatchObject({ ok: true, tokenAccess: true });
    expect(cookiePair(consumed, "mb_access")).toBeDefined();
  });

  test("rejects a share token forged with the former fallback secret", async () => {
    configureAccess();
    const handler = await loadHandler();
    const response = await invoke(handler, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: { shareToken: forgeShareToken("CE&EE2025-") },
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).not.toHaveProperty("tokenAccess");
    expect(cookiePair(response, "mb_access")).toBeUndefined();
  });
});
