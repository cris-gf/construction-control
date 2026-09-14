import js from "@eslint/js";
import ts from "typescript-eslint";
export default ts.config(
  { ignores: ["dist/**", "node_modules/**", "public/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        crypto: "readonly",
        console: "readonly",
        fetch: "readonly",
        AbortSignal: "readonly",
        document: "readonly",
        getComputedStyle: "readonly",
      },
    },
  },
);
