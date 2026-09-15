import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Auth } from "../features/auth/AuthPage";
import { workspaceText } from "../locales/es/workspace";
import { auth } from "../services/firebase";
import { Workspace } from "./Workspace";

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (user === undefined)
    return <div className="loading">{workspaceText.loadingSession}</div>;
  return user ? <Workspace key={user.uid} user={user} /> : <Auth />;
}
