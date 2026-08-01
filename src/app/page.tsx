import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/types/api";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (token) {
    redirect("/resources");
  }

  redirect("/login");
}
