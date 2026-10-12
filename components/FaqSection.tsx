"use client";

import { products } from "./products";
import styles from "./faq.module.css";

type FaqSectionProps = {
    onExplore: () => void;
};

// Replace ingredient and storage answers after their details are confirmed.
const questions = [
    {
        id: "flavours",
        category: "FLAVOURS",
        question: "Which flavours can I choose?",
        answer:
            new Intl.ListFormat("en-GB", {
                style: "long",
                type: "conjunction",
            }).format(products.map((product) => product.name)) + ".",
        artwork: "orange",
    },
    {
        id: "ingredients",
        category: "INGREDIENTS",
        question: "What ingredients are in each drink?",
        answer:
            "Full ingredient and allergen information is not available on this website yet. Please confirm these details before choosing a drink.",
        artwork: "pineapple",
    },
    {
        id: "storage",
        category: "STORAGE",
        question: "How should I store my drinks?",
        answer:
            "Storage instructions and shelf-life details are not available on this website yet.",
        artwork: "watermelon",
    },
    {
        id: "ordering",
        category: "ORDERING",
        question: "How can I order?",
        answer:
            "Online ordering is not available yet. You can still explore all five HEALTHEE flavours in the collection.",
        artwork: "zobo",
    },
] as const;

export default function FaqSection({ onExplore }: FaqSectionProps) {
    return (
        <section
            className={styles.section}
            id="faqs"
            aria-labelledby="faq-title"
        >
            <div className={styles.inner}>
                <header className={styles.intro}>
                    <p className={styles.eyebrow}>THE JUICY DETAILS</p>

                    <h2 id="faq-title">Curious? Let’s clear it up.</h2>

                    <p className={styles.description}>
                        A few things you might like to know.
                    </p>
                </header>

                <div className={styles.grid}>
                    {questions.map((item, index) => (
                        <details
                            key={item.id}
                            className={styles.card}
                            open={index === 0}
                        >
                            <summary className={styles.summary}>
                <span className={styles.category}>
                  {item.category}
                </span>

                                <span className={styles.question}>
                  {item.question}
                </span>

                                <span className={styles.toggle} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14" />
                    <path
                        className={styles.vertical}
                        d="M12 5v14"
                    />
                  </svg>
                </span>

                                <span
                                    className={`${styles.artwork} ${styles[item.artwork]}`}
                                    aria-hidden="true"
                                />
                            </summary>

                            <div className={styles.answer}>
                                <p>{item.answer}</p>

                                {item.id === "ordering" && (
                                    <button
                                        className={styles.explore}
                                        type="button"
                                        onClick={onExplore}
                                    >
                                        Explore flavours
                                        <span aria-hidden="true">↗</span>
                                    </button>
                                )}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}