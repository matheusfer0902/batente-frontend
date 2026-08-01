/**
 * Estado de um bloco de tela. É o contrato que a UI conhece — nenhum
 * componente recebe o objeto do RTK Query.
 */
export interface BlockState<T> {
  data: T | undefined;
  /** Primeira carga: mostra esqueleto. */
  isLoading: boolean;
  /** Recarga em segundo plano: mantém o conteúdo na tela. */
  isFetching: boolean;
  isError: boolean;
  retry: () => void;
}
