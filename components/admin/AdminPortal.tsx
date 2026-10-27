"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Leaf } from "../Icons";
import AdminPortal from "./AdminPortal";
import { adminRequest, type Admin } from "./admin-api";
import styles from "./live-admin.module.css";

function SignIn({ onLogin }: { onLogin: (admin: Admin) => void }) {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">(
    "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controller.current?.abort();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");

    controller.current = new AbortController();
    const signal = controller.current.signal;

    try {
      if (mode === "login") {
        const admin = await adminRequest<Admin>(
          "login",
          "POST",
          {
            emailAddress: email.trim().toLowerCase(),
            password,
          },
          signal,
        );

        if (!signal.aborted) {
          try {
            localStorage.setItem(
              "healthee-admin-session-change",
              String(Date.now()),
            );
          } catch {}

          onLogin(admin);
        }
      } else if (mode === "forgot") {
        await adminRequest(
          "forgot-password",
          "POST",
          {
            emailAddress: email.trim().toLowerCase(),
          },
          signal,
        );

        if (!signal.aborted) {
          setMode("reset");
          setPassword("");
          setNotice(
            "If your account is eligible, a reset code will arrive by email.",
          );
        }
      } else {
        await adminRequest(
          "reset-password",
          "POST",
          {
            emailAddress: email.trim().toLowerCase(),
            otp,
            newPassword: password,
          },
          signal,
        );

        if (!signal.aborted) {
          setMode("login");
          setPassword("");
          setOtp("");
          setNotice(
            "Password reset. Sign in with your new password.",
          );
        }
      }
    } catch (failure) {
      if (!signal.aborted) {
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not sign in.",
        );
      }
    } finally {
      lock.current = false;

      if (!signal.aborted) {
        setBusy(false);
      }
    }
  }

  return (
    <div className={styles.login}>
      <section className={styles.loginStory}>
        <a className={styles.logo} href="/">
          healthee
          <Leaf />
        </a>

        <span className={styles.eyebrow}>
          FRESH BUSINESS. HAPPY CUSTOMERS.
        </span>

        <h1>
          A little order.
          <br />
          A lot of goodness.
        </h1>

        <p>
          Manage your catalogue, prices and product images from one
          place.
        </p>
      </section>

      <section className={styles.loginForm}>
        <span className={styles.eyebrow}>HEALTHEE ADMIN</span>

        <h2>
          {mode === "login"
            ? "Welcome back."
            : mode === "forgot"
              ? "Reset your password."
              : "Choose a new password."}
        </h2>

        <p className={styles.muted}>
          Use your admin account to continue.
        </p>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className={styles.success}>
            {notice}
          </p>
        )}

        <form className={styles.form} onSubmit={submit}>
          <fieldset disabled={busy}>
            <label>
              Email address
              <input
                name="emailAddress"
                type="email"
                autoComplete="username"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            {mode === "reset" && (
              <label>
                Six-digit email code
                <input
                  name="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  autoComplete="one-time-code"
                />
              </label>
            )}

            {mode !== "forgot" && (
              <label>
                {mode === "reset" ? "New password" : "Password"}
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    mode === "reset"
                      ? "new-password"
                      : "current-password"
                  }
                  minLength={mode === "reset" ? 8 : 1}
                  maxLength={100}
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />
              </label>
            )}

            <button className={styles.primary} disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in →"
                  : mode === "forgot"
                    ? "Send reset code"
                    : "Reset password"}
            </button>
          </fieldset>
        </form>

        <button
          className={styles.textButton}
          disabled={busy}
          onClick={() => {
            setMode(mode === "login" ? "forgot" : "login");
            setError("");
            setNotice("");
            setPassword("");
          }}
        >
          {mode === "login" ? "Forgot password?" : "Back to sign in"}
        </button>

        <a className={styles.textButton} href="/">
          Open public website ↗
        </a>
      </section>
    </div>
  );
}

export default function AdminApp() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);

  async function refresh(background = false) {
    const attempt = ++generation.current;

    controller.current?.abort();
    controller.current = new AbortController();

    if (!background) {
      setLoading(true);
    }

    try {
      const value = await adminRequest<Admin | null>(
        "session",
        "GET",
        undefined,
        controller.current.signal,
      );

      if (attempt === generation.current) {
        setAdmin(value);
        setError("");
      }
    } catch (failure) {
      if (
        attempt === generation.current &&
        !controller.current?.signal.aborted
      ) {
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not load admin session.",
        );
      }
    } finally {
      if (attempt === generation.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void refresh();

    const expired = () => {
      generation.current++;
      controller.current?.abort();
      setAdmin(null);
      setLoading(false);
      setError("");
    };

    const focus = () => {
      if (document.visibilityState === "visible") {
        void refresh(true);
      }
    };

    const storage = (event: StorageEvent) => {
      if (event.key === "healthee-admin-session-change") {
        void refresh(true);
      }
    };

    window.addEventListener("healthee-admin-expired", expired);
    window.addEventListener("focus", focus);
    window.addEventListener("storage", storage);

    return () => {
      generation.current++;
      controller.current?.abort();

      window.removeEventListener(
        "healthee-admin-expired",
        expired,
      );
      window.removeEventListener("focus", focus);
      window.removeEventListener("storage", storage);
    };
  }, []);

  async function logout() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await adminRequest("logout", "POST");

      generation.current++;
      controller.current?.abort();
      setAdmin(null);

      try {
        localStorage.setItem(
          "healthee-admin-session-change",
          String(Date.now()),
        );
      } catch {}
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not sign out.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.app}>
        <p className={styles.empty} role="status">
          Loading admin portal…
        </p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className={styles.app}>
        {error && (
          <div className={styles.sessionError} role="alert">
            {error}{" "}
            <button onClick={() => void refresh()}>
              Retry session
            </button>
          </div>
        )}

        <SignIn
          onLogin={(value) => {
            generation.current++;
            controller.current?.abort();
            setAdmin(value);
            setError("");
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <AdminPortal
        key={admin.adminId}
        admin={admin}
        signingOut={busy}
        sessionError={error}
        onSignOut={() => void logout()}
        onRefresh={() => void refresh(true)}
      />
    </div>
  );
}