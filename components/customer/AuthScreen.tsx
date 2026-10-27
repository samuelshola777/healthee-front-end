"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import CustomerShell from "./CustomerShell";
import { useCustomer } from "./CustomerProvider";
import { api } from "./api";

import styles from "./customer.module.css";

export type AuthKind =
  | "register"
  | "login"
  | "verify-otp"
  | "forgot-password"
  | "reset-password";

const titles: Record<AuthKind, string> = {
  register: "A fresh start.",
  login: "Welcome back.",
  "verify-otp": "Check your inbox.",
  "forgot-password": "Let’s get you back in.",
  "reset-password": "Make it a fresh one.",
};

export default function AuthScreen({
  kind,
}: {
  kind: AuthKind;
}) {
  const router = useRouter();
  const session = useCustomer();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");

  const [next, setNext] = useState(
    "/customer/profile",
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const lock = useRef(false);

  const controller =
    useRef<AbortController | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(
      window.location.search,
    );

    setEmail(query.get("email") ?? "");

    const target = query.get("next");

    if (
      target === "/cart" ||
      target === "/cart/review"
    ) {
      setNext(target);
    }

    return () => {
      controller.current?.abort();
    };
  }, []);

  const query = (path: string) =>
    `/customer/${path}?email=${encodeURIComponent(
      email.trim(),
    )}&next=${encodeURIComponent(next)}`;

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (lock.current) {
      return;
    }

    setError("");
    setNotice("");

    if (
      ["register", "reset-password"].includes(kind) &&
      password !== confirm
    ) {
      setError("The passwords do not match.");
      return;
    }

    lock.current = true;
    setBusy(true);

    controller.current = new AbortController();

    try {
      const emailAddress = email
        .trim()
        .toLowerCase();

      const signal = controller.current.signal;

      if (kind === "login") {
        await session.login(
          emailAddress,
          password,
          signal,
        );

        setPassword("");
        router.push(next);
      }

      if (kind === "register") {
        await api(
          "register",
          "POST",
          {
            emailAddress,
            password,
          },
          signal,
        );

        router.push(query("verify-otp"));
      }

      if (kind === "verify-otp") {
        await api(
          "verify-otp",
          "POST",
          {
            emailAddress,
            otp,
          },
          signal,
        );

        router.push(
          query("login") + "&verified=1",
        );
      }

      if (kind === "forgot-password") {
        await api(
          "forgot-password",
          "POST",
          {
            emailAddress,
          },
          signal,
        );

        router.push(query("reset-password"));
      }

      if (kind === "reset-password") {
        await api(
          "reset-password",
          "POST",
          {
            emailAddress,
            otp,
            newPassword: password,
          },
          signal,
        );

        router.push(
          query("login") + "&reset=1",
        );
      }
    } catch (error) {
      if (!controller.current?.signal.aborted) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not complete your request.",
        );
      }
    } finally {
      lock.current = false;

      if (!controller.current?.signal.aborted) {
        setBusy(false);
      }
    }
  }

  async function resend() {
    if (!email || lock.current) {
      return;
    }

    lock.current = true;

    setBusy(true);
    setError("");

    controller.current = new AbortController();

    try {
      await api(
        "resend-otp",
        "POST",
        {
          emailAddress: email
            .trim()
            .toLowerCase(),

          userOtpType:
            kind === "reset-password"
              ? "PASSWORD_RESET"
              : "ACCOUNT_ACTIVATION",
        },
        controller.current.signal,
      );

      setNotice(
        "A new code has been sent. Please check your inbox and spam folder.",
      );
    } catch (error) {
      if (!controller.current.signal.aborted) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not resend your code.",
        );
      }
    } finally {
      lock.current = false;

      if (!controller.current.signal.aborted) {
        setBusy(false);
      }
    }
  }

  const hasPassword = [
    "register",
    "login",
    "reset-password",
  ].includes(kind);

  const hasOtp =
    kind === "verify-otp" ||
    kind === "reset-password";

  return (
    <CustomerShell>
      <div className={styles.auth}>
        <aside className={styles.story}>
          <span className={styles.eyebrow}>
            YOUR DAILY DOSE OF HAPPY
          </span>

          <h1>
            Good days.
            <br />
            Start with you.
          </h1>

          <p>
            Fresh fruit. Familiar favourites. A little
            more goodness in every bottle.
          </p>

          <img
            src="/assets/fresh-market/closing-fruit.png"
            alt=""
          />
        </aside>

        <section
          className={styles.formPanel}
          aria-labelledby="auth-title"
        >
          <span className={styles.eyebrow}>
            THE HEALTHEE FAMILY
          </span>

          <h2 id="auth-title">
            {titles[kind]}
          </h2>

          <p className={styles.copy}>
            {kind === "register"
              ? "Create your account to save your basket and get ready for pickup."
              : kind === "login"
                ? "Sign in to your account and pick up where you left off."
                : kind === "verify-otp"
                  ? "Enter the six-digit email code to activate your account. You’ll sign in afterwards."
                  : kind === "forgot-password"
                    ? "Enter your account email. We’ll send a password reset code."
                    : "Enter the reset code from your email and choose a new password."}
          </p>

          {error && (
            <p
              role="alert"
              className={styles.alert}
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className={styles.success}
            >
              {notice}
            </p>
          )}

          <form
            className={styles.form}
            onSubmit={submit}
          >
            <fieldset disabled={busy}>
              <label>
                Email address

                <input
                  type="email"
                  name="emailAddress"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />
              </label>

              {hasOtp && (
                <label>
                  Six-digit code

                  <input
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      )
                    }
                  />
                </label>
              )}

              {hasPassword && (
                <label>
                  {kind === "reset-password"
                    ? "New password"
                    : "Password"}

                  <input
                    type="password"
                    name="password"
                    autoComplete={
                      kind === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    minLength={
                      kind === "login" ? 1 : 8
                    }
                    maxLength={100}
                    required
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                  />

                  {kind !== "login" && (
                    <small>
                      Use between 8 and 100 characters.
                    </small>
                  )}
                </label>
              )}

              {(kind === "register" ||
                kind === "reset-password") && (
                <label>
                  Confirm password

                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={100}
                    required
                    value={confirm}
                    onChange={(event) =>
                      setConfirm(event.target.value)
                    }
                  />
                </label>
              )}

              <button
                className={styles.primary}
                type="submit"
              >
                {busy
                  ? "Please wait…"
                  : kind === "register"
                    ? "Create my account →"
                    : kind === "login"
                      ? "Sign in →"
                      : kind === "verify-otp"
                        ? "Verify my email →"
                        : kind === "forgot-password"
                          ? "Send reset code →"
                          : "Save new password →"}
              </button>
            </fieldset>
          </form>

          <div className={styles.links}>
            {kind === "login" ? (
              <>
                <Link
                  className={styles.link}
                  href={query("forgot-password")}
                >
                  Forgot password?
                </Link>

                <Link
                  className={styles.link}
                  href={query("register")}
                >
                  Create an account
                </Link>

                <Link
                  className={styles.link}
                  href={query("verify-otp")}
                >
                  Verify your email
                </Link>
              </>
            ) : (
              <Link
                className={styles.link}
                href={query("login")}
              >
                Back to sign in
              </Link>
            )}

            {hasOtp && (
              <button
                className={styles.link}
                type="button"
                disabled={busy || !email}
                onClick={() => void resend()}
              >
                Resend code
              </button>
            )}
          </div>
        </section>
      </div>
    </CustomerShell>
  );
}