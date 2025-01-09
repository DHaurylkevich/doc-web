import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions:
    {
      sourceType: "commonjs",
      globals: {
        ...globals.node
      }
    }
  },
  {
    ignores: ["**/node_modules/**", "**/seeders/**", "**/migrations/**", "**/*.test.js"],
    // languageOptions: {
    //   globals: {
    //     ...globals.mocha,
    //   },
    // }
  },
  pluginJs.configs.recommended,
];