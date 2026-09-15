import { appConfig } from "../../config/appConfig";
/** Spanish interface copy for services. Stored domain values live in domain/schemas.ts. */
export const servicesText = {
  missingFirebaseConfig: "Falta configurar Firebase. Consulta .env.example.",
  invalidSession: "Sesión no válida.",
  invalidPath: "Ruta no válida.",
  wrongProject: "El registro no pertenece a la obra activa.",
  importLimitExceeded: `Máximo ${appConfig.backup.maxImportRecords} registros por importación atómica en esta versión.`,
} as const;
