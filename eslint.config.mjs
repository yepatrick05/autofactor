import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            // Standard JavaScript indent
            indent: ["error", 4],
            // TypeScript specific indent
            "@typescript-eslint/indent": ["error", 4],
            // React/JSX specific indent (Critical for .tsx files)
            "react/jsx-indent": ["error", 4],
            "react/jsx-indent-props": ["error", 4],
        },
    },
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
