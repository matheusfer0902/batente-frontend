import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/auth";

/**
 * Estado da sessão para a interface.
 *
 * **Não existe `token` aqui, e esse é o ponto.** O par de tokens vive em
 * cookies `HttpOnly` e nunca passa por JavaScript — nem `localStorage`, nem
 * `sessionStorage`, nem memória do Redux. O que o slice guarda é só quem o
 * servidor disse que está logado, em `GET /auth/me`.
 *
 * `status` existe porque "sem usuário" é ambíguo: pode ser "ainda não
 * perguntei ao servidor" ou "perguntei e não há sessão". Um guard que confunde
 * os dois pisca a tela de login na cara de quem está autenticado.
 *
 * **Desvio consciente de CLAUDE.md** ("não duplicar server state em slices"):
 * `user` espelha a resposta de `/auth/me`. Mantido porque `authState()` em
 * `test/helpers/auth.ts` pré-carrega este slice e é usado por outros módulos;
 * eliminá-lo exigiria reescrever o helper compartilhado sem ganho algum de
 * segurança. A hidratação é unidirecional — só `SessionProvider` escreve, a
 * partir do servidor — então não há duas fontes de verdade concorrentes.
 */
export type SessionStatus = "unknown" | "authenticated" | "anonymous";

interface AuthState {
  user: User | null;
  status: SessionStatus;
}

const initialState: AuthState = {
  user: null,
  status: "unknown",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** `GET /auth/me` respondeu: há sessão. */
    sessionEstablished: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = "authenticated";
    },

    /** `GET /auth/me` deu 401, ou o logout terminou. */
    sessionCleared: (state) => {
      state.user = null;
      state.status = "anonymous";
    },
  },
});

export const { sessionEstablished, sessionCleared } = authSlice.actions;

export default authSlice.reducer;
