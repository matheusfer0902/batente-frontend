import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { Language } from "@/lib/i18n/settings";
import ptCommon from "@/locales/pt/common.json";
import ptAuth from "@/locales/pt/auth.json";
import ptAccess from "@/locales/pt/access.json";
import ptDevice from "@/locales/pt/device.json";
import enCommon from "@/locales/en/common.json";
import enAuth from "@/locales/en/auth.json";
import enAccess from "@/locales/en/access.json";
import enDevice from "@/locales/en/device.json";

const resources = {
  pt: { common: ptCommon, auth: ptAuth, access: ptAccess, device: ptDevice },
  en: { common: enCommon, auth: enAuth, access: enAccess, device: enDevice },
};

const testI18n = i18n.createInstance();

void testI18n.use(initReactI18next).init({
  lng: "pt",
  fallbackLng: "pt",
  resources,
  defaultNS: "common",
  ns: ["common", "auth", "access", "device"],
  interpolation: { escapeValue: false },
});

export function getTestI18n(locale: Language = "pt") {
  void testI18n.changeLanguage(locale);
  return testI18n;
}

export { testI18n };
