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

function forgeAccessCookie(secret: string) {
  const encoded = Buffer.from(
    JSON.stringify({ expiresAt: Date.now() + 60_000 }),
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `mb_access=${encodeURIComponent(`${encoded}.${signature}`)}`;
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
  test("fails closed when access credentials are not configured", async () => {
    const handler = await loadHandler();
    const response = await invoke(handler);

    expect(response.statusCode).toBe(503);
  });

  test("rejects an access cookie forged with the former fallback secret", async () => {
    const handler = await loadHandler();
    const response = await invoke(handler, {
      headers: { cookie: forgeAccessCookie("CE&EE2025-") },
    });

    expect(response.body).toEqual({ authenticated: false });
  });

  test.each([
    ["backslash", "/\\evil.example"],
    ["control character", "/dashboard\r\nX-Test: injected"],
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
    expect.soft(header(response, "Set-Cookie")).toBeUndefined();
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

    const setCookie = header(login, "Set-Cookie");
    expect(Array.isArray(setCookie)).toBe(true);
    const accessCookie = (setCookie as string[]).find((value) =>
      value.startsWith("mb_access="),
    );
    expect(accessCookie).toBeDefined();

    const authenticated = await invoke(handler, {
      headers: { cookie: accessCookie?.split(";")[0] },
    });
    expect(authenticated.statusCode).toBe(200);
    expect(authenticated.body).toEqual({ authenticated: true });
  });
});
