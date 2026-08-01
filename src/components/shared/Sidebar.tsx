"use client";

import Link from "next/link";
import { BatenteWordmark } from "@/components/shared/BatenteLogo";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { SidebarUserMenu } from "@/components/shared/SidebarUserMenu";

/** Casca de navegação do painel — 246px fixos a partir de `md`. */
export function Sidebar() {
  return (
    <aside className="hidden w-[246px] shrink-0 flex-col border-r border-border bg-gun-950 md:flex">
      <div className="border-b border-border px-5 py-5">
        <Link href="/inicio" className="inline-flex">
          <BatenteWordmark
            markSize={24}
            className="gap-2.5"
            textClassName="text-base tracking-[0.01em]"
          />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav />
      </div>

      <div className="border-t border-border">
        <SidebarUserMenu />
      </div>
    </aside>
  );
}
