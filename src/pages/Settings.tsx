import { Link } from "react-router-dom";
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
      <h1 className="font-display text-3xl">Mer</h1>

      {/* Snabblänkar */}
      <div className="grid gap-3">
        <CardLink to="/notes" title="Anteckningar" subtitle="Fria blad för idéer, minnen och lärdomar." />
        <CardLink to="/shopping" title="Inköpslista" subtitle="Planera, bocka av eller hämta från recept." />
        <CardLink to="/recipe/new" title="Nytt recept" subtitle="Lägg till från grunden." />
      </div>

      {/* Import / Export */}
      <div className="rounded-2xl border border-amber-100 bg-white/70 p-4 shadow-sm space-y-3">
        <h2 className="font-display text-xl">Backup</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={doExport} className="btn-primary">Exportera recept</button>
          <label className="btn cursor-pointer">
            Importera från fil
            <input type="file" accept="application/json" onChange={doImport} className="hidden" />
          </label>
        </div>
        <p className="text-sm text-neutral-600">
          Allt lagras lokalt på enheten. Ingen inloggning. Ingen delning.
        </p>
      </div>
    </section>
  );
}

function CardLink({ to, title, subtitle }:{to:string; title:string; subtitle:string}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-amber-100 bg-white/70 p-3 shadow-sm block hover:bg-white"
    >
      <div className="font-medium">{title}</div>
      <div className="text-sm text-neutral-600">{subtitle}</div>
    </Link>
  );
}