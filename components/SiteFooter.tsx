"use client";

import { Arrow } from "./Icons";
import styles from "./footer.module.css";

type SiteFooterProps = { onExplore: () => void };
type Platform = "instagram" | "tiktok";

const socials = [
    {
        platform: "instagram",
        name: "Instagram",
        href: "https://www.instagram.com/healtheefruitjuices/",
        description: "Find your next juicy moment.",
    },
    {
        platform: "tiktok",
        name: "TikTok",
        href: "https://www.tiktok.com/@healtheefruitjuices",
        description: "Good days. Stay juicy.",
    },
] satisfies {
    platform: Platform;
    name: string;
    href: string;
    description: string;
}[];

function SocialIcon({ platform }: { platform: Platform }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            aria-hidden="true"
            focusable="false"
        >
            {platform === "instagram" ? (
                <>
                    <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <circle
                        cx="12"
                        cy="12"
                        r="4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <circle
                        cx="17.5"
                        cy="6.5"
                        r="1.2"
                        fill="currentColor"
                    />
                </>
            ) : (
                <path
                    fill="currentColor"
                    d="M15.6 2h-3.3v13.2a2.7 2.7 0 1 1-2.3-2.7V9.1a6.1 6.1 0 1 0 5.6 6.1V8.4a9 9 0 0 0 5.3 1.7V6.8A5.3 5.3 0 0 1 15.6 2Z"
                />
            )}
        </svg>
    );
}

export default function SiteFooter({ onExplore }: SiteFooterProps) {
    return (
        <footer className={styles.footer} aria-label="HEALTHEE footer">
            <svg
                className={styles.wave}
                viewBox="0 0 1440 90"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="M0 35C220-20 360 100 670 62S1160-25 1440 25V90H0Z"
                    fill="currentColor"
                />
            </svg>

            <div className={styles.inner}>
                <div className={styles.grid}>
                    <div className={styles.intro}>
                        <a
                            className={styles.wordmark}
                            href="#top"
                            aria-label="HEALTHEE home"
                        >
                            healt
                            <span>
                hee
                <svg
                    viewBox="0 0 27 20"
                    aria-hidden="true"
                    focusable="false"
                >
                  <path
                      d="M13 17C2 16 2 8 1 3c9 0 12 5 12 14ZM14 17C12 6 20 2 26 1c1 9-4 15-12 16Z"
                      fill="currentColor"
                  />
                  <path
                      d="m8 8 6 10 7-11"
                      stroke="#018543"
                      fill="none"
                      strokeWidth="1.3"
                  />
                </svg>
              </span>
                        </a>

                        <h2>
                            Stay in the
                            <br />
                            juicy loop.
                        </h2>

                        <p className={styles.handle}>@healtheefruitjuices</p>
                    </div>

                    {socials.map(({ platform, name, href, description }) => (
                        <a
                            key={platform}
                            className={`${styles.card} ${
                                platform === "tiktok" ? styles.tiktok : ""
                            }`}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`HEALTHEE on ${name}, @healtheefruitjuices (opens in a new tab)`}
                        >
                            <div className={styles.cardCopy}>
                <span className={styles.externalArrow}>
                  <Arrow />
                </span>

                                <h3>{name}</h3>
                                <p>{description}</p>

                                <div className={styles.socialHandle}>
                                    <SocialIcon platform={platform} />
                                    <span>@healtheefruitjuices</span>
                                </div>
                            </div>

                            {/* Each card displays one half of the shared fruit sprite. */}
                            <div className={styles.artwork} aria-hidden="true">
                                <img
                                    className={
                                        platform === "tiktok" ? styles.secondFruit : undefined
                                    }
                                    src="/assets/footer/footer-fruits.png"
                                    alt=""
                                    width="1774"
                                    height="887"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        </a>
                    ))}
                </div>

                <nav
                    className={styles.navigation}
                    aria-label="Footer navigation"
                >
                    <a href="#our-drinks">
                        Our drinks <Arrow />
                    </a>

                    <a href="#healthee-way">
                        The HEALTHEE way <Arrow />
                    </a>

                    <a href="#faqs">
                        FAQs <Arrow />
                    </a>

                    <button type="button" onClick={onExplore}>
                        Explore collection <Arrow />
                    </button>
                </nav>

                <div className={styles.bottom}>
                    <p>
                        © {new Date().getFullYear()} HEALTHEE. All rights reserved.
                    </p>

                    <a href="#top">
                        Back to top <Arrow />
                    </a>
                </div>
            </div>
        </footer>
    );
}