"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import type { Resource } from "@/types/resource";
import { ResourceService } from "@/services/ResourceService";
import { useCanMutate } from "@/hooks/useCanMutate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResourceDeleteDialog } from "@/components/resource/ResourceDeleteDialog";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const { t } = useTranslation("resource");
  const router = useRouter();
  const { canEdit, canDelete } = useCanMutate(resource);
  const viewModel = ResourceService.toCardViewModel(resource);

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-xl">{viewModel.displayTitle}</CardTitle>
        <CardDescription>
          {t("card.updatedAt", { date: viewModel.updatedLabel })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{viewModel.summary}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href={`/resources/${resource.id}`}>{t("card.view")}</Link>
        </Button>
        {canEdit && (
          <Button
            variant="secondary"
            onClick={() => router.push(`/resources/${resource.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
            {t("common:edit")}
          </Button>
        )}
        {canDelete && <ResourceDeleteDialog resource={resource} />}
        {!canEdit && !canDelete && (
          <Button variant="ghost" disabled>
            <Trash2 className="h-4 w-4 opacity-40" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
