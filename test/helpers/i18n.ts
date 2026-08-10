import i18n, { type Resource, type ResourceLanguage } from "i18next";
import { initReactI18next } from "react-i18next";
import { languages, namespaces, type Language } from "@/lib/i18n/settings";

/**
 * Carrega **todos** os namespaces, derivando de `settings.ts`.
 *
 * Antes eram quatro importações à mão (`common`, `auth`, `access`, `device`), e
 * a lista desatualizava a cada tela nova: o teste renderizava `actions.block`
 * em vez do texto, e a falha aparecia como "o botão não existe" — longe da
 * causa. Uma lista de namespaces mantida em dois lugares só fica igual por
 * sorte.
 *
 * `import.meta.glob` com `eager` resolve em tempo de build, então continua
 * síncrono como antes.
 */
const arquivos = import.meta.glob<ResourceLanguage>(
  "../../src/locales/*/*.json",
  { eager: true, import: "default" },
);

function recursosDe(lng: string): ResourceLanguage {
  const entradas = namespaces.map((ns) => {
    const conteudo = arquivos[`../../src/locales/${lng}/${ns}.json`];

    if (!conteudo) {
      throw new Error(
        `Locale ausente: src/locales/${lng}/${ns}.json. ` +
          "O namespace está em settings.ts mas o arquivo não existe.",
      );
    }

    return [ns, conteudo] as const;
  });

  return Object.fromEntries(entradas);
}

const resources: Resource = Object.fromEntries(
  languages.map((lng) => [lng, recursosDe(lng)]),
);

const testI18n = i18n.createInstance();

void testI18n.use(initReactI18next).init({
  lng: "pt",
  fallbackLng: "pt",
  resources,
  defaultNS: "common",
  ns: [...namespaces],
  interpolation: { escapeValue: false },
});

export function getTestI18n(locale: Language = "pt") {
  void testI18n.changeLanguage(locale);
  return testI18n;
}

export { testI18n };
