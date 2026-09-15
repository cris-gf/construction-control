export function fresh(projectId: string) {
  const id = crypto.randomUUID();
  return {
    id,
    projectId: projectId || id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    deleted: false,
  };
}
