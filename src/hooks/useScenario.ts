"use client";

import { useSearchParams } from "next/navigation";
import { isMockScenario, type MockScenario } from "@/types/api";

/** Query da demonstração: `?cenario=degradado`. Ignorada por um backend real. */
export function useScenario(): MockScenario | undefined {
  const searchParams = useSearchParams();
  const value = searchParams.get("cenario");
  return isMockScenario(value) ? value : undefined;
}
