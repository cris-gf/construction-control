import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  connectFirestoreEmulator,
  doc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { schemas, type Kind, type RecordData } from "./domain";
const env = import.meta.env;
export const emulated = env.VITE_USE_EMULATORS === "true";
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN || "demo-construction.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "demo-construction",
  appId: env.VITE_FIREBASE_APP_ID || "demo-app",
};
if (!emulated && (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID))
  throw new Error("Falta configurar Firebase. Consulta .env.example.");
const app = initializeApp(config);
export const auth = getAuth(app);
const host = env.VITE_EMULATOR_HOST || "localhost";
if (emulated)
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
const databases = new Map<string, Firestore>();
export function database(uid: string) {
  if (auth.currentUser?.uid !== uid) throw new Error("Sesión no válida.");
  const found = databases.get(uid);
  if (found) return found;
  // El nombre de Firebase App separa físicamente IndexedDB por cuenta.
  const name = `user-${uid}`;
  const userApp =
    getApps().find((a) => a.name === name) || initializeApp(config, name);
  const db = initializeFirestore(userApp, {
    localCache:
      localStorage.getItem("trusted-device") === "yes"
        ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        : memoryLocalCache(),
  });
  // Firestore usa Auth de esta app; comparte la sesión mediante el mismo usuario autenticado.
  const userAuth = getAuth(userApp);
  if (emulated)
    connectAuthEmulator(userAuth, `http://${host}:9099`, {
      disableWarnings: true,
    });
  if (emulated) connectFirestoreEmulator(db, host, 8080);
  databases.set(uid, db);
  return db;
}
export async function prepareDatabase(uid: string) {
  const db = database(uid);
  const userApp = getApps().find((a) => a.name === `user-${uid}`)!;
  await getAuth(userApp).updateCurrentUser(auth.currentUser);
  return db;
}
export async function signOutDatabases() {
  for (const a of getApps())
    if (a.name.startsWith("user-")) await getAuth(a).signOut();
}
export function ref(
  db: Firestore,
  uid: string,
  projectId: string,
  kind: Kind,
  id: string,
) {
  if (
    auth.currentUser?.uid !== uid ||
    !uid ||
    [projectId, id].some((v) => v.includes("/"))
  )
    throw new Error("Ruta no válida.");
  return kind === "projects"
    ? doc(db, "users", uid, "projects", id)
    : doc(db, "users", uid, "projects", projectId, kind, id);
}
export function save(
  db: Firestore,
  uid: string,
  projectId: string,
  kind: Kind,
  value: RecordData,
  other?: { kind: Kind; value: RecordData },
) {
  const batch = writeBatch(db);
  const parsed = schemas[kind].parse(value);
  if (parsed.projectId !== (kind === "projects" ? parsed.id : projectId))
    throw new Error("El registro no pertenece a la obra activa.");
  batch.set(ref(db, uid, projectId, kind, value.id), parsed);
  if (other)
    batch.set(
      ref(db, uid, projectId, other.kind, other.value.id),
      schemas[other.kind].parse(other.value),
    );
  return batch.commit();
}
