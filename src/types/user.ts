import type { UserRole } from "@/types/auth";

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  lastLoginAt: string | null;
}
