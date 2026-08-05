import { z } from "zod";

export interface LoginSchemaMessages {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
}

/**
 * Fábrica do schema de login. As mensagens chegam traduzidas para manter o
 * schema puro (sem i18n) e a UI sem texto fixo.
 *
 * O login não valida tamanho de senha: quem decide é o servidor — validar aqui
 * revelaria a política de senha e barraria credenciais legadas válidas.
 */
export function buildLoginSchema(messages: LoginSchemaMessages) {
  return z.object({
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z.string().min(1, messages.passwordRequired),
  });
}

export const loginSchema = buildLoginSchema({
  emailRequired: "Required",
  emailInvalid: "Invalid email",
  passwordRequired: "Required",
});

/**
 * Criação de usuário **por administrador** — não há auto-registro.
 *
 * Ao contrário do login, aqui validar o tamanho mínimo da senha é correto: quem
 * preenche está definindo uma credencial nova, e o feedback imediato evita uma
 * ida ao servidor para ouvir "curta demais". O mínimo espelha o backend
 * (`CreateUserBody`), e o servidor continua sendo a autoridade.
 */
export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "RH", "OPERADOR"]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
