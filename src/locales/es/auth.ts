import { appConfig } from "../../config/appConfig";
/** Spanish interface copy for auth. Stored domain values live in domain/schemas.ts. */
export const authText = {
  headlineStart: "Construye con",
  headlineEnd: "las cuentas claras.",
  introStart: "Tu presupuesto, tus materiales y tu equipo.",
  introEnd: "Toda tu obra, en un solo lugar.",
  illustrationCaption: "DE LOS PLANOS A LA REALIDAD",
  welcome: "BIENVENIDO A OBRA",
  registerTitle: "Empieza tu próxima obra",
  resetTitle: "Recupera tu acceso",
  loginTitle: "Tu obra te espera",
  subtitle: "Control sencillo. Decisiones con confianza.",
  resetSent: "Si existe la cuenta, recibirás un correo de recuperación.",
  authenticationFailed: `No se pudo completar. Revisa tus datos y la conexión. La contraseña debe tener al menos ${appConfig.auth.minimumPasswordLength} caracteres.`,
  email: "Correo electrónico",
  password: "Contraseña",
  trustedDevice:
    "Este es un dispositivo de confianza. Activar acceso sin conexión.",
  trustedDeviceHint:
    "Los datos se conservan en este navegador. Usa esta opción solo en tu teléfono personal.",
  busy: "Un momento…",
  login: "Iniciar sesión",
  register: "Crear cuenta",
  sendReset: "Enviar recuperación",
  haveAccount: "Ya tengo cuenta",
  createAccount: "Crear una cuenta",
  backToLogin: "Volver al inicio",
  forgotPassword: "Olvidé mi contraseña",
  localEnvironment: "Entorno local · Emuladores Firebase",
} as const;
