import { addDependency, loadAsJson, setScripts, type TransformerProps } from "@batijs/core";

export default async function getPackageJson(props: TransformerProps) {
  const packageJson = await loadAsJson(props);

  setScripts(packageJson, {
    dev: {
      value: "tsx ./express-entry.ts",
      precedence: 20,
      warnIfReplaced: true,
    },
    build: {
      value: "vite build",
      precedence: 1,
      warnIfReplaced: true,
    },
    preview: {
      value: "NODE_ENV=production tsx ./express-entry.ts",
      precedence: 20,
    },
  });

  return addDependency(packageJson, await import("../package.json", { assert: { type: "json" } }), {
    devDependencies: [
      "@types/express",
      ...(props.meta.BATI.has("firebase-auth") ? (["@types/cookie-parser"] as const) : [])
    ],
    dependencies: [
      "@hattip/adapter-node",
      "express",
      "tsx",
      "vite",
      "vike",
      ...(props.meta.BATI.has("authjs") ? (["@auth/core", "vike-authjs"] as const) : []),
      ...(props.meta.BATI.has("firebase-auth") ? (["cookie-parser"] as const) : [])
    ],
  });
}
