import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

export function seedConfig(env, target = "emulator") {
  if (!["emulator", "production"].includes(target))
    throw new Error("Destino inválido.");
  for (const key of Object.keys(env)) {
    if (/^VITE_.*(PASSWORD|SEED_EMAIL|SECRET|PRIVATE_KEY)/i.test(key)) {
      throw new Error(
        "Las credenciales privadas no pueden usar el prefijo VITE_.",
      );
    }
  }
  const email = env.SEED_EMAIL?.trim();
  const password = env.SEED_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Configura SEED_EMAIL en el archivo privado de entorno.");
  if (!password || password.length < 8)
    throw new Error("Configura SEED_PASSWORD con al menos 8 caracteres.");
  const firebase =
    target === "emulator"
      ? { apiKey: "demo-key", projectId: "demo-construction" }
      : {
          apiKey: env.VITE_FIREBASE_API_KEY,
          authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: env.VITE_FIREBASE_PROJECT_ID,
          appId: env.VITE_FIREBASE_APP_ID,
        };
  if (
    target === "production" &&
    Object.values(firebase).some((v) => !v || v.startsWith("demo-"))
  ) {
    throw new Error(
      "Configura los cuatro valores VITE_FIREBASE_* del proyecto real.",
    );
  }
  return {
    target,
    email,
    password,
    firebase,
    host: env.SEED_EMULATOR_HOST || "emulators",
  };
}

export function loadSeedConfig(target = "emulator") {
  // Separate local fixtures from real credentials. Process variables override the file.
  const path =
    process.env.SEED_ENV_FILE ||
    (target === "production" ? ".env" : ".env.local-demo");
  let file = {};
  try {
    file = parseEnv(readFileSync(path, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT")
      throw new Error("No se pudo leer el archivo de entorno.");
  }
  return seedConfig({ ...file, ...process.env }, target);
}
