import { test, expect, type Page } from "@playwright/test";
async function register(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Crear una cuenta", exact: true })
    .click();
  await page
    .getByLabel("Correo electrónico")
    .fill(`obra-${crypto.randomUUID()}@test.local`);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill(`Test-${crypto.randomUUID()}!`);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Crear mi primera obra" }),
  ).toBeVisible();
}
async function createProject(page: Page) {
  await page.getByRole("button", { name: "Crear mi primera obra" }).click();
  await page.getByLabel("Nombre de la obra *").fill("Casa del bosque");
  await page.getByLabel("Presupuesto (Q) *").fill("150000");
  await page.getByRole("button", { name: "Guardar obra", exact: true }).click();
  await expect(
    page.getByText("Cambios confirmados en el servidor."),
  ).toBeVisible();
}
test("aislamiento de cuentas, compras exactas, edición y cierre de sesión", async ({
  page,
  browser,
}) => {
  await register(page);
  await createProject(page);
  await page
    .getByRole("button", { name: "Registrar compra", exact: true })
    .click();
  await page.getByLabel("Material o servicio *").fill("Cemento");
  await page.getByLabel("Cantidad *").fill("35");
  await page.getByLabel("Unidad *").fill("saco");
  await page.getByLabel("Precio unitario (Q) *").fill("71.99");
  await expect(page.getByText("Q2,519.65", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Marcar pagado" }).click();
  await page
    .getByRole("button", { name: "Guardar compra", exact: true })
    .click();
  await expect(
    page.getByText("Cambios confirmados en el servidor."),
  ).toBeVisible();
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Compras", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cemento", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Editar Compra", exact: true })
    .click();
  await page.getByLabel("Monto pagado (Q) *").fill("1000");
  await page
    .getByRole("button", { name: "Guardar compra", exact: true })
    .click();
  await expect(page.getByText("Saldo: Q1,519.65")).toBeVisible();
  const other = await browser.newContext();
  const second = await other.newPage();
  await register(second);
  await expect(
    second.getByText("Casa del bosque", { exact: true }),
  ).toHaveCount(0);
  await other.close();
  page.on("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Eliminar Compra", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cemento", exact: true }),
  ).toHaveCount(0);
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Respaldo" })
    .click();
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("button", { name: "Iniciar sesión", exact: true }),
  ).toBeVisible();
  await page.goto("/compras");
  await expect(
    page.getByRole("button", { name: "Iniciar sesión", exact: true }),
  ).toBeVisible();
});
test("pendiente convertido, calendario, trabajador y respaldo", async ({
  page,
}) => {
  await register(page);
  await createProject(page);
  await page
    .getByRole("button", { name: "Agregar pendiente", exact: true })
    .click();
  await page.getByLabel("Material o descripción *").fill("Varilla");
  await page.getByLabel("Cantidad", { exact: true }).fill("10");
  await page.getByLabel("Unidad", { exact: true }).fill("unidad");
  await page.getByLabel("Precio estimado (Q)").fill("50");
  await page.getByLabel("Compra prevista").fill("2026-09-15T10:00");
  await page
    .getByRole("button", { name: "Guardar pendiente", exact: true })
    .click();
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Pendientes", exact: true })
    .click();
  const dl = page.waitForEvent("download");
  await page
    .locator(".record-tools")
    .getByRole("button", { name: "Compra", exact: true })
    .click();
  expect((await dl).suggestedFilename()).toBe("buyDate.ics");
  await page.getByRole("button", { name: "Convertir en compra" }).click();
  await page
    .getByRole("button", { name: "Guardar compra", exact: true })
    .click();
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Resumen", exact: true })
    .click();
  await expect(
    page
      .locator(".stat-card")
      .filter({ hasText: "Por pagar y comprar" })
      .getByRole("heading", { name: "Q500.00", exact: true }),
  ).toBeVisible();
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Equipo", exact: true })
    .click();
  await page.getByRole("button", { name: "Trabajador", exact: true }).click();
  await page.getByLabel("Nombre *", { exact: true }).fill("Carlos Pérez");
  await page
    .getByRole("button", { name: "Guardar trabajador", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Registrar pago", exact: true })
    .click();
  await page.getByLabel("Trabajador *").selectOption({ label: "Carlos Pérez" });
  await page.getByLabel("Monto acordado (Q) *").fill("2000");
  await page.getByLabel("Monto pagado (Q) *").fill("500");
  await page
    .getByRole("button", { name: "Guardar pago de mano de obra", exact: true })
    .click();
  await expect(page.getByText("Saldo Q1,500.00")).toBeVisible();
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Respaldo" })
    .click();
  const backup = page.waitForEvent("download");
  await page.getByRole("button", { name: "Respaldo completo JSON" }).click();
  const file = await backup;
  expect(file.suggestedFilename()).toBe("obra-respaldo.json");
  await page.getByLabel("Importar JSON").setInputFiles((await file.path())!);
  await expect(
    page.getByRole("heading", { name: "Vista previa: Casa del bosque" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Confirmar importación en una obra nueva" })
    .click();
  await expect(
    page.getByText("Respaldo importado y confirmado."),
  ).toBeVisible();
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Resumen", exact: true })
    .click();
  await expect(
    page
      .locator(".stat-card")
      .filter({ hasText: "Por pagar y comprar" })
      .getByRole("heading", { name: "Q2,000.00", exact: true }),
  ).toBeVisible();
});
test("PWA carga offline, crea y edita, reconecta sin duplicaciones", async ({
  page,
  context,
}) => {
  await register(page);
  await createProject(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Todo bajo control." }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText("Sin conexión", { exact: false }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Registrar compra", exact: true })
    .click();
  await page.getByLabel("Material o servicio *").fill("Arena offline");
  await page.getByLabel("Unidad *").fill("metro cúbico");
  await page.getByLabel("Precio unitario (Q) *").fill("350");
  await page
    .getByRole("button", { name: "Guardar compra", exact: true })
    .click();
  await page
    .locator(".bottom-nav")
    .getByRole("link", { name: "Compras", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Arena offline" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Editar Compra", exact: true })
    .click();
  await page.getByLabel("Cantidad *").fill("2");
  await page
    .getByRole("button", { name: "Guardar compra", exact: true })
    .click();
  await expect(page.getByText("Saldo: Q700.00")).toBeVisible();
  await expect(
    page.getByText("Cambios pendientes", { exact: false }).first(),
  ).toBeVisible();
  await context.setOffline(false);
  await expect(page.locator(".sync")).toContainText("Conectado", {
    timeout: 30000,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Arena offline" }),
  ).toHaveCount(1);
  await expect(page.getByText("Saldo: Q700.00")).toBeVisible();
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"]',
    )!;
    return fetch(link.href).then((r) => r.json());
  });
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toHaveLength(2);
});
test("interfaz cabe en 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await register(page);
  await createProject(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
