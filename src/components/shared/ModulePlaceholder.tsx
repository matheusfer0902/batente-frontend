"use client";

import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";

/**
 * Rota já navegável, tela ainda por vir. Existe para que a casca do painel
 * seja honesta: o menu do design mostra o sistema inteiro, e nenhum item
 * leva a lugar nenhum.
 */
export function ModulePlaceholder({ navKey }: { navKey: string }) {
  const { t } = useTranslation(["nav", "common"]);

  return (
    <>
      <PageHeader
        title={t(`nav:${navKey}`)}
        subtitle={t("common:placeholder.kicker")}
      />
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          title={t("common:placeholder.title")}
          description={t("common:placeholder.description")}
        />
      </div>
    </>
  );
}
