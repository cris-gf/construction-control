import { signOut } from "firebase/auth";
import { routes } from "../config/routes";
import { workspaceText } from "../locales/es/workspace";
import { auth, signOutDatabases } from "./firebase";
export async function closeSession(hasPendingWrites: boolean) {
  if (hasPendingWrites && !window.confirm(workspaceText.confirmSignOut)) return;
  await signOutDatabases();
  await signOut(auth);
  window.location.assign(routes.dashboard);
}
