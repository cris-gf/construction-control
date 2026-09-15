import { Pencil, Trash2 } from "lucide-react";
import { commonText } from "../locales/es/common";

export function RecordActions({
  title,
  onEdit,
  onDelete,
}: {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="row-actions">
      <button
        className="icon"
        aria-label={commonText.editLabel(title)}
        onClick={onEdit}
      >
        <Pencil size={16} />
      </button>
      <button
        className="icon"
        aria-label={commonText.deleteLabel(title)}
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
