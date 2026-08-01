"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/authSchema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const { t } = useTranslation("auth");
  const { login, isLoading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "owner@batente.dev",
      password: "password123",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await login(values);
  };

  return (
    <Card className="w-full max-w-md border-border/80">
      <CardHeader>
        <CardTitle>{t("login.title")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.email")}</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground">{t("demoHint")}</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {t("login.submit")}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t("login.noAccount")}{" "}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                {t("login.registerLink")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
