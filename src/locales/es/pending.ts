/** Spanish interface copy for pending. Stored domain values live in domain/schemas.ts. */
export const pendingText = {
  deadline: (date: string) => `Límite: ${date}`,
  noDeadline: "Sin fecha límite",
  purchase: "Compra",
  receipt: "Recepción",

  title: "Lo que sigue",
  countSuffix: " pendientes",
  emptyHint: "Agrega tu primer material o actividad pendiente.",
  statusLabel: (material: string | number) => `Estado de ${material}`,
  convertToPurchase: "Convertir en compra ",
} as const;
