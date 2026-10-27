export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const reply = (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    });

  const base = process.env.HEALTHEE_API_URL;

  if (!base) {
    return reply(
      {
        message:
          "Set HEALTHEE_API_URL in .env.local, then restart Next.js.",
      },
      503,
    );
  }

  const incoming = new URL(request.url);
  const id = incoming.searchParams.get("id");
  const page = incoming.searchParams.get("page") ?? "1";

  if (
    (id !== null && !/^[a-zA-Z0-9_-]{1,150}$/.test(id)) ||
    !/^[1-9]\d{0,3}$/.test(page)
  ) {
    return reply(
      {
        message: "Invalid product ID or page.",
      },
      400,
    );
  }

  try {
    const url = new URL(
      base.replace(/\/$/, "") +
        "/api/v1/product/public" +
        (id ? "/" + encodeURIComponent(id) : ""),
    );

    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      throw new Error("Invalid backend URL");
    }

    if (!id) {
      url.search = new URLSearchParams({
        page,
        size: "100",
        sortBy: "productName",
        sortDirection: "ASC",
      }).toString();
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (process.env.HEALTHEE_API_KEY) {
      headers["X-API-Key"] = process.env.HEALTHEE_API_KEY;
    }

    const response = await fetch(url, {
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return reply(
        {
          message:
            response.status === 404
              ? "Product is no longer available."
              : "The product service is unavailable. Please retry.",
        },
        response.status === 404 ? 404 : 502,
      );
    }

    const result = await response.json();

    if (result.success !== true || result.data == null) {
      throw new Error("Invalid catalogue response");
    }

    return reply(result.data);
  } catch {
    // Keep upstream URLs and credentials out of browser errors.
    console.error(
      "[catalogue] Could not fetch public products.",
    );

    return reply(
      {
        message:
          "Cannot reach the product service. Check that the backend is running, then retry.",
      },
      502,
    );
  }
}