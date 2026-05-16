import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // The new React 19 lint flags reading Date.now() / new Date() during
      // render. We do this intentionally for "overdue" / "due-now" UI which
      // recomputes on every render. Hydration is fine because dynamic pages
      // are server-rendered fresh on each request.
      "react-hooks/purity": "off",
      // Dialog forms that mirror an `initial` prop into local state when
      // re-opened legitimately call setState in an effect. Migrating to the
      // recommended `key`-based reset is a V2 cleanup.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
