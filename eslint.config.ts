import eslint from "@eslint/js";
import type { ExtendsElement } from "@eslint/config-helpers";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import VueEslintParser from "vue-eslint-parser";

export default defineConfig(
  globalIgnores(["**/dist"]),
  {
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      ...(pluginVue.configs["flat/recommended"] as ExtendsElement[]),
    ],
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: VueEslintParser,
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-require-imports": "off",
      "vue/multi-word-component-names": "off",
    },
  },
  eslintConfigPrettier,
);
