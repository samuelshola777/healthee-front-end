import type { SVGProps } from "react";
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: "search" | "account" | "cart" | "menu" | "close";
}) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {name === "search" && (
        <>
          <circle cx="10.5" cy="10.5" r="7" />
          <path d="m16 16 5 5" />
        </>
      )}
      {name === "account" && (
        <>
          <circle cx="12" cy="6.5" r="4" />
          <path d="M3.5 21v-2a8.5 8.5 0 0 1 17 0v2z" />
        </>
      )}
      {name === "cart" && (
        <>
          <path d="M2 3h3l2 13h12l2-10H6M8 12h11" />
          <circle cx="9" cy="20" r="1.3" />
          <circle cx="18" cy="20" r="1.3" />
        </>
      )}
      {name === "menu" && <path d="M3 6h18M3 12h18M3 18h18" />}
      {name === "close" && <path d="m5 5 14 14M19 5 5 19" />}
    </svg>
  );
}
export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="32"
      viewBox="0 0 28 32"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M3 2c19 0 25 9 21 27C7 29 1 19 3 2Z" />
      <path d="M6 6 23 28" fill="none" stroke="#018543" strokeWidth="2" />
    </svg>
  );
}
