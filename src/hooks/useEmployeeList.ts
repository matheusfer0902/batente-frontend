"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useGetEmployeeListQuery,
  useGetEmployeeSummaryQuery,
} from "@/redux/reducers/queries/employeeApi";
import type {
  EmployeeFilter,
  EmployeeQueryArgs,
  EmployeeStatus,
} from "@/types/employee";

const POR_PAGINA = 25;

/**
 * Estado da tela 6.
 *
 * A busca é **do servidor**, não do array carregado: a lista é paginada, e
 * filtrar no cliente só acharia quem já estivesse na página aberta. Antes o
 * hook fazia as duas coisas, o que dava a impressão de funcionar enquanto a
 * base cabia numa página.
 */
export function useEmployeeList() {
  const [status, setStatus] = useState<EmployeeStatus | "ALL">("ACTIVE");
  const [departmentId, setDepartmentId] = useState<string | undefined>();
  const [alertFilter, setAlertFilter] = useState<EmployeeFilter | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Trocar filtro com a página 3 aberta mostraria "nada encontrado" para um
  // resultado que tem só duas páginas.
  useEffect(() => {
    setPage(1);
  }, [status, departmentId, alertFilter, search]);

  const queryArgs = useMemo<EmployeeQueryArgs>(
    () => ({
      status,
      departmentId,
      filter: alertFilter,
      q: search.trim() || undefined,
      page,
      limit: POR_PAGINA,
    }),
    [status, departmentId, alertFilter, search, page],
  );

  const summaryQuery = useGetEmployeeSummaryQuery();
  const listQuery = useGetEmployeeListQuery(queryArgs);

  const total = listQuery.data?.total ?? 0;

  /** Alterna o filtro: clicar de novo no mesmo cartão desfaz. */
  function toggleAlerta(filtro: EmployeeFilter) {
    setAlertFilter((atual) => (atual === filtro ? undefined : filtro));
  }

  return {
    summary: summaryQuery.data,
    employees: listQuery.data?.items ?? [],
    total,
    page,
    setPage,
    pageCount: Math.max(Math.ceil(total / POR_PAGINA), 1),
    status,
    setStatus,
    departmentId,
    setDepartmentId,
    alertFilter,
    toggleAlerta,
    search,
    setSearch,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    // O resumo é consulta à parte: pode falhar sem derrubar a lista.
    isSummaryError: summaryQuery.isError,
    retry: () => {
      void summaryQuery.refetch();
      void listQuery.refetch();
    },
  };
}
