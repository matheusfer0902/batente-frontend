import { describe, expect, expectTypeOf, it } from "vitest";
import {
  buildLoginSchema,
  createUserSchema,
  loginSchema,
  type CreateUserFormValues,
  type LoginFormValues,
} from "@/lib/schemas/authSchema";

const MENSAGENS = {
  emailRequired: "email-obrigatorio",
  emailInvalid: "email-invalido",
  passwordRequired: "senha-obrigatoria",
};

describe("buildLoginSchema", () => {
  it("aceita credenciais bem formadas", () => {
    // arrange
    const schema = buildLoginSchema(MENSAGENS);

    // act
    const resultado = schema.safeParse({
      email: "rh@construtoravale.com.br",
      password: "x",
    });

    // assert
    expect(resultado.success).toBe(true);
  });

  it("usa a mensagem injetada quando o e-mail está vazio", () => {
    // arrange
    const schema = buildLoginSchema(MENSAGENS);

    // act
    const resultado = schema.safeParse({ email: "", password: "x" });

    // assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.message).toBe(MENSAGENS.emailRequired);
  });

  it("usa a mensagem injetada quando o e-mail tem formato inválido", () => {
    // arrange
    const schema = buildLoginSchema(MENSAGENS);

    // act
    const resultado = schema.safeParse({ email: "sem-arroba", password: "x" });

    // assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.message).toBe(MENSAGENS.emailInvalid);
  });

  it("usa a mensagem injetada quando a senha está vazia", () => {
    // arrange
    const schema = buildLoginSchema(MENSAGENS);

    // act
    const resultado = schema.safeParse({
      email: "rh@construtoravale.com.br",
      password: "",
    });

    // assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.message).toBe(
      MENSAGENS.passwordRequired,
    );
  });

  it("não impõe tamanho mínimo de senha — a política é do servidor e não se revela na entrada", () => {
    // arrange
    const schema = buildLoginSchema(MENSAGENS);

    // act
    const resultado = schema.safeParse({
      email: "rh@construtoravale.com.br",
      password: "a",
    });

    // assert
    expect(resultado.success).toBe(true);
  });

  it("mantém o tipo do formulário alinhado ao schema", () => {
    expectTypeOf<LoginFormValues>().toEqualTypeOf<{
      email: string;
      password: string;
    }>();
    expect(loginSchema).toBeDefined();
  });
});

describe("createUserSchema", () => {
  const VALIDO = {
    name: "Marina Vale",
    email: "marina@construtoravale.com.br",
    password: "senha-forte-123",
    role: "RH" as const,
  };

  it("aceita um payload de criação completo", () => {
    // act
    const resultado = createUserSchema.safeParse(VALIDO);

    // assert
    expect(resultado.success).toBe(true);
  });

  it("exige senha de pelo menos 8 caracteres — aqui a credencial está sendo criada", () => {
    // act
    const resultado = createUserSchema.safeParse({
      ...VALIDO,
      password: "curta",
    });

    // assert
    expect(resultado.success).toBe(false);
  });

  it("recusa papel fora dos três conhecidos", () => {
    // act
    const resultado = createUserSchema.safeParse({
      ...VALIDO,
      role: "SUPERADMIN",
    });

    // assert
    expect(resultado.success).toBe(false);
  });

  it("recusa nome com menos de dois caracteres", () => {
    // act
    const resultado = createUserSchema.safeParse({ ...VALIDO, name: "M" });

    // assert
    expect(resultado.success).toBe(false);
  });

  it("mantém o tipo do formulário alinhado ao schema", () => {
    expectTypeOf<CreateUserFormValues["role"]>().toEqualTypeOf<
      "ADMIN" | "RH" | "OPERADOR"
    >();
  });
});
