"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDepartment } from "@/hooks/useDepartment";
import { useScheduleList } from "@/hooks/useScheduleList";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "@/redux/reducers/queries/employeeApi";
import {
  employeeEditSchema,
  employeeFormSchema,
  type EmployeeFormValues,
} from "@/lib/schemas/employeeSchema";
import { apiErrorCode } from "@/lib/apiError";
import { EmployeeService } from "@/services/EmployeeService";
import type { EmployeeDetail } from "@/types/employee";

interface EmployeeFormProps {
  /** Ausente = tela 7 (novo). Presente = tela 3c (editar). */
  employee?: EmployeeDetail;
}

const MENSAGENS: Record<string, string> = {
  registration_taken: "employee:errors.registrationTaken",
  cpf_taken: "employee:errors.cpfTaken",
  schedule_required: "employee:errors.scheduleRequired",
  cpf_invalido: "employee:errors.cpfInvalid",
};

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const { t } = useTranslation(["employee", "common"]);
  const router = useRouter();
  const editando = Boolean(employee);

  const { departments } = useDepartment();
  const { schedules } = useScheduleList();
  const [createEmployee, createState] = useCreateEmployeeMutation();
  const [updateEmployee, updateState] = useUpdateEmployeeMutation();
  const [erro, setErro] = useState<string | null>(null);

  const salvando = createState.isLoading || updateState.isLoading;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(editando ? employeeEditSchema : employeeFormSchema),
    defaultValues: {
      name: employee?.name ?? "",
      registration: employee?.registration ?? "",
      cpf: employee?.cpfMask ?? "",
      position: employee?.position ?? "",
      departmentId: employee?.department?.id ?? "",
      hireDate: employee?.hireDate ?? "",
      workScheduleId: employee?.currentSchedule?.id ?? "",
    },
  });

  async function submeter(values: EmployeeFormValues) {
    setErro(null);

    try {
      if (employee) {
        await updateEmployee({
          id: employee.id,
          name: values.name,
          registration: values.registration,
          position: values.position || undefined,
          departmentId: values.departmentId || undefined,
          // Máscara não é CPF: reenviar `***.982.247-**` gravaria lixo. Só vai
          // quando o campo foi de fato reescrito com dígitos.
          cpf:
            values.cpf && !values.cpf.includes("*")
              ? EmployeeService.normalizeCpf(values.cpf)
              : undefined,
        }).unwrap();

        router.push("/colaboradores");
        return;
      }

      await createEmployee({
        name: values.name,
        registration: values.registration,
        cpf: values.cpf ? EmployeeService.normalizeCpf(values.cpf) : undefined,
        position: values.position || undefined,
        departmentId: values.departmentId || undefined,
        hireDate: values.hireDate,
        workScheduleId: values.workScheduleId,
      }).unwrap();

      router.push("/colaboradores");
    } catch (causa) {
      const chave = MENSAGENS[apiErrorCode(causa) ?? ""];
      setErro(chave ? t(chave) : t("common:errors.generic"));
    }
  }

  return (
    <>
      <PageHeader
        title={editando ? t("employee:editTitle") : t("employee:createTitle")}
        subtitle={
          editando ? t("employee:editSubtitle") : t("employee:createSubtitle")
        }
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submeter)}
          className="space-y-8 px-5 py-5 md:px-8"
          noValidate
        >
          <section className="space-y-4">
            <h2 className="font-display text-[15px] text-linen">
              {t("employee:sections.identification")}
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("employee:form.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("employee:form.registration")}</FormLabel>
                    <FormControl>
                      <Input {...field} className="font-mono" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("employee:form.cpf")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="font-mono"
                        inputMode="numeric"
                        autoComplete="off"
                        onChange={(e) =>
                          field.onChange(
                            // Máscara guardada é exibida como veio; só o que
                            // o usuário digita passa pelo formatador.
                            e.currentTarget.value.includes("*")
                              ? e.currentTarget.value
                              : EmployeeService.maskCpf(e.currentTarget.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {t("employee:form.cpfHint")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-[15px] text-linen">
              {t("employee:sections.bond")}
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("employee:form.department")}</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="">{t("employee:form.select")}</option>
                        {departments.map((departamento) => (
                          <option key={departamento.id} value={departamento.id}>
                            {departamento.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("employee:form.position")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!editando ? (
                <FormField
                  control={form.control}
                  name="hireDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("employee:form.hireDate")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-[15px] text-linen">
              {t("employee:sections.schedule")}
            </h2>

            {editando ? (
              // Tela 3c: a escala não se edita aqui. Trocar encerra a atual e
              // cria outra — a operação vive na aba Escalas.
              <Alert variant="info">
                <strong className="block">
                  {employee?.currentSchedule
                    ? t("employee:currentSchedule", {
                        name: employee.currentSchedule.name,
                        since: employee.currentSchedule.validFrom,
                      })
                    : t("employee:noSchedule")}
                </strong>
                {t("employee:scheduleLocked")}
              </Alert>
            ) : (
              <FormField
                control={form.control}
                name="workScheduleId"
                render={({ field }) => (
                  <FormItem className="md:max-w-sm">
                    <FormLabel>
                      {t("employee:form.schedule")} ·{" "}
                      <span className="text-cherry">
                        {t("employee:form.required")}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="">
                          {t("employee:form.selectSchedule")}
                        </option>
                        {schedules.map((escala) => (
                          <option key={escala.id} value={escala.id}>
                            {escala.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {t("employee:form.scheduleHint")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </section>

          {erro ? <Alert variant="danger">{erro}</Alert> : null}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={salvando}
            >
              {t("common:cancel")}
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando
                ? t("common:saving")
                : editando
                  ? t("employee:form.saveChanges")
                  : t("employee:form.save")}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
