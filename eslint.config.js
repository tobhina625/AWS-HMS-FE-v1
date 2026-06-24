import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-plugin-prettier";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,vue}"]},
  { languageOptions: { globals: { ...globals.browser, google: "readonly" } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {files: ["**/*.vue"], languageOptions: {parserOptions: {parser: tseslint.parser}}},
  {
    plugins: {
      jsdoc,
      prettier,
    },
    rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Require explicit return types in public functions
    '@typescript-eslint/no-explicit-any': 'off', // Disallow usage of 'any' type
    '@typescript-eslint/no-unused-vars': 'error', // Disallow unused variables
    // 'jsdoc/require-jsdoc': 'error', // Require JSDoc comments
    // 'jsdoc/require-param-type': 'error', // Require JSDoc param types
    // 'jsdoc/require-returns-type': 'error', // Require JSDoc return types
    'no-async-promise-executor': 'off'
  }}
];