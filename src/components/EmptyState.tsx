import { ClipboardList } from "lucide-react";
import { commonText } from "../locales/es/common";

export function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <ClipboardList size={30} />
      <p>{text}</p>
      <small>{commonText.emptyHint}</small>
    </div>
  );
}
