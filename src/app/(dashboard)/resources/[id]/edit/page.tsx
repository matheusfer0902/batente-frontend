"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useResource } from "@/hooks/useResource";
import { ResourceForm } from "@/components/resource/ResourceForm";

export default function EditResourcePage() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation("common");
  const { resource, isLoading } = useResource({ id: params.id });

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!resource) {
    return null;
  }

  return <ResourceForm mode="update" resource={resource} />;
}
