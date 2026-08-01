"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout as logoutAction, setCredentials } from "@/redux/reducers/slices/authSlice";
import {
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from "@/redux/reducers/queries/authApi";
import type { AuthCredentials, RegisterPayload } from "@/types/auth";
import { AUTH_TOKEN_COOKIE } from "@/types/api";

function setAuthCookie(token: string) {
  document.cookie = `${AUTH_TOKEN_COOKIE}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
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

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      const result = await loginMutation(credentials).unwrap();
      dispatch(setCredentials(result));
      setAuthCookie(result.token);
      router.push("/resources");
      return result;
    },
    [dispatch, loginMutation, router],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await registerMutation(payload).unwrap();
      dispatch(setCredentials(result));
      setAuthCookie(result.token);
      router.push("/resources");
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
    clearAuthCookie();
    router.push("/login");
  }, [dispatch, logoutMutation, router, token]);

  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading: loginState.isLoading || registerState.isLoading || isMeLoading,
    login,
    register,
    logout,
  };
}
