export type IconName =
    | "home"
    | "orders"
    | "products"
    | "customers"
    | "content"
    | "settings"
    | "search"
    | "arrow"
    | "close"
    | "clock"
    | "check"
    | "chef";

const paths: Record<IconName, string> = {
    home: "m3 10 9-7 9 7v11h-6v-7H9v7H3Z",
    orders: "M3 5h18l-2 15H5L3 5ZM8 5V3h8v2M8 10h8",
    products: "m3 4 9-1 9 9-9 9-9-9V4Zm4 3h.01",
    customers:
        "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    content: "M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8M8 16h6",
    settings:
        "m10 3-1 3-3 1-3 3 2 2-1 4 3 2 3-1 3 3 3-2v-4l3-2-1-4-4-1-2-3h-2Zm4 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    search:
        "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    close: "m5 5 14 14M19 5 5 19",
    clock:
        "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    check:
        "m8 12 3 3 5-6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    chef:
        "M6 14a5 5 0 0 1-1-10 5 5 0 0 1 8-2 5 5 0 0 1 6 8v9H6v-5Zm0 2h13",
};

export default function AdminIcon({ name }: { name: IconName }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={paths[name]} />
        </svg>
    );
}