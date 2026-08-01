import type { BlockState } from "@/types/ui";

/** Forma mínima de um resultado de query — evita acoplar a UI aos tipos do RTK. */
interface QueryLike<T> {
  data?: T;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => unknown;
}

export function toBlockState<T>(query: QueryLike<T>): BlockState<T> {
  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    retry: () => {
      void query.refetch();
    },
  };
}
