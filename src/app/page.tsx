import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AuthService } from "@/services/AuthService";
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/types/api";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (token) {
    redirect(
      AuthService.resolveAuthenticatedRoute(
        cookieStore.get(AUTH_ROLE_COOKIE)?.value,
      ),
    );
  }

  redirect("/login");
}
