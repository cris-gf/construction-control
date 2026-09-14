import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

export async function seedSession(config, create = false) {
  const app = initializeApp(config.firebase);
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (config.target === "emulator") {
    connectAuthEmulator(auth, `http://${config.host}:9099`, {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, config.host, 8080);
  }
  if (create) {
    try {
      await createUserWithEmailAndPassword(auth, config.email, config.password);
    } catch (error) {
      if (error.code !== "auth/email-already-in-use") throw error;
      await signInWithEmailAndPassword(auth, config.email, config.password);
    }
  } else await signInWithEmailAndPassword(auth, config.email, config.password);
  return { auth, db };
}
