"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { Arrow, Icon } from "./Icons";
import { closeOnBackdrop, useDialogScrollLock } from "./dialog";
import { useBasket } from "./customer/BasketProvider";
import styles from "./featured-shop.module.css";

type Product = {
  id: string;
  productName: string;
  productDescription: string;
  productPrice: number | string;
  productCategoriesType: "NORM" | "EXOTIC" | "FOODS";
  productBottleSize: "CL_25" | "CL_50" | null;
  productThumbnailsUrls: string[] | null;
  displayVideoUrl: string | null;
  availableForPublicDisplay: boolean;
};

type Group = {
  key: string;
  name: string;
  variants: Product[];
};

export type FeaturedShopHandle = {
  openMenu: () => void;
  openBasket: () => void;
  openProduct: (flavour: string) => void;
};

const FLAVOUR_NAMES: Record<string, string[]> = {
  orange: ["orange juice", "orange"],
  watermelon: ["watermelon juice", "watermelon"],
  pineapple: ["pineapple juice", "pineapple"],
  zobo: ["zobo", "zobo juice"],
  tigernut: ["tigernut", "tigernut juice", "tigernut milk"],
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);

const sizeLabel = (product: Product) =>
  product.productBottleSize === "CL_25"
    ? "25cl"
    : product.productBottleSize === "CL_50"
      ? "50cl"
      : "Per serving";

const minorPrice = (product: Product) =>
  Math.round(Number(product.productPrice) * 100);

const mediaUrl = (value?: string | null) => {
  if (!value) return "";

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
};

const fruit = (name: string) => {
  const lower = name.toLowerCase();

  return ["orange", "watermelon", "pineapple", "zobo"].find(
    (item) => lower.includes(item),
  );
};

function groupProducts(products: Product[]): Group[] {
  const groups = new Map<string, Group>();

  for (const product of products) {
    const key =
      product.productCategoriesType +
      ":" +
      product.productName.trim().toLowerCase();

    const group = groups.get(key) ?? {
      key,
      name: product.productName,
      variants: [],
    };

    group.variants.push(product);
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => ({
    ...group,
    variants: group.variants.sort((a, b) =>
      (a.productBottleSize ?? "").localeCompare(
        b.productBottleSize ?? "",
      ),
    ),
  }));
}

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const source = mediaUrl(product.productThumbnailsUrls?.[0]);

  return source && !failed ? (
    <img
      src={source}
      alt={product.productName}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <div className={styles.imagePlaceholder}>
      {fruit(product.productName) && (
        <span
          className={`ingredient ingredient-${fruit(product.productName)}`}
          aria-hidden="true"
        />
      )}

      <span>Product photo coming soon</span>
    </div>
  );
}

function ProductMedia({ product }: { product: Product }) {
  const [selected, setSelected] = useState("");
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const images = [
    ...new Set(
      (product.productThumbnailsUrls ?? [])
        .map(mediaUrl)
        .filter(Boolean),
    ),
  ]
    .filter((url) => !failedImages.includes(url))
    .slice(0, 12);

  const source = images.includes(selected)
    ? selected
    : images[0];

  const video = mediaUrl(product.displayVideoUrl);

  return (
    <div className={styles.gallery}>
      <div className={styles.mediaFrame}>
        {showVideo && video && !videoFailed ? (
          <video
            key={video}
            src={video}
            poster={source}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-label={`${product.productName} product video`}
            onError={() => {
              setVideoFailed(true);
              setShowVideo(false);
            }}
          />
        ) : source ? (
          <img
            key={source}
            src={source}
            alt={`${product.productName}, ${sizeLabel(product)}`}
            onError={() =>
              setFailedImages((current) => [
                ...current,
                source,
              ])
            }
          />
        ) : (
          <div className={styles.mediaPlaceholder}>
            <span aria-hidden="true">❧</span>
            <p>Product photo is not available yet.</p>
          </div>
        )}

        <span className={styles.mediaSize}>
          {sizeLabel(product)}
        </span>
      </div>

      {images.length > 1 && (
        <div
          className={styles.thumbnails}
          role="group"
          aria-label="Product photos"
        >
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              aria-label={`View photo ${index + 1}`}
              aria-pressed={!showVideo && source === url}
              onClick={() => {
                setSelected(url);
                setShowVideo(false);
              }}
            >
              <img src={url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {video && !videoFailed && (
        <button
          type="button"
          className={styles.videoToggle}
          aria-pressed={showVideo}
          onClick={() =>
            setShowVideo((current) => !current)
          }
        >
          <span aria-hidden="true">
            {showVideo ? "◻" : "▷"}
          </span>

          {showVideo
            ? "Show product photo"
            : "Watch product video"}
        </button>
      )}

      {videoFailed && (
        <p className={styles.mediaNote} role="status">
          Video is unavailable. The product photo is shown
          instead.
        </p>
      )}
    </div>
  );
}

function ProductCard({
  group,
  onView,
  onAdd,
  disabled,
}: {
  group: Group;
  onView: (product: Product) => void;
  onAdd: (product: Product) => void;
  disabled: boolean;
}) {
  const [selectedId, setSelectedId] = useState(
    group.variants[0].id,
  );

  const selected =
    group.variants.find((item) => item.id === selectedId) ??
    group.variants[0];

  return (
    <article className={styles.card}>
      <button
        className={styles.photoButton}
        onClick={() => onView(selected)}
        aria-label={`View ${selected.productName}, ${sizeLabel(selected)}`}
      >
        <ProductImage
          key={selected.id}
          product={selected}
        />
      </button>

      <div className={styles.cardBody}>
        <button
          className={styles.productName}
          onClick={() => onView(selected)}
        >
          {group.name}
        </button>

        <p className={styles.price}>
          {money(minorPrice(selected) / 100)}
        </p>

        <div
          className={styles.sizes}
          role="group"
          aria-label={`${group.name} size`}
        >
          {group.variants.map((item) => (
            <button
              key={item.id}
              aria-pressed={selected.id === item.id}
              onClick={() => setSelectedId(item.id)}
            >
              {sizeLabel(item)}
            </button>
          ))}
        </div>

        <button
          className={styles.addButton}
          onClick={() => onAdd(selected)}
          disabled={disabled}
        >
          <Icon name="cart" />
          Add to cart
        </button>
      </div>
    </article>
  );
}

export default forwardRef<
  FeaturedShopHandle,
  {
    onBasketCountChange: (count: number) => void;
  }
>(function FeaturedShop({ onBasketCountChange }, ref) {
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const basket = useBasket();
  const router = useRouter();

  const [notice, setNotice] = useState("");
  const [panel, setPanel] = useState<"menu" | "product">(
    "menu",
  );

  const [requestedFlavour, setRequestedFlavour] = useState<
    string | null
  >(null);

  const [detail, setDetail] = useState<Product | null>(
    null,
  );
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");

  const dialog = useRef<HTMLDialogElement>(null);
  const detailRequest = useRef<AbortController | null>(null);

  useDialogScrollLock(dialog);

  function open(next: "menu" | "basket") {
    if (next === "basket") {
      dialog.current?.close();
      router.push("/cart");
      return;
    }

    detailRequest.current?.abort();
    setRequestedFlavour(null);
    setPanel(next);
    dialog.current?.showModal();
  }

  function openProduct(flavour: string) {
    detailRequest.current?.abort();

    setRequestedFlavour(flavour);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setNotice("");
    setPanel("product");

    dialog.current?.showModal();
  }

  useImperativeHandle(ref, () => ({
    openMenu: () => open("menu"),
    openBasket: () => open("basket"),
    openProduct,
  }));

  useEffect(
    () => () => detailRequest.current?.abort(),
    [],
  );

  useEffect(() => {
    onBasketCountChange(basket.count);
  }, [basket.count, onBasketCountChange]);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    void (async () => {
      try {
        const items: Product[] = [];

        for (let page = 1; page <= 100; page++) {
          const response = await fetch(
            `/api/catalogue?page=${page}`,
            {
              signal: controller.signal,
              cache: "no-store",
            },
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Could not load products.",
            );
          }

          if (
            !Number.isInteger(data.totalPage) ||
            !Array.isArray(data.data)
          ) {
            throw new Error(
              "The product service returned an unexpected response.",
            );
          }

          items.push(...data.data);

          if (page >= data.totalPage) break;

          if (page === 100) {
            throw new Error(
              "The catalogue is too large to load. Please contact support.",
            );
          }
        }

        if (!controller.signal.aborted) {
          setCatalogue([
            ...new Map(
              items
                .filter(
                  (item) =>
                    item &&
                    typeof item.id === "string" &&
                    typeof item.productName === "string" &&
                    item.availableForPublicDisplay === true &&
                    Number.isFinite(
                      Number(item.productPrice),
                    ) &&
                    Number(item.productPrice) >= 0,
                )
                .map((item) => [item.id, item]),
            ).values(),
          ]);
        }
      } catch (failure) {
        if (!controller.signal.aborted) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load products.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    if (!requestedFlavour || loading) return;

    const flavour = requestedFlavour;
    setRequestedFlavour(null);

    if (error) {
      setDetailLoading(false);
      setDetailError(error);
      return;
    }

    const names = FLAVOUR_NAMES[flavour] ?? [];

    const candidates = catalogue.filter((product) =>
      names.includes(
        product.productName.trim().toLowerCase(),
      ),
    );

    const rank = (product: Product) =>
      product.productBottleSize === "CL_25"
        ? 0
        : product.productBottleSize === "CL_50"
          ? 1
          : 2;

    candidates.sort(
      (a, b) =>
        rank(a) - rank(b) ||
        a.id.localeCompare(b.id),
    );

    if (!candidates.length) {
      setDetailLoading(false);
      setDetailError(
        `${
          flavour.charAt(0).toUpperCase() +
          flavour.slice(1)
        } is not currently available in the public menu.`,
      );
      return;
    }

    void view(candidates[0]);

    // Resolve a queued flavour click once catalogue loading finishes.
    // view owns the cancellable request for the selected database ID.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedFlavour, loading, catalogue, error]);

  const groups = groupProducts(catalogue);

  const featured = [
    "orange juice",
    "watermelon juice",
    "pineapple juice",
    "zobo",
  ].flatMap((name) => {
    const group = groups.find(
      (item) =>
        item.name.trim().toLowerCase() === name,
    );

    return group ? [group] : [];
  });

  const visible = groups.filter(
    (group) =>
      (category === "ALL" ||
        group.variants[0].productCategoriesType ===
          category) &&
      group.name
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );

  async function add(product: Product) {
    setNotice("");

    try {
      await basket.add(product.id);

      setNotice(
        `${product.productName}, ${sizeLabel(product)}, added to your basket.`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not update your basket.",
      );
    }
  }

  async function view(product: Product) {
    detailRequest.current?.abort();

    setRequestedFlavour(null);
    setNotice("");

    const controller = new AbortController();
    detailRequest.current = controller;

    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setPanel("product");

    dialog.current?.showModal();

    try {
      const response = await fetch(
        `/api/catalogue?id=${encodeURIComponent(product.id)}`,
        {
          signal: controller.signal,
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not load this product.",
        );
      }

      if (
        data.id !== product.id ||
        data.availableForPublicDisplay !== true ||
        !Number.isFinite(Number(data.productPrice))
      ) {
        throw new Error("This product is unavailable.");
      }

      if (!controller.signal.aborted) {
        setDetail(data);
      }
    } catch (failure) {
      if (!controller.signal.aborted) {
        setDetailError(
          failure instanceof Error
            ? failure.message
            : "Could not load this product.",
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setDetailLoading(false);
      }
    }
  }

  const detailVariants = detail
    ? groups.find((group) =>
        group.variants.some(
          (variant) => variant.id === detail.id,
        ),
      )?.variants ?? [detail]
    : [];

  const feedback = loading ? (
    <p role="status">Loading fresh favourites…</p>
  ) : error ? (
    <div role="alert">
      <p>{error}</p>

      <button
        className={styles.secondaryButton}
        onClick={() => setRetry((value) => value + 1)}
      >
        Retry
      </button>
    </div>
  ) : null;

  return (
    <>
      <section
        className={styles.section}
        id="shop-favourites"
        aria-labelledby="shop-title"
      >
        <div className={styles.layout}>
          <div className={styles.intro}>
            <span
              className={styles.leaves}
              aria-hidden="true"
            >
              ❧
            </span>

            <p className={styles.eyebrow}>
              FRESH FROM HEALTHEE
            </p>

            <h2 id="shop-title">Shop your favourites.</h2>

            <p>Fresh juice. Your size. Your happy.</p>

            <button
              className={styles.addButton}
              onClick={() => open("menu")}
            >
              View full menu
              <Arrow />
            </button>

            <img
              src="/assets/fresh-market/closing-fruit.png"
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className={styles.grid}>
            {feedback}

            {!loading && !error && !featured.length && (
              <p>
                No featured products are available yet.
                Explore the full menu.
              </p>
            )}

            {!loading &&
              !error &&
              featured.map((group) => (
                <ProductCard
                  key={group.key}
                  group={group}
                  onView={view}
                  onAdd={add}
                  disabled={basket.busy || !basket.ready}
                />
              ))}
          </div>
        </div>

        <p className={styles.notice} role="status">
          {notice}
        </p>
      </section>

      <dialog
        ref={dialog}
        className={styles.modal}
        aria-labelledby="shop-dialog-title"
        onClick={closeOnBackdrop}
        onClose={() => {
          if (!dialog.current?.open) {
            detailRequest.current?.abort();
            setRequestedFlavour(null);
          }
        }}
      >
        <div className={styles.modalHeader}>
          <h2 id="shop-dialog-title">
            {panel === "product"
              ? "Your juicy details."
              : "Find your favourite."}
          </h2>

          <button
            className="icon-button"
            aria-label="Close"
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className={styles.modalBody}>
          {panel === "menu" && (
            <>
              <label className={styles.search}>
                Search the menu

                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Try orange or cake"
                />
              </label>

              <div
                className={styles.filters}
                role="group"
                aria-label="Product category"
              >
                {["ALL", "NORM", "EXOTIC", "FOODS"].map(
                  (value) => (
                    <button
                      key={value}
                      aria-pressed={category === value}
                      onClick={() => setCategory(value)}
                    >
                      {value === "ALL"
                        ? "All"
                        : value === "FOODS"
                          ? "Foods"
                          : value === "NORM"
                            ? "Norm"
                            : "Exotic"}
                    </button>
                  ),
                )}
              </div>

              {feedback}

              {!loading && !error && (
                <>
                  <p
                    className={styles.results}
                    role="status"
                  >
                    {visible.length} products
                  </p>

                  <div className={styles.grid}>
                    {visible.map((group) => (
                      <ProductCard
                        key={group.key}
                        group={group}
                        onView={view}
                        onAdd={add}
                        disabled={
                          basket.busy || !basket.ready
                        }
                      />
                    ))}
                  </div>

                  {!visible.length && (
                    <p>No products match your search.</p>
                  )}
                </>
              )}
            </>
          )}

          {panel === "product" && (
            <>
              <button
                className={styles.secondaryButton}
                onClick={() => {
                  detailRequest.current?.abort();
                  setRequestedFlavour(null);
                  setPanel("menu");
                }}
              >
                ← Back to menu
              </button>

              {detailLoading && (
                <div
                  className={styles.detailLoading}
                  role="status"
                >
                  <span aria-hidden="true">❧</span>
                  Loading product…
                </div>
              )}

              {detailError && (
                <div
                  className={styles.detailError}
                  role="alert"
                >
                  <h3>
                    Let’s find your next favourite.
                  </h3>

                  <p>{detailError}</p>

                  <button
                    className={styles.addButton}
                    onClick={() => open("menu")}
                  >
                    Browse available products
                  </button>
                </div>
              )}

              {detail && (
                <div className={styles.detail}>
                  <ProductMedia
                    key={detail.id}
                    product={detail}
                  />

                  <div className={styles.detailInfo}>
                    <span
                      className={styles.categoryBadge}
                    >
                      {detail.productCategoriesType ===
                      "FOODS"
                        ? "HEALTHEE FOODS"
                        : detail.productCategoriesType ===
                            "NORM"
                          ? "NORM COLLECTION"
                          : "EXOTIC COLLECTION"}
                    </span>

                    <h3>{detail.productName}</h3>

                    {detail.productDescription && (
                      <p className={styles.description}>
                        {detail.productDescription}
                      </p>
                    )}

                    <div
                      className={styles.variantSection}
                    >
                      <span
                        className={styles.fieldLabel}
                      >
                        {detail.productBottleSize
                          ? "Choose your bottle size"
                          : "Serving"}
                      </span>

                      <div
                        className={styles.variantOptions}
                        role="group"
                        aria-label="Product size"
                      >
                        {detailVariants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            aria-label={`Select ${sizeLabel(variant)}`}
                            aria-pressed={
                              variant.id === detail.id
                            }
                            disabled={
                              basket.busy || detailLoading
                            }
                            onClick={() =>
                              void view(variant)
                            }
                          >
                            {sizeLabel(variant)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.detailPrice}>
                      <strong>
                        {money(minorPrice(detail) / 100)}
                      </strong>

                      <span>
                        per{" "}
                        {detail.productBottleSize
                          ? `${sizeLabel(detail)} bottle`
                          : "serving"}
                      </span>
                    </div>

                    <button
                      className={`${styles.addButton} ${styles.detailAdd}`}
                      onClick={() => void add(detail)}
                      disabled={
                        basket.busy || !basket.ready
                      }
                    >
                      <Icon name="cart" />
                      {basket.busy
                        ? "Adding…"
                        : "Add to cart"}
                      <Arrow />
                    </button>

                    <div className={styles.pickupNote}>
                      <span
                        className={styles.pickupMark}
                        aria-hidden="true"
                      >
                        ↗
                      </span>

                      <div>
                        <strong>Pickup, your way.</strong>

                        <p>
                          Once your order is packaged, you
                          arrange a dispatch rider to
                          collect it.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <p className={styles.notice} role="status">
            {notice}
          </p>
        </div>

        <footer className={styles.modalCart}>
          <div>
            <strong>Your cart</strong>

            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {!basket.ready
                ? "Loading your cart…"
                : `${basket.count} ${
                    basket.count === 1 ? "item" : "items"
                  } in your cart`}
            </span>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={() => open("basket")}
          >
            <Icon name="cart" />
            View cart
            {basket.ready ? ` (${basket.count})` : ""}
          </button>
        </footer>
      </dialog>
    </>
  );
});