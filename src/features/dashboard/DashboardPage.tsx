import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Empty } from "../../components/EmptyState";
import { PaymentBadge } from "../../components/PaymentBadge";
import { StatCard } from "../../components/StatCard";
import { appConfig } from "../../config/appConfig";
import { routes } from "../../config/routes";
import {
  dateLabel,
  live,
  localNow,
  money,
  summary,
  today,
  total,
  type Project,
  type ProjectData,
} from "../../domain";
import { commonText } from "../../locales/es/common";
import { dashboardText } from "../../locales/es/dashboard";

export function Dashboard({
  project,
  data,
  edit,
}: {
  project: Project;
  data: ProjectData;
  edit: () => void;
}) {
  const s = summary(project, data),
    pending = live(data.pendingItems).filter(
      (p) => !["completado", "cancelado", "recibido"].includes(p.status),
    ),
    due = pending.filter((p) => p.dueDate && p.dueDate < localNow()),
    now = pending.filter(
      (p) => p.dueDate.slice(0, 10) === today() && p.dueDate >= localNow(),
    ),
    upcoming = pending.filter((p) => p.dueDate.slice(0, 10) > today());
  return (
    <>
      <div className="stats-grid">
        <section className="budget-card">
          <div>
            <span>{dashboardText.availableBudget}</span>
            <ArrowUpRight size={21} />
          </div>
          <h2>{money(s.available)}</h2>
          <p>
            {dashboardText.budgetPrefix}
            {money(project.budgetCents)}
            {dashboardText.budgetSuffix}
          </p>
          <div className="budget-track">
            <i style={{ width: `${Math.min(s.percent || 0, 100)}%` }} />
          </div>
          <div>
            <small>
              {s.percent === null
                ? dashboardText.setBudget
                : dashboardText.usedPercent(s.percent.toFixed(1))}
            </small>
            <button className="text-button" onClick={edit}>
              {dashboardText.viewBudget}
            </button>
          </div>
        </section>
        <StatCard
          icon={<ShoppingBag size={20} />}
          label={dashboardText.spent}
          value={money(s.spent)}
          description={dashboardText.spentHint}
        />
        <StatCard
          icon={<Clock size={20} />}
          label={dashboardText.committed}
          value={money(s.committed)}
          description={dashboardText.committedHint}
          tone="amber"
        />
      </div>
      {s.percent !== null &&
        s.percent >= appConfig.dashboard.budgetWarningPercent && (
          <div
            className={
              "banner " +
              (s.percent >= appConfig.dashboard.budgetExceededPercent
                ? "error"
                : "warning")
            }
          >
            {dashboardText.budgetAlertPrefix}{" "}
            {s.percent >= appConfig.dashboard.budgetExceededPercent
              ? appConfig.dashboard.budgetExceededPercent
              : s.percent >= appConfig.dashboard.budgetCriticalPercent
                ? appConfig.dashboard.budgetCriticalPercent
                : appConfig.dashboard.budgetWarningPercent}
            {dashboardText.budgetAlertSuffix}
          </div>
        )}
      {s.percent === null && (
        <div className="banner warning">{dashboardText.budgetRequired}</div>
      )}
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>{dashboardText.distributionTitle}</h2>
            <span>{dashboardText.actualExpenses}</span>
          </div>
          <div className="distribution">
            <div
              className="donut"
              style={{
                background: `conic-gradient(#214e40 0 ${s.spent ? (s.purchasesPaid / s.spent) * 100 : 0}%, #d7bd7b 0 ${s.spent ? 100 : 0}%, #e9ece5 0)`,
              }}
            >
              <div>
                <small>{dashboardText.paidTotal}</small>
                <strong>{money(s.spent)}</strong>
              </div>
            </div>
            <div className="legend">
              <div>
                <span className="dot green" />
                <span>
                  {dashboardText.materialsAndServices}
                  <strong>{money(s.purchasesPaid)}</strong>
                </span>
              </div>
              <div>
                <span className="dot gold" />
                <span>
                  {dashboardText.labor}
                  <strong>{money(s.laborPaid)}</strong>
                </span>
              </div>
              <p>{dashboardText.paidOnly}</p>
            </div>
          </div>
        </section>
        <section className="panel agenda">
          <div className="section-heading">
            <h2>{dashboardText.agenda}</h2>
            <CalendarDays size={19} />
          </div>
          <div className="agenda-counts">
            <div>
              <strong>{due.length}</strong>
              <span>{dashboardText.overdue}</span>
            </div>
            <div>
              <strong>{now.length}</strong>
              <span>{dashboardText.today}</span>
            </div>
            <div>
              <strong>{upcoming.length}</strong>
              <span>{dashboardText.upcoming}</span>
            </div>
          </div>
          {[...due, ...now, ...upcoming]
            .slice(0, appConfig.dashboard.agendaItems)
            .map((p) => (
              <div className="agenda-item" key={p.id}>
                <span className="tiny-icon">
                  <Clock size={17} />
                </span>
                <div>
                  <strong>{p.material}</strong>
                  <small>
                    {dateLabel(p.dueDate)} · {p.priority}
                  </small>
                </div>
              </div>
            ))}
          {pending.length === 0 && (
            <p className="agenda-clear">
              <Check size={17} />
              {dashboardText.allClear}
            </p>
          )}
          <NavLink className="text-button" to={routes.pending}>
            {dashboardText.allPending}
            <ArrowUpRight size={16} />
          </NavLink>
        </section>
      </div>
      <section className="panel">
        <div className="section-heading">
          <h2>{dashboardText.recentPurchases}</h2>
          <NavLink className="text-button" to={routes.purchases}>
            {dashboardText.viewAll}
            <ArrowUpRight size={15} />
          </NavLink>
        </div>
        {live(data.purchases).length === 0 ? (
          <Empty text={dashboardText.firstPurchaseHint} />
        ) : (
          live(data.purchases)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, appConfig.dashboard.recentPurchases)
            .map((p) => (
              <div className="record-main recent" key={p.id}>
                <span className="record-icon">
                  <ShoppingBag size={20} />
                </span>
                <div>
                  <h3>{p.material}</h3>
                  <p>
                    {p.supplier || commonText.noSupplier} · {dateLabel(p.date)}
                  </p>
                </div>
                <PaymentBadge
                  paid={p.paidCents}
                  total={total(p.quantity, p.unitPriceCents)}
                />
                <strong>{money(total(p.quantity, p.unitPriceCents))}</strong>
              </div>
            ))
        )}
      </section>
    </>
  );
}
