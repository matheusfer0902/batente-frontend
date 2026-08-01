"use client";

import { useMemo } from "react";
import { useSearchContext } from "@/contexts/SearchContext";
import { ResourceService } from "@/services/ResourceService";
import {
  useCreateResourceMutation,
  useDeleteResourceMutation,
  useGetResourceByIdQuery,
  useGetResourceListQuery,
  useUpdateResourceMutation,
} from "@/redux/reducers/queries/resourceApi";
import type {
  CreateResourcePayload,
  UpdateResourcePayload,
} from "@/types/resource";

interface UseResourceOptions {
  id?: string;
}

export function useResource(options: UseResourceOptions = {}) {
  const { id } = options;
  const { query } = useSearchContext();

  const listQuery = useGetResourceListQuery();
  const detailQuery = useGetResourceByIdQuery(id ?? "", { skip: !id });

  const [createResource, createState] = useCreateResourceMutation();
  const [updateResource, updateState] = useUpdateResourceMutation();
  const [deleteResource, deleteState] = useDeleteResourceMutation();

  const sortedResources = useMemo(() => {
    if (!listQuery.data) return [];
    const filtered = ResourceService.filterBySearch(listQuery.data, query);
    return ResourceService.sortByUpdatedAt(filtered);
  }, [listQuery.data, query]);

  const cardViewModels = useMemo(
    () => sortedResources.map(ResourceService.toCardViewModel),
    [sortedResources],
  );

  return {
    resources: listQuery.data ?? [],
    resource: detailQuery.data,
    sortedResources,
    cardViewModels,
    isLoading: listQuery.isLoading || detailQuery.isLoading,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
    create: (payload: CreateResourcePayload) => createResource(payload).unwrap(),
    update: (payload: UpdateResourcePayload) => updateResource(payload).unwrap(),
    remove: (resourceId: string) => deleteResource(resourceId).unwrap(),
  };
}
