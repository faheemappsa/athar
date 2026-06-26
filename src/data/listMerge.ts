export const mergeUniqueById = <T extends { id: string }>(baseList: T[], additions: T[]) => {
  const existingIds = new Set(baseList.map((item) => item.id));
  return [...baseList, ...additions.filter((item) => !existingIds.has(item.id))];
};
