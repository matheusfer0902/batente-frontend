"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@/hooks/useNavigation";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { NavBadge, NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface NavBadgeProps {
  kind: NavBadge;
  count: number | undefined;
}

/** Pendências pedem decisão (âmbar); ajustes são só uma contagem. */
function NavItemBadge({ kind, count }: NavBadgeProps) {
  if (count === undefined || count === 0) return null;

  if (kind === "pending") {
    return (
      <span className="rounded-[2px] bg-sun px-1.5 py-px font-mono text-[10.5px] leading-normal text-gun">
        {count}
      </span>
    );
  }

  return <span className="font-mono text-[10.5px] text-n400">{count}</span>;
}

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  count: number | undefined;
  onNavigate?: () => void;
}

function SidebarNavItem({
  item,
  isActive,
  count,
  onNavigate,
}: SidebarNavItemProps) {
  const { t } = useTranslation("nav");

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-[13.5px] transition-colors",
        isActive
          ? "bg-n800 font-medium text-linen shadow-[inset_2px_0_0_var(--chart)]"
          : "text-n300 hover:bg-n800/60 hover:text-linen",
      )}
    >
      <span>{t(item.key)}</span>
      {item.badge ? <NavItemBadge kind={item.badge} count={count} /> : null}
      {item.live ? (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-chart"
        />
      ) : null}
    </Link>
  );
}

/** Grupos e itens visíveis para o papel atual. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation("nav");
  const { groups, badgeCounts, isActive, isAdmin } = useNavigation();

  return (
    <nav aria-label={t("label")} className="flex flex-col gap-5">
      {groups.map((group, index) => (
        <div key={group.labelKey ?? `group-${index}`} className="flex flex-col gap-0.5">
          {group.labelKey ? (
            <div className="flex items-center gap-2 px-3 pb-2">
              <Eyebrow tone="inherit" className="text-[9.5px] text-n400">
                {t(group.labelKey)}
              </Eyebrow>
              {group.adminBadge && isAdmin ? (
                <span className="rounded-[2px] border border-moon/35 px-1 font-mono text-[8.5px] leading-normal tracking-[0.12em] text-moon">
                  {t("adminOnly")}
                </span>
              ) : null}
            </div>
          ) : null}

          {group.items.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              count={item.badge ? badgeCounts[item.badge] : undefined}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}
