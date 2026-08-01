"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BatenteWordmark } from "@/components/shared/BatenteLogo";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { SidebarUserMenu } from "@/components/shared/SidebarUserMenu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Abaixo de `md` a sidebar vira gaveta. O design cobre só desktop (1440px):
 * esta é a leitura mínima para o painel continuar utilizável no celular.
 */
export function MobileNav() {
  const { t } = useTranslation("nav");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-border bg-gun-950 px-4 py-3 md:hidden">
      <Link href="/inicio" className="inline-flex">
        <BatenteWordmark
          markSize={22}
          className="gap-2.5"
          textClassName="text-[15px]"
        />
      </Link>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("openMenu")}>
            <Menu className="text-n300" />
          </Button>
        </DialogTrigger>
        <DialogContent className="left-0 top-0 h-full max-w-[280px] translate-x-0 translate-y-0 grid-rows-[auto_1fr_auto] gap-0 rounded-none border-y-0 border-l-0 border-r border-border bg-gun-950 p-0 sm:rounded-none">
          <DialogTitle className="border-b border-border px-5 py-5 text-base">
            <BatenteWordmark
              markSize={24}
              className="gap-2.5"
              textClassName="text-base tracking-[0.01em]"
            />
          </DialogTitle>
          <div className="overflow-y-auto px-3 py-4">
            <SidebarNav onNavigate={() => setIsOpen(false)} />
          </div>
          <div className="border-t border-border">
            <SidebarUserMenu />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
