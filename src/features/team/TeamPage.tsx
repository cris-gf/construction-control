import { Plus } from "lucide-react";
import { useState } from "react";
import { Empty } from "../../components/EmptyState";
import { PaymentBadge } from "../../components/PaymentBadge";
import {
  dateLabel,
  live,
  money,
  type Kind,
  type ProjectData,
  type RecordData,
} from "../../domain";
import { teamText } from "../../locales/es/team";

export function Team({
  data,
  actions,
  add,
}: {
  data: ProjectData;
  actions: (k: Kind, r: RecordData) => React.ReactNode;
  add: () => void;
}) {
  const [worker, setWorker] = useState("");
  const payments = live(data.laborPayments).filter(
    (p) => !worker || p.workerId === worker,
  );
  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <h2>{teamText.title}</h2>
          <button className="secondary" onClick={add}>
            <Plus size={16} />
            {teamText.worker}
          </button>
        </div>
        {live(data.workers).length === 0 ? (
          <Empty text={teamText.emptyHint} />
        ) : (
          live(data.workers).map((w) => (
            <div className="record-main recent" key={w.id}>
              <span className="avatar">{w.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <h3>{w.name}</h3>
                <p>
                  {w.role} · {w.agreement} · {w.active ? "activo" : "inactivo"}
                </p>
                {w.phone && <a href={"tel:" + w.phone}>{w.phone}</a>}
              </div>
              {actions("workers", w)}
            </div>
          ))
        )}
      </section>
      <section className="panel">
        <div className="section-heading">
          <h2>{teamText.paymentsTitle}</h2>
          <select
            aria-label={teamText.workerFilter}
            value={worker}
            onChange={(e) => setWorker(e.target.value)}
          >
            <option value="">{teamText.allWorkers}</option>
            {data.workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="labor-totals">
          <span>
            {teamText.agreed}{" "}
            <strong>
              {money(payments.reduce((s, p) => s + p.agreedCents, 0))}
            </strong>
          </span>
          <span>
            {teamText.paid}{" "}
            <strong>
              {money(payments.reduce((s, p) => s + p.paidCents, 0))}
            </strong>
          </span>
          <span>
            {teamText.pending}{" "}
            <strong>
              {money(
                payments.reduce((s, p) => s + p.agreedCents - p.paidCents, 0),
              )}
            </strong>
          </span>
        </div>
        {payments.map((p) => (
          <article className="record" key={p.id}>
            <div className="record-main">
              <div>
                <h3>
                  {data.workers.find((w) => w.id === p.workerId)?.name ||
                    "Trabajador"}{" "}
                  · {p.period}
                </h3>
                <p>{p.description}</p>
                <p>{dateLabel(p.date)}</p>
              </div>
              <strong>{money(p.agreedCents)}</strong>
              {actions("laborPayments", p)}
            </div>
            <div className="record-tools">
              <PaymentBadge
                paid={p.paidCents}
                total={p.agreedCents}
                colored={false}
              />
              <span>
                {teamText.paidPrefix}
                {money(p.paidCents)}
              </span>
              <span>
                {teamText.balancePrefix}
                {money(p.agreedCents - p.paidCents)}
              </span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
