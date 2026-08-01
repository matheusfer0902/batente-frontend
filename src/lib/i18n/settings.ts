export const fallbackLng = "pt";
export const languages = ["pt", "en"] as const;
export type Language = (typeof languages)[number];

export const defaultNS = "common";
export const namespaces = ["common", "auth", "resource"] as const;
export type Namespace = (typeof namespaces)[number];

export function getOptions(lng: Language = fallbackLng, ns: Namespace = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
