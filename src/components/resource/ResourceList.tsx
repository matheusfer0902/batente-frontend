"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useSearchContext } from "@/contexts/SearchContext";
import { useResource } from "@/hooks/useResource";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResourceList() {
  const { t } = useTranslation(["resource", "common"]);
  const { query, setQuery } = useSearchContext();
  const { sortedResources, isLoading } = useResource();

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {t("common:loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("resource:title")}</h1>
          <p className="text-muted-foreground">{t("resource:subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/resources/new">
            <Plus className="h-4 w-4" />
            {t("resource:create")}
          </Link>
        </Button>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("common:search")}
        aria-label={t("common:search")}
      />

      {sortedResources.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {t("resource:empty")}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
