"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials, setToken, logout } from "@/redux/reducers/slices/authSlice";
import { useLazyGetMeQuery } from "@/redux/reducers/queries/authApi";
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/types/api";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function AuthHydrator() {
  const dispatch = useAppDispatch();
  const [fetchMe] = useLazyGetMeQuery();
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const token = getCookie(AUTH_TOKEN_COOKIE);
    if (!token) return;

    dispatch(setToken(token));

    void (async () => {
      try {
        const user = await fetchMe(undefined, true).unwrap();
        dispatch(setCredentials({ user, token }));
      } catch {
        dispatch(logout());
        document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `${AUTH_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
      }
    })();
  }, [dispatch, fetchMe]);

  return null;
}
