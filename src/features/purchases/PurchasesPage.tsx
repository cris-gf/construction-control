import { Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Empty } from "../../components/EmptyState";
import { PaymentBadge } from "../../components/PaymentBadge";
import {
  dateLabel,
  live,
  money,
  paymentStatus,
  total,
  type Kind,
  type ProjectData,
  type RecordData,
} from "../../domain";
import { paymentStates } from "../../domain/options";
import { commonText } from "../../locales/es/common";
import { purchasesText } from "../../locales/es/purchases";

export function Purchases({
  data,
  actions,
}: {
  data: ProjectData;
  actions: (k: Kind, r: RecordData) => React.ReactNode;
}) {
  const [q, setQ] = useState(""),
    [supplier, setSupplier] = useState(""),
    [category, setCategory] = useState(""),
    [status, setStatus] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const rows = live(data.purchases)
    .filter(
      (p) =>
        (p.material + " " + p.supplier)
          .toLowerCase()
          .includes(q.toLowerCase()) &&
        (!supplier || p.supplier === supplier) &&
        (!category || p.category === category) &&
        (!status ||
          paymentStatus(p.paidCents, total(p.quantity, p.unitPriceCents)) ===
            status) &&
        (!from || p.date.slice(0, 10) >= from) &&
        (!to || p.date.slice(0, 10) <= to),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>{purchasesText.title}</h2>
        <span>
          {rows.length}
          {purchasesText.countSuffix}
        </span>
      </div>
      <div className="filters">
        <label className="search">
          <Search size={18} />
          <input
            aria-label={purchasesText.searchLabel}
            placeholder={purchasesText.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <select
          aria-label={purchasesText.supplierFilter}
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
        >
          <option value="">{purchasesText.allSuppliers}</option>
          {[...new Set(data.purchases.map((p) => p.supplier))]
            .filter(Boolean)
            .map((v) => (
              <option key={v}>{v}</option>
            ))}
        </select>
        <select
          aria-label={purchasesText.categoryFilter}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">{purchasesText.allCategories}</option>
          {[...new Set(data.purchases.map((p) => p.category))]
            .filter(Boolean)
            .map((v) => (
              <option key={v}>{v}</option>
            ))}
        </select>
        <select
          aria-label={purchasesText.paymentFilter}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{purchasesText.allPayments}</option>
          {[...paymentStates].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <label>
          {purchasesText.from}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          {purchasesText.to}
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      {rows.length === 0 ? (
        <Empty text={purchasesText.emptyHint} />
      ) : (
        rows.map((p) => (
          <article className="record" key={p.id}>
            <div className="record-main">
              <span className="record-icon">
                <ShoppingBag />
              </span>
              <div>
                <h3>{p.material}</h3>
                <p>
                  {p.quantity} {p.unit} × {money(p.unitPriceCents)} ·{" "}
                  {p.supplier || commonText.noSupplier}
                </p>
                <p>
                  {dateLabel(p.date)} · {p.category}
                </p>
              </div>
              <strong>{money(total(p.quantity, p.unitPriceCents))}</strong>
              {actions("purchases", p)}
            </div>
            <div className="record-tools">
              <PaymentBadge
                paid={p.paidCents}
                total={total(p.quantity, p.unitPriceCents)}
              />
              <span>
                {purchasesText.paidPrefix}
                {money(p.paidCents)}
              </span>
              <span>
                {purchasesText.balancePrefix}{" "}
                {money(total(p.quantity, p.unitPriceCents) - p.paidCents)}
              </span>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
