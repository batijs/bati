// @ts-nocheck

import eslint from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
// missing "exports" in package.json
import react from "eslint-plugin-react/configs/recommended.js";
// See https://github.com/solidjs-community/eslint-plugin-solid/issues/118
// import solid from "eslint-plugin-solid/configs/typescript";
import solid from "eslint-plugin-solid/dist/configs/typescript.js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default tseslint.config(
  {
    ignores: [
      "dist/*",
      // JS files at the root of the project
      "*.js",
      "*.cjs",
      "*.mjs",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        1,
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  //# BATI.has("vue")
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  },
  //# BATI.has("react")
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...react,
    languageOptions: {
      ...react.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },
  //# BATI.has("solid")
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ...solid,
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  //# BATI.has("vue")
  ...pluginVue.configs["flat/recommended"],
  //# BATI.has("vue")
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/max-attributes-per-line": "off",
      "vue/html-self-closing": "off",
    },
  },
  //# BATI.has("prettier")
  prettier,
);
