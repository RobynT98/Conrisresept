import { exportAll, importAll } from "../db";

export default function Settings() {
  async function doExport() {
    const payload = await exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conrisresept.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function doImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const json = JSON.parse(await file.text());
    await importAll(json);
    alert("Importerat!");
  }

  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl">Inställningar</h1>
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <button onClick={doExport} className="px-3 py-2 rounded bg-forest text-white">
          Exportera recept
        </button>
        <label className="block">
          <span className="text-sm">Importera från fil</span>
          <input type="file" accept="application/json" onChange={doImport} className="block mt-1" />
        </label>
        <p className="text-sm text-neutral-600">
          Allt lagras lokalt på enheten. Ingen inloggning. Ingen delning.
        </p>
      </div>
    </section>
  );
}