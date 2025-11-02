import { useEffect, useState } from "react";
import { uuid } from "../state";

type Note = {
  id: string;
  text: string;
  updatedAt: number;
};

const LS_KEY = "notes.v1";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try { setNotes(JSON.parse(raw)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(notes));
  }, [notes]);

  function addNote() {
    const t = draft.trim();
    if (!t) return;
    setNotes([{ id: uuid(), text: t, updatedAt: Date.now() }, ...notes]);
    setDraft("");
  }

  function updateNote(id: string, text: string) {
    setNotes(ns =>
      ns.map(n => n.id === id ? { ...n, text, updatedAt: Date.now() } : n)
    );
  }

  function removeNote(id: string) {
    if (!confirm("Ta bort anteckningen?")) return;
    setNotes(ns => ns.filter(n => n.id !== id));
  }

  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl">Anteckningar</h1>

      {/* Ny anteckning */}
      <div className="panel p-3 grid gap-2">
        <textarea
          className="field min-h-[80px]"
          placeholder="Skriv en idé, ett tips eller ett minne…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
        <div className="flex justify-end">
          <button className="btn-primary" onClick={addNote}>Spara anteckning</button>
        </div>
      </div>

      {/* Lista */}
      {notes.length === 0 ? (
        <p className="text-neutral-600">Inga anteckningar än.</p>
      ) : (
        <ul className="grid gap-3">
          {notes.map(n => (
            <li key={n.id} className="rounded-2xl border border-amber-100 bg-white/70 p-3 shadow-sm">
              <textarea
                className="w-full resize-y bg-transparent outline-none"
                value={n.text}
                onChange={e => updateNote(n.id, e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span>Uppdaterad {new Date(n.updatedAt).toLocaleString()}</span>
                <button className="text-red-600" onClick={() => removeNote(n.id)}>Ta bort</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}