import { HardHat, LogOut, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Brand } from "../components/Brand";
import { nav } from "../config/navigation";
import { live, type Project } from "../domain";
import { workspaceText } from "../locales/es/workspace";
import { closeSession } from "../services/session";
export function WorkspaceSidebar({
  email,
  projects,
  active,
  pending,
  onSelectProject,
  onNewProject,
}: {
  email: string | null;
  projects: Project[];
  active: string;
  pending: boolean;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}) {
  return (
    <aside className="sidebar">
      <Brand link />
      <div className="project-picker">
        <span className="eyebrow">{workspaceText.workspaceLabel}</span>
        <select
          aria-label={workspaceText.activeProject}
          value={active}
          onChange={(e) => {
            onSelectProject(e.target.value);
          }}
        >
          <option value="" disabled>
            {workspaceText.selectProject}
          </option>
          {live(projects).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="text-button" onClick={onNewProject}>
          <Plus size={14} />
          {workspaceText.newProject}
        </button>
      </div>
      <nav>
        {nav.map(([to, label, Icon]) => (
          <NavLink to={to} end key={to}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="tip">
          <HardHat />
          <strong>{workspaceText.tipTitle}</strong>
          <small>{workspaceText.tipBody}</small>
        </div>
        <span className="user-email">{email}</span>
        <button
          className="text-button"
          onClick={() => void closeSession(pending)}
        >
          <LogOut size={17} />
          {workspaceText.signOut}
        </button>
      </div>
    </aside>
  );
}
