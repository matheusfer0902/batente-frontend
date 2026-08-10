"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DataBoundary } from "@/components/shared/DataBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import { DepartmentFormDialog } from "@/components/department/DepartmentFormDialog";
import { useCanMutate } from "@/hooks/useCanMutate";
import { useDepartment } from "@/hooks/useDepartment";
import { DepartmentService } from "@/services/DepartmentService";
import { apiErrorCode } from "@/lib/apiError";
import { cn } from "@/lib/utils";
import type { Department } from "@/types/department";

const HEAD =
  "border-b border-border px-6 py-2.5 text-left font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-moon";

const ACAO =
  "font-mono text-[11px] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:no-underline";

export function DepartmentList() {
  const { t } = useTranslation(["department", "common"]);
  const {
    departments,
    isLoading,
    isError,
    retry,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
  } = useDepartment();
  const { canCreate, canEdit, canDelete } = useCanMutate("departments");

  const [emEdicao, setEmEdicao] = useState<Department | undefined>();
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [bloqueio, setBloqueio] = useState<Department | null>(null);

  function abrirNovo() {
    setEmEdicao(undefined);
    setDialogoAberto(true);
  }

  function abrirEdicao(department: Department) {
    setEmEdicao(department);
    setDialogoAberto(true);
  }

  async function excluir(department: Department) {
    setBloqueio(null);

    try {
      await remove(department.id);
    } catch (causa) {
      // `in_use` chega quando alguém vinculou uma pessoa entre o carregamento
      // da lista e o clique. A tela mostrava o botão ativo de boa-fé; quem
      // decide é a FK `ON DELETE RESTRICT`.
      if (apiErrorCode(causa) === "in_use") {
        setBloqueio(department);
      }
    }
  }

  return (
    <>
      <PageHeader
        title={t("department:title")}
        subtitle={t("department:subtitle", { count: departments.length })}
        actions={
          canCreate ? (
            <Button variant="default" size="entryInline" onClick={abrirNovo}>
              {t("department:create")}
            </Button>
          ) : null
        }
      />

      {bloqueio ? (
        <div className="px-5 pt-5 md:px-8">
          <Alert variant="danger">
            <strong className="block">
              {t("department:deleteBlocked.title", { name: bloqueio.name })}
            </strong>
            {t("department:deleteBlocked.body", {
              count: bloqueio.employeeCount,
            })}
          </Alert>
        </div>
      ) : null}

      <DataBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={retry}
        isEmpty={departments.length === 0}
        skeleton={<SkeletonText lines={8} className="p-6" />}
        empty={
          <EmptyState
            title={t("department:empty")}
            className="mx-auto max-w-md py-16"
          />
        }
      >
        <div className="mx-5 mb-6 overflow-hidden rounded-sm border border-border bg-gun-950 md:mx-8">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className={cn(HEAD, "w-[40%]")}>
                  {t("department:table.name")}
                </th>
                <th className={cn(HEAD, "w-[20%]")}>
                  {t("department:table.people")}
                </th>
                <th className={cn(HEAD, "text-right")}>
                  {t("department:table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => {
                // Vazio é a única condição em que a exclusão é possível — a
                // tela 15 pede a ação apagada, com o motivo, nos demais.
                const removivel = DepartmentService.canDelete(department);

                return (
                  <tr
                    key={department.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-3.5 text-linen">{department.name}</td>
                    <td className="px-6 py-3.5 font-mono text-n300">
                      {department.employeeCount}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        className={cn(ACAO, "text-n300 hover:text-linen")}
                        onClick={() => abrirEdicao(department)}
                        disabled={!canEdit}
                      >
                        {t("department:actions.edit")}
                      </button>
                      <span className="mx-1.5 text-n400">·</span>
                      <button
                        type="button"
                        className={cn(
                          ACAO,
                          removivel && canDelete
                            ? "text-cherry"
                            : "text-gun-700",
                        )}
                        onClick={() => void excluir(department)}
                        disabled={!removivel || !canDelete}
                        title={
                          removivel
                            ? undefined
                            : t("department:deleteBlocked.body", {
                                count: department.employeeCount,
                              })
                        }
                      >
                        {t("department:actions.delete")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DataBoundary>

      <DepartmentFormDialog
        open={dialogoAberto}
        onOpenChange={setDialogoAberto}
        department={emEdicao}
        isSaving={isCreating || isUpdating}
        onSubmit={(values) =>
          emEdicao
            ? update({ id: emEdicao.id, name: values.name })
            : create({ name: values.name })
        }
      />
    </>
  );
}
