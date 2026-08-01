export const fallbackLng = "pt";
export const languages = ["pt", "en"] as const;
export type Language = (typeof languages)[number];

export const defaultNS = "common";
export const namespaces = [
  "common",
  "auth",
  "resource",
  "nav",
  "dashboard",
  "device",
  "access",
] as const;
export type Namespace = (typeof namespaces)[number];

/**
 * Todos os namespaces são carregados na inicialização. São arquivos pequenos,
 * e assim nenhuma tela suspende no meio da navegação esperando tradução.
 */
export function getOptions(
  lng: Language = fallbackLng,
  ns: readonly Namespace[] = namespaces,
) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: [...ns],
  };
}
