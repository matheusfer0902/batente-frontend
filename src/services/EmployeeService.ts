import type { EmployeeStatus } from "@/types/employee";

/** Tom visual de cada situação. Os nomes seguem o banco, não o rótulo. */
export type EmployeeTone = "active" | "leave" | "terminated";

export const EmployeeService = {
  statusTone(status: EmployeeStatus): EmployeeTone {
    if (status === "ACTIVE") return "active";
    if (status === "ON_LEAVE") return "leave";
    return "terminated";
  },

  statusKey(status: EmployeeStatus): string {
    return `status.${status}`;
  },

  /**
   * Só dígitos, para enviar ao servidor.
   *
   * A validação de verificador acontece no backend (`CpfPolicy`), que é quem
   * cifra — repetir a conta aqui daria duas fontes para a mesma regra. O que
   * a interface faz é evitar mandar pontuação.
   */
  normalizeCpf(cpf: string): string {
    return cpf.replace(/\D/g, "");
  },

  /** `52998224725` → `529.982.247-25`, enquanto se digita. */
  maskCpf(cpf: string): string {
    const digitos = EmployeeService.normalizeCpf(cpf).slice(0, 11);

    return digitos
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  },
};
