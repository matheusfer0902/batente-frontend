"use client";

import { useMemo } from "react";
import { toBlockState } from "@/redux/queryState";
import { useGetAccessEventByIdQuery } from "@/redux/reducers/queries/accessApi";
import { AccessService } from "@/services/AccessService";

/**
 * Detalhe de um acesso. Só leitura: o evento é registro imutável, não há
 * mutation de edição nem de exclusão neste módulo.
 */
export function useAccessDetail(id: string) {
  const query = useGetAccessEventByIdQuery(id, { skip: !id });
  const event = query.data;

  const timeline = useMemo(
    () => (event ? AccessService.toTimeline(event) : []),
    [event],
  );

  return {
    event: toBlockState(query),
    timeline,
    isNotFound: query.isError && !event,
  };
}
