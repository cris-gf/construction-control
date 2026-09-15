import { appConfig } from "../config/appConfig";
export function csv(rows: object[]) {
  const keys = [...new Set(rows.flatMap(Object.keys))];
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return (
    "\uFEFF" +
    [
      keys.map(cell).join(","),
      ...rows.map((r) =>
        keys.map((k) => cell((r as Record<string, unknown>)[k])).join(","),
      ),
    ].join("\r\n")
  );
}
export function download(name: string, contents: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(
    () => URL.revokeObjectURL(url),
    appConfig.backup.downloadUrlLifetimeMs,
  );
}
