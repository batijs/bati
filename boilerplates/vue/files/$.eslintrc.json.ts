import { loadAsJson, type TransformerProps } from "@batijs/core";

export default async function getEslintConfig(props: TransformerProps) {
  if (!props.meta.BATI.has("eslint")) return;

  const eslintConfig = await loadAsJson(props);
  eslintConfig.extends.push("plugin:vue/vue3-recommended");
  eslintConfig.parser = "vue-eslint-parser";
  eslintConfig.parserOptions.parser = "@typescript-eslint/parser";
  eslintConfig.rules ??= {};
  eslintConfig.rules["vue/multi-word-component-names"] = "off";
  eslintConfig.rules["vue/singleline-html-element-content-newline"] = "off";
  eslintConfig.rules["vue/max-attributes-per-line"] = "off";
  eslintConfig.rules["vue/html-self-closing"] = "off";
  return eslintConfig;
}
