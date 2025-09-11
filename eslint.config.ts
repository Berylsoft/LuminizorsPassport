import eslint from "@eslint/js";
import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import VueEslintParser from "vue-eslint-parser";

export default tseslint.config(
  globalIgnores(["**/dist"]),
  {
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      ...pluginVue.configs["flat/recommended"],
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
      "vue/multi-word-component-names": "off",
    },
  },
  eslintConfigPrettier,
);
