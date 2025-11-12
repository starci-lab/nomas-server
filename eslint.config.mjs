import js from "@eslint/js"
import globals from "globals"
import * as tseslint from "typescript-eslint"
import prettier from "eslint-config-prettier"
import { defineConfig } from "eslint/config"

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        languageOptions: { globals: globals.node },
        extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
        rules: {
            indent: ["error", 4],
            "linebreak-style": "off",
            quotes: ["error", "double"],
            semi: ["error", "never"],
            "@typescript-eslint/no-explicit-any": "error",
        },
    },
])
