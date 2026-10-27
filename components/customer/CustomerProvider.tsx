"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  api,
  ApiError,
  type Customer,
} from "./api";

type State = {
  customer: Customer | null;
  loading: boolean;
  error: string;
  refresh: (background?: boolean) => Promise<void>;
  login: (
    emailAddress: string,
    password: string,
    signal?: AbortSignal,
  ) => Promise<void>;
  logout: () => Promise<void>;
  update: (customer: Customer) => void;
};

const Context = createContext<State | null>(null);

export function CustomerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const generation = useRef(0);

  const refresh = useCallback(
    async (background = false) => {
      const current = ++generation.current;

      if (!background) {
        setLoading(true);
      }

      setError("");

      try {
        const value = await api<Customer | null>(
          "session",
        );

        if (current === generation.current) {
          setCustomer(value);
        }
      } catch (error) {
        if (current === generation.current) {
          if (!background) {
            setCustomer(null);
          }

          if (
            !(
              error instanceof ApiError &&
              error.status === 401
            )
          ) {
            setError(
              error instanceof Error
                ? error.message
                : "Could not load your account.",
            );
          }
        }
      } finally {
        if (current === generation.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void refresh();

    const expire = () => {
      ++generation.current;

      setCustomer(null);
      setLoading(false);
      setError(
        "Your session ended. Please sign in again.",
      );
    };

    const focus = () => {
      if (document.visibilityState === "visible") {
        void refresh(true);
      }
    };

    const changed = (event: StorageEvent) => {
      if (
        event.key === "healthee-session-change-v1"
      ) {
        void refresh(true);
      }
    };

    window.addEventListener(
      "healthee-session-expired",
      expire,
    );

    window.addEventListener("focus", focus);
    window.addEventListener("storage", changed);

    return () => {
      ++generation.current;

      window.removeEventListener(
        "healthee-session-expired",
        expire,
      );

      window.removeEventListener("focus", focus);
      window.removeEventListener("storage", changed);
    };
  }, [refresh]);

  function notify() {
    try {
      localStorage.setItem(
        "healthee-session-change-v1",
        String(Date.now()),
      );
    } catch {
      // Focus refresh still works when storage is blocked.
    }
  }

  async function login(
    emailAddress: string,
    password: string,
    signal?: AbortSignal,
  ) {
    const current = ++generation.current;

    const value = await api<Customer>(
      "login",
      "POST",
      {
        emailAddress: emailAddress
          .trim()
          .toLowerCase(),
        password,
      },
      signal,
    );

    if (current === generation.current) {
      setCustomer(value);
      setError("");
      setLoading(false);
      notify();
    }
  }

  async function logout() {
    await api("logout", "POST", {});

    ++generation.current;

    setCustomer(null);
    setError("");
    notify();
  }

  return (
    <Context.Provider
      value={{
        customer,
        loading,
        error,
        refresh,
        login,
        logout,
        update: (value) =>
          setCustomer((current) =>
            current?.customerId === value.customerId
              ? value
              : current,
          ),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useCustomer() {
  const value = useContext(Context);

  if (!value) {
    throw new Error("CustomerProvider is required");
  }

  return value;
}