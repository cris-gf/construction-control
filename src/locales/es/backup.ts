import { appConfig } from "../../config/appConfig";
/** Spanish interface copy for backup. Stored domain values live in domain/schemas.ts. */
export const backupText = {
  importedSuffix: " (importada)",
  title: "Tu información, siempre contigo.",
  exportActive: "Exporta únicamente la obra activa:",
  csv: " CSV",
  exportJson: "Respaldo completo JSON",
  importTitle: "Importar respaldo",
  importDescription:
    "Se validarán los datos y se creará una obra nueva en tu cuenta. No se conserva ninguna identidad del archivo.",
  importLabel: "Importar JSON",
  invalidFile: `Archivo inválido. Selecciona un respaldo de Obra válido, de hasta ${appConfig.backup.maxFileBytes / 1_000_000} MB.`,
  previewPrefix: "Vista previa: ",
  budgetPrefix: "Presupuesto: ",
  confirmImport: "Confirmar importación en una obra nueva",
  cancel: "Cancelar",
  projectSettings: "Configuración de la obra",
  editProject: "Editar obra y presupuesto",
  deleteProject: "Eliminar obra",
  installHint:
    "Instala Obra desde el menú del navegador o “Compartir → Agregar a inicio” en iPhone. La primera carga requiere conexión. Los datos locales solo están disponibles en este navegador.",
  signOut: "Cerrar sesión",
  fileTooLarge: `El respaldo excede ${appConfig.backup.maxFileBytes / 1_000_000} MB.`,
  duplicateIds: "Identificadores duplicados.",
  missingWorker: "Falta un trabajador referenciado.",
  invalidPurchaseLink: "Enlace de compra inválido.",
  invalidPendingLink: "Enlace de pendiente inválido.",
} as const;
