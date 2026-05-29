import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "az"],
  defaultLocale: "en",
  localePrefix: "always",
});
