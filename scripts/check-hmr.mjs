import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
const original = readFileSync("src/styles.css", "utf8");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto("http://obra-dev:5173");
  await page.getByRole("heading", { name: "Tu obra te espera" }).waitFor();
  writeFileSync(
    "src/styles.css",
    original + "\n:root { --hmr-check: verified; }\n",
  );
  await page.waitForFunction(
    () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--hmr-check")
        .trim() === "verified",
  );
  console.log(
    "PASS: cambio en el volumen montado recibido por HMR sin recargar la página.",
  );
} finally {
  writeFileSync("src/styles.css", original);
  await browser.close();
}
