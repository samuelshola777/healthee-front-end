import { NextRequest, NextResponse } from "next/server";
import { imageUrl, productError } from "../../../../components/admin/admin-api";

export const dynamic = "force-dynamic";
const COOKIE = "healthee_admin_access";
type Context = { params: Promise<{ path: string[] }> };
type Payload = Record<string, unknown>;
class Failure extends Error { constructor(message: string, public status: number) { super(message); } }
const answer = (data: unknown, message = "", status = 200, success = true) => NextResponse.json({ success, message, data }, { status, headers: { "Cache-Control": "no-store" } });
function clear(response: NextResponse) { response.cookies.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 }); return response; }
const id = (value: string | undefined) => !!value && /^[a-zA-Z0-9_-]{1,150}$/.test(value);
const email = (value: unknown) => typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const password = (value: unknown) => typeof value === "string" && value.length >= 8 && value.length <= 100;
function text(value: unknown, max: number, required = false) { return value === undefined && !required || typeof value === "string" && value.length <= max && (!required || !!value.trim()); }
async function json(request: NextRequest): Promise<Payload> {
  const body = await request.text();
  if (body.length > 65536) throw new Failure("Request is too large.", 413);
  try { const value = JSON.parse(body); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(); return value; }
  catch { throw new Failure("Send a valid JSON object.", 400); }
}
function accountBody(body: Payload, create: boolean) {
  if (!text(body.firstName, 100, true) || !text(body.lastName, 100, true) || !text(body.phoneNumber, 30)) throw new Failure("Enter first name, last name and a valid phone number.", 400);
  if (create && (!email(body.emailAddress) || !password(body.password))) throw new Failure("Enter a valid email and an 8-100 character password.", 400);
  const result: Payload = { firstName: String(body.firstName).trim(), lastName: String(body.lastName).trim(), phoneNumber: body.phoneNumber ?? "" };
  if (create) { result.emailAddress = String(body.emailAddress).trim().toLowerCase(); result.password = body.password; }
  return result;
}
async function upstream(path: string, method: string, token?: string, body?: unknown) {
  const base = process.env.HEALTHEE_API_URL;
  if (!base) throw new Failure("Configure HEALTHEE_API_URL on the frontend server.", 503);
  if (token && !process.env.HEALTHEE_API_KEY) throw new Failure("Configure HEALTHEE_API_KEY on the frontend server.", 503);
  const url = new URL(base.replace(/\/$/, "") + "/api/v1" + path);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Failure("Invalid service configuration.", 503);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) { headers.Authorization = "Bearer " + token; headers["X-API-Key"] = process.env.HEALTHEE_API_KEY!; }
  if (body !== undefined && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  const response = await fetch(url, { method, headers, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(body instanceof FormData ? 30000 : 15000) });
  if (response.status === 204) return null;
  let result;
  try { result = await response.json(); } catch { throw new Failure("The admin service returned an unreadable response.", 502); }
  if (!response.ok || result?.success === false) {
    const status = response.status >= 500 ? 502 : response.status;
    throw new Failure(status >= 500 ? "The admin service is temporarily unavailable. Please retry." : typeof result?.message === "string" ? result.message : "Could not complete the request.", status);
  }
  return result?.success === true ? result.data : result;
}
async function handler(request: NextRequest, context: Context) {
  let path = "";
  try {
    path = (await context.params).path.join("/");
    const method = request.method;
    if (method !== "GET" && request.headers.get("origin") !== new URL(request.url).origin) throw new Failure("This request origin is not allowed.", 403);
    if (path === "logout" && method === "POST") return clear(answer(null, "Signed out."));
    if (path === "login" && method === "POST") {
      const body = await json(request);
      if (!email(body.emailAddress) || typeof body.password !== "string" || !body.password || body.password.length > 100) throw new Failure("Enter your email address and password.", 400);
      const result = await upstream("/admin/public/login", "POST", undefined, { emailAddress: String(body.emailAddress).trim().toLowerCase(), password: body.password });
      if (typeof result?.accessToken !== "string" || !result.accessToken || !result.admin?.adminId || result.admin.active !== true || result.admin.userActive !== true || result.admin.userVerified !== true) throw new Failure("The service returned an invalid admin session.", 502);
      const response = answer(result.admin, "Signed in.");
      response.cookies.set(COOKIE, result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
      return response;
    }
    if (["forgot-password", "reset-password"].includes(path) && method === "POST") {
      const body = await json(request);
      if (!email(body.emailAddress)) throw new Failure("Enter a valid email address.", 400);
      if (path === "reset-password" && (typeof body.otp !== "string" || !/^\d{6}$/.test(body.otp) || !password(body.newPassword))) throw new Failure("Enter a six-digit OTP and an 8-100 character password.", 400);
      await upstream("/admin/public/" + path, "POST", undefined, path === "forgot-password" ? { emailAddress: body.emailAddress } : { emailAddress: body.emailAddress, otp: body.otp, newPassword: body.newPassword });
      return answer(null, path === "forgot-password" ? "If the account is eligible, reset instructions will be emailed." : "Password reset. You can sign in.");
    }
    // Reject unknown operations before any upstream request.
    const segments = path.split("/");
    const product = segments[0] === "product";
    const accounts = segments[0] === "admin";
    const known = path === "session" && method === "GET" || path === "upload" && method === "POST"
      || product && (segments.length === 1 && ["GET", "POST"].includes(method) || segments.length === 2 && id(segments[1]) && ["GET", "PUT", "DELETE"].includes(method))
      || accounts && (segments.length === 1 && ["GET", "POST"].includes(method) || segments.length === 2 && id(segments[1]) && ["GET", "PUT", "DELETE"].includes(method) || segments.length === 3 && id(segments[1]) && ["activate", "deactivate"].includes(segments[2]) && method === "PATCH");
    if (!known) throw new Failure("Unknown admin operation.", 404);
    const token = request.cookies.get(COOKIE)?.value;
    if (!token) return path === "session" ? answer(null) : answer(null, "Sign in to your admin account.", 401, false);
    const admin = await upstream("/admin/private/me", "GET", token);
    if (!admin?.adminId || admin.active !== true || admin.userActive !== true || admin.userVerified !== true) throw new Failure("Admin account is inactive.", 401);
    if (path === "session") return answer(admin);
    if (accounts && admin.superAdmin !== true) throw new Failure("Super admin access is required.", 403);
    if (path === "upload") {
      const form = await request.formData(); const file = form.get("file");
      if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Failure("Choose a JPG, PNG or WebP image up to 5 MB.", 400);
      const body = new FormData(); body.set("file", file);
      const result = await upstream("/product/private/thumbnail/upload", "POST", token, body);
      if (!imageUrl(result?.fileUrl)) throw new Failure("The upload returned an invalid image URL.", 502);
      return answer(result, "Thumbnail uploaded.");
    }
    if (product && method === "GET" && segments.length === 1) {
      const params = new URL(request.url).searchParams;
      const page = params.get("page") || "1", size = params.get("size") || "20";
      const search = params.get("search") || "", category = params.get("category"), visible = params.get("visible");
      const sortBy = params.get("sortBy") || "createdAt", direction = params.get("direction") || "DESC";
      if (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 10000 || !/^\d+$/.test(size) || Number(size) < 1 || Number(size) > 100 || search.length > 100 || category && !["NORM", "EXOTIC", "FOODS"].includes(category) || visible && !["true", "false"].includes(visible) || !["productName", "productPrice", "createdAt", "updatedAt"].includes(sortBy) || !["ASC", "DESC"].includes(direction)) throw new Failure("Invalid product filters or pagination.", 400);
      const query = new URLSearchParams({ page, size, sortBy, sortDirection: direction });
      const filter: Payload = { search };
      if (category) filter.productCategoriesType = category;
      if (visible) filter.availableForPublicDisplay = visible === "true";
      const result = await upstream("/product/private/filter?" + query, "POST", token, filter);
      if (!Array.isArray(result?.data) || !Number.isInteger(result.totalPage)) throw new Failure("Unexpected product list response.", 502);
      return answer(result);
    }
    let body: unknown;
    if (["POST", "PUT"].includes(method)) {
      const raw = await json(request);
      if (product) {
        const error = productError(raw); if (error) throw new Failure(error, 400);
        body = { productName: String(raw.productName).trim(), productDescription: String(raw.productDescription).trim(), productPrice: String(raw.productPrice), productCategoriesType: raw.productCategoriesType, productBottleSize: raw.productBottleSize, productThumbnailsUrls: raw.productThumbnailsUrls, availableForPublicDisplay: raw.availableForPublicDisplay, displayVideoUrl: raw.displayVideoUrl ?? "", ...(raw.revision === undefined ? {} : { revision: raw.revision }) };
      } else body = accountBody(raw, method === "POST");
    }
    const backend = (product ? "/product/private" : "/admin/private") + (segments.length > 1 ? "/" + segments.slice(1).map(encodeURIComponent).join("/") : "");
    return answer(await upstream(backend, method, token, body), method === "DELETE" ? "Deleted." : "Saved.", method === "POST" ? 201 : 200);
  } catch (error) {
    const failure = error instanceof Failure ? error : new Failure("Cannot reach the admin service. Please retry.", 502);
    const response = answer(null, failure.message, failure.status, false);
    return failure.status === 401 && !["login", "forgot-password", "reset-password"].includes(path) ? clear(response) : response;
  }
}
export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };