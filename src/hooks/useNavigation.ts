"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCanAccess } from "@/hooks/useCanAccess";
import {
  useGetAdjustmentSummaryQuery,
  useGetPendingSummaryQuery,
} from "@/redux/reducers/queries/timekeepingApi";
import { NAV_GROUPS, type NavBadge, type NavGroup } from "@/lib/navigation";

/**
 * Navegação visível para o papel atual, com os contadores dos itens.
 * A sidebar sempre mostra os números reais — cenários de demonstração valem
 * para o conteúdo da página, não para o menu.
 */
export function useNavigation() {
  const pathname = usePathname();
  const { canAccess, isAdmin, user } = useCanAccess();

  // Mesma chave de cache das telas sem cenário — evita requisição duplicada.
  const { data: pending } = useGetPendingSummaryQuery({});
  const { data: adjustments } = useGetAdjustmentSummaryQuery({});

  const groups = useMemo<NavGroup[]>(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => canAccess(item.roles)),
      })).filter((group) => group.items.length > 0),
    [canAccess],
  );

  const badgeCounts: Record<NavBadge, number | undefined> = {
    pending: pending?.days,
    adjustments: adjustments?.count,
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return { groups, badgeCounts, isActive, isAdmin, user };
}
