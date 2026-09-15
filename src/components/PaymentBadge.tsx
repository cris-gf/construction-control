import { paymentStatus } from "../domain";
export function PaymentBadge({
  paid,
  total,
  colored = true,
}: {
  paid: number;
  total: number;
  colored?: boolean;
}) {
  const status = paymentStatus(paid, total);
  return (
    <span className={colored ? `badge ${status}` : "badge"}>{status}</span>
  );
}
