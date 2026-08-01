"use client";

import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { fallbackLng, getOptions, type Language } from "@/lib/i18n/settings";

const runsOnServerSide = typeof window === "undefined";

void i18next
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`@/locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    ...getOptions(fallbackLng),
    lng: fallbackLng,
    preload: runsOnServerSide ? [fallbackLng, "en"] : [],
  });

export default i18next;

export function changeLanguage(lng: Language) {
  return i18next.changeLanguage(lng);
}
