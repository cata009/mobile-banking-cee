import { FormEvent, ReactNode, CSSProperties, useEffect, useMemo, useState } from "react";

type AccessGateProps = {
  children: ReactNode;
};

type AccessStatus = "checking" | "locked" | "unlocked";

const LOCAL_ACCESS_KEY = "mb-local-access";
const LOCAL_ATTEMPTS_KEY = "mb-local-access-attempts";
const SHARE_ACCESS_PARAM = "access_token";
const LOCAL_DEV_PASSWORD = import.meta.env.DEV ? "CE&EE2025-" : "";
const LOCAL_SHARE_ACCESS_TOKEN = import.meta.env.DEV ? "local-dev-share-access" : "";
const ONE_MONTH_MS = 31 * 24 * 60 * 60 * 1000;
const SIX_MONTHS_MS = 183 * 24 * 60 * 60 * 1000;
const BLOCK_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const BLOCKED_MESSAGE = "Access temporarily blocked. Please contact the local UX designer for support.";

type LocalAttemptState = {
  count: number;
  blockedUntil: number;
};

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function isLocalAccessValid() {
  const access = readLocalJson<{ expiresAt?: number }>(LOCAL_ACCESS_KEY, {});
  return Boolean(access.expiresAt && access.expiresAt > Date.now());
}

function getLocalAttemptState(): LocalAttemptState {
  return readLocalJson<LocalAttemptState>(LOCAL_ATTEMPTS_KEY, { count: 0, blockedUntil: 0 });
}

function setLocalAttemptState(state: LocalAttemptState) {
  localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(state));
}

function setLocalAccess(remember: boolean) {
  const now = Date.now();
  localStorage.setItem(
    LOCAL_ACCESS_KEY,
    JSON.stringify({ expiresAt: now + (remember ? SIX_MONTHS_MS : ONE_MONTH_MS) })
  );
  localStorage.removeItem(LOCAL_ATTEMPTS_KEY);
}

async function checkServerAccess() {
  const response = await fetch("/api/access", {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });

  if (!response.ok) return false;

  const data = (await response.json()) as { authenticated?: boolean };
  return Boolean(data.authenticated);
}

async function submitServerAccess(password: string, remember: boolean) {
  const response = await fetch("/api/access", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password, remember }),
    credentials: "same-origin",
  });
  const data = (await response.json().catch(() => ({}))) as { ok?: boolean; blocked?: boolean; message?: string };

  return {
    ok: response.ok && Boolean(data.ok),
    blocked: Boolean(data.blocked),
    message: data.message,
  };
}

async function submitServerShareAccess(shareToken: string) {
  const response = await fetch("/api/access", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shareToken }),
    credentials: "same-origin",
  });
  const data = (await response.json().catch(() => ({}))) as { ok?: boolean; blocked?: boolean; message?: string };

  return {
    ok: response.ok && Boolean(data.ok),
    blocked: Boolean(data.blocked),
    message: data.message,
  };
}

function readShareAccessToken(search: string = window.location.search) {
  try {
    return new URLSearchParams(search).get(SHARE_ACCESS_PARAM);
  } catch {
    return null;
  }
}

function removeShareAccessTokenFromUrl() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(SHARE_ACCESS_PARAM)) return;
    url.searchParams.delete(SHARE_ACCESS_PARAM);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // URL cleanup is best-effort; access validation remains server-side.
  }
}

function submitLocalAccess(password: string, remember: boolean) {
  const attemptState = getLocalAttemptState();
  const now = Date.now();

  if (attemptState.blockedUntil > now) {
    return { ok: false, blocked: true, message: BLOCKED_MESSAGE };
  }

  if (password !== LOCAL_DEV_PASSWORD) {
    const count = attemptState.count + 1;
    const blockedUntil = count >= MAX_ATTEMPTS ? now + BLOCK_MS : 0;
    setLocalAttemptState({ count, blockedUntil });

    return {
      ok: false,
      blocked: blockedUntil > 0,
      message:
        blockedUntil > 0
          ? BLOCKED_MESSAGE
          : count >= 7
            ? "Multiple failed attempts. Access will be temporarily blocked after 10 attempts."
            : "Incorrect password. Please check the password and try again.",
    };
  }

  setLocalAccess(remember);
  return { ok: true, blocked: false, message: "" };
}

export default function AccessGate({ children }: AccessGateProps) {
  const [status, setStatus] = useState<AccessStatus>("checking");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usesLocalFallback, setUsesLocalFallback] = useState(false);
  const formDisabled = status === "checking" || isSubmitting || message === BLOCKED_MESSAGE;
  const helperText = useMemo(() => "For support, contact the local UX designer", []);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      const shareToken = readShareAccessToken();

      try {
        if (import.meta.env.DEV && shareToken === LOCAL_SHARE_ACCESS_TOKEN) {
          setLocalAccess(true);
          removeShareAccessTokenFromUrl();
          if (!isMounted) return;
          setStatus("unlocked");
          return;
        }

        if (shareToken) {
          const result = await submitServerShareAccess(shareToken);
          removeShareAccessTokenFromUrl();
          if (!isMounted) return;

          if (result.ok) {
            setStatus("unlocked");
            return;
          }

          setMessage(result.message || "This share link has expired. Please scan a fresh QR code or enter the password.");
        }

        const authenticated = await checkServerAccess();
        if (!isMounted) return;
        setStatus(authenticated ? "unlocked" : "locked");
      } catch {
        if (!isMounted) return;
        if (import.meta.env.DEV) {
          setUsesLocalFallback(true);
          setStatus(isLocalAccessValid() ? "unlocked" : "locked");
          return;
        }

        setMessage("Access service unavailable. Please contact the local UX designer for support.");
        setStatus("locked");
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setMessage("Enter password to continue.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const result = usesLocalFallback
        ? submitLocalAccess(password, remember)
        : await submitServerAccess(password, remember);

      if (result.ok) {
        setStatus("unlocked");
        return;
      }

      setMessage(result.message || "Incorrect password. Please check the password and try again.");
    } catch {
      setMessage("Access service unavailable. Please contact the local UX designer for support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "unlocked") {
    return <>{children}</>;
  }

  return (
    <main style={styles.page} aria-busy={status === "checking"}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.logoMark} aria-hidden="true" />
        <label style={styles.label} htmlFor="access-password">
          Enter password to continue
        </label>
        <input
          id="access-password"
          type="password"
          autoComplete="current-password"
          value={password}
          disabled={formDisabled}
          onChange={(event) => setPassword(event.target.value)}
          style={styles.input}
        />
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={remember}
            disabled={formDisabled}
            onChange={(event) => setRemember(event.target.checked)}
            style={styles.checkbox}
          />
          Remember my password
        </label>
        {message && (
          <p role="alert" style={message === BLOCKED_MESSAGE ? styles.errorStrong : styles.error}>
            {message}
          </p>
        )}
        <button type="submit" disabled={formDisabled} style={formDisabled ? styles.buttonDisabled : styles.button}>
          {isSubmitting || status === "checking" ? "Checking..." : "Continue"}
        </button>
        <p style={styles.helper}>{helperText}</p>
      </form>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "#F5F5F5",
    color: "#262626",
    fontFamily: "UniCredit, Inter, Arial, sans-serif",
  },
  card: {
    width: "min(100%, 360px)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: 24,
    borderRadius: 8,
    background: "#FFFFFF",
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)",
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#E2001A",
    marginBottom: 4,
  },
  label: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: "24px",
  },
  input: {
    height: 44,
    border: "1px solid #B8B8B8",
    borderRadius: 6,
    padding: "0 12px",
    fontSize: 16,
    fontFamily: "inherit",
    color: "#262626",
    background: "#FFFFFF",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    fontWeight: 700,
    color: "#262626",
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: "#E2001A",
  },
  error: {
    margin: 0,
    fontSize: 13,
    lineHeight: "18px",
    color: "#B00020",
  },
  errorStrong: {
    margin: 0,
    padding: "10px 12px",
    borderRadius: 6,
    background: "#FFF1F1",
    fontSize: 13,
    lineHeight: "18px",
    color: "#B00020",
  },
  button: {
    height: 44,
    border: 0,
    borderRadius: 6,
    background: "#E2001A",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  buttonDisabled: {
    height: 44,
    border: 0,
    borderRadius: 6,
    background: "#B8B8B8",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "not-allowed",
  },
  helper: {
    margin: 0,
    fontSize: 13,
    lineHeight: "18px",
    color: "#666666",
  },
} satisfies Record<string, CSSProperties>;
