export function mapId<T extends { id: string }>(item: T): T & { _id: string } {
  return {
    ...item,
    _id: item.id,
  };
}

export function mapIds<T extends { id: string }>(items: T[]): (T & { _id: string })[] {
  return items.map(mapId);
}
