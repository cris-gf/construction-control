import React from "react";
import { it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Editor } from "../src/forms";
afterEach(cleanup);
it("formulario calcula total exacto y rechaza abono excesivo", () => {
  const onSave = vi.fn();
  render(
    <Editor
      kind="purchases"
      projectId={crypto.randomUUID()}
      workers={[]}
      onSave={onSave}
      onClose={() => {}}
    />,
  );
  fireEvent.change(screen.getByLabelText("Material o servicio *"), {
    target: { value: "Cemento" },
  });
  fireEvent.change(screen.getByLabelText("Unidad *"), {
    target: { value: "saco" },
  });
  fireEvent.change(screen.getByLabelText("Cantidad *"), {
    target: { value: "35" },
  });
  fireEvent.change(screen.getByLabelText("Precio unitario (Q) *"), {
    target: { value: "71.99" },
  });
  expect(screen.getByText("Q2,519.65")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Monto pagado (Q) *"), {
    target: { value: "3000" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Guardar compra" }).closest("form")!,
  );
  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toBeTruthy();
  fireEvent.click(screen.getByText("Marcar pagado"));
  fireEvent.submit(
    screen.getByRole("button", { name: "Guardar compra" }).closest("form")!,
  );
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ unitPriceCents: 7199, paidCents: 251965 }),
  );
});
