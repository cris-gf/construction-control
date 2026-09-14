import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  writeBatch,
  enableNetwork,
  type Firestore,
} from "firebase/firestore";
import {
  Building2,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  HardHat,
  ChartNoAxesCombined,
  Settings,
  Plus,
  ArrowUpRight,
  LogOut,
  Wifi,
  WifiOff,
  Check,
  Clock,
  Download,
  Pencil,
  Trash2,
  CalendarDays,
  Search,
} from "lucide-react";
import {
  auth,
  prepareDatabase,
  signOutDatabases,
  save,
  ref,
  emulated,
} from "./firebase";
import { Editor, titles } from "./forms";
import {
  type Kind,
  type Project,
  type ProjectData,
  type RecordData,
  type PendingItem,
  type Purchase,
  emptyData,
  live,
  summary,
  money,
  total,
  paymentStatus,
  fresh,
  dateLabel,
  today,
  localNow,
  pendingStates,
  compare,
} from "./domain";
import { backup, csv, download, ics, parseBackup, type Backup } from "./backup";
const nav = [
  ["/", "Resumen", LayoutDashboard],
  ["/compras", "Compras", ShoppingBag],
  ["/pendientes", "Pendientes", ClipboardList],
  ["/equipo", "Equipo", HardHat],
  ["/precios", "Precios", ChartNoAxesCombined],
  ["/ajustes", "Respaldo", Settings],
] as const;
function Auth() {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [trusted, setTrusted] = useState(
      localStorage.getItem("trusted-device") === "yes",
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="auth">
      <div className="auth-story">
        <div className="brand">
          <Building2 /> obra<span>CONTROL DE CONSTRUCCIÓN</span>
        </div>
        <h1>
          Construye con
          <br />
          las cuentas claras.
        </h1>
        <p>
          Tu presupuesto, tus materiales y tu equipo.
          <br />
          Toda tu obra, en un solo lugar.
        </p>
        <div className="architectural">
          <div />
          <div />
          <div />
          <span>DE LOS PLANOS A LA REALIDAD</span>
        </div>
      </div>
      <section className="auth-form">
        <span className="eyebrow">BIENVENIDO A OBRA</span>
        <h2>
          {mode === "register"
            ? "Empieza tu próxima obra"
            : mode === "reset"
              ? "Recupera tu acceso"
              : "Tu obra te espera"}
        </h2>
        <p>Control sencillo. Decisiones con confianza.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              localStorage.setItem("trusted-device", trusted ? "yes" : "no");
              if (mode === "register")
                await createUserWithEmailAndPassword(auth, email, password);
              else if (mode === "login")
                await signInWithEmailAndPassword(auth, email, password);
              else {
                await sendPasswordResetEmail(auth, email);
                setError(
                  "Si existe la cuenta, recibirás un correo de recuperación.",
                );
              }
            } catch {
              setError(
                "No se pudo completar. Revisa tus datos y la conexión. La contraseña debe tener al menos 8 caracteres.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Correo electrónico
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {mode !== "reset" && (
            <label>
              Contraseña
              <input
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          <label className="check">
            <input
              type="checkbox"
              checked={trusted}
              onChange={(e) => setTrusted(e.target.checked)}
            />
            Este es un dispositivo de confianza. Activar acceso sin conexión.
          </label>
          <small>
            Los datos se conservan en este navegador. Usa esta opción solo en tu
            teléfono personal.
          </small>
          <button disabled={busy}>
            {busy
              ? "Un momento…"
              : mode === "login"
                ? "Iniciar sesión"
                : mode === "register"
                  ? "Crear cuenta"
                  : "Enviar recuperación"}
            <ArrowUpRight size={18} />
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
        <div className="auth-links">
          <button
            className="text-button"
            onClick={() => setMode(mode === "register" ? "login" : "register")}
          >
            {mode === "register" ? "Ya tengo cuenta" : "Crear una cuenta"}
          </button>
          <button
            className="text-button"
            onClick={() => setMode(mode === "reset" ? "login" : "reset")}
          >
            {mode === "reset" ? "Volver al inicio" : "Olvidé mi contraseña"}
          </button>
        </div>
        {emulated && (
          <p className="demo-note">Entorno local · Emuladores Firebase</p>
        )}
      </section>
    </main>
  );
}
export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (user === undefined)
    return <div className="loading">Preparando tu obra…</div>;
  return user ? <Workspace key={user.uid} user={user} /> : <Auth />;
}
function Workspace({ user }: { user: User }) {
  const [db, setDb] = useState<Firestore | null>(null),
    [projects, setProjects] = useState<Project[]>([]),
    [active, setActive] = useState(""),
    [recordData, setData] = useState<ProjectData>(emptyData),
    [dataProject, setDataProject] = useState(""),
    [retryVersion, setRetryVersion] = useState(0),
    [online, setOnline] = useState(navigator.onLine),
    [metadata, setMetadata] = useState<
      Record<string, { pending: boolean; cache: boolean }>
    >({}),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [editor, setEditor] = useState<{
      kind: Kind;
      initial?: Partial<RecordData>;
      convert?: PendingItem;
    } | null>(null),
    [imported, setImported] = useState<Backup | null>(null);
  const route = useLocation().pathname;
  const data = dataProject === active ? recordData : emptyData;
  const dataReady =
    dataProject === active &&
    Object.keys(emptyData).every((k) => Boolean(metadata[k]));
  useEffect(() => {
    let current = true;
    prepareDatabase(user.uid)
      .then((d) => {
        if (current) setDb(d);
      })
      .catch(() =>
        setError(
          "No se pudo abrir el almacenamiento. Vuelve a iniciar sesión.",
        ),
      );
    const change = () => setOnline(navigator.onLine);
    window.addEventListener("online", change);
    window.addEventListener("offline", change);
    return () => {
      current = false;
      window.removeEventListener("online", change);
      window.removeEventListener("offline", change);
    };
  }, [user.uid]);
  useEffect(() => {
    if (!db) return;
    return onSnapshot(
      collection(db, "users", user.uid, "projects"),
      { includeMetadataChanges: true },
      (snap) => {
        const rows = snap.docs.map((d) => d.data() as Project);
        setProjects(rows);
        setMetadata((m) => ({
          ...m,
          projects: {
            pending: snap.metadata.hasPendingWrites,
            cache: snap.metadata.fromCache,
          },
        }));
        setActive((a) =>
          live(rows).some((p) => p.id === a) ? a : live(rows)[0]?.id || "",
        );
      },
      () =>
        setError(
          "No se pudieron consultar las obras. Revisa la sesión y vuelve a intentar.",
        ),
    );
  }, [db, user.uid, retryVersion]);
  useEffect(() => {
    setData(emptyData);
    setDataProject(active);
    setMetadata((m) => ({ projects: m.projects }));
    if (!db || !active) return;
    const unsub = Object.keys(emptyData).map((kind) =>
      onSnapshot(
        collection(db, "users", user.uid, "projects", active, kind),
        { includeMetadataChanges: true },
        (snap) => {
          setData((d) => ({ ...d, [kind]: snap.docs.map((r) => r.data()) }));
          setMetadata((m) => ({
            ...m,
            [kind]: {
              pending: snap.metadata.hasPendingWrites,
              cache: snap.metadata.fromCache,
            },
          }));
        },
        () =>
          setError(
            "Error al consultar registros. Reintenta la sincronización.",
          ),
      ),
    );
    return () => unsub.forEach((u) => u());
  }, [db, user.uid, active, retryVersion]);
  const project = projects.find((p) => p.id === active && !p.deleted),
    pending = Object.values(metadata)
      .filter(Boolean)
      .some((m) => m.pending),
    cached = Object.values(metadata)
      .filter(Boolean)
      .some((m) => m.cache);
  function submit(value: RecordData) {
    if (!db || !editor)
      throw new Error(
        "El almacenamiento aún no está listo. Intenta guardar nuevamente.",
      );
    const { kind, initial, convert } = editor;
    const records = kind === "projects" ? projects : data[kind];
    const current = records.find((r) => r.id === initial?.id);
    if (initial?.id && current?.version !== initial.version) {
      throw new Error(
        "Este registro cambió. Recarga la versión reciente antes de guardar.",
      );
    }
    if (
      convert &&
      data.pendingItems.find((p) => p.id === convert.id)?.version !==
        convert.version
    ) {
      setError("El pendiente cambió. Recarga su versión reciente.");
      return;
    }
    const other = convert
      ? {
          kind: "pendingItems" as const,
          value: {
            ...convert,
            purchaseId: value.id,
            status: "comprado" as const,
            version: convert.version + 1,
            updatedAt: Date.now(),
          },
        }
      : undefined;
    void save(db, user.uid, active, kind, value, other)
      .then(() => setNotice("Cambios confirmados en el servidor."))
      .catch(() =>
        setError(
          "No se pudo sincronizar el cambio; puede existir una versión más reciente. Reabre el registro y revisa los datos antes de intentarlo otra vez.",
        ),
      );
    setNotice("Cambio enviado a la cola local; pendiente de confirmación.");
    setEditor(null);
    if (kind === "projects") setActive(value.id);
  }
  function mutate(kind: Kind, value: RecordData) {
    if (!db) return;
    void save(db, user.uid, active, kind, {
      ...value,
      version: value.version + 1,
      updatedAt: Date.now(),
    }).catch(() =>
      setError(
        "Cambio rechazado. Recarga la versión reciente e inténtalo otra vez.",
      ),
    );
  }
  function remove(kind: Kind, value: RecordData) {
    if (
      kind === "workers" &&
      live(data.laborPayments).some((p) => p.workerId === value.id)
    ) {
      setError(
        "Este trabajador tiene pagos. Puedes marcarlo inactivo en lugar de eliminarlo.",
      );
      return;
    }
    if (window.confirm("¿Eliminar este registro? Se retirará de los totales."))
      mutate(kind, { ...value, deleted: true });
  }
  function convert(p: PendingItem) {
    setEditor({
      kind: "purchases",
      convert: p,
      initial: {
        material: p.material,
        quantity: p.quantity,
        unit: p.unit || "unidad",
        unitPriceCents: p.unitPriceCents,
        supplier: p.supplier,
        pendingItemId: p.id,
        notes: p.notes,
      },
    });
  }
  const actions = (kind: Kind, r: RecordData) => (
    <div className="row-actions">
      <button
        className="icon"
        aria-label={`Editar ${titles[kind]}`}
        onClick={() => setEditor({ kind, initial: r })}
      >
        <Pencil size={16} />
      </button>
      <button
        className="icon"
        aria-label={`Eliminar ${titles[kind]}`}
        onClick={() => remove(kind, r)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
  async function doImport() {
    if (!db || !imported) return;
    const count = Object.values(imported.data).reduce(
      (s, r) => s + r.length,
      0,
    );
    if (count > 450) {
      setError("Máximo 450 registros por importación atómica en esta versión.");
      return;
    }
    const pid = crypto.randomUUID(),
      mapping = new Map<string, string>();
    for (const rows of Object.values(imported.data))
      for (const r of rows) mapping.set(r.id, crypto.randomUUID());
    const batch = writeBatch(db);
    const p = {
      ...imported.project,
      ...fresh(pid),
      id: pid,
      projectId: pid,
      name: imported.project.name.slice(0, 148) + " (importada)",
    };
    batch.set(ref(db, user.uid, pid, "projects", pid), p);
    for (const [kind, rows] of Object.entries(imported.data))
      for (const row of rows) {
        const r: Record<string, unknown> = {
          ...row,
          ...fresh(pid),
          deleted: row.deleted,
          id: mapping.get(row.id),
        };
        for (const key of ["workerId", "purchaseId", "pendingItemId"])
          if (key in r && r[key]) r[key] = mapping.get(String(r[key])) || "";
        batch.set(ref(db, user.uid, pid, kind as Kind, String(r.id)), r);
      }
    setImported(null);
    setNotice("Importación en cola local.");
    void batch
      .commit()
      .then(() => {
        setActive(pid);
        setNotice("Respaldo importado y confirmado.");
      })
      .catch(() =>
        setError(
          "No se pudo importar el respaldo. Ningún registro parcial fue guardado.",
        ),
      );
  }
  if (!db)
    return (
      <main className="loading">
        <div>
          {error || "Abriendo tu espacio de trabajo…"}
          {error && (
            <button onClick={() => window.location.reload()}>Reintentar</button>
          )}
        </div>
      </main>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <Building2 /> obra<span>CONTROL DE CONSTRUCCIÓN</span>
        </a>
        <div className="project-picker">
          <span className="eyebrow">TU ESPACIO DE TRABAJO</span>
          <select
            aria-label="Proyecto activo"
            value={active}
            onChange={(e) => {
              setActive(e.target.value);
              setEditor(null);
            }}
          >
            <option value="" disabled>
              Selecciona una obra
            </option>
            {live(projects).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            className="text-button"
            onClick={() => setEditor({ kind: "projects" })}
          >
            <Plus size={14} />
            Nueva obra
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
            <strong>Cada detalle cuenta.</strong>
            <small>Un registro hoy, una mejor decisión mañana.</small>
          </div>
          <span className="user-email">{user.email}</span>
          <button
            className="text-button"
            onClick={async () => {
              if (
                pending &&
                !window.confirm(
                  "Hay cambios pendientes. Quedarán en este dispositivo para tu próxima sesión. ¿Cerrar sesión?",
                )
              )
                return;
              await signOutDatabases();
              await signOut(auth);
              window.location.assign("/");
            }}
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <span>
            <Building2 size={17} />
            {project?.name || "Mi espacio"}{" "}
            <span className="desktop-only">
              / {nav.find((n) => n[0] === route)?.[1] || "Resumen"}
            </span>
          </span>
          <div className={"sync " + (error ? "sync-error" : "")} role="status">
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}{" "}
            {error
              ? "Con error"
              : !online
                ? "Sin conexión"
                : pending
                  ? "Sincronizando"
                  : cached || (Boolean(active) && !dataReady)
                    ? "Conectando"
                    : "Conectado"}
            {pending && <span> · Cambios pendientes</span>}
          </div>
        </header>
        <div className="mobile-project">
          <select
            aria-label="Obra en móvil"
            value={active}
            onChange={(e) => setActive(e.target.value)}
          >
            <option value="">Mis obras</option>
            {live(projects).map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            className="icon"
            aria-label="Nueva obra"
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
                Reintentar
              </button>
              <button className="text-button" onClick={() => setError("")}>
                Cerrar
              </button>
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button className="text-button" onClick={() => setNotice("")}>
                Cerrar
              </button>
            </div>
          )}
          {!project ? (
            <section className="empty welcome">
              <HardHat size={48} />
              <h1>Tu próxima obra empieza aquí.</h1>
              <p>Crea una obra y lleva sus cuentas desde el primer día.</p>
              <button onClick={() => setEditor({ kind: "projects" })}>
                <Plus size={18} />
                Crear mi primera obra
              </button>
            </section>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">
                    {route === "/"
                      ? "UNA VISTA CLARA DE TU OBRA"
                      : "TU OBRA, AL DÍA"}
                  </span>
                  <h1>
                    {route === "/"
                      ? "Todo bajo control."
                      : nav.find((n) => n[0] === route)?.[1] || "Resumen"}
                  </h1>
                  <p>
                    {route === "/"
                      ? "Cada quetzal en su lugar. Así va tu proyecto."
                      : project.name + " · Registra, consulta y organiza."}
                  </p>
                </div>
                <span className="project-state">
                  <span /> {project.status}
                </span>
              </div>
              <div className="quick-actions">
                <button onClick={() => setEditor({ kind: "purchases" })}>
                  <Plus size={18} />
                  Registrar compra
                </button>
                <button
                  className="secondary"
                  onClick={() => setEditor({ kind: "pendingItems" })}
                >
                  <ClipboardList size={18} />
                  Agregar pendiente
                </button>
                <button
                  className="secondary"
                  onClick={() => setEditor({ kind: "laborPayments" })}
                >
                  <HardHat size={18} />
                  Registrar pago
                </button>
              </div>
              {route === "/" && (
                <Dashboard
                  project={project}
                  data={data}
                  edit={() => setEditor({ kind: "projects", initial: project })}
                />
              )}{" "}
              {route === "/compras" && (
                <Purchases data={data} actions={actions} />
              )}{" "}
              {route === "/pendientes" && (
                <section className="panel">
                  <div className="section-heading">
                    <h2>Lo que sigue</h2>
                    <span>{live(data.pendingItems).length} pendientes</span>
                  </div>
                  {live(data.pendingItems).length === 0 ? (
                    <Empty text="Agrega tu primer material o actividad pendiente." />
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
                                  ![
                                    "completado",
                                    "cancelado",
                                    "recibido",
                                  ].includes(p.status)
                                    ? "overdue"
                                    : ""
                                }
                              >
                                {p.dueDate
                                  ? `Límite: ${dateLabel(p.dueDate)}`
                                  : "Sin fecha límite"}
                              </p>
                            </div>
                            <strong>
                              {money(total(p.quantity, p.unitPriceCents))}
                            </strong>
                            {actions("pendingItems", p)}
                          </div>
                          <div className="record-tools">
                            <select
                              aria-label={`Estado de ${p.material}`}
                              value={p.status}
                              onChange={(e) =>
                                mutate("pendingItems", {
                                  ...p,
                                  status: e.target
                                    .value as PendingItem["status"],
                                })
                              }
                            >
                              {pendingStates.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                            {!p.purchaseId &&
                              !["cancelado", "completado"].includes(
                                p.status,
                              ) && (
                                <button
                                  className="text-button"
                                  onClick={() => convert(p)}
                                >
                                  Convertir en compra <ArrowUpRight size={14} />
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
                                    {key === "buyDate" ? "Compra" : "Recepción"}
                                  </button>
                                ),
                            )}
                          </div>
                        </article>
                      ))
                  )}
                </section>
              )}
              {route === "/equipo" && (
                <Team
                  data={data}
                  actions={actions}
                  add={() => setEditor({ kind: "workers" })}
                />
              )}{" "}
              {route === "/precios" && <Prices data={data} />}{" "}
              {route === "/ajustes" && (
                <section className="panel">
                  <h2>Tu información, siempre contigo.</h2>
                  <p>
                    Exporta únicamente la obra activa:{" "}
                    <strong>{project.name}</strong>.
                  </p>
                  <div className="export-grid">
                    {(
                      ["purchases", "laborPayments", "pendingItems"] as const
                    ).map((kind) => (
                      <button
                        className="secondary"
                        key={kind}
                        disabled={!dataReady}
                        onClick={() =>
                          download(
                            `${kind}.csv`,
                            csv(data[kind].filter((r) => !r.deleted)),
                            "text/csv;charset=utf-8",
                          )
                        }
                      >
                        <Download size={18} />
                        {titles[kind]} CSV
                      </button>
                    ))}
                    <button
                      disabled={!dataReady}
                      onClick={() =>
                        download(
                          "obra-respaldo.json",
                          backup(project, data),
                          "application/json",
                        )
                      }
                    >
                      <Download size={18} />
                      Respaldo completo JSON
                    </button>
                  </div>
                  <hr />
                  <h2>Importar respaldo</h2>
                  <p>
                    Se validarán los datos y se creará una obra nueva en tu
                    cuenta. No se conserva ninguna identidad del archivo.
                  </p>
                  <input
                    aria-label="Importar JSON"
                    type="file"
                    accept="application/json,.json"
                    onChange={async (e) => {
                      try {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10000000) throw new Error();
                          setImported(parseBackup(await file.text()));
                        }
                      } catch {
                        setError(
                          "Archivo inválido. Selecciona un respaldo de Obra válido, de hasta 10 MB.",
                        );
                      }
                      e.target.value = "";
                    }}
                  />
                  {imported && (
                    <div className="import-preview">
                      <h3>Vista previa: {imported.project.name}</h3>
                      <p>Presupuesto: {money(imported.project.budgetCents)}</p>
                      {Object.entries(imported.data).map(([k, v]) => (
                        <p key={k}>
                          {titles[k as Kind]}: {v.length}
                        </p>
                      ))}
                      <button onClick={() => void doImport()}>
                        Confirmar importación en una obra nueva
                      </button>
                      <button
                        className="text-button"
                        onClick={() => setImported(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  <hr />
                  <h2>Configuración de la obra</h2>
                  <button
                    className="secondary"
                    onClick={() =>
                      setEditor({ kind: "projects", initial: project })
                    }
                  >
                    Editar obra y presupuesto
                  </button>
                  <button
                    className="text-button danger"
                    onClick={() => remove("projects", project)}
                  >
                    Eliminar obra
                  </button>
                  <p className="muted">
                    Instala Obra desde el menú del navegador o “Compartir →
                    Agregar a inicio” en iPhone. La primera carga requiere
                    conexión. Los datos locales solo están disponibles en este
                    navegador.
                  </p>
                  <button
                    className="text-button mobile-only"
                    onClick={async () => {
                      if (
                        pending &&
                        !window.confirm(
                          "Hay cambios pendientes. ¿Cerrar sesión y conservarlos para tu próxima sesión?",
                        )
                      )
                        return;
                      await signOutDatabases();
                      await signOut(auth);
                      window.location.assign("/");
                    }}
                  >
                    Cerrar sesión
                  </button>
                </section>
              )}
            </>
          )}
        </div>
        <footer className="page-footer">
          Hecho para construir con tranquilidad.
          <span>
            OBRA · {emulated ? "ENTORNO LOCAL" : "CONTROL DE CONSTRUCCIÓN"}
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
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <ClipboardList size={30} />
      <p>{text}</p>
      <small>Los registros que agregues aparecerán aquí.</small>
    </div>
  );
}
function Dashboard({
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
            <span>PRESUPUESTO DISPONIBLE</span>
            <ArrowUpRight size={21} />
          </div>
          <h2>{money(s.available)}</h2>
          <p>De {money(project.budgetCents)} presupuestados</p>
          <div className="budget-track">
            <i style={{ width: `${Math.min(s.percent || 0, 100)}%` }} />
          </div>
          <div>
            <small>
              {s.percent === null
                ? "Configura un presupuesto"
                : `${s.percent.toFixed(1)}% utilizado`}
            </small>
            <button className="text-button" onClick={edit}>
              Ver presupuesto →
            </button>
          </div>
        </section>
        <section className="stat-card">
          <span className="stat-icon">
            <ShoppingBag size={20} />
          </span>
          <p>Total gastado</p>
          <h2>{money(s.spent)}</h2>
          <small>Materiales + mano de obra</small>
        </section>
        <section className="stat-card">
          <span className="stat-icon amber">
            <Clock size={20} />
          </span>
          <p>Por pagar y comprar</p>
          <h2>{money(s.committed)}</h2>
          <small>Compromisos pendientes</small>
        </section>
      </div>
      {s.percent !== null && s.percent >= 80 && (
        <div className={"banner " + (s.percent >= 100 ? "error" : "warning")}>
          Atención: alcanzaste el{" "}
          {s.percent >= 100 ? "100" : s.percent >= 90 ? "90" : "80"} % del
          presupuesto.
        </div>
      )}
      {s.percent === null && (
        <div className="banner warning">
          Define un presupuesto para calcular el porcentaje utilizado.
        </div>
      )}
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Así se distribuye tu inversión</h2>
            <span>GASTOS REALES</span>
          </div>
          <div className="distribution">
            <div
              className="donut"
              style={{
                background: `conic-gradient(#214e40 0 ${s.spent ? (s.purchasesPaid / s.spent) * 100 : 0}%, #d7bd7b 0 ${s.spent ? 100 : 0}%, #e9ece5 0)`,
              }}
            >
              <div>
                <small>Total pagado</small>
                <strong>{money(s.spent)}</strong>
              </div>
            </div>
            <div className="legend">
              <div>
                <span className="dot green" />
                <span>
                  Materiales y servicios
                  <strong>{money(s.purchasesPaid)}</strong>
                </span>
              </div>
              <div>
                <span className="dot gold" />
                <span>
                  Mano de obra<strong>{money(s.laborPaid)}</strong>
                </span>
              </div>
              <p>Solo se incluyen pagos realizados.</p>
            </div>
          </div>
        </section>
        <section className="panel agenda">
          <div className="section-heading">
            <h2>En tu agenda</h2>
            <CalendarDays size={19} />
          </div>
          <div className="agenda-counts">
            <div>
              <strong>{due.length}</strong>
              <span>Vencidas</span>
            </div>
            <div>
              <strong>{now.length}</strong>
              <span>Para hoy</span>
            </div>
            <div>
              <strong>{upcoming.length}</strong>
              <span>Próximas</span>
            </div>
          </div>
          {[...due, ...now, ...upcoming].slice(0, 2).map((p) => (
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
              Sin actividades pendientes. ¡Todo al día!
            </p>
          )}
          <NavLink className="text-button" to="/pendientes">
            Ver todos los pendientes <ArrowUpRight size={16} />
          </NavLink>
        </section>
      </div>
      <section className="panel">
        <div className="section-heading">
          <h2>Últimas compras</h2>
          <NavLink className="text-button" to="/compras">
            Ver todas <ArrowUpRight size={15} />
          </NavLink>
        </div>
        {live(data.purchases).length === 0 ? (
          <Empty text="Tu primera compra es el inicio de un buen control." />
        ) : (
          live(data.purchases)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 4)
            .map((p) => (
              <div className="record-main recent" key={p.id}>
                <span className="record-icon">
                  <ShoppingBag size={20} />
                </span>
                <div>
                  <h3>{p.material}</h3>
                  <p>
                    {p.supplier || "Sin proveedor"} · {dateLabel(p.date)}
                  </p>
                </div>
                <span
                  className={
                    "badge " +
                    paymentStatus(
                      p.paidCents,
                      total(p.quantity, p.unitPriceCents),
                    )
                  }
                >
                  {paymentStatus(
                    p.paidCents,
                    total(p.quantity, p.unitPriceCents),
                  )}
                </span>
                <strong>{money(total(p.quantity, p.unitPriceCents))}</strong>
              </div>
            ))
        )}
      </section>
    </>
  );
}
function Purchases({
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
        <h2>Compras de tu obra</h2>
        <span>{rows.length} registros</span>
      </div>
      <div className="filters">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Buscar material o proveedor"
            placeholder="Buscar material o proveedor…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <select
          aria-label="Filtrar proveedor"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
        >
          <option value="">Todos los proveedores</option>
          {[...new Set(data.purchases.map((p) => p.supplier))]
            .filter(Boolean)
            .map((v) => (
              <option key={v}>{v}</option>
            ))}
        </select>
        <select
          aria-label="Filtrar categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {[...new Set(data.purchases.map((p) => p.category))]
            .filter(Boolean)
            .map((v) => (
              <option key={v}>{v}</option>
            ))}
        </select>
        <select
          aria-label="Filtrar estado de pago"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos los pagos</option>
          {["pagado", "parcial", "pendiente"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <label>
          Desde
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      {rows.length === 0 ? (
        <Empty text="No hay compras para estos filtros." />
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
                  {p.supplier || "Sin proveedor"}
                </p>
                <p>
                  {dateLabel(p.date)} · {p.category}
                </p>
              </div>
              <strong>{money(total(p.quantity, p.unitPriceCents))}</strong>
              {actions("purchases", p)}
            </div>
            <div className="record-tools">
              <span
                className={
                  "badge " +
                  paymentStatus(
                    p.paidCents,
                    total(p.quantity, p.unitPriceCents),
                  )
                }
              >
                {paymentStatus(
                  p.paidCents,
                  total(p.quantity, p.unitPriceCents),
                )}
              </span>
              <span>Pagado: {money(p.paidCents)}</span>
              <span>
                Saldo:{" "}
                {money(total(p.quantity, p.unitPriceCents) - p.paidCents)}
              </span>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
function Team({
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
          <h2>Las manos detrás de tu obra</h2>
          <button className="secondary" onClick={add}>
            <Plus size={16} />
            Trabajador
          </button>
        </div>
        {live(data.workers).length === 0 ? (
          <Empty text="Registra un trabajador antes de agregar sus pagos." />
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
          <h2>Compromisos y pagos</h2>
          <select
            aria-label="Historial por trabajador"
            value={worker}
            onChange={(e) => setWorker(e.target.value)}
          >
            <option value="">Todo el equipo</option>
            {data.workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="labor-totals">
          <span>
            Acordado{" "}
            <strong>
              {money(payments.reduce((s, p) => s + p.agreedCents, 0))}
            </strong>
          </span>
          <span>
            Pagado{" "}
            <strong>
              {money(payments.reduce((s, p) => s + p.paidCents, 0))}
            </strong>
          </span>
          <span>
            Pendiente{" "}
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
              <span className="badge">
                {paymentStatus(p.paidCents, p.agreedCents)}
              </span>
              <span>Pagado {money(p.paidCents)}</span>
              <span>Saldo {money(p.agreedCents - p.paidCents)}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
function Prices({ data }: { data: ProjectData }) {
  const [material, setMaterial] = useState(""),
    [unit, setUnit] = useState(""),
    [quantity, setQuantity] = useState("1"),
    [left, setLeft] = useState(""),
    [right, setRight] = useState("");
  const c = compare(data.purchases, material, unit),
    a = c.rows.find((p) => p.id === left),
    b = c.rows.find((p) => p.id === right);
  let saving: number | null = null;
  try {
    if (a && b)
      saving = total(quantity, Math.abs(a.unitPriceCents - b.unitPriceCents));
  } catch {
    /* Mostrar validación */
  }
  return (
    <section className="panel">
      <h2>Compra mejor, con historia.</h2>
      <p>
        Compara el mismo material y unidad. Los precios de medidas diferentes se
        mantienen separados.
      </p>
      <div className="filters">
        <label>
          Material
          <select
            value={material}
            onChange={(e) => {
              setMaterial(e.target.value);
              setUnit("");
              setLeft("");
              setRight("");
            }}
          >
            <option value="">Selecciona</option>
            {[...new Set(live(data.purchases).map((p) => p.material))].map(
              (m) => (
                <option key={m}>{m}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Unidad
          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setLeft("");
              setRight("");
            }}
          >
            <option value="">Selecciona</option>
            {[
              ...new Set(
                data.purchases
                  .filter((p) => p.material === material)
                  .map((p) => p.unit),
              ),
            ].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
      </div>
      {c.lowest !== null && (
        <div className="labor-totals">
          <span>
            Menor precio<strong>{money(c.lowest)}</strong>
          </span>
          <span>
            Más reciente<strong>{money(c.latest!)}</strong>
          </span>
        </div>
      )}
      {c.rows.length < 2 ? (
        <Empty text="Necesitas al menos dos compras del mismo material y unidad para comparar." />
      ) : (
        <>
          <div className="form-grid">
            {[
              [left, setLeft, "Compra A"],
              [right, setRight, "Compra B"],
            ].map(([value, setter, label]) => (
              <label key={String(label)}>
                {String(label)}
                <select
                  value={String(value)}
                  onChange={(e) =>
                    (setter as (s: string) => void)(e.target.value)
                  }
                >
                  <option value="">Selecciona una compra</option>
                  {c.rows.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.supplier} · {dateLabel(p.date)} ·{" "}
                      {money(p.unitPriceCents)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label>
              Cantidad a comprar
              <input
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
          </div>
          {a && b && (
            <div className="calculated">
              <span>
                Diferencia por {unit}:{" "}
                {money(Math.abs(a.unitPriceCents - b.unitPriceCents))} (
                {a.unitPriceCents
                  ? `${((Math.abs(a.unitPriceCents - b.unitPriceCents) / a.unitPriceCents) * 100).toFixed(2)}% respecto a A`
                  : "Porcentaje no disponible: precio A es cero"}
                )
              </span>
              <strong>
                Ahorro estimado:{" "}
                {saving === null ? "Cantidad inválida" : money(saving)}
              </strong>
            </div>
          )}
        </>
      )}
      {c.rows.map((p: Purchase) => (
        <div className="record-main recent" key={p.id}>
          <div>
            <h3>{p.supplier || "Sin proveedor"}</h3>
            <p>
              {dateLabel(p.date)} · {p.quantity} {p.unit}
            </p>
          </div>
          <strong>{money(p.unitPriceCents)}</strong>
        </div>
      ))}
    </section>
  );
}
