import { z } from "zod";

/** `YYYY-MM-DD` — o que `<input type="date">` produz e o backend espera. */
const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date");

/**
 * Formulário da tela 7.
 *
 * `workScheduleId` é obrigatório, e a razão é do banco, não da interface:
 * `trg_employees_escala_vigente` (RN-5.3) reprova colaborador ACTIVE sem
 * vigência. É o mesmo motivo do aviso que o design imprime no campo — "sem
 * escala não há jornada esperada, e o ponto desta pessoa não pode ser
 * calculado".
 *
 * O CPF é opcional (a coluna aceita nulo), mas, quando vem, precisa ter 11
 * dígitos. O dígito verificador é conferido no servidor, junto da cifra — uma
 * regra, um dono.
 */
const camposComuns = {
  name: z.string().trim().min(3, "min").max(120, "max"),
  registration: z.string().trim().min(1, "required").max(30, "max"),
  cpf: z
    .string()
    .trim()
    .refine((valor) => valor === "" || valor.replace(/\D/g, "").length === 11, {
      message: "cpf",
    })
    .optional(),
  position: z.string().trim().max(120, "max").optional(),
  departmentId: z.string().optional(),
};

export const employeeFormSchema = z.object({
  ...camposComuns,
  hireDate: dataIso,
  workScheduleId: z.string().min(1, "scheduleRequired"),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

/**
 * Edição (tela 3c): sem escala e sem admissão.
 *
 * Nenhuma das duas se edita aqui — trocar escala encerra a atual e cria outra,
 * e mudar a admissão reescreveria a vigência inicial.
 *
 * Os dois campos continuam no esquema, como `z.string()` livre, em vez de
 * saírem por `.omit()`. O motivo é de tipo, não de validação: o `zodResolver`
 * do RHF é invariante no formato, e dois formatos diferentes tornariam o
 * resolver não atribuível ao mesmo `useForm`. Ficam presentes e ignorados —
 * o service de edição nunca os envia.
 */
export const employeeEditSchema = z.object({
  ...camposComuns,
  hireDate: z.string(),
  workScheduleId: z.string(),
});
