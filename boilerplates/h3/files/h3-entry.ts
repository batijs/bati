// BATI.has("auth0")
import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { authjsHandler, authjsSessionMiddleware } from "@batijs/authjs/server/authjs-handler";
import {
  firebaseAuthLoginHandler,
  firebaseAuthLogoutHandler,
  firebaseAuthMiddleware,
} from "@batijs/firebase-auth/server/firebase-auth-middleware";
import {
  luciaAuthLoginHandler,
  luciaAuthLogoutHandler,
  luciaAuthMiddleware,
  luciaAuthSignupHandler,
  luciaCsrfMiddleware,
  luciaGithubCallbackHandler,
  luciaGithubLoginHandler,
} from "@batijs/lucia-auth/server/lucia-auth-handlers";
import { createTodoHandler } from "@batijs/shared-server/server/create-todo-handler";
import { vikeHandler } from "@batijs/shared-server/server/vike-handler";
import { telefuncHandler } from "@batijs/telefunc/server/telefunc-handler";
import { appRouter } from "@batijs/trpc/trpc/server";
import { tsRestHandler } from "@batijs/ts-rest/server/ts-rest-handler";
import installCrypto from "@hattip/polyfills/crypto";
import installGetSetCookie from "@hattip/polyfills/get-set-cookie";
import installWhatwgNodeFetch from "@hattip/polyfills/whatwg-node";
import { type NodeHTTPCreateContextFnOptions, nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { createApp, createRouter, eventHandler, fromNodeMiddleware, toNodeListener, toWebRequest } from "h3";
import serveStatic from "serve-static";

installWhatwgNodeFetch();
installGetSetCookie();
installCrypto();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = __dirname;
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const hmrPort = process.env.HMR_PORT ? parseInt(process.env.HMR_PORT, 10) : 24678;

interface Middleware<Context extends Record<string | number | symbol, unknown>> {
  (request: Request, context: Context): Response | void | Promise<Response> | Promise<void>;
}

export function fromWebMiddleware<Context extends Record<string | number | symbol, unknown>>(
  handler: Middleware<Context>,
) {
  return eventHandler((event) => {
    const ctx = event.context as unknown as Record<string, unknown>;
    ctx.context ??= {};
    return handler(toWebRequest(event), ctx.context as Context);
  });
}

export default await startServer();

async function startServer() {
  const app = createApp();

  if (process.env.NODE_ENV === "production") {
    app.use("/", fromNodeMiddleware(serveStatic(`${root}/dist/client`)));
  } else {
    // Instantiate Vite's development server and integrate its middleware to our server.
    // ⚠️ We should instantiate it *only* in development. (It isn't needed in production
    // and would unnecessarily bloat our server in production.)
    const vite = await import("vite");
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true, hmr: { port: hmrPort } },
      })
    ).middlewares;
    app.use(fromNodeMiddleware(viteDevMiddleware));
  }

  const router = createRouter();

  if (BATI.has("authjs") || BATI.has("auth0")) {
    /**
     * Append Auth.js session to context
     **/
    app.use(fromWebMiddleware(authjsSessionMiddleware));

    /**
     * Auth.js route
     * @link {@see https://authjs.dev/getting-started/installation}
     **/
    router.use("/api/auth/**", fromWebMiddleware(authjsHandler));
  }

  if (BATI.has("firebase-auth")) {
    app.use(fromWebMiddleware(firebaseAuthMiddleware));
    router.post("/api/sessionLogin", fromWebMiddleware(firebaseAuthLoginHandler));
    router.post("/api/sessionLogout", fromWebMiddleware(firebaseAuthLogoutHandler));
  }

  if (BATI.has("lucia-auth")) {
    app.use(fromWebMiddleware(luciaCsrfMiddleware));
    app.use(fromWebMiddleware(luciaAuthMiddleware));

    router.post("/api/signup", fromWebMiddleware(luciaAuthSignupHandler));
    router.post("/api/login", fromWebMiddleware(luciaAuthLoginHandler));
    router.post("/api/logout", fromWebMiddleware(luciaAuthLogoutHandler));
    router.get("/api/login/github", fromWebMiddleware(luciaGithubLoginHandler));
    router.get("/api/login/github/callback", fromWebMiddleware(luciaGithubCallbackHandler));
  }

  if (BATI.has("trpc")) {
    /**
     * tRPC route
     *
     * @link {@see https://trpc.io/docs/server/adapters}
     **/
    router.use(
      "/api/trpc/**:path",
      eventHandler((event) =>
        nodeHTTPRequestHandler({
          req: event.node.req,
          res: event.node.res,
          path: event.context.params!.path,
          router: appRouter,
          createContext({ req, res }: NodeHTTPCreateContextFnOptions<IncomingMessage, ServerResponse>) {
            return { req, res };
          },
        }),
      ),
    );
  }

  if (BATI.has("telefunc")) {
    /**
     * Telefunc route
     *
     * @link {@see https://telefunc.com}
     **/
    router.post("/_telefunc", fromWebMiddleware(telefuncHandler));
  }

  if (BATI.has("ts-rest")) {
    router.use("/api/**", fromWebMiddleware(tsRestHandler));
  }

  if (!BATI.has("telefunc") && !BATI.has("trpc") && !BATI.has("ts-rest")) {
    router.post("/api/todo/create", fromWebMiddleware(createTodoHandler));
  }

  /**
   * Vike route
   *
   * @link {@see https://vike.dev}
   **/
  router.use("/**", fromWebMiddleware(vikeHandler));

  app.use(router);

  const server = createServer(toNodeListener(app));

  if (BATI.has("vercel")) {
    if (process.env.NODE_ENV !== "production") {
      server.listen(port);

      server.on("listening", () => {
        console.log(`Server listening on http://localhost:${port}`);
      });
    }
  } else {
    server.listen(port);

    server.on("listening", () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  }

  return server;
}
