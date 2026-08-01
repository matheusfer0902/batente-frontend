"use client";

import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 py-6 text-center text-sm text-muted-foreground">
      {t("footer.copyright", { year })}
    </footer>
  );
}
