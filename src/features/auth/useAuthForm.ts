import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import type { FormEvent } from "react";
import { useState } from "react";
import { appConfig } from "../../config/appConfig";
import { authText } from "../../locales/es/auth";
import { auth } from "../../services/firebase";
export function useAuthForm() {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [trusted, setTrusted] = useState(
      localStorage.getItem(appConfig.storage.trustedDeviceKey) === "yes",
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      localStorage.setItem(
        appConfig.storage.trustedDeviceKey,
        trusted ? "yes" : "no",
      );
      if (mode === "register")
        await createUserWithEmailAndPassword(auth, email, password);
      else if (mode === "login")
        await signInWithEmailAndPassword(auth, email, password);
      else {
        await sendPasswordResetEmail(auth, email);
        setError(authText.resetSent);
      }
    } catch {
      setError(authText.authenticationFailed);
    } finally {
      setBusy(false);
    }
  };
  return {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    trusted,
    setTrusted,
    error,
    busy,
    submit,
  };
}
