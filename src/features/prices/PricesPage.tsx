import { useState } from "react";
import { Empty } from "../../components/EmptyState";
import {
  compare,
  dateLabel,
  live,
  money,
  total,
  type ProjectData,
  type Purchase,
} from "../../domain";
import { commonText } from "../../locales/es/common";
import { pricesText } from "../../locales/es/prices";

export function Prices({ data }: { data: ProjectData }) {
  const [material, setMaterial] = useState(""),
    [unit, setUnit] = useState(""),
    [quantity, setQuantity] = useState("1"),
    [left, setLeft] = useState(""),
    [right, setRight] = useState("");
  const c = compare(data.purchases, material, unit),
    a = c.rows.find((p) => p.id === left),
    b = c.rows.find((p) => p.id === right);
  let saving: number | null = null;
  try {
    if (a && b)
      saving = total(quantity, Math.abs(a.unitPriceCents - b.unitPriceCents));
  } catch {
    /* Mostrar validación */
  }
  return (
    <section className="panel">
      <h2>{pricesText.title}</h2>
      <p>{pricesText.description}</p>
      <div className="filters">
        <label>
          {pricesText.material}
          <select
            value={material}
            onChange={(e) => {
              setMaterial(e.target.value);
              setUnit("");
              setLeft("");
              setRight("");
            }}
          >
            <option value="">{pricesText.select}</option>
            {[...new Set(live(data.purchases).map((p) => p.material))].map(
              (m) => (
                <option key={m}>{m}</option>
              ),
            )}
          </select>
        </label>
        <label>
          {pricesText.unit}
          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setLeft("");
              setRight("");
            }}
          >
            <option value="">{pricesText.select}</option>
            {[
              ...new Set(
                data.purchases
                  .filter((p) => p.material === material)
                  .map((p) => p.unit),
              ),
            ].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
      </div>
      {c.lowest !== null && (
        <div className="labor-totals">
          <span>
            {pricesText.lowest}
            <strong>{money(c.lowest)}</strong>
          </span>
          <span>
            {pricesText.latest}
            <strong>{money(c.latest!)}</strong>
          </span>
        </div>
      )}
      {c.rows.length < 2 ? (
        <Empty text={pricesText.emptyHint} />
      ) : (
        <>
          <div className="form-grid">
            {[
              { value: left, onChange: setLeft, label: pricesText.purchaseA },
              { value: right, onChange: setRight, label: pricesText.purchaseB },
            ].map(({ value, onChange, label }) => (
              <label key={label}>
                {label}
                <select
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                >
                  <option value="">{pricesText.selectPurchase}</option>
                  {c.rows.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.supplier} · {dateLabel(p.date)} ·{" "}
                      {money(p.unitPriceCents)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label>
              {pricesText.quantity}
              <input
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
          </div>
          {a && b && (
            <div className="calculated">
              <span>
                {pricesText.differencePrefix}
                {unit}: {money(Math.abs(a.unitPriceCents - b.unitPriceCents))} (
                {a.unitPriceCents
                  ? pricesText.relativeDifference(
                      (
                        (Math.abs(a.unitPriceCents - b.unitPriceCents) /
                          a.unitPriceCents) *
                        100
                      ).toFixed(2),
                    )
                  : pricesText.zeroPrice}
                )
              </span>
              <strong>
                {pricesText.estimatedSaving}{" "}
                {saving === null ? pricesText.invalidQuantity : money(saving)}
              </strong>
            </div>
          )}
        </>
      )}
      {c.rows.map((p: Purchase) => (
        <div className="record-main recent" key={p.id}>
          <div>
            <h3>{p.supplier || commonText.noSupplier}</h3>
            <p>
              {dateLabel(p.date)} · {p.quantity} {p.unit}
            </p>
          </div>
          <strong>{money(p.unitPriceCents)}</strong>
        </div>
      ))}
    </section>
  );
}
