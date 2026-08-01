"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import { useResource } from "@/hooks/useResource";
import { useCanMutate } from "@/hooks/useCanMutate";
import { ResourceDeleteDialog } from "@/components/resource/ResourceDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation(["resource", "common"]);
  const { resource, isLoading } = useResource({ id: params.id });
  const { canEdit, canDelete } = useCanMutate(resource);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {t("common:loading")}
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {t("resource:empty")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("resource:detail.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("resource:detail.owner", { ownerId: resource.ownerId })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/resources">{t("common:back")}</Link>
          </Button>
          {canEdit && (
            <Button asChild>
              <Link href={`/resources/${resource.id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t("common:edit")}
              </Link>
            </Button>
          )}
          {canDelete && <ResourceDeleteDialog resource={resource} />}
        </div>
      </div>

      <Card className="max-w-3xl border-border/80">
        <CardHeader>
          <CardTitle>{resource.title}</CardTitle>
          <CardDescription>
            {t("resource:card.updatedAt", {
              date: new Date(resource.updatedAt).toLocaleDateString(),
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {resource.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
