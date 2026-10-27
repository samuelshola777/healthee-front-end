"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import AdminDialog from "./AdminDialog";
import {
  adminRequest,
  adminMoney,
  bottleLabel,
  imageUrl,
  productError,
  type LiveProduct,
  type ProductDraft,
  type ProductPage,
} from "./admin-api";
import styles from "./live-admin.module.css";

type Media = {
  key: string;
  url?: string;
  file?: File;
  preview?: string;
};

const draftOf = (product?: LiveProduct): ProductDraft => ({
  productName: product?.productName ?? "",
  productDescription: product?.productDescription ?? "",
  productCategoriesType: product?.productCategoriesType ?? "NORM",
  productBottleSize:
    product?.productBottleSize ??
    (product?.productCategoriesType === "FOODS" ? null : "CL_25"),
  productPrice: product?.productPrice ?? "",
  productThumbnailsUrls: product?.productThumbnailsUrls ?? [],
  availableForPublicDisplay:
    product?.availableForPublicDisplay ?? true,
  displayVideoUrl: product?.displayVideoUrl ?? "",
  revision: product?.revision ?? 0,
});

function Thumbnail({
  url,
  name,
}: {
  url?: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  return url && !failed ? (
    <img src={url} alt={name} onError={() => setFailed(true)} />
  ) : (
    <span
      className={styles.placeholder}
      aria-label="No product image"
    >
      ❧
    </span>
  );
}

function Editor({
  product,
  onClose,
  onSaved,
  onReload,
}: {
  product?: LiveProduct;
  onClose: () => void;
  onSaved: () => void;
  onReload: () => void;
}) {
  const [draft, setDraft] = useState<ProductDraft>(() =>
    draftOf(product),
  );

  const [media, setMedia] = useState<Media[]>(() =>
    (product?.productThumbnailsUrls ?? []).map((url) => ({
      key: crypto.randomUUID(),
      url,
    })),
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [conflict, setConflict] = useState(false);

  const input = useRef<HTMLInputElement>(null);
  const previews = useRef(new Set<string>());
  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controller.current?.abort();

      previews.current.forEach((value) =>
        URL.revokeObjectURL(value),
      );

      previews.current.clear();
    };
  }, []);

  function files(selected: FileList | null) {
    if (!selected || lock.current) return;

    const values = Array.from(selected);

    if (
      media.length + values.length > 12 ||
      values.some(
        (file) =>
          !file.size ||
          file.size > 5 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(
            file.type,
          ),
      )
    ) {
      setError(
        "Choose up to 12 JPG, PNG or WebP thumbnails, each up to 5 MB.",
      );
      return;
    }

    setError("");

    const added = values.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);

      return {
        key: crypto.randomUUID(),
        file,
        preview,
      };
    });

    setMedia((current) => [...current, ...added]);
  }

  function remove(item: Media) {
    if (item.preview) {
      URL.revokeObjectURL(item.preview);
      previews.current.delete(item.preview);
    }

    setMedia((current) =>
      current.filter((value) => value.key !== item.key),
    );
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lock.current) return;

    const preliminary = productError({
      ...draft,
      productThumbnailsUrls: media
        .filter((item) => item.url)
        .map((item) => item.url),
    });

    if (preliminary) {
      setError(preliminary);
      return;
    }

    lock.current = true;
    controller.current = new AbortController();

    const signal = controller.current.signal;

    setBusy(true);
    setError("");
    setConflict(false);

    let staged = [...media];

    try {
      let completed = 0;
      const total = staged.filter(
        (item) => item.file && !item.url,
      ).length;

      for (const item of staged) {
        if (!item.file || item.url) continue;

        setProgress(
          `Uploading thumbnail ${++completed} of ${total}…`,
        );

        const body = new FormData();
        body.set("file", item.file);

        const uploaded = await adminRequest<{ fileUrl: string }>(
          "upload",
          "POST",
          body,
          signal,
        );

        if (!imageUrl(uploaded.fileUrl)) {
          throw new Error(
            "The service returned an invalid image URL.",
          );
        }

        // Keep successful uploads so retrying a failed save does not
        // upload the same files again.
        staged = staged.map((value) =>
          value.key === item.key
            ? {
                ...value,
                url: uploaded.fileUrl,
                file: undefined,
              }
            : value,
        );

        if (!signal.aborted) {
          setMedia(staged);
        }
      }

      const body = {
        ...draft,
        productName: draft.productName.trim(),
        productPrice: String(draft.productPrice),
        productThumbnailsUrls: staged.map((item) => item.url!),
      };

      const validation = productError(body);

      if (validation) {
        throw new Error(validation);
      }

      setProgress("Saving product…");

      await adminRequest(
        product ? `product/${product.id}` : "product",
        product ? "PUT" : "POST",
        body,
        signal,
      );

      if (!signal.aborted) {
        onSaved();
      }
    } catch (failure) {
      if (!signal.aborted) {
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not save product.",
        );

        setConflict(
          !!product &&
            (failure as { status?: number }).status === 409,
        );
      }
    } finally {
      lock.current = false;

      if (!signal.aborted) {
        setBusy(false);
        setProgress("");
      }
    }
  }

  return (
    <AdminDialog
      title={product ? "Edit product" : "Add product"}
      busy={busy}
      onClose={onClose}
    >
      <form className={styles.form} onSubmit={save}>
        <fieldset disabled={busy}>
          <p className={styles.muted}>
            Each bottle size is a separate product record. Prices
            are in naira.
          </p>

          <label>
            Product name
            <input
              name="productName"
              required
              maxLength={150}
              value={draft.productName}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  productName: event.target.value,
                })
              }
            />
          </label>

          <label>
            Description
            <textarea
              name="productDescription"
              maxLength={2000}
              rows={3}
              value={draft.productDescription}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  productDescription: event.target.value,
                })
              }
            />
          </label>

          <div className={styles.two}>
            <label>
              Category
              <select
                name="productCategoriesType"
                value={draft.productCategoriesType}
                onChange={(event) => {
                  const category = event.target
                    .value as LiveProduct["productCategoriesType"];

                  setDraft({
                    ...draft,
                    productCategoriesType: category,
                    productBottleSize:
                      category === "FOODS"
                        ? null
                        : draft.productBottleSize ?? "CL_25",
                  });
                }}
              >
                <option value="NORM">Norm</option>
                <option value="EXOTIC">Exotic</option>
                <option value="FOODS">Foods</option>
              </select>
            </label>

            <label>
              Bottle size
              <select
                name="productBottleSize"
                disabled={draft.productCategoriesType === "FOODS"}
                value={draft.productBottleSize ?? ""}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    productBottleSize: event.target
                      .value as LiveProduct["productBottleSize"],
                  })
                }
              >
                {draft.productCategoriesType === "FOODS" ? (
                  <option value="">Per serving</option>
                ) : (
                  <>
                    <option value="CL_25">25cl</option>
                    <option value="CL_50">50cl</option>
                  </>
                )}
              </select>
            </label>
          </div>

          <label>
            Price (₦)
            <input
              name="productPrice"
              type="number"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              required
              value={draft.productPrice}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  productPrice: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.check}>
            <input
              name="availableForPublicDisplay"
              type="checkbox"
              checked={draft.availableForPublicDisplay}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  availableForPublicDisplay: event.target.checked,
                })
              }
            />
            Show on public menu
          </label>

          <section
            className={styles.mediaSection}
            aria-labelledby="thumbnail-title"
          >
            <div className={styles.row}>
              <div>
                <h3 id="thumbnail-title">Product thumbnails</h3>
                <p className={styles.muted}>
                  The first image is the primary thumbnail.
                  Uploads start when you save.
                </p>
              </div>

              <span>{media.length}/12</span>
            </div>

            <input
              ref={input}
              className={styles.srOnly}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              aria-label="Upload product thumbnails"
              onChange={(event) => {
                files(event.target.files);
                event.target.value = "";
              }}
            />

            <button
              type="button"
              className={styles.uploadBox}
              disabled={media.length >= 12}
              onClick={() => input.current?.click()}
            >
              <strong>＋ Choose product images</strong>
              <span>JPG, PNG or WebP · Maximum 5 MB each</span>
            </button>

            <div className={styles.gallery}>
              {media.map((item, index) => (
                <div className={styles.imageCard} key={item.key}>
                  <Thumbnail
                    url={item.url ?? item.preview}
                    name={`Thumbnail ${index + 1}`}
                  />

                  <span>
                    {index === 0
                      ? "Primary image"
                      : `Image ${index + 1}`}
                    {item.file ? " · New" : ""}
                  </span>

                  <div>
                    <button
                      type="button"
                      disabled={index === 0}
                      aria-label={`Make thumbnail ${index + 1} primary`}
                      onClick={() =>
                        setMedia((current) => [
                          item,
                          ...current.filter(
                            (value) => value.key !== item.key,
                          ),
                        ])
                      }
                    >
                      Make primary
                    </button>

                    <button
                      type="button"
                      aria-label={`Remove thumbnail ${index + 1}`}
                      onClick={() => remove(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </fieldset>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {conflict && (
          <button
            type="button"
            className={styles.secondary}
            disabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  "Reloading discards your unsaved editor changes. Continue?",
                )
              ) {
                onReload();
              }
            }}
          >
            Reload latest product
          </button>
        )}

        {progress && <p role="status">{progress}</p>}

        <div className={styles.formActions}>
          <button
            className={styles.primary}
            type="submit"
            disabled={busy}
          >
            {busy ? "Please wait…" : "Save product"}
          </button>

          <button
            className={styles.secondary}
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [visible, setVisible] = useState("");
  const [sort, setSort] = useState("createdAt");

  const [result, setResult] = useState<ProductPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);

  const [editor, setEditor] = useState<{
    product?: LiveProduct;
    key: string;
  } | null>(null);

  const [deleting, setDeleting] = useState<LiveProduct | null>(
    null,
  );
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);

  const lock = useRef(false);
  const mutation = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => mutation.current?.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    const timer = setTimeout(() => {
      const params = new URLSearchParams({
        page: String(page),
        size: "18",
        search: search.trim(),
        category,
        visible,
        sortBy: sort,
        direction: sort === "productName" ? "ASC" : "DESC",
      });

      void adminRequest<ProductPage>(
        "product?" + params,
        "GET",
        undefined,
        controller.signal,
      )
        .then((value) => {
          if (!controller.signal.aborted) {
            setResult(value);
          }
        })
        .catch((failure) => {
          if (!controller.signal.aborted) {
            setError(failure.message);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [page, search, category, visible, sort, reload]);

  async function action(
    task: (signal: AbortSignal) => Promise<void>,
  ) {
    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setError("");

    mutation.current = new AbortController();
    const signal = mutation.current.signal;

    try {
      await task(signal);
    } catch (failure) {
      if (!signal.aborted) {
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not complete request.",
        );
      }
    } finally {
      lock.current = false;

      if (!signal.aborted) {
        setBusy(false);
      }
    }
  }

  function edit(product: LiveProduct) {
    void action(async (signal) => {
      const value = await adminRequest<LiveProduct>(
        `product/${product.id}`,
        "GET",
        undefined,
        signal,
      );

      if (!signal.aborted) {
        setEditor({
          product: value,
          key: crypto.randomUUID(),
        });
      }
    });
  }

  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            YOUR LIVE CATALOGUE
          </span>

          <h1>Products & Pricing</h1>
          <p>Manage real products, bottle sizes, prices and photos.</p>
        </div>

        <button
          className={styles.primary}
          disabled={busy}
          onClick={() => setEditor({ key: crypto.randomUUID() })}
        >
          Add product +
        </button>
      </div>

      <div className={styles.filters}>
        <label>
          Search products
          <input
            type="search"
            aria-label="Search products"
            maxLength={100}
            value={search}
            placeholder="Name or description"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            <option value="NORM">Norm</option>
            <option value="EXOTIC">Exotic</option>
            <option value="FOODS">Foods</option>
          </select>
        </label>

        <label>
          Visibility
          <select
            value={visible}
            onChange={(event) => {
              setVisible(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All products</option>
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
        </label>

        <label>
          Sort by
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="createdAt">Newest first</option>
            <option value="productName">Product name</option>
            <option value="productPrice">Highest price</option>
            <option value="updatedAt">Recently updated</option>
          </select>
        </label>
      </div>

      {notice && (
        <p className={styles.success} role="status">
          {notice}
        </p>
      )}

      {error && (
        <div className={styles.error} role="alert">
          {error}{" "}
          <button onClick={() => setReload((value) => value + 1)}>
            Retry loading
          </button>
        </div>
      )}

      {loading ? (
        <p className={styles.empty} role="status">
          Loading products…
        </p>
      ) : (
        !error && (
          <>
            <p className={styles.muted}>
              {result?.totalElements ?? 0} product variants
            </p>

            <div className={styles.productGrid}>
              {result?.data.map((product) => (
                <article
                  className={styles.productCard}
                  key={product.id}
                >
                  <div className={styles.productImage}>
                    <Thumbnail
                      key={
                        product.productThumbnailsUrls?.[0] ??
                        product.id
                      }
                      url={imageUrl(
                        product.productThumbnailsUrls?.[0],
                      )}
                      name={product.productName}
                    />
                  </div>

                  <div>
                    <span className={styles.eyebrow}>
                      {product.productCategoriesType} ·{" "}
                      {bottleLabel(product.productBottleSize)}
                    </span>

                    <h2>{product.productName}</h2>

                    <strong className={styles.price}>
                      {adminMoney(product.productPrice)}
                    </strong>

                    <span
                      className={
                        product.availableForPublicDisplay
                          ? styles.visible
                          : styles.hidden
                      }
                    >
                      {product.availableForPublicDisplay
                        ? "Visible on menu"
                        : "Hidden from menu"}
                    </span>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.secondary}
                        disabled={busy}
                        aria-label={`Edit ${product.productName} ${bottleLabel(
                          product.productBottleSize,
                        )}`}
                        onClick={() => edit(product)}
                      >
                        Edit product
                      </button>

                      <button
                        className={styles.danger}
                        disabled={busy}
                        onClick={() => {
                          setDeleting(product);
                          setConfirmation("");
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!result?.data.length && (
              <p className={styles.empty}>
                No products match these filters.
              </p>
            )}

            <div className={styles.pagination}>
              <button
                className={styles.secondary}
                disabled={page <= 1 || busy}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </button>

              <span>
                Page {page} of{" "}
                {Math.max(1, result?.totalPage ?? 1)}
              </span>

              <button
                className={styles.secondary}
                disabled={
                  page >= (result?.totalPage ?? 1) || busy
                }
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </>
        )
      )}

      {editor && (
        <Editor
          key={editor.key}
          product={editor.product}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setNotice(
              "Product saved. The public catalogue will show the saved values on its next load.",
            );
            setReload((value) => value + 1);
          }}
          onReload={() => {
            if (editor.product) {
              edit(editor.product);
            }
          }}
        />
      )}

      {deleting && (
        <AdminDialog
          title="Delete product?"
          busy={busy}
          onClose={() => setDeleting(null)}
        >
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();

              if (confirmation !== "DELETE") return;

              void action(async (signal) => {
                await adminRequest(
                  `product/${deleting.id}`,
                  "DELETE",
                  undefined,
                  signal,
                );

                if (signal.aborted) return;

                setDeleting(null);
                setNotice("Product deleted.");

                if (result?.data.length === 1 && page > 1) {
                  setPage((value) => value - 1);
                } else {
                  setReload((value) => value + 1);
                }
              });
            }}
          >
            <p>
              Delete{" "}
              <strong>
                {deleting.productName},{" "}
                {bottleLabel(deleting.productBottleSize)}
              </strong>
              ? This removes the product and schedules cleanup of
              images no longer used by another product.
            </p>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <label>
              Type DELETE to confirm
              <input
                name="deleteProductConfirmation"
                value={confirmation}
                disabled={busy}
                onChange={(event) =>
                  setConfirmation(event.target.value)
                }
                autoComplete="off"
              />
            </label>

            <button
              className={styles.danger}
              disabled={busy || confirmation !== "DELETE"}
            >
              Delete product
            </button>
          </form>
        </AdminDialog>
      )}
    </section>
  );
}