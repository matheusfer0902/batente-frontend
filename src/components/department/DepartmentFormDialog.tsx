"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  departmentFormSchema,
  type DepartmentFormValues,
} from "@/lib/schemas/departmentSchema";
import { apiErrorCode } from "@/lib/apiError";
import type { Department } from "@/types/department";

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ausente = modo "novo". Presente = modo "editar". */
  department?: Department;
  onSubmit: (values: DepartmentFormValues) => Promise<unknown>;
  isSaving: boolean;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  onSubmit,
  isSaving,
}: DepartmentFormDialogProps) {
  const { t } = useTranslation(["department", "common"]);
  const [erro, setErro] = useState<string | null>(null);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: { name: "" },
  });

  // O diálogo é montado uma vez e reaproveitado entre linhas da tabela. Sem
  // este reset, abrir "editar" de outro departamento traria o nome anterior.
  useEffect(() => {
    if (open) {
      form.reset({ name: department?.name ?? "" });
      setErro(null);
    }
  }, [open, department, form]);

  async function submeter(values: DepartmentFormValues) {
    setErro(null);

    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (causa) {
      // 409 `department_name_taken` vem do UNIQUE do banco, não de validação
      // local: duas abas podem cadastrar o mesmo nome ao mesmo tempo.
      const code = apiErrorCode(causa);
      setErro(
        code === "department_name_taken"
          ? t("department:errors.nameTaken")
          : t("common:errors.generic"),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {department ? t("department:edit") : t("department:create")}
          </DialogTitle>
          <DialogDescription>
            {t("department:form.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submeter)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("department:form.name")}</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {erro ? <Alert variant="danger">{erro}</Alert> : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                {t("department:form.cancel")}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? t("common:saving") : t("department:form.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
