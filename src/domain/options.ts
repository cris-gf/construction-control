/** Persisted values: changing these requires reviewing stored data and firestore.rules. */
export const projectStates = [
  "planificación",
  "activa",
  "pausada",
  "finalizada",
] as const;
export const pendingTypes = [
  "comprar",
  "recibir",
  "solicitar",
  "pagar",
  "otro",
] as const;
export const priorities = ["baja", "normal", "alta", "urgente"] as const;
export const workerAgreements = [
  "diario",
  "semanal",
  "por actividad",
  "otro",
] as const;
export const workerActivity = ["activo", "inactivo"] as const;
export const paymentStates = ["pagado", "parcial", "pendiente"] as const;
