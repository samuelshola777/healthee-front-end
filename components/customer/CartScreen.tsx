"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import CustomerShell from "./CustomerShell";
import { useCustomer } from "./CustomerProvider";
import { useBasket } from "./BasketProvider";

import {
  money,
  safeImage,
  sizeLabel,
  type CartItem,
  type Product,
} from "./api";

import styles from "./customer.module.css";

function Photo({
  url,
  name,
}: {
  url?: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = safeImage(url);

  return src && !failed ? (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <span
      className={styles.fruit}
      aria-label="Product photo unavailable"
    >
      ❧
    </span>
  );
}

export default function CartScreen({
  review = false,
}: {
  review?: boolean;
}) {
  const session = useCustomer();
  const basket = useBasket();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState("");
  const [retry, setRetry] = useState(0);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (session.loading) return;

    if (session.customer) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    setLoading(true);
    setCatalogueError("");

    void (async () => {
      const result: Product[] = [];

      try {
        for (let page = 1; page <= 100; page++) {
          const response = await fetch(
            `/api/catalogue?page=${page}`,
            {
              cache: "no-store",
              signal: controller.signal,
            },
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Could not load current prices.",
            );
          }

          if (
            !Array.isArray(data.data) ||
            !Number.isInteger(data.totalPage)
          ) {
            throw new Error(
              "The product list was incomplete.",
            );
          }

          result.push(...data.data);

          if (page >= data.totalPage) break;

          if (page === 100) {
            throw new Error(
              "The product list is too large. Please try again later.",
            );
          }
        }

        if (!controller.signal.aborted) {
          setProducts(
            result.filter(
              (product) =>
                typeof product.id === "string" &&
                Number.isFinite(
                  Number(product.productPrice),
                ) &&
                Number(product.productPrice) >= 0,
            ),
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setCatalogueError(
            error instanceof Error
              ? error.message
              : "Could not load current prices.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [
    session.loading,
    session.customer?.customerId,
    retry,
  ]);

  async function act(task: () => Promise<void>) {
    setActionError("");

    try {
      await task();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Could not update your basket.",
      );
    }
  }

  const rows: CartItem[] = session.customer
    ? basket.cart?.items ?? []
    : basket.guest.map((item) => {
        const product = products.find(
          (product) => product.id === item.id,
        );

        const available = Boolean(
          product?.availableForPublicDisplay,
        );

        const unitPrice = product?.productPrice ?? 0;

        return {
          cartItemId: item.id,
          productId: item.id,
          title:
            product?.productName ?? "Unavailable product",
          quantity: item.quantity,
          unitPrice,
          lineTotal: available
            ? (
                Math.round(Number(unitPrice) * 100) *
                item.quantity
              ) / 100
            : 0,
          available,
          productBottleSize:
            product?.productBottleSize ?? null,
          productThumbnailsUrls:
            product?.productThumbnailsUrls ?? [],
        };
      });

  const pending =
    !basket.ready ||
    session.loading ||
    (!session.customer && loading) ||
    Boolean(
      session.customer &&
      !basket.cart &&
      !basket.error,
    );

  const failure = basket.error || catalogueError;

  const subtotal = session.customer
    ? basket.cart?.subtotal ?? 0
    : rows.reduce(
        (sum, row) =>
          sum + Math.round(Number(row.lineTotal) * 100),
        0,
      ) / 100;

  const hasUnavailable = rows.some(
    (row) => !row.available,
  );

  const contactComplete = Boolean(
    session.customer?.firstName &&
    session.customer?.lastName &&
    session.customer?.phoneNumber,
  );

  return (
    <CustomerShell>
      <nav
        className={styles.steps}
        aria-label="Basket steps"
      >
        <Link
          href="/cart"
          aria-current={!review ? "step" : undefined}
        >
          01 Your basket
        </Link>

        <span>→</span>

        <span
          aria-current={review ? "step" : undefined}
        >
          02 Pickup review
        </span>
      </nav>

      <span className={styles.eyebrow}>
        FRESH PICKS. HAPPY SIPS.
      </span>

      <h1 className={styles.heading}>
        {review
          ? "Ready for a juicy moment?"
          : "Your basket."}
      </h1>

      <p className={styles.copy}>
        Choose your favourites. Once an order is packaged,
        you arrange a dispatch rider to collect it.
      </p>

      {(actionError || session.error) && (
        <p className={styles.alert} role="alert">
          {actionError || session.error}
        </p>
      )}

      {basket.storageWarning && (
        <p className={styles.alert} role="status">
          {basket.storageWarning}
        </p>
      )}

      {session.customer && basket.guest.length > 0 && (
        <section className={styles.panel}>
          <h2>You have a guest basket.</h2>

          <p className={styles.copy}>
            Move it into this account. If a product is in
            both baskets, we keep the larger quantity.
            Completed items are removed from the guest basket.
          </p>

          <button
            className={styles.primary}
            disabled={basket.busy || pending}
            onClick={() => void act(basket.merge)}
          >
            {basket.busy
              ? "Moving your items…"
              : "Move guest basket →"}
          </button>
        </section>
      )}

      {pending ? (
        <p className={styles.copy} role="status">
          Loading your basket and current prices…
        </p>
      ) : failure ? (
        <section className={styles.panel}>
          <p className={styles.alert} role="alert">
            {failure}
          </p>

          <button
            className={styles.secondary}
            onClick={() => {
              setRetry((value) => value + 1);
              void basket.refresh();
            }}
          >
            Reload basket
          </button>
        </section>
      ) : !rows.length ? (
        <section
          className={`${styles.panel} ${styles.empty}`}
        >
          <h2>
            A little empty. Plenty of possibility.
          </h2>

          <p className={styles.copy}>
            Find something fresh to fill your basket.
          </p>

          <Link
            className={styles.primary}
            href="/#shop-favourites"
          >
            Explore the juices →
          </Link>
        </section>
      ) : (
        <div className={styles.cartLayout}>
          <div className={styles.cartList}>
            {review && (
              <section className={styles.panel}>
                <h2>Your pickup details</h2>

                {!session.customer ? (
                  <>
                    <p className={styles.copy}>
                      Create an account or sign in to continue.
                    </p>

                    <Link
                      className={styles.primary}
                      href="/customer/login?next=%2Fcart%2Freview"
                    >
                      Sign in →
                    </Link>

                    <Link
                      className={styles.link}
                      href="/customer/register?next=%2Fcart%2Freview"
                    >
                      Create an account
                    </Link>
                  </>
                ) : (
                  <>
                    <p className={styles.copy}>
                      {[
                        session.customer.firstName,
                        session.customer.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || "Add your name"}

                      <br />

                      {session.customer.emailAddress}

                      <br />

                      {session.customer.phoneNumber ||
                        "Add a contact phone number"}
                    </p>

                    {!contactComplete && (
                      <p className={styles.alert}>
                        Complete your name and phone number
                        before ordering.
                      </p>
                    )}

                    <Link
                      className={styles.link}
                      href="/customer/profile"
                    >
                      Edit contact details
                    </Link>
                  </>
                )}
              </section>
            )}

            {rows.map((row) => (
              <article
                key={row.cartItemId}
                className={styles.cartRow}
              >
                <Photo
                  key={
                    row.productId +
                    row.productThumbnailsUrls?.[0]
                  }
                  url={row.productThumbnailsUrls?.[0]}
                  name={row.title || "Juice"}
                />

                <div>
                  <h2>
                    {row.title || "Unavailable product"}
                  </h2>

                  <p>
                    {sizeLabel(row.productBottleSize)}
                    {" · "}
                    {row.available
                      ? money(row.unitPrice) + " each"
                      : "Unavailable — please remove this item"}
                  </p>

                  {!review ? (
                    <div className={styles.quantity}>
                      <button
                        type="button"
                        aria-label={
                          `Decrease ${row.title} ` +
                          `${sizeLabel(row.productBottleSize)} quantity`
                        }
                        disabled={
                          basket.busy ||
                          row.quantity <= 1 ||
                          !row.available
                        }
                        onClick={() =>
                          void act(() =>
                            basket.quantity(
                              row.cartItemId,
                              row.quantity - 1,
                            ),
                          )
                        }
                      >
                        −
                      </button>

                      <span aria-label="Quantity">
                        {row.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={
                          `Increase ${row.title} ` +
                          `${sizeLabel(row.productBottleSize)} quantity`
                        }
                        disabled={
                          basket.busy ||
                          row.quantity >= 100 ||
                          !row.available
                        }
                        onClick={() =>
                          void act(() =>
                            basket.quantity(
                              row.cartItemId,
                              row.quantity + 1,
                            ),
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <p>Quantity: {row.quantity}</p>
                  )}
                </div>

                <div>
                  <strong>
                    {row.available
                      ? money(row.lineTotal)
                      : "—"}
                  </strong>

                  {!review && (
                    <div>
                      <button
                        className={styles.link}
                        disabled={basket.busy}
                        onClick={() =>
                          void act(() =>
                            basket.remove(row.cartItemId),
                          )
                        }
                      >
                        Remove {row.title}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}

            {!review && (
              <div className={styles.links}>
                <Link
                  className={styles.link}
                  href="/#shop-favourites"
                >
                  Keep shopping
                </Link>

                <button
                  className={styles.link}
                  disabled={basket.busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove every item from this basket?",
                      )
                    ) {
                      void act(basket.clear);
                    }
                  }}
                >
                  Clear basket
                </button>
              </div>
            )}
          </div>

          <aside
            className={`${styles.panel} ${styles.summary}`}
          >
            <h2>
              {review
                ? "Pickup summary"
                : "A basket of goodness."}
            </h2>

            <dl>
              <dt>Items</dt>
              <dd>
                {rows.reduce(
                  (sum, row) => sum + row.quantity,
                  0,
                )}
              </dd>

              <dt>Collection</dt>
              <dd>Customer-arranged pickup</dd>
            </dl>

            <div className={styles.total}>
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            {hasUnavailable && (
              <p className={styles.alert}>
                Remove unavailable products before continuing.
              </p>
            )}

            {review ? (
              <>
                <p className={styles.copy}>
                  Your basket is saved. Online order placement
                  and payment are not available yet. No order
                  has been placed and no payment has been taken.
                </p>

                <Link
                  className={styles.secondary}
                  href="/cart"
                >
                  Back to basket
                </Link>
              </>
            ) : hasUnavailable ? null : (
              <Link
                className={styles.primary}
                href={
                  session.customer
                    ? "/cart/review"
                    : "/customer/login?next=%2Fcart"
                }
              >
                {session.customer
                  ? "Review pickup →"
                  : "Sign in to continue →"}
              </Link>
            )}

            {!session.customer && !review && (
              <Link
                className={styles.link}
                href="/customer/register?next=%2Fcart"
              >
                New here? Create an account
              </Link>
            )}
          </aside>
        </div>
      )}
    </CustomerShell>
  );
}