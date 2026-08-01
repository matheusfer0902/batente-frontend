"use client";

import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/lib/i18n/client";
import type { Language } from "@/lib/i18n/settings";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { t, i18n } = useTranslation(["common", "auth"]);
  const { user, logout } = useAuth();

  const switchLanguage = (lng: Language) => {
    void changeLanguage(lng);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/80 bg-card/40 px-4 md:px-6">
      <div className="md:hidden font-display text-lg font-bold">{t("common:appName")}</div>
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {t(`common:language.${i18n.language as Language}`, {
                defaultValue: i18n.language,
              })}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => switchLanguage("pt")}>
              {t("common:language.pt")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchLanguage("en")}>
              {t("common:language.en")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
        {user && (
          <div className="ml-2 flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.name}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              {t("auth:logout")}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
