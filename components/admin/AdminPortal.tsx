"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { closeOnBackdrop, useDialogScrollLock } from "../dialog";
import { Leaf } from "../Icons";

import AdminIcon, { type IconName } from "./AdminIcon";
import AdminProducts from "./AdminProducts";
import AdminAccounts from "./AdminAccounts";

import type { Admin } from "./admin-api";

import {
  bestsellers,
  dateLabel,
  demoDate,
  initialContent,
  initialOrders,
  initialProducts,
  initialSettings,
  money,
  orderTotal,
  periods,
  sections,
  statuses,
  type AdminProduct,
  type BusinessSettings,
  type Order,
  type OrderStatus,
  type Period,
  type Section,
  type SiteContent,
} from "./admin-data";

import liveStyles from "./live-admin.module.css";
import styles from "./admin.module.css";

type PortalSection = Section | "Admin accounts";

type AdminPortalProps = {
  admin: Admin;
  signingOut: boolean;
  sessionError: string;
  onSignOut: () => void;
  onRefresh: () => void;
};

const navigationIcons: Record<Section, IconName> = {
  Dashboard: "home",
  Orders: "orders",
  "Products & Pricing": "products",
  Customers: "customers",
  "Website Content": "content",
  Settings: "settings",
};

const statusColours: Record<OrderStatus, string> = {
  New: "#5b9fee",
  Preparing: "#ffc843",
  Completed: "#018543",
  Cancelled: "#9ba6a0",
};

function ProductImage({ product }: { product: AdminProduct }) {
  return product.image ? (
    <img
      src={product.image}
      alt=""
      width="1200"
      height="1300"
      loading="lazy"
    />
  ) : (
    <span className={styles.productPlaceholder} aria-hidden="true">
      <AdminIcon name="products" />
    </span>
  );
}

function Badge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`${styles.badge} ${styles[status.toLowerCase()]}`}
    >
      {status}
    </span>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useDialogScrollLock(ref);

  useEffect(() => {
    const dialog = ref.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.modal}
      aria-labelledby={id}
      onClose={(event) => {
        if (!event.currentTarget.open) {
          onClose();
        }
      }}
      onClick={closeOnBackdrop}
    >
      <header className={styles.modalHeader}>
        <h2 id={id}>{title}</h2>

        <button
          type="button"
          className={styles.iconButton}
          aria-label="Close dialog"
          onClick={() => ref.current?.close()}
        >
          <AdminIcon name="close" />
        </button>
      </header>

      {children}
    </dialog>
  );
}

function OrdersTable({
  orders,
  onOpen,
}: {
  orders: Order[];
  onOpen: (order: Order) => void;
}) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>
          Orders and preparation status
        </caption>

        <thead>
          <tr>
            <th scope="col">Order ID</th>
            <th scope="col">Customer</th>
            <th scope="col">Items</th>
            <th scope="col">Total</th>
            <th scope="col">Status</th>
            <th scope="col">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <strong>#{order.id}</strong>
                <small>{dateLabel(order.date)}</small>
              </td>

              <td>{order.customer}</td>

              <td>
                <span className={styles.orderItems}>
                  {order.items
                    .map(
                      (item) =>
                        `${item.quantity} × ${item.name} (${item.size})`,
                    )
                    .join(", ")}
                </span>
              </td>

              <td className={styles.noWrap}>
                {money(orderTotal(order))}
              </td>

              <td>
                <Badge status={order.status} />
              </td>

              <td>
                <button
                  type="button"
                  className={styles.smallButton}
                  aria-label={`View order ${order.id}`}
                  onClick={() => onOpen(order)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <p className={styles.empty}>
          No orders match your search.
        </p>
      )}
    </div>
  );
}

function OrderDetails({
  order,
  onSave,
  onClose,
}: {
  order: Order;
  onSave: (status: OrderStatus) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(order.status);

  return (
    <Modal title={`Order #${order.id}`} onClose={onClose}>
      <p className={styles.muted}>
        {dateLabel(order.date)} · Sample order
      </p>

      <div className={styles.customerBox}>
        <strong>{order.customer}</strong>
        <p>{order.phone}</p>
        <p>{order.address}</p>
      </div>

      <ul className={styles.lineItems}>
        {order.items.map((item, index) => (
          <li key={index}>
            <span>
              {item.quantity} × {item.name}

              <small>
                {item.size} · {money(item.unitPrice)} each
              </small>
            </span>

            <strong>
              {money(item.quantity * item.unitPrice)}
            </strong>
          </li>
        ))}
      </ul>

      <div className={styles.total}>
        <span>Delivery</span>
        <strong>{money(order.deliveryFee)}</strong>
      </div>

      <div className={styles.total}>
        <span>Order total</span>
        <strong>{money(orderTotal(order))}</strong>
      </div>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(status);
        }}
      >
        <label>
          Preparation status

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as OrderStatus)
            }
          >
            {statuses.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>

        <p className={styles.muted}>
          Changing status updates this preview only. It does not
          record a payment.
        </p>

        <button className={styles.primary} type="submit">
          Update preview
        </button>
      </form>
    </Modal>
  );
}

// AdminApp owns authentication.
// This component receives the session as props.
export default function AdminPortal({
  admin,
  signingOut,
  sessionError,
  onSignOut,
  onRefresh,
}: AdminPortalProps) {
  const [selectedSection, setSection] =
    useState<PortalSection>("Dashboard");

  const section =
    selectedSection === "Admin accounts" && !admin.superAdmin
      ? "Dashboard"
      : selectedSection;

  const isLiveSection =
    section === "Products & Pricing" ||
    section === "Admin accounts";

  const [orders, setOrders] = useState(initialOrders);
  const [period, setPeriod] = useState<Period>("This week");
  const [query, setQuery] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);

  const [orderFilter, setOrderFilter] = useState<
    OrderStatus | "All"
  >("All");

  const [openedOrder, setOpenedOrder] = useState<Order | null>(
    null,
  );

  const [content, setContent] =
    useState<SiteContent>(initialContent);

  const [settings, setSettings] =
    useState<BusinessSettings>(initialSettings);

  const [notice, setNotice] = useState("");

  const search = query.trim().toLowerCase();

  const today = orders.filter(
    (order) => order.date === demoDate,
  );

  const count = (status: OrderStatus) =>
    today.filter((order) => order.status === status).length;

  const ranked = bestsellers(initialProducts, orders, period);

  const matchingOrders = orders.filter(
    (order) =>
      (!todayOnly || order.date === demoDate) &&
      (orderFilter === "All" || order.status === orderFilter) &&
      `${order.id} ${order.customer} ${order.items
        .map((item) => item.name)
        .join(" ")}`
        .toLowerCase()
        .includes(search),
  );

  const customers = Array.from(
    new Set(orders.map((order) => order.customer)),
  )
    .map((name) => {
      const history = orders.filter(
        (order) => order.customer === name,
      );

      return {
        name,
        history,
        spent: history
          .filter((order) => order.status === "Completed")
          .reduce((sum, order) => sum + orderTotal(order), 0),
      };
    })
    .filter((customer) =>
      customer.name.toLowerCase().includes(search),
    );

  const metricCards: {
    label: string;
    value: number;
    icon: IconName;
    tone: string;
    filter: OrderStatus | "All";
  }[] = [
    {
      label: "Orders today",
      value: today.length,
      icon: "orders",
      tone: "green",
      filter: "All",
    },
    {
      label: "Pending orders",
      value: count("New"),
      icon: "clock",
      tone: "orange",
      filter: "New",
    },
    {
      label: "Preparing",
      value: count("Preparing"),
      icon: "chef",
      tone: "yellow",
      filter: "Preparing",
    },
    {
      label: "Completed",
      value: count("Completed"),
      icon: "check",
      tone: "green",
      filter: "Completed",
    },
  ];

  let cursor = 0;

  const gradient = statuses
    .map((status) => {
      const start = cursor;

      cursor += today.length
        ? (count(status) / today.length) * 100
        : 0;

      return `${statusColours[status]} ${start}% ${cursor}%`;
    })
    .join(", ");

  function navigate(next: PortalSection) {
    setSection(next);
    setQuery("");
    setOrderFilter("All");
    setTodayOnly(false);
    setOpenedOrder(null);
    setNotice("");
  }

  function showOrders(
    filter: OrderStatus | "All" = "All",
    onlyToday = false,
  ) {
    navigate("Orders");
    setOrderFilter(filter);
    setTodayOnly(onlyToday);
  }

  return (
    <div className={styles.portal}>
      <a href="#admin-main" className={styles.skip}>
        Skip to admin content
      </a>

      <header className={styles.header}>
        <a
          className={styles.logo}
          href="/"
          aria-label="Healthee website"
        >
          healthee
          <Leaf />
        </a>

        <nav
          className={styles.navigation}
          aria-label="Admin navigation"
        >
          {sections.map((item) => (
            <button
              type="button"
              key={item}
              aria-current={
                section === item ? "page" : undefined
              }
              onClick={() => navigate(item)}
            >
              <AdminIcon name={navigationIcons[item]} />
              {item}
            </button>
          ))}

          {admin.superAdmin && (
            <button
              type="button"
              aria-current={
                section === "Admin accounts"
                  ? "page"
                  : undefined
              }
              onClick={() => navigate("Admin accounts")}
            >
              <AdminIcon name="customers" />
              Admin accounts
            </button>
          )}
        </nav>

        <div className={styles.account}>
          <div className={liveStyles.identity}>
            <strong>{admin.firstName || "Admin"}</strong>

            <small>
              {admin.superAdmin ? "Super admin" : "Admin"}
            </small>
          </div>

          <button
            type="button"
            className={liveStyles.secondary}
            disabled={signingOut}
            onClick={onSignOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>

      <main id="admin-main" className={styles.main}>
        {isLiveSection ? (
          <div className={liveStyles.liveBanner}>
            <span>
              <i /> Connected to your live admin API
            </span>

            <a href="/">Open website ↗</a>
          </div>
        ) : (
          <div className={styles.demo}>
            <span>
              <strong>Frontend preview</strong> · Sample data
              dated {dateLabel(demoDate)}.{" "}
              Changes on this screen reset on refresh.
            </span>

            <a href="/">Open website ↗</a>
          </div>
        )}

        {sessionError && (
          <p className={liveStyles.error} role="alert">
            {sessionError}
          </p>
        )}

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        {(section === "Orders" || section === "Customers") && (
          <label
            className={`${styles.search} ${styles.pageSearch}`}
          >
            <AdminIcon name="search" />

            <span className={styles.srOnly}>
              Search {section.toLowerCase()}
            </span>

            <input
              type="search"
              value={query}
              maxLength={100}
              placeholder={`Search ${section.toLowerCase()}…`}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        )}

        {section === "Dashboard" && (
          <>
            <section
              className={styles.hero}
              aria-labelledby="admin-welcome"
            >
              <img
                src="/assets/admin/hero-fruit.png"
                alt=""
                width="1774"
                height="887"
              />

              <div>
                <p className={styles.eyebrow}>
                  HEALTHEE ADMIN
                </p>

                <h1 id="admin-welcome">
                  Fresh orders.
                  <br />
                  Happy customers.
                </h1>

                <p>A little overview of your juicy business.</p>

                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => showOrders()}
                >
                  View orders
                  <AdminIcon name="arrow" />
                </button>
              </div>
            </section>

            <section
              className={styles.metrics}
              aria-label="Order summary for the sample date"
            >
              {metricCards.map((card) => (
                <button
                  type="button"
                  key={card.label}
                  className={`${styles.metric} ${styles[card.tone]}`}
                  onClick={() =>
                    showOrders(card.filter, true)
                  }
                >
                  <span className={styles.metricIcon}>
                    <AdminIcon name={card.icon} />
                  </span>

                  <span>
                    <span className={styles.metricLabel}>
                      {card.label}
                    </span>

                    <strong>{card.value}</strong>
                  </span>

                  <svg viewBox="0 0 80 32" aria-hidden="true">
                    <path
                      d="M2 25Q12 25 18 13T36 18T54 11T77 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              ))}
            </section>

            <section aria-labelledby="bestsellers-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="bestsellers-title">
                    Most Purchased Products
                  </h2>

                  <p>Bottles from completed sample orders.</p>
                </div>

                <div
                  className={styles.periods}
                  role="group"
                  aria-label="Bestseller period"
                >
                  {periods.map((value) => (
                    <button
                      type="button"
                      key={value}
                      aria-pressed={period === value}
                      onClick={() => setPeriod(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.bestsellers}>
                {ranked.map(
                  ({ product, quantity }, index) => (
                    <button
                      type="button"
                      key={product.id}
                      className={styles.bestseller}
                      style={
                        {
                          "--product-colour": product.colour,
                        } as CSSProperties
                      }
                      onClick={() =>
                        navigate("Products & Pricing")
                      }
                    >
                      <span className={styles.rank}>
                        {index + 1}
                      </span>

                      <ProductImage product={product} />

                      <span className={styles.bestsellerCopy}>
                        <strong>{product.name}</strong>
                        <b>{quantity}</b>
                        <small>bottles ordered</small>
                      </span>
                    </button>
                  ),
                )}
              </div>

              {ranked.length === 0 && (
                <p className={styles.empty}>
                  No completed juice orders in this period.
                </p>
              )}
            </section>

            <div className={styles.dashboardBottom}>
              <section
                className={styles.panel}
                aria-labelledby="recent-orders-title"
              >
                <div className={styles.panelHeading}>
                  <h2 id="recent-orders-title">
                    Recent orders
                  </h2>

                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => showOrders()}
                  >
                    View all orders
                    <AdminIcon name="arrow" />
                  </button>
                </div>

                <OrdersTable
                  orders={matchingOrders.slice(0, 5)}
                  onOpen={setOpenedOrder}
                />
              </section>

              <section
                className={styles.panel}
                aria-labelledby="order-progress-title"
              >
                <div className={styles.panelHeading}>
                  <div>
                    <h2 id="order-progress-title">
                      Order progress
                    </h2>

                    <p>Orders on the sample date.</p>
                  </div>
                </div>

                <div className={styles.progress}>
                  <div
                    className={styles.donut}
                    style={{
                      background: today.length
                        ? `conic-gradient(${gradient})`
                        : "#e5eae3",
                    }}
                    aria-hidden="true"
                  >
                    <span>
                      <strong>{today.length}</strong>
                      <small>orders today</small>
                    </span>
                  </div>

                  <ul>
                    {statuses
                      .filter(
                        (status) =>
                          status !== "Cancelled" ||
                          count(status) > 0,
                      )
                      .map((status) => (
                        <li key={status}>
                          <span>
                            <i
                              style={{
                                background:
                                  statusColours[status],
                              }}
                            />

                            {status}
                          </span>

                          <strong>{count(status)}</strong>
                        </li>
                      ))}
                  </ul>
                </div>
              </section>
            </div>
          </>
        )}

        {section === "Orders" && (
          <section className={styles.panel}>
            <div className={styles.pageHeading}>
              <div>
                <h1>Orders</h1>

                <p>
                  Review customer requests and update preparation
                  status.
                </p>
              </div>

              <label className={styles.filter}>
                Status

                <select
                  value={orderFilter}
                  onChange={(event) =>
                    setOrderFilter(
                      event.target.value as OrderStatus | "All",
                    )
                  }
                >
                  <option value="All">All statuses</option>

                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className={styles.filter}>
              <input
                type="checkbox"
                checked={todayOnly}
                onChange={(event) =>
                  setTodayOnly(event.target.checked)
                }
              />

              Only {dateLabel(demoDate)}
            </label>

            <OrdersTable
              orders={matchingOrders}
              onOpen={setOpenedOrder}
            />
          </section>
        )}

        {section === "Products & Pricing" && (
          <AdminProducts />
        )}

        {section === "Admin accounts" && admin.superAdmin && (
          <AdminAccounts
            current={admin}
            onRefresh={onRefresh}
          />
        )}

        {section === "Customers" && (
          <section className={styles.panel}>
            <div className={styles.pageHeading}>
              <div>
                <h1>Customers</h1>

                <p>
                  Sample customer history, grouped by name for
                  this preview.
                </p>
              </div>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <caption className={styles.srOnly}>
                  Sample customers and completed order totals
                </caption>

                <thead>
                  <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">Orders</th>
                    <th scope="col">Completed order value</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.name}>
                      <td>
                        <strong>{customer.name}</strong>
                      </td>

                      <td>{customer.history.length}</td>

                      <td>{money(customer.spent)}</td>

                      <td>
                        <button
                          type="button"
                          className={styles.smallButton}
                          aria-label={`View orders for ${customer.name}`}
                          onClick={() => {
                            navigate("Orders");
                            setQuery(customer.name);
                          }}
                        >
                          View orders
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {customers.length === 0 && (
                <p className={styles.empty}>
                  No customers match your search.
                </p>
              )}
            </div>
          </section>
        )}

        {section === "Website Content" && (
          <section className={styles.panel}>
            <div className={styles.pageHeading}>
              <div>
                <h1>Website Content</h1>

                <p>
                  Try copy changes here before backend publishing
                  is connected.
                </p>
              </div>
            </div>

            <div className={styles.editorColumns}>
              <form
                className={styles.form}
                onSubmit={(event) => {
                  event.preventDefault();

                  setNotice(
                    "Content saved in this preview only. The public landing page has not changed.",
                  );
                }}
              >
                <label>
                  Hero headline

                  <input
                    value={content.headline}
                    maxLength={90}
                    required
                    onChange={(event) =>
                      setContent({
                        ...content,
                        headline: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Supporting text

                  <textarea
                    value={content.description}
                    maxLength={250}
                    rows={4}
                    required
                    onChange={(event) =>
                      setContent({
                        ...content,
                        description: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Instagram link

                  <input
                    type="url"
                    value={content.instagram}
                    placeholder="https://www.instagram.com/your-account"
                    onChange={(event) =>
                      setContent({
                        ...content,
                        instagram: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  TikTok link

                  <input
                    type="url"
                    value={content.tiktok}
                    onChange={(event) =>
                      setContent({
                        ...content,
                        tiktok: event.target.value,
                      })
                    }
                  />
                </label>

                <button
                  type="submit"
                  className={styles.primary}
                >
                  Save preview
                </button>
              </form>

              <aside
                className={styles.contentPreview}
                aria-label="Website copy preview"
              >
                <span>Copy preview</span>

                <h2>{content.headline}</h2>
                <p>{content.description}</p>

                <img
                  src="/assets/admin/hero-fruit.png"
                  alt=""
                  width="1774"
                  height="887"
                />
              </aside>
            </div>
          </section>
        )}

        {section === "Settings" && (
          <section className={styles.panel}>
            <div className={styles.pageHeading}>
              <div>
                <h1>Business settings</h1>

                <p>
                  Business contact and delivery settings preview.
                </p>
              </div>
            </div>

            <form
              className={`${styles.form} ${styles.settingsForm}`}
              onSubmit={(event) => {
                event.preventDefault();

                setNotice(
                  "Settings saved in this preview only. No backend changes were made.",
                );
              }}
            >
              <label>
                Business name

                <input
                  value={settings.name}
                  maxLength={80}
                  required
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Contact email

                <input
                  type="email"
                  value={settings.email}
                  maxLength={120}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      email: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Contact phone

                <input
                  type="tel"
                  value={settings.phone}
                  maxLength={25}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      phone: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Default delivery fee (₦)

                <input
                  type="number"
                  value={settings.deliveryFee}
                  min={0}
                  max={1000000}
                  step={1}
                  required
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      deliveryFee: Number(event.target.value),
                    })
                  }
                />
              </label>

              <p className={styles.muted}>
                Sample delivery fees start at zero. Your business
                delivery rules will be defined when the backend
                is added.
              </p>

              <button
                type="submit"
                className={styles.primary}
              >
                Save preview
              </button>
            </form>
          </section>
        )}
      </main>

      {openedOrder && (
        <OrderDetails
          key={openedOrder.id}
          order={openedOrder}
          onClose={() => setOpenedOrder(null)}
          onSave={(status) => {
            setOrders((current) =>
              current.map((order) =>
                order.id === openedOrder.id
                  ? { ...order, status }
                  : order,
              ),
            );

            setOpenedOrder(null);
            setNotice("Order status updated in this preview.");
          }}
        />
      )}
    </div>
  );
}