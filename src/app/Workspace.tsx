import { type User } from "firebase/auth";
import { enableNetwork } from "firebase/firestore";
import {
  Building2,
  ClipboardList,
  HardHat,
  Plus,
  Wifi,
  WifiOff,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Editor } from "../components/EntityEditor";
import { appConfig } from "../config/appConfig";
import { nav } from "../config/navigation";
import { routes } from "../config/routes";
import { live } from "../domain";
import { BackupPage } from "../features/backup/BackupPage";
import { Dashboard } from "../features/dashboard/DashboardPage";
import { PendingPage } from "../features/pending/PendingPage";
import { Prices } from "../features/prices/PricesPage";
import { Purchases } from "../features/purchases/PurchasesPage";
import { Team } from "../features/team/TeamPage";
import { useWorkspaceActions } from "../hooks/useWorkspaceActions";
import { useWorkspaceData } from "../hooks/useWorkspaceData";
import { workspaceText } from "../locales/es/workspace";
import { emulated } from "../services/firebase";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

export function Workspace({ user }: { user: User }) {
  const workspace = useWorkspaceData(user);
  const {
    db,
    projects,
    active,
    setActive,
    data,
    dataReady,
    project,
    pending,
    cached,
    online,
    error,
    setError,
    setRetryVersion,
  } = workspace;
  const route = useLocation().pathname;
  const {
    notice,
    setNotice,
    editor,
    setEditor,
    imported,
    setImported,
    submit,
    mutate,
    remove,
    convert,
    actions,
    doImport,
  } = useWorkspaceActions(user, workspace);
  if (!db)
    return (
      <main className="loading">
        <div>
          {error || workspaceText.openingWorkspace}
          {error && (
            <button onClick={() => window.location.reload()}>
              {workspaceText.retry}
            </button>
          )}
        </div>
      </main>
    );
  return (
    <div className="app-shell">
      <WorkspaceSidebar
        email={user.email}
        projects={projects}
        active={active}
        pending={pending}
        onSelectProject={(id) => {
          setActive(id);
          setEditor(null);
        }}
        onNewProject={() => setEditor({ kind: "projects" })}
      />
      <main className="main">
        <header className="topbar">
          <span>
            <Building2 size={17} />
            {project?.name || workspaceText.myWorkspace}{" "}
            <span className="desktop-only">
              / {nav.find((n) => n[0] === route)?.[1] || workspaceText.overview}
            </span>
          </span>
          <div className={"sync " + (error ? "sync-error" : "")} role="status">
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}{" "}
            {error
              ? workspaceText.syncError
              : !online
                ? workspaceText.offline
                : pending
                  ? workspaceText.syncing
                  : cached || (Boolean(active) && !dataReady)
                    ? workspaceText.connecting
                    : workspaceText.connected}
            {pending && <span>{workspaceText.pendingChanges}</span>}
          </div>
        </header>
        <div className="mobile-project">
          <select
            aria-label={workspaceText.mobileProject}
            value={active}
            onChange={(e) => setActive(e.target.value)}
          >
            <option value="">{workspaceText.myProjects}</option>
            {live(projects).map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            className="icon"
            aria-label={workspaceText.newProject}
            onClick={() => setEditor({ kind: "projects" })}
          >
            <Plus />
          </button>
        </div>
        <div className="content">
          {error && (
            <div role="alert" className="banner error">
              {error}
              <button
                onClick={() => {
                  setError("");
                  if (db) void enableNetwork(db);
                  setRetryVersion((v) => v + 1);
                }}
              >
                {workspaceText.retry}
              </button>
              <button className="text-button" onClick={() => setError("")}>
                {workspaceText.close}
              </button>
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button className="text-button" onClick={() => setNotice("")}>
                {workspaceText.close}
              </button>
            </div>
          )}
          {!project ? (
            <section className="empty welcome">
              <HardHat size={48} />
              <h1>{workspaceText.emptyTitle}</h1>
              <p>{workspaceText.emptyDescription}</p>
              <button onClick={() => setEditor({ kind: "projects" })}>
                <Plus size={18} />
                {workspaceText.createFirstProject}
              </button>
            </section>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">
                    {route === routes.dashboard
                      ? workspaceText.overviewEyebrow
                      : workspaceText.pageEyebrow}
                  </span>
                  <h1>
                    {route === routes.dashboard
                      ? workspaceText.overviewTitle
                      : nav.find((n) => n[0] === route)?.[1] ||
                        workspaceText.overview}
                  </h1>
                  <p>
                    {route === routes.dashboard
                      ? workspaceText.overviewDescription
                      : project.name + workspaceText.pageDescriptionSuffix}
                  </p>
                </div>
                <span className="project-state">
                  <span /> {project.status}
                </span>
              </div>
              <div className="quick-actions">
                <button onClick={() => setEditor({ kind: "purchases" })}>
                  <Plus size={18} />
                  {workspaceText.addPurchase}
                </button>
                <button
                  className="secondary"
                  onClick={() => setEditor({ kind: "pendingItems" })}
                >
                  <ClipboardList size={18} />
                  {workspaceText.addPending}
                </button>
                <button
                  className="secondary"
                  onClick={() => setEditor({ kind: "laborPayments" })}
                >
                  <HardHat size={18} />
                  {workspaceText.addLaborPayment}
                </button>
              </div>
              {route === routes.dashboard && (
                <Dashboard
                  project={project}
                  data={data}
                  edit={() => setEditor({ kind: "projects", initial: project })}
                />
              )}{" "}
              {route === routes.purchases && (
                <Purchases data={data} actions={actions} />
              )}{" "}
              {route === routes.pending && (
                <PendingPage
                  data={data}
                  actions={actions}
                  mutate={mutate}
                  convert={convert}
                />
              )}
              {route === routes.team && (
                <Team
                  data={data}
                  actions={actions}
                  add={() => setEditor({ kind: "workers" })}
                />
              )}{" "}
              {route === routes.prices && <Prices data={data} />}{" "}
              {route === routes.backup && (
                <BackupPage
                  project={project}
                  data={data}
                  dataReady={dataReady}
                  imported={imported}
                  setImported={setImported}
                  setError={setError}
                  doImport={doImport}
                  setEditor={setEditor}
                  remove={remove}
                  pending={pending}
                />
              )}
            </>
          )}
        </div>
        <footer className="page-footer">
          {workspaceText.footer}
          <span>
            {appConfig.brand.name.toUpperCase() + " · "}
            {emulated
              ? workspaceText.localEnvironment
              : appConfig.brand.tagline}
          </span>
        </footer>
      </main>
      <nav className="bottom-nav">
        {nav.map(([to, label, Icon]) => (
          <NavLink to={to} end key={to}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {editor && (
        <Editor
          key={
            editor.kind +
            (editor.initial?.id || "new") +
            (editor.initial?.version || 0)
          }
          kind={editor.kind}
          initial={editor.initial}
          projectId={active}
          workers={live(data.workers)}
          onClose={() => setEditor(null)}
          onSave={submit}
          onReload={() => {
            const latest = (
              editor.kind === "projects" ? projects : data[editor.kind]
            ).find((r) => r.id === editor.initial?.id);
            if (latest) setEditor({ kind: editor.kind, initial: latest });
          }}
        />
      )}
    </div>
  );
}
