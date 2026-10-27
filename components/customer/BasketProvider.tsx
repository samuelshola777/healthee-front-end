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
  GUEST_KEY,
  readGuest,
  type Cart,
  type GuestItem,
} from "./api";

import { useCustomer } from "./CustomerProvider";

type State = {
  guest: GuestItem[];
  cart: Cart | null;
  count: number;
  ready: boolean;
  busy: boolean;
  error: string;
  storageWarning: string;
  refresh: () => Promise<void>;
  add: (id: string) => Promise<void>;
  quantity: (
    id: string,
    value: number,
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  merge: () => Promise<void>;
};

const Context = createContext<State | null>(null);

export function BasketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    customer,
    loading: sessionLoading,
  } = useCustomer();

  const [guest, setGuest] = useState<GuestItem[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [owner, setOwner] = useState<string | null>(
    null,
  );

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [storageWarning, setStorageWarning] =
    useState("");

  const locked = useRef(false);
  const guestRef = useRef<GuestItem[]>([]);
  const generation = useRef(0);

  const customerId = customer?.customerId ?? null;

  const identity = useRef(customerId);
  identity.current = customerId;

  const visibleCart =
    owner === customerId ? cart : null;

  const save = useCallback((items: GuestItem[]) => {
    guestRef.current = items;
    setGuest(items);

    try {
      localStorage.setItem(
        GUEST_KEY,
        JSON.stringify(items),
      );

      setStorageWarning("");
    } catch {
      setStorageWarning(
        "Your browser cannot save this basket. Keep this page open until you finish.",
      );
    }
  }, []);

  useEffect(() => {
    try {
      const items = readGuest(
        localStorage.getItem(GUEST_KEY),
      );

      guestRef.current = items;
      setGuest(items);
    } catch {
      setStorageWarning(
        "Your browser cannot save your guest basket.",
      );
    }

    setReady(true);

    const sync = (event: StorageEvent) => {
      if (event.key === GUEST_KEY) {
        const items = readGuest(event.newValue);

        guestRef.current = items;
        setGuest(items);
      }
    };

    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("storage", sync);
    };
  }, []);

  const refresh = useCallback(async () => {
    const current = ++generation.current;

    if (!customerId) {
      setCart(null);
      setOwner(null);
      setError("");
      return;
    }

    setError("");

    try {
      const next = await api<Cart>("cart");

      if (
        current === generation.current &&
        identity.current === customerId
      ) {
        setCart(next);
        setOwner(customerId);
      }
    } catch (error) {
      if (current === generation.current) {
        setCart(null);
        setOwner(null);

        setError(
          error instanceof Error
            ? error.message
            : "Could not load your basket.",
        );
      }
    }
  }, [customerId]);

  useEffect(() => {
    void refresh();

    return () => {
      ++generation.current;
    };
  }, [refresh]);

  async function run(
    work: () => Promise<void>,
  ) {
    if (locked.current) {
      throw new Error(
        "Please wait for the current basket change to finish.",
      );
    }

    locked.current = true;

    setBusy(true);
    setError("");

    try {
      await work();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update your basket.",
      );

      throw error;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function mutate(
    path: string,
    method: string,
    body?: unknown,
  ) {
    const startedAs = customerId;

    const next = await api<Cart>(
      path,
      method,
      body,
    );

    if (identity.current === startedAs) {
      setCart(next);
      setOwner(startedAs);
    }
  }

  async function add(id: string) {
    if (sessionLoading || !ready) {
      throw new Error(
        "Please wait while your basket loads.",
      );
    }

    await run(async () => {
      if (customerId) {
        await mutate("cart/items", "POST", {
          productId: id,
          quantity: 1,
        });

        return;
      }

      const existing = guestRef.current.find(
        (item) => item.id === id,
      );

      if ((existing?.quantity ?? 0) >= 100) {
        throw new Error(
          "You can add up to 100 of each size.",
        );
      }

      if (
        !existing &&
        guestRef.current.length >= 200
      ) {
        throw new Error(
          "Your basket has reached its item limit.",
        );
      }

      save(
        existing
          ? guestRef.current.map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item,
            )
          : [
              ...guestRef.current,
              {
                id,
                quantity: 1,
              },
            ],
      );
    });
  }

  async function quantity(
    id: string,
    value: number,
  ) {
    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value > 100
    ) {
      throw new Error(
        "Choose a quantity between 1 and 100.",
      );
    }

    await run(async () => {
      if (customerId) {
        await mutate(
          "cart/items/" + encodeURIComponent(id),
          "PATCH",
          {
            quantity: value,
          },
        );

        return;
      }

      save(
        guestRef.current.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: value,
              }
            : item,
        ),
      );
    });
  }

  async function remove(id: string) {
    await run(async () => {
      if (customerId) {
        await mutate(
          "cart/items/" + encodeURIComponent(id),
          "DELETE",
        );

        return;
      }

      save(
        guestRef.current.filter(
          (item) => item.id !== id,
        ),
      );
    });
  }

  async function clear() {
    await run(async () => {
      if (customerId) {
        await api("cart", "DELETE");

        if (identity.current === customerId) {
          setCart({
            cartId: "",
            items: [],
            totalQuantity: 0,
            subtotal: 0,
            currencyCode: "NGN",
          });

          setOwner(customerId);
        }

        return;
      }

      save([]);
    });
  }

  async function merge() {
    if (!customerId) {
      throw new Error(
        "Sign in to move your guest basket.",
      );
    }

    await run(async () => {
      for (const item of [...guestRef.current]) {
        if (identity.current !== customerId) {
          throw new Error(
            "Your account changed. Sign in and try again.",
          );
        }

        // Re-read before each item. Keeping the larger quantity
        // prevents doubling after a lost response and retry.
        const current = await api<Cart>("cart");

        const existing = current.items.find(
          (row) => row.productId === item.id,
        );

        const next = existing
          ? await api<Cart>(
              "cart/items/" + existing.cartItemId,
              "PATCH",
              {
                quantity: Math.max(
                  existing.quantity,
                  item.quantity,
                ),
              },
            )
          : await api<Cart>(
              "cart/items",
              "POST",
              {
                productId: item.id,
                quantity: item.quantity,
              },
            );

        if (identity.current !== customerId) {
          throw new Error(
            "Your account changed. Reload your basket.",
          );
        }

        setCart(next);
        setOwner(customerId);

        save(
          guestRef.current.filter(
            (row) => row.id !== item.id,
          ),
        );
      }
    });
  }

  const count = customerId
    ? visibleCart?.totalQuantity ?? 0
    : guest.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

  return (
    <Context.Provider
      value={{
        guest,
        cart: visibleCart,
        count,
        ready: ready && !sessionLoading,
        busy,
        error,
        storageWarning,
        refresh,
        add,
        quantity,
        remove,
        clear,
        merge,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useBasket() {
  const value = useContext(Context);

  if (!value) {
    throw new Error("BasketProvider is required");
  }

  return value;
}