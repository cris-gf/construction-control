/** Spanish interface copy for prices. Stored domain values live in domain/schemas.ts. */
export const pricesText = {
  title: "Compra mejor, con historia.",
  description:
    "Compara el mismo material y unidad. Los precios de medidas diferentes se mantienen separados.",
  material: "Material",
  select: "Selecciona",
  unit: "Unidad",
  lowest: "Menor precio",
  latest: "Más reciente",
  emptyHint:
    "Necesitas al menos dos compras del mismo material y unidad para comparar.",
  purchaseA: "Compra A",
  purchaseB: "Compra B",
  selectPurchase: "Selecciona una compra",
  quantity: "Cantidad a comprar",
  differencePrefix: "Diferencia por ",
  relativeDifference: (value1: string | number) => `${value1}% respecto a A`,
  zeroPrice: "Porcentaje no disponible: precio A es cero",
  estimatedSaving: "Ahorro estimado:",
  invalidQuantity: "Cantidad inválida",
} as const;
