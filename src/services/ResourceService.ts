import type { Resource, ResourceCardViewModel } from "@/types/resource";

export class ResourceService {
  static sortByUpdatedAt(resources: Resource[]): Resource[] {
    return [...resources].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  static filterBySearch(resources: Resource[], search: string): Resource[] {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return resources;

    return resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(normalized) ||
        resource.description.toLowerCase().includes(normalized),
    );
  }

  static toCardViewModel(resource: Resource): ResourceCardViewModel {
    return {
      id: resource.id,
      displayTitle: resource.title.trim(),
      summary: ResourceService.truncate(resource.description, 120),
      updatedLabel: new Date(resource.updatedAt).toLocaleDateString(),
      ownerId: resource.ownerId,
    };
  }

  private static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trimEnd()}…`;
  }
}
