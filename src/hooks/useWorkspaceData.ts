import { type User } from "firebase/auth";
import { collection, onSnapshot, type Firestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { emptyData, live, type Project, type ProjectData } from "../domain";
import { workspaceText } from "../locales/es/workspace";
import { prepareDatabase } from "../services/firebase";

export function useWorkspaceData(user: User) {
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
    [error, setError] = useState("");
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
      .catch(() => setError(workspaceText.storageFailed));
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
      () => setError(workspaceText.projectsFailed),
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
        () => setError(workspaceText.recordsFailed),
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

  return {
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
  };
}
