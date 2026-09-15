/** Spanish interface copy for common. Stored domain values live in domain/schemas.ts. */
export const commonText = {
  invalidAmounts:
    "Revisa los campos y montos: el abono no debe exceder el total.",
  invalidData: "Revisa los datos.",
  estimated: "estimado",
  noSupplier: "Sin proveedor",

  emptyHint: "Los registros que agregues aparecerán aquí.",
  editRecord: "EDITAR REGISTRO",
  newRecord: "NUEVO REGISTRO",
  closeForm: "Cerrar formulario",
  selectWorker: "Selecciona un trabajador",
  total: "Total ",
  markPaid: "Marcar pagado",
  reloadLatest: "Recargar versión reciente",
  cancel: "Cancelar",
  save: "Guardar ",
  editLabel: (title: string | number) => `Editar ${title}`,
  deleteLabel: (title: string | number) => `Eliminar ${title}`,
} as const;
