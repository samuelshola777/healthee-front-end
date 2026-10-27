export type Admin = {
  adminId: string; userId: string; firstName: string | null; lastName: string | null;
  emailAddress: string; phoneNumber: string | null; active: boolean;
  userActive: boolean; userVerified: boolean; superAdmin: boolean;
};
export type LiveProduct = {
  id: string; productId: string; productName: string; productDescription: string;
  productCategoriesType: "NORM" | "EXOTIC" | "FOODS";
  productBottleSize: "CL_25" | "CL_50" | null;
  productPrice: number | string; availableForPublicDisplay: boolean;
  productThumbnailsUrls: string[]; displayVideoUrl: string | null; revision?: number;
};
export type ProductDraft = Omit<LiveProduct, "id" | "productId">;
export type ProductPage = { totalPage: number; totalElements: number; numberOfElements: number; data: LiveProduct[] };
export const adminMoney = (value: number | string) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(value));
export const bottleLabel = (value: LiveProduct["productBottleSize"]) => value === "CL_25" ? "25cl" : value === "CL_50" ? "50cl" : "Per serving";
export function imageUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048) return "";
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : ""; } catch { return ""; }
}
export function productError(value: Record<string, unknown>): string {
  if (typeof value.productName !== "string" || !value.productName.trim() || value.productName.trim().length > 150) return "Enter a product name up to 150 characters.";
  if (typeof value.productDescription !== "string" || value.productDescription.length > 2000) return "Description must not exceed 2,000 characters.";
  if (!["NORM", "EXOTIC", "FOODS"].includes(String(value.productCategoriesType))) return "Choose a valid category.";
  if (value.productCategoriesType === "FOODS" ? value.productBottleSize !== null : !["CL_25", "CL_50"].includes(String(value.productBottleSize))) return "Choose a bottle size for juice; foods have no bottle size.";
  const price = String(value.productPrice);
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(price) || Number(price) <= 0 || Number(price) > 9999999999.99) return "Enter a positive price with at most two decimal places.";
  if (typeof value.availableForPublicDisplay !== "boolean") return "Choose whether the product is visible.";
  if (!Array.isArray(value.productThumbnailsUrls) || value.productThumbnailsUrls.length > 12 || value.productThumbnailsUrls.some(url => !imageUrl(url))) return "Use up to 12 valid thumbnail URLs.";
  if (value.displayVideoUrl !== null && value.displayVideoUrl !== "" && !imageUrl(value.displayVideoUrl)) return "Enter a valid video URL or leave it blank.";
  if (value.revision !== undefined && (!Number.isSafeInteger(value.revision) || Number(value.revision) < 0)) return "Invalid product revision. Reload the product.";
  return "";
}
export class AdminApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function adminRequest<T>(path: string, method = "GET", data?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api/admin/" + path, {
      method, credentials: "same-origin", cache: "no-store", signal,
      headers: data instanceof FormData || data === undefined ? undefined : { "Content-Type": "application/json" },
      body: data instanceof FormData ? data : data === undefined ? undefined : JSON.stringify(data),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new AdminApiError("Could not connect. Check your connection and retry.", 0);
  }
  let result;
  try { result = await response.json(); } catch { throw new AdminApiError("The service returned an unreadable response.", response.status); }
  if (!response.ok || result.success !== true) {
    if (response.status === 401 && !["login", "forgot-password", "reset-password"].includes(path)) window.dispatchEvent(new Event("healthee-admin-expired"));
    throw new AdminApiError(result.message || "Could not complete the request.", response.status);
  }
  return result.data as T;
}