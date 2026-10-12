"use client";

import { useRef, useState } from "react";
import HeroVideo from "./hero/HeroVideo";
import FaqSection from "./FaqSection";
import SiteFooter from "./SiteFooter";
import { closeOnBackdrop, useDialogScrollLock } from "./dialog";
import { products, type Product } from "./products";
import { Arrow, Icon, Leaf } from "./Icons";

type Panel = "search" | "account" | "cart" | "menu" | "collection";

export default function FreshMarket() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<Panel>("collection");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product>(products[0]);

  useDialogScrollLock(dialog);

  function open(next: Panel, product?: Product) {
    setPanel(next);
    setQuery("");

    if (product) {
      setSelected(product);
    }

    dialog.current?.showModal();
  }

  const close = () => dialog.current?.close();

  const filtered = products.filter((product) =>
      `${product.name} ${product.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
  );

  const panelTitle = {
    search: "Find your flavour.",
    account: "Your HEALTHEE account",
    cart: "Your basket",
    menu: "Explore HEALTHEE",
    collection: "Meet your next favourite.",
  }[panel];

  return (
      <>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <header className="site-header" id="top">
          <a className="wordmark" href="#" aria-label="HEALTHEE home">
            healt
            <span>
            hee
            <svg viewBox="0 0 27 20" aria-hidden="true">
              <path
                  d="M13 17C2 16 2 8 1 3c9 0 12 5 12 14ZM14 17C12 6 20 2 26 1c1 9-4 15-12 16Z"
                  fill="currentColor"
              />
              <path
                  d="m8 8 6 10 7-11"
                  stroke="#f9f8e3"
                  fill="none"
                  strokeWidth="1.3"
              />
            </svg>
          </span>
          </a>

          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#our-drinks">Our drinks</a>
            <a href="#healthee-way">The HEALTHEE way</a>
            <button onClick={() => open("collection")}>
              Explore collection
            </button>
          </nav>

          <div className="header-actions">
            <button
                className="icon-button"
                aria-label="Search flavours"
                onClick={() => open("search")}
            >
              <Icon name="search" />
            </button>

            <button
                className="icon-button account-button"
                aria-label="Account"
                onClick={() => open("account")}
            >
              <Icon name="account" />
            </button>

            <button
                className="icon-button cart-button"
                aria-label="Basket, 0 items"
                onClick={() => open("cart")}
            >
              <Icon name="cart" />
              <span className="cart-count">0</span>
            </button>

            <button
                className="icon-button menu-button"
                aria-label="Open menu"
                onClick={() => open("menu")}
            >
              <Icon name="menu" />
            </button>
          </div>
        </header>

        <main id="main">
          <section className="hero" aria-labelledby="hero-title">
            <HeroVideo />

            <div className="hero-copy">
              <h1 id="hero-title">
                Good days.
                <br />
                <span>Start juicy.</span>
              </h1>

              <p>Five flavours. Find your favourite.</p>

              <a className="pill-button" href="#our-drinks">
                Explore juices{" "}
                <span className="outlined-arrow">
                <Arrow />
              </span>
              </a>
            </div>
          </section>

          <div className="flavour-zone">
            <nav className="flavour-dock" aria-label="Explore juice flavours">
              {products.map((product) => (
                  <button
                      key={product.id}
                      onClick={() => open("collection", product)}
                      aria-label={`Explore ${product.name}`}
                  >
                <span
                    className={`ingredient ingredient-${product.id}`}
                    aria-hidden="true"
                />
                    <span>{product.name}</span>
                    <span className="round-arrow">
                  <Arrow />
                </span>
                  </button>
              ))}
            </nav>

            <div className="flavour-band">
              <span className="band-leaf" aria-hidden="true" />
              <Leaf />
              <span>FIND YOUR FLAVOUR</span>
              <Leaf />
              <span className="band-orange" aria-hidden="true" />
            </div>
          </div>

          <section
              className="drinks-section"
              id="our-drinks"
              aria-labelledby="drinks-title"
          >
            <div className="section-intro reveal">
              <p className="eyebrow">OUR DRINKS</p>
              <h2 id="drinks-title">Pick your happy.</h2>
              <p className="intro-description">
                Real fruit flavours crafted for your everyday moments. Five
                delicious options, one refreshing collection.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature-card orange-card reveal">
                <img
                    className="feature-art"
                    src="/assets/fresh-market/orange-card.png"
                    alt="Orange HEALTHEE bottle with orange slices and green leaves"
                    width="1254"
                    height="1254"
                    loading="lazy"
                />

                <div className="feature-copy">
                  <h3>
                    Fruity
                    <br />
                    Flavours
                  </h3>

                  <p>
                    Five vibrant
                    <br />
                    flavours made
                    <br />
                    with real fruits.
                  </p>

                  <button
                      className="round-arrow"
                      aria-label="Discover fruity flavours"
                      onClick={() => open("collection", products[0])}
                  >
                    <Arrow />
                  </button>
                </div>
              </article>

              <article
                  className="feature-card moments-card reveal"
                  id="healthee-way"
              >
                <img
                    className="feature-art"
                    src="/assets/fresh-market/moments-card.png"
                    alt="A woman enjoying a HEALTHEE watermelon drink outdoors"
                    width="1254"
                    height="1254"
                    loading="lazy"
                />

                <div className="feature-copy">
                  <h3>
                    Made
                    <br />
                    for your
                    <br />
                    moments
                  </h3>

                  <p>
                    A flavour for
                    <br />
                    every mood
                    <br />
                    and every day.
                  </p>

                  <a
                      className="round-arrow"
                      href="#juicy-moment"
                      aria-label="The HEALTHEE way: a juicy moment"
                  >
                    <Arrow />
                  </a>
                </div>
              </article>

              <article className="feature-card collection-card reveal">
                <img
                    className="feature-art"
                    src="/assets/fresh-market/fruit-collage.png"
                    alt="A colourful arrangement of pineapple, watermelon, citrus, hibiscus and nuts"
                    width="1254"
                    height="1254"
                    loading="lazy"
                />

                <div className="feature-copy">
                  <h3>
                    Explore
                    <br />
                    the collection
                  </h3>

                  <p>
                    Discover all five
                    <br />
                    HEALTHEE juices
                    <br />
                    and find your
                    <br />
                    favourite.
                  </p>

                  <button
                      className="round-arrow"
                      aria-label="Explore all five juices"
                      onClick={() => open("collection")}
                  >
                    <Arrow />
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section
              className="closing-section"
              id="juicy-moment"
              aria-labelledby="closing-title"
          >
            <svg
                className="cream-wave"
                viewBox="0 0 1024 60"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
              <path
                  d="M0 0H1024V6C868 74 777 26 638 24S358 1 203 23 63 15 0 0Z"
                  fill="currentColor"
              />
            </svg>

            <span className="closing-fruit closing-left" aria-hidden="true" />
            <span className="closing-fruit closing-right" aria-hidden="true" />

            <h2 className="reveal" id="closing-title">
              Make room for
              <br />a juicy moment.
            </h2>
          </section>

          <FaqSection onExplore={() => open("collection")} />
        </main>

        <SiteFooter onExplore={() => open("collection")} />

        <dialog
            className="market-dialog"
            ref={dialog}
            aria-labelledby="dialog-title"
            onClick={closeOnBackdrop}
            onKeyDownCapture={(event) => {
              // Search inputs otherwise consume the first Escape to clear their value.
              if (event.key === "Escape") {
                event.preventDefault();
                close();
              }
            }}
        >
          <div className="dialog-header">
            <h2 id="dialog-title">{panelTitle}</h2>

            <button
                className="icon-button"
                aria-label="Close dialog"
                onClick={close}
            >
              <Icon name="close" />
            </button>
          </div>

          {panel === "menu" && (
              <nav className="mobile-nav" aria-label="Mobile navigation">
                <a href="#our-drinks" onClick={close}>
                  Our drinks <Arrow />
                </a>

                <a href="#healthee-way" onClick={close}>
                  The HEALTHEE way <Arrow />
                </a>

                <button onClick={() => setPanel("collection")}>
                  Explore collection <Arrow />
                </button>

                <button onClick={() => setPanel("account")}>
                  Account <Icon name="account" />
                </button>
              </nav>
          )}

          {panel === "search" && (
              <div className="search-panel">
                <label htmlFor="flavour-search">Search our five flavours</label>

                <input
                    id="flavour-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Try orange or watermelon"
                    autoComplete="off"
                />

                <p className="search-status" role="status">
                  {filtered.length} {filtered.length === 1 ? "flavour" : "flavours"}{" "}
                  found
                </p>

                <div className="search-results">
                  {filtered.map((product) => (
                      <button
                          key={product.id}
                          onClick={() => {
                            setSelected(product);
                            setPanel("collection");
                          }}
                      >
                  <span
                      className={`ingredient ingredient-${product.id}`}
                      aria-hidden="true"
                  />
                        {product.name}
                        <Arrow />
                      </button>
                  ))}
                </div>

                {!filtered.length && (
                    <p>
                      Try another flavour: Orange, Watermelon, Pineapple, Zobo or
                      Tigernut.
                    </p>
                )}
              </div>
          )}

          {panel === "account" && (
              <div className="empty-panel">
                <Icon name="account" />
                <p>Online accounts are not available yet.</p>
                <p>You can still discover all five HEALTHEE flavours.</p>

                <button
                    className="text-button"
                    onClick={() => setPanel("collection")}
                >
                  Explore the collection <Arrow />
                </button>
              </div>
          )}

          {panel === "cart" && (
              <div className="empty-panel">
                <Icon name="cart" />
                <h3>Your basket is empty.</h3>

                <p>
                  Online ordering is not available yet. Find your favourite flavour
                  in the collection.
                </p>

                <button
                    className="text-button"
                    onClick={() => setPanel("collection")}
                >
                  Explore juices <Arrow />
                </button>
              </div>
          )}

          {panel === "collection" && (
              <div className="collection-panel">
                <div
                    className="product-options"
                    role="group"
                    aria-label="Select a flavour"
                >
                  {products.map((product) => (
                      <button
                          key={product.id}
                          aria-pressed={selected.id === product.id}
                          onClick={() => setSelected(product)}
                      >
                        {product.name}
                      </button>
                  ))}
                </div>

                <div className="product-detail" aria-live="polite">
                  <img
                      src={selected.image}
                      alt={`${selected.name} HEALTHEE juice bottle`}
                      width="400"
                      height="400"
                  />

                  <div>
                    <p className="eyebrow">{selected.category}</p>
                    <h3>{selected.name}</h3>
                    <p>{selected.description}</p>
                  </div>
                </div>
              </div>
          )}
        </dialog>
      </>
  );
}