import { ArrowUpRight, CalendarDays, ClipboardList } from "lucide-react";
import { Empty } from "../../components/EmptyState";
import {
  dateLabel,
  live,
  localNow,
  money,
  pendingStates,
  total,
  type Kind,
  type PendingItem,
  type ProjectData,
  type RecordData,
} from "../../domain";
import { ics } from "../../domain/calendar";
import { pendingText } from "../../locales/es/pending";
import { download } from "../../services/files";

export function PendingPage({
  data,
  actions,
  mutate,
  convert,
}: {
  data: ProjectData;
  actions: (kind: Kind, value: RecordData) => React.ReactNode;
  mutate: (kind: Kind, value: RecordData) => void;
  convert: (value: PendingItem) => void;
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>{pendingText.title}</h2>
        <span>
          {live(data.pendingItems).length}
          {pendingText.countSuffix}
        </span>
      </div>
      {live(data.pendingItems).length === 0 ? (
        <Empty text={pendingText.emptyHint} />
      ) : (
        live(data.pendingItems)
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
          .map((p) => (
            <article className="record" key={p.id}>
              <div className="record-main">
                <span className="record-icon">
                  <ClipboardList />
                </span>
                <div>
                  <h3>{p.material}</h3>
                  <p>
                    {p.quantity} {p.unit} · {p.type} · {p.priority}
                  </p>
                  <p
                    className={
                      p.dueDate &&
                      p.dueDate < localNow() &&
                      !["completado", "cancelado", "recibido"].includes(
                        p.status,
                      )
                        ? "overdue"
                        : ""
                    }
                  >
                    {p.dueDate
                      ? pendingText.deadline(dateLabel(p.dueDate))
                      : pendingText.noDeadline}
                  </p>
                </div>
                <strong>{money(total(p.quantity, p.unitPriceCents))}</strong>
                {actions("pendingItems", p)}
              </div>
              <div className="record-tools">
                <select
                  aria-label={pendingText.statusLabel(p.material)}
                  value={p.status}
                  onChange={(e) =>
                    mutate("pendingItems", {
                      ...p,
                      status: e.target.value as PendingItem["status"],
                    })
                  }
                >
                  {pendingStates.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {!p.purchaseId &&
                  !["cancelado", "completado"].includes(p.status) && (
                    <button className="text-button" onClick={() => convert(p)}>
                      {pendingText.convertToPurchase}
                      <ArrowUpRight size={14} />
                    </button>
                  )}
                {(["buyDate", "receiveDate"] as const).map(
                  (key) =>
                    p[key] && (
                      <button
                        className="text-button"
                        key={key}
                        onClick={() =>
                          download(
                            `${key}.ics`,
                            ics(
                              `${key === "buyDate" ? "Comprar" : "Recibir"}: ${p.material}`,
                              p[key],
                              p.id + key,
                            ),
                            "text/calendar",
                          )
                        }
                      >
                        <CalendarDays size={15} />
                        {key === "buyDate"
                          ? pendingText.purchase
                          : pendingText.receipt}
                      </button>
                    ),
                )}
              </div>
            </article>
          ))
      )}
    </section>
  );
}
