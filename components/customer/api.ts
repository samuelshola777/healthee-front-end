export type Customer = {
  customerId: string;
  customerNumber: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "NON_BINARY" | null;
  active: boolean;
  verified: boolean;
  marketingEmailsEnabled: boolean;
};

export type CartItem = {
  cartItemId: string;
  productId: string;
  title: string | null;
  productThumbnailsUrls: string[];
  available: boolean;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
  productBottleSize: "CL_25" | "CL_50" | null;
};

export type Cart = {
  cartId: string;
  items: CartItem[];
  totalQuantity: number;
  subtotal: number | string;
  currencyCode: string;
};

export type GuestItem = {
  id: string;
  quantity: number;
};

export type Product = {
  id: string;
  productName: string;
  productPrice: number | string;
  productBottleSize: "CL_25" | "CL_50" | null;
  productThumbnailsUrls: string[] | null;
  availableForPublicDisplay: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  method = "GET",
  data?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch("/api/customer/" + path, {
      method,
      cache: "no-store",
      credentials: "same-origin",
      signal,
      headers:
        data instanceof FormData
          ? undefined
          : data === undefined
            ? undefined
            : {
                "Content-Type": "application/json",
              },
      body:
        data === undefined
          ? undefined
          : data instanceof FormData
            ? data
            : JSON.stringify(data),
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw new ApiError(
      "We could not connect. Check your connection and try again.",
      0,
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new ApiError(
      "The service returned an unreadable response. Please retry.",
      response.status,
    );
  }

  if (!response.ok || result.success !== true) {
    if (
      response.status === 401 &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(
        new Event("healthee-session-expired"),
      );
    }

    throw new ApiError(
      result.message || "This request could not be completed.",
      response.status,
    );
  }

  return result.data as T;
}

export const money = (amount: number | string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(amount));

export const sizeLabel = (
  size: Product["productBottleSize"],
) =>
  size === "CL_25"
    ? "25cl"
    : size === "CL_50"
      ? "50cl"
      : "Per serving";

export function safeImage(value?: string | null) {
  if (!value) {
    return "";
  }

  if (
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return value;
  }

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

export const GUEST_KEY = "healthee-guest-basket-v1";

export function readGuest(
  value: string | null,
): GuestItem[] {
  try {
    const data: unknown = JSON.parse(value ?? "[]");

    if (!Array.isArray(data)) {
      return [];
    }

    return [
      ...new Map(
        data
          .filter(
            (row): row is GuestItem =>
              row &&
              typeof row.id === "string" &&
              /^[\w-]{1,150}$/.test(row.id) &&
              Number.isInteger(row.quantity) &&
              row.quantity > 0 &&
              row.quantity <= 100,
          )
          .map((row) => [
            row.id,
            {
              id: row.id,
              quantity: row.quantity,
            },
          ]),
      ).values(),
    ].slice(0, 200);
  } catch {
    return [];
  }
}