"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useCustomer } from "./CustomerProvider";
import { useBasket } from "./BasketProvider";

import styles from "./customer.module.css";

export default function CustomerShell({
  children,
}: {
  children: ReactNode;
}) {
  const { customer } = useCustomer();
  const basket = useBasket();

  return (
    <div className={styles.site}>
      <a
        className="skip-link"
        href="#customer-main"
      >
        Skip to content
      </a>

      <header className={styles.header}>
        <Link
          href="/"
          className="wordmark"
          aria-label="HEALTHEE home"
        >
          healt<span>hee</span>
        </Link>

        <nav aria-label="Customer navigation">
          <Link href="/#shop-favourites">
            Shop juices
          </Link>

          <Link
            href={
              customer
                ? "/customer/profile"
                : "/customer/login"
            }
          >
            {customer?.firstName || "My account"}
          </Link>

          <Link href="/cart">
            Basket ({basket.count})
          </Link>
        </nav>
      </header>

      <main
        id="customer-main"
        className={styles.main}
      >
        {children}
      </main>

      <footer className={styles.footer}>
        <span>Good days. Start juicy.</span>

        <Link href="/">
          Back to HEALTHEE ↗
        </Link>
      </footer>
    </div>
  );
}