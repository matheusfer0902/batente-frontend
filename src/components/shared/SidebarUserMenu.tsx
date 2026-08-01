"use client";

import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { changeLanguage } from "@/lib/i18n/client";
import { languages, type Language } from "@/lib/i18n/settings";
import { PermissionService } from "@/services/PermissionService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { eyebrowVariants } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

/**
 * Bloco do usuário no rodapé da sidebar. O design não mostra onde ficam
 * idioma e saída — é aqui, junto de quem está logado.
 */
export function SidebarUserMenu() {
  const { t, i18n } = useTranslation(["auth", "common"]);
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-n800/50"
        >
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-sm bg-n700 font-mono text-[11px] text-n300">
            {PermissionService.initials(user.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] text-linen">
              {user.name}
            </span>
            <span
              className={cn(
                eyebrowVariants({ tone: "inherit" }),
                "block text-[9.5px] tracking-[0.14em] text-n400",
              )}
            >
              {t(`auth:roles.${user.role}`)}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-52">
        <DropdownMenuLabel>{t("common:language.label")}</DropdownMenuLabel>
        {languages.map((language: Language) => (
          <DropdownMenuItem
            key={language}
            onClick={() => void changeLanguage(language)}
            className={cn(i18n.language === language && "text-chart")}
          >
            {t(`common:language.${language}`)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void logout()}>
          {t("auth:logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
