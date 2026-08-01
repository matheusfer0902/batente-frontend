"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import type { Resource } from "@/types/resource";
import { useResource } from "@/hooks/useResource";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResourceDeleteDialogProps {
  resource: Resource;
}

export function ResourceDeleteDialog({ resource }: ResourceDeleteDialogProps) {
  const { t } = useTranslation(["resource", "common"]);
  const router = useRouter();
  const toast = useToast();
  const { remove, isDeleting } = useResource();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await remove(resource.id);
      toast.success(t("resource:toast.deleted"));
      setOpen(false);
      router.push("/resources");
    } catch {
      toast.error(t("resource:toast.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          {t("common:delete")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("resource:delete.title")}</DialogTitle>
          <DialogDescription>
            {t("resource:delete.description", { title: resource.title })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common:cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {t("resource:delete.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
