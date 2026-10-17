export type Section =
    | "Dashboard"
    | "Orders"
    | "Products & Pricing"
    | "Customers"
    | "Website Content"
    | "Settings";

export type OrderStatus = "New" | "Preparing" | "Completed" | "Cancelled";
export type Period = "Today" | "This week" | "This month";
export type Category = "Norm" | "Exotic" | "Foods";

export interface AdminProduct {
    id: string;
    name: string;
    category: Category;
    image: string;
    colour: string;
    visible: boolean;
    variants: {
        id: string;
        label: string;
        price: number;
    }[];
}

export interface Order {
    id: string;
    customer: string;
    phone: string;
    address: string;
    date: string;
    status: OrderStatus;
    deliveryFee: number;
    items: {
        productId: string;
        name: string;
        size: string;
        quantity: number;
        unitPrice: number;
    }[];
}

export interface SiteContent {
    headline: string;
    description: string;
    instagram: string;
    tiktok: string;
}

export interface BusinessSettings {
    name: string;
    email: string;
    phone: string;
    deliveryFee: number;
}

export const sections: Section[] = [
    "Dashboard",
    "Orders",
    "Products & Pricing",
    "Customers",
    "Website Content",
    "Settings",
];

export const statuses: OrderStatus[] = [
    "New",
    "Preparing",
    "Completed",
    "Cancelled",
];

export const periods: Period[] = ["Today", "This week", "This month"];

export const demoDate = "2026-10-17";

export const money = (amount: number) =>
    `₦${amount.toLocaleString("en-NG")}`;

export const orderTotal = (order: Order) =>
    order.items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        order.deliveryFee,
    );

export const dateLabel = (date: string) =>
    new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));

function juice(
    id: string,
    name: string,
    category: Category,
    small: number,
    large: number,
    image = "",
    colour = "#f4efd8",
): AdminProduct {
    return {
        id,
        name,
        category,
        image,
        colour,
        visible: true,
        variants: [
            { id: "25cl", label: "25cl", price: small },
            { id: "50cl", label: "50cl", price: large },
        ],
    };
}

function food(
    id: string,
    name: string,
    price: number,
    label = "Item",
): AdminProduct {
    return {
        id,
        name,
        category: "Foods",
        image: "",
        colour: "#f4efd8",
        visible: true,
        variants: [{ id: "portion", label, price }],
    };
}

export const initialProducts: AdminProduct[] = [
    juice(
        "orange",
        "Orange Juice",
        "Norm",
        1500,
        3000,
        "/assets/admin/orange.png",
        "#fff1d9",
    ),
    juice(
        "watermelon",
        "Watermelon Juice",
        "Norm",
        1500,
        3000,
        "/assets/admin/watermelon.png",
        "#fce7e5",
    ),
    juice(
        "pineapple",
        "Pineapple Juice",
        "Norm",
        1500,
        3000,
        "/assets/admin/pineapple.png",
        "#fff6cc",
    ),
    juice("norm-mix-2", "Norm Mix of 2", "Norm", 1500, 3000),
    juice("norm-mix-3", "Norm Mix of 3", "Norm", 1500, 3000),
    juice("norm-exotic", "Norm + Exotic Mix", "Norm", 2500, 5000),
    juice("red-apple", "Red Apple Juice", "Exotic", 5000, 9000),
    juice("carrot", "Carrot Juice", "Exotic", 5000, 9000),
    juice("exotic-mix-2", "Exotic Mix of 2", "Exotic", 3500, 6000),
    juice("exotic-mix-3", "Exotic Mix of 3", "Exotic", 3500, 6000),
    juice(
        "zobo",
        "Zobo",
        "Exotic",
        500,
        1000,
        "/assets/admin/zobo.png",
        "#f5e5ed",
    ),
    juice("clementine", "Clementine", "Exotic", 7500, 15000),
    juice("grape", "Grape Juice", "Exotic", 10000, 20000),
    juice("blueberry", "Blueberry", "Exotic", 20000, 40000),
    food("wings", "Wings", 5000, "6 pieces"),
    food("cake", "Cake", 3000),
    food("mini-meatpie", "Mini Meatpie", 500),
    food("mini-sausage", "Mini Sausage Roll", 500),
];

function sampleOrder(
    number: number,
    customer: string,
    status: OrderStatus,
    date: string,
    lines: [string, string, number][],
): Order {
    return {
        id: `HLT-${number}`,
        customer,
        phone: "Not supplied — sample customer",
        address: "Sample delivery address, Lagos",
        date,
        status,
        deliveryFee: 0,

        // Order lines retain their original prices when the catalogue is edited.
        items: lines.map(([productId, size, quantity]) => {
            const product = initialProducts.find(
                (item) => item.id === productId,
            )!;

            const variant = product.variants.find(
                (item) => item.id === size,
            )!;

            return {
                productId,
                name: product.name,
                size: variant.label,
                quantity,
                unitPrice: variant.price,
            };
        }),
    };
}

export const initialOrders: Order[] = [
    sampleOrder(1010, "Ada Nwosu", "New", demoDate, [
        ["orange", "50cl", 2],
        ["zobo", "50cl", 1],
    ]),
    sampleOrder(1009, "Tunde Bello", "Preparing", demoDate, [
        ["pineapple", "25cl", 3],
    ]),
    sampleOrder(1008, "Chioma Adeyemi", "Completed", demoDate, [
        ["orange", "50cl", 6],
        ["watermelon", "50cl", 4],
    ]),
    sampleOrder(1007, "Emeka Okafor", "New", demoDate, [
        ["norm-mix-2", "50cl", 2],
    ]),
    sampleOrder(1006, "Fatima Usman", "Preparing", demoDate, [
        ["zobo", "50cl", 5],
    ]),
    sampleOrder(1005, "Grace Daniel", "Completed", demoDate, [
        ["pineapple", "50cl", 5],
        ["zobo", "50cl", 3],
    ]),
    sampleOrder(1004, "Ada Nwosu", "Completed", "2026-10-16", [
        ["orange", "50cl", 8],
        ["watermelon", "50cl", 6],
    ]),
    sampleOrder(1003, "Tunde Bello", "Completed", "2026-10-15", [
        ["pineapple", "50cl", 5],
        ["zobo", "25cl", 7],
    ]),
    sampleOrder(1002, "Grace Daniel", "Cancelled", "2026-10-12", [
        ["orange", "25cl", 2],
    ]),
    sampleOrder(1001, "Fatima Usman", "Completed", "2026-10-02", [
        ["watermelon", "50cl", 4],
        ["zobo", "50cl", 3],
    ]),
];

export const initialContent: SiteContent = {
    headline: "Good days. Start juicy.",
    description: "Natural fruit juices for your brighter days.",
    instagram: "",
    tiktok: "https://www.tiktok.com/@healtheefruitjuices",
};

export const initialSettings: BusinessSettings = {
    name: "Healthee Fruit Juices",
    email: "",
    phone: "",
    deliveryFee: 0,
};

export function inPeriod(date: string, period: Period): boolean {
    const end = Date.parse(`${demoDate}T00:00:00Z`);

    const start =
        period === "Today"
            ? end
            : period === "This week"
                ? end - 6 * 86400000
                : Date.parse("2026-10-01T00:00:00Z");

    const value = Date.parse(`${date}T00:00:00Z`);

    return value >= start && value <= end;
}

export function bestsellers(
    products: AdminProduct[],
    orders: Order[],
    period: Period,
) {
    const quantities = new Map<string, number>();

    for (const order of orders) {
        if (
            order.status !== "Completed" ||
            !inPeriod(order.date, period)
        ) {
            continue;
        }

        for (const item of order.items) {
            quantities.set(
                item.productId,
                (quantities.get(item.productId) ?? 0) + item.quantity,
            );
        }
    }

    return products
        .filter((product) => product.category !== "Foods")
        .map((product) => ({
            product,
            quantity: quantities.get(product.id) ?? 0,
        }))
        .filter((item) => item.quantity > 0)
        .sort(
            (a, b) =>
                b.quantity - a.quantity ||
                a.product.name.localeCompare(b.product.name),
        )
        .slice(0, 4);
}