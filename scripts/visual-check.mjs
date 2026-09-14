import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { loadSeedConfig } from "./seed-config.mjs";
const { email, password } = loadSeedConfig();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://emulators:5000");
await page.getByLabel("Correo electrónico").fill(email);
await page.getByLabel("Contraseña", { exact: true }).fill(password);
await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
await page.getByRole("heading", { name: "Todo bajo control." }).waitFor();
await page
  .getByRole("heading", { name: "Cemento UGC", exact: true })
  .first()
  .waitFor();
mkdirSync("test-results", { recursive: true });
await page.screenshot({
  path: "test-results/dashboard-desktop.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "test-results/dashboard-mobile.png",
  fullPage: true,
});
if (errors.length) throw new Error(errors.join("\n"));
console.log("Capturas desktop y móvil generadas; sin errores JavaScript.");
await browser.close();
