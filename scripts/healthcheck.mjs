try {
  const response = await fetch("http://127.0.0.1:4400/emulators");
  const state = await response.json();
  for (const name of ["auth", "firestore", "hosting"]) {
    if (!state[name]) throw new Error("Emulador aún no disponible");
    await fetch(`http://127.0.0.1:${state[name].port}/`, {
      signal: AbortSignal.timeout(1500),
    });
  }
} catch {
  process.exit(1);
}
