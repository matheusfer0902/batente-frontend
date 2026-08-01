export interface Resource {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourcePayload {
  title: string;
  description: string;
}

export interface UpdateResourcePayload {
  id: string;
  title?: string;
  description?: string;
}

export interface ResourceFilters {
  search?: string;
}

export interface ResourceCardViewModel {
  id: string;
  displayTitle: string;
  summary: string;
  updatedLabel: string;
  ownerId: string;
}
