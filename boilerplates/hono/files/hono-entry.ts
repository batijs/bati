import { authjsHandler } from "@batijs/authjs/server/authjs-handler";
import { firebaseAdmin } from "@batijs/firebase-auth/libs/firebaseAdmin";
import { telefuncHandler } from "@batijs/telefunc/server/telefunc-handler";
import { appRouter } from "@batijs/trpc/trpc/server";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { fetchRequestHandler, type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getAuth } from "firebase-admin/auth";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { renderPage } from "vike/server";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export function handlerAdapter<Context extends Record<string | number | symbol, unknown>>(
  handler: (request: Request, context: Context) => Promise<Response>,
) {
  return createMiddleware((context) => {
    return handler(context.req.raw, context as unknown as Context);
  });
}

const app = new Hono();

app.use(compress());

if (isProduction) {
  app.use(
    "/*",
    serveStatic({
      root: `dist/client/`,
    }),
  );
}

if (BATI.has("authjs")) {
  app.use("/api/auth/**", handlerAdapter(authjsHandler));
}

if (BATI.has("firebase-auth")) {
  app.use(async (c, next) => {
    const sessionCookie: string = getCookie(c, "__session") || "";
    if (sessionCookie) {
      const auth = getAuth(firebaseAdmin);
      try {
        const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
        const user = await auth.getUser(decodedIdToken.sub);
        c.set("user", user);
      } catch (error) {
        console.debug("verifySessionCookie:", error);
        c.set("user", null);
      }
    }
    await next();
  });

  app.post("/api/sessionLogin", async (c) => {
    const body = await c.req.json();
    const idToken: string = body.idToken || "";

    let expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days. The auth.createSessionCookie() function of Firebase expects time to be specified in miliseconds.

    const auth = getAuth(firebaseAdmin);
    try {
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      const options = { maxAge: expiresIn / 1000, httpOnly: true, secure: true };

      expiresIn = 60 * 60 * 24 * 5; // 5 days. The setCookie() function of Hono expects time to be specified in seconds.
      setCookie(c, "__session", sessionCookie, options);

      return c.json({ status: "success" }, 200);
    } catch (error) {
      console.error("createSessionCookie failed :", error);
      return c.text("Unathorized", 401);
    }
  });

  app.post("/api/sessionLogout", (c) => {
    deleteCookie(c, "__session");
    return c.text("Logged Out", 200);
  });
}

if (BATI.has("trpc")) {
  /**
   * tRPC route
   *
   * @link {@see https://trpc.io/docs/server/adapters}
   **/
  app.use("/api/trpc/*", (c) => {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext({ req, resHeaders }): FetchCreateContextFnOptions {
        return { req, resHeaders };
      },
    });
  });
}

if (BATI.has("telefunc")) {
  /**
   * Telefunc route
   *
   * @link {@see https://telefunc.com}
   **/
  app.post("/_telefunc", handlerAdapter(telefuncHandler));
}

app.all("*", async (c, next) => {
  const pageContextInit = BATI.has("firebase-auth")
    ? {
        urlOriginal: c.req.url,
        user: c.get("user"),
      }
    : {
        urlOriginal: c.req.url,
      };
  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    return next();
  } else {
    const { body, statusCode, headers } = httpResponse;
    headers.forEach(([name, value]) => c.header(name, value));
    c.status(statusCode);

    return c.body(body);
  }
});

if (isProduction) {
  console.log(`Server listening on http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port: port,
  });
}

export default app;
