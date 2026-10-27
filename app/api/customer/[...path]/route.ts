import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic = "force-dynamic";

const COOKIE = "healthee_customer_access";
const MAX_IMAGE = 5 * 1024 * 1024;

const headers = {
  "Cache-Control": "no-store",
};

type Context = {
  params: Promise<{
    path: string[];
  }>;
};

type Payload = Record<string, unknown>;

const routes: Record<
  string,
  [string, string, boolean]
> = {
  "POST register": [
    "/customer/public/register",
    "POST",
    false,
  ],

  "POST login": [
    "/customer/public/login",
    "POST",
    false,
  ],

  "POST verify-otp": [
    "/customer/public/verify-otp",
    "POST",
    false,
  ],

  "POST resend-otp": [
    "/customer/public/resend-otp",
    "POST",
    false,
  ],

  "POST forgot-password": [
    "/customer/public/forgot-password",
    "POST",
    false,
  ],

  "POST reset-password": [
    "/customer/public/reset-password",
    "POST",
    false,
  ],

  "GET session": [
    "/customer/private/profile",
    "GET",
    true,
  ],

  "GET profile": [
    "/customer/private/profile",
    "GET",
    true,
  ],

  "PATCH profile": [
    "/customer/private/profile",
    "PATCH",
    true,
  ],

  "DELETE profile": [
    "/customer/private/profile",
    "DELETE",
    true,
  ],

  "PATCH change-password": [
    "/customer/private/change-password",
    "PATCH",
    true,
  ],

  "GET cart": [
    "/cart/private",
    "GET",
    true,
  ],

  "DELETE cart": [
    "/cart/private",
    "DELETE",
    true,
  ],

  "POST cart/items": [
    "/cart/private/items",
    "POST",
    true,
  ],

  "POST avatar": [
    "/utilities/public/file/upload",
    "POST",
    true,
  ],
};

function reply(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      data: null,
    },
    {
      status,
      headers,
    },
  );
}

function clear(response: NextResponse) {
  response.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

function valid(
  path: string,
  data: Payload,
): boolean {
  const email =
    typeof data.emailAddress === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      data.emailAddress,
    ) &&
    data.emailAddress.length <= 254;

  const password = (value: unknown) =>
    typeof value === "string" &&
    value.length >= 8 &&
    value.length <= 100;

  const otp =
    typeof data.otp === "string" &&
    /^\d{6}$/.test(data.otp);

  if (path === "register") {
    return email && password(data.password);
  }

  if (path === "login") {
    return (
      email &&
      typeof data.password === "string" &&
      data.password.length > 0 &&
      data.password.length <= 100
    );
  }

  if (path === "verify-otp") {
    return email && otp;
  }

  if (path === "forgot-password") {
    return email;
  }

  if (path === "resend-otp") {
    return (
      email &&
      [
        "ACCOUNT_ACTIVATION",
        "PASSWORD_RESET",
      ].includes(String(data.userOtpType))
    );
  }

  if (path === "reset-password") {
    return (
      email &&
      otp &&
      password(data.newPassword)
    );
  }

  if (path === "change-password") {
    return (
      typeof data.oldPassword === "string" &&
      password(data.newPassword)
    );
  }

  if (
    path === "cart/items" ||
    path.startsWith("cart/items/")
  ) {
    return (
      Number.isInteger(data.quantity) &&
      Number(data.quantity) >= 1 &&
      Number(data.quantity) <= 100 &&
      (
        path !== "cart/items" ||
        (
          typeof data.productId === "string" &&
          /^[\w-]{1,150}$/.test(data.productId)
        )
      )
    );
  }

  if (path === "profile") {
    const lengths: Record<string, number> = {
      firstName: 100,
      lastName: 100,
      phoneNumber: 30,
      profilePictureUrl: 500,
    };

    for (
      const [key, limit] of Object.entries(lengths)
    ) {
      if (
        data[key] !== undefined &&
        (
          typeof data[key] !== "string" ||
          String(data[key]).length > limit
        )
      ) {
        return false;
      }
    }

    if (
      data.firstName !== undefined &&
      !String(data.firstName).trim()
    ) {
      return false;
    }

    if (
      data.lastName !== undefined &&
      !String(data.lastName).trim()
    ) {
      return false;
    }

    if (
      data.gender !== undefined &&
      ![
        "MALE",
        "FEMALE",
        "NON_BINARY",
      ].includes(String(data.gender))
    ) {
      return false;
    }

    if (
      data.dateOfBirth !== undefined &&
      (
        typeof data.dateOfBirth !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(
          data.dateOfBirth,
        ) ||
        !Number.isFinite(
          Date.parse(data.dateOfBirth),
        ) ||
        Date.parse(data.dateOfBirth) >= Date.now()
      )
    ) {
      return false;
    }

    if (
      data.marketingEmailsEnabled !== undefined &&
      typeof data.marketingEmailsEnabled !==
        "boolean"
    ) {
      return false;
    }

    if (data.profilePictureUrl) {
      try {
        if (
          !["http:", "https:"].includes(
            new URL(
              String(data.profilePictureUrl),
            ).protocol,
          )
        ) {
          return false;
        }
      } catch {
        return false;
      }
    }
  }

  return true;
}

async function handle(
  request: NextRequest,
  context: Context,
) {
  const {
    path: parts,
  } = await context.params;

  const path = parts.join("/");
  const method = request.method;

  if (
    method !== "GET" &&
    request.headers.get("origin") !==
      new URL(request.url).origin
  ) {
    return reply(
      "Please submit this request from the HEALTHEE website.",
      403,
    );
  }

  if (
    path === "logout" &&
    method === "POST"
  ) {
    return clear(
      NextResponse.json(
        {
          success: true,
          data: null,
        },
        {
          headers,
        },
      ),
    );
  }

  let route = routes[`${method} ${path}`];

  if (
    /^cart\/items\/[a-zA-Z0-9_-]{1,150}$/.test(
      path,
    ) &&
    ["PATCH", "DELETE"].includes(method)
  ) {
    route = [
      "/cart/private/items/" + parts[2],
      method,
      true,
    ];
  }

  if (!route) {
    return reply(
      "This customer endpoint does not exist.",
      404,
    );
  }

  const token = request.cookies.get(COOKIE)?.value;

  if (route[2] && !token) {
    if (path === "session") {
      return NextResponse.json(
        {
          success: true,
          data: null,
        },
        {
          headers,
        },
      );
    }

    return reply(
      "Please sign in to continue.",
      401,
    );
  }

  const base = process.env.HEALTHEE_API_URL;

  if (!base) {
    return reply(
      "The customer service is not configured.",
      503,
    );
  }

  if (
    route[2] &&
    !process.env.HEALTHEE_API_KEY
  ) {
    return reply(
      "The server API key is not configured.",
      503,
    );
  }

  try {
    const target = new URL(
      base.replace(/\/$/, "") +
        "/api/v1" +
        route[0],
    );

    if (
      !["http:", "https:"].includes(
        target.protocol,
      ) ||
      target.username ||
      target.password
    ) {
      throw new Error("Invalid service URL");
    }

    const outgoing: Record<string, string> = {
      Accept: "application/json",
    };

    if (token && route[2]) {
      outgoing.Authorization = `Bearer ${token}`;
    }

    if (process.env.HEALTHEE_API_KEY) {
      outgoing["X-API-Key"] =
        process.env.HEALTHEE_API_KEY;
    }

    let body: string | FormData | undefined;

    if (path === "avatar") {
      if (
        Number(
          request.headers.get("content-length"),
        ) >
        MAX_IMAGE + 1024 * 1024
      ) {
        return reply(
          "Choose an image smaller than 5 MB.",
          413,
        );
      }

      const incoming = await request.formData();
      const file = incoming.get("file");

      if (
        !(file instanceof File) ||
        file.size === 0 ||
        file.size > MAX_IMAGE ||
        ![
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(file.type)
      ) {
        return reply(
          "Choose a JPG, PNG or WebP image, up to 5 MB.",
          400,
        );
      }

      const form = new FormData();

      form.set("file", file);
      form.set("category", "IMAGE");
      form.set("usageType", "GENERAL");

      body = form;
    } else if (
      ["POST", "PATCH"].includes(method)
    ) {
      const text = await request.text();

      if (text.length > 16000) {
        return reply(
          "The request is too large.",
          413,
        );
      }

      let data: Payload;

      try {
        data = JSON.parse(text);
      } catch {
        return reply(
          "Send a valid JSON request.",
          400,
        );
      }

      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        !valid(path, data)
      ) {
        return reply(
          "Please check the form fields and try again.",
          400,
        );
      }

      outgoing["Content-Type"] =
        "application/json";

      body = JSON.stringify(data);
    }

    const upstream = await fetch(target, {
      method: route[1],
      headers: outgoing,
      body,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(
        path === "avatar" ? 30000 : 15000,
      ),
    });

    let result;

    try {
      result = await upstream.json();
    } catch {
      return reply(
        "The customer service returned an unreadable response.",
        502,
      );
    }

    if (
      !upstream.ok ||
      result.success !== true
    ) {
      const response = reply(
        upstream.status >= 500
          ? "The customer service is temporarily unavailable. Please retry."
          : typeof result.message === "string"
            ? result.message.slice(0, 300)
            : "This request could not be completed.",
        upstream.ok ? 400 : upstream.status,
      );

      return (
        route[2] &&
        upstream.status === 401
      )
        ? clear(response)
        : response;
    }

    if (path === "login") {
      if (
        typeof result.data?.accessToken !==
          "string" ||
        !result.data.accessToken.trim() ||
        !result.data?.customer
      ) {
        return reply(
          "The login response was incomplete.",
          502,
        );
      }

      const response = NextResponse.json(
        {
          success: true,
          data: result.data.customer,
        },
        {
          headers,
        },
      );

      // JWT validation and expiry remain the backend's responsibility.
      response.cookies.set(
        COOKIE,
        result.data.accessToken,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        },
      );

      return response;
    }

    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.data ?? null,
      },
      {
        headers,
      },
    );

    return (
      path === "profile" &&
      method === "DELETE"
    )
      ? clear(response)
      : response;
  } catch (error) {
    const cause =
      error instanceof Error &&
      "cause" in error
        ? (
            error.cause as {
              code?: string;
              message?: string;
            }
          )
        : undefined;

    console.error(
      "[customer] Upstream request failed",
      {
        operation: `${method} ${
          path === "avatar"
            ? "avatar"
            : parts[0]
        }`,

        code:
          cause?.code ??
          (
            cause?.message === "bad port"
              ? "BLOCKED_PORT"
              : "UPSTREAM_ERROR"
          ),
      },
    );

    return reply(
      "Cannot reach the customer service. Please retry shortly.",
      502,
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;