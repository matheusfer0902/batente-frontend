"use client";

import type { ReactNode } from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonText } from "@/components/ui/skeleton";

interface DataBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  /** Carregou, mas não há o que mostrar. */
  isEmpty?: boolean;
  onRetry?: () => void;
  /** Esqueleto com a forma do conteúdo — nunca um giro no vazio. */
  skeleton?: ReactNode;
  empty?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}

/**
 * Ordem dos estados de um bloco com dados (2f): carregando → erro → vazio →
 * conteúdo. Recebe booleanos, não o objeto do RTK Query.
 */
export function DataBoundary({
  isLoading,
  isError,
  isEmpty = false,
  onRetry,
  skeleton,
  empty,
  error,
  children,
}: DataBoundaryProps) {
  if (isLoading) {
    return <>{skeleton ?? <SkeletonText className="p-5" />}</>;
  }

  if (isError) {
    return <>{error ?? <ErrorState onRetry={onRetry} />}</>;
  }

  if (isEmpty && empty) {
    return <>{empty}</>;
  }

  return <>{children}</>;
}
