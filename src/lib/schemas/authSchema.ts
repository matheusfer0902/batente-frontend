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

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
