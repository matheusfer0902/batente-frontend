"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useResource } from "@/hooks/useResource";
import { useToast } from "@/hooks/useToast";
import {
  resourceFormSchema,
  type ResourceFormValues,
} from "@/lib/schemas/resourceSchema";
import type { Resource } from "@/types/resource";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResourceFormProps {
  mode: "create" | "update";
  resource?: Resource;
}

export function ResourceForm({ mode, resource }: ResourceFormProps) {
  const { t } = useTranslation(["resource", "common"]);
  const router = useRouter();
  const toast = useToast();
  const { create, update, isCreating, isUpdating } = useResource({
    id: resource?.id,
  });

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: resource?.title ?? "",
      description: resource?.description ?? "",
    },
  });

  const onSubmit = async (values: ResourceFormValues) => {
    try {
      if (mode === "create") {
        const created = await create(values);
        toast.success(t("resource:toast.created"));
        router.push(`/resources/${created.id}`);
        return;
      }

      if (!resource) return;

      await update({
        id: resource.id,
        ...values,
      });
      toast.success(t("resource:toast.updated"));
      router.push(`/resources/${resource.id}`);
    } catch {
      toast.error(t("resource:toast.error"));
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Card className="max-w-2xl border-border/80">
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? t("resource:form.createTitle")
            : t("resource:form.editTitle")}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("resource:form.title")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("resource:form.description")}</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {mode === "create"
                ? t("resource:form.createSubmit")
                : t("resource:form.editSubmit")}
            </Button>
            <Button variant="outline" asChild>
              <Link href={resource ? `/resources/${resource.id}` : "/resources"}>
                {t("common:cancel")}
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
