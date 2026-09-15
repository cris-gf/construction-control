import type { ReactNode } from "react";
export function StatCard({
  icon,
  label,
  value,
  description,
  tone = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  tone?: "" | "amber";
}) {
  return (
    <section className="stat-card">
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <p>{label}</p>
      <h2>{value}</h2>
      <small>{description}</small>
    </section>
  );
}
