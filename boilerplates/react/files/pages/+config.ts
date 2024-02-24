import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Head from "../layouts/HeadDefault";
import Layout from "../layouts/LayoutDefault";

// Default config (can be overridden by pages)
export default {
  Layout,
  Head,
  /*{ @if (it.BATI.has("firebase-auth")) }*/
  passToClient: ["user"],
  /*{ /if }*/
  // <title>
  title: "My Vike App",
  extends: vikeReact,
  /*{ @if (it.BATI.has("firebase-auth")) }*/
  meta: {
    firebaseApp: {
      env: { client: true },
    },
  },
  /*{ /if }*/
} satisfies Config;