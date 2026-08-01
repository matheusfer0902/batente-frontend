"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [{ href: "/resources", labelKey: "title", ns: "resource" as const }];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation(["resource", "common"]);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/80 bg-card/40 md:block">
      <div className="flex h-16 items-center border-b border-border/80 px-6">
        <Link href="/resources" className="font-display text-lg font-bold tracking-tight">
          {t("common:appName")}
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              {t(`${item.ns}:${item.labelKey}`)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
