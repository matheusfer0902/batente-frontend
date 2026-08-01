"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout as logoutAction, setCredentials } from "@/redux/reducers/slices/authSlice";
import {
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from "@/redux/reducers/queries/authApi";
import { AuthService } from "@/services/AuthService";
import type {
  AuthCredentials,
  LoginFailure,
  RegisterPayload,
} from "@/types/auth";
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/types/api";
import type { UserRole } from "@/types/auth";

function setAuthCookies(token: string, role: UserRole) {
  document.cookie = `${AUTH_TOKEN_COOKIE}=${token}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `${AUTH_ROLE_COOKIE}=${role}; path=/; max-age=86400; SameSite=Lax`;
}

function clearAuthCookies() {
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${AUTH_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, token } = useAppSelector((state) => state.auth);

  const [loginMutation, loginState] = useLoginMutation();
  const [registerMutation, registerState] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const { isLoading: isMeLoading } = useGetMeQuery(undefined, {
    skip: !token,
  });

  const landingRoute = AuthService.resolveLandingRoute(user?.role);

  /**
   * Não lança em falha: a tela de login trata os estados 1c/1d/1e a partir de
   * `loginFailure`, que é derivado do erro mantido pelo RTK Query.
   */
  const login = useCallback(
    async (credentials: AuthCredentials): Promise<boolean> => {
      const result = await loginMutation(credentials);

      if ("error" in result) {
        return false;
      }

      dispatch(setCredentials(result.data));
      setAuthCookies(result.data.token, result.data.user.role);
      router.push(AuthService.resolveLandingRoute(result.data.user.role));
      return true;
    },
    [dispatch, loginMutation, router],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await registerMutation(payload).unwrap();
      dispatch(setCredentials(result));
      setAuthCookies(result.token, result.user.role);
      router.push(AuthService.resolveLandingRoute(result.user.role));
      return result;
    },
    [dispatch, registerMutation, router],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutMutation().unwrap();
      } catch {
        // noop — local logout still proceeds
      }
    }
    dispatch(logoutAction());
    clearAuthCookies();
    router.push("/login");
  }, [dispatch, logoutMutation, router, token]);

  const loginFailure = useMemo<LoginFailure | null>(
    () =>
      loginState.error ? AuthService.parseLoginFailure(loginState.error) : null,
    [loginState.error],
  );

  const clearLoginFailure = useCallback(() => {
    if (loginState.error) {
      loginState.reset();
    }
  }, [loginState]);

  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading: loginState.isLoading || registerState.isLoading || isMeLoading,
    isSubmitting: loginState.isLoading,
    loginFailure,
    clearLoginFailure,
    landingRoute,
    login,
    register,
    logout,
  };
}
