import { useEffect, useState } from "react";
import { getAllNotes, putNote, deleteNote } from "../db";
import type { Note } from "../types";
import { uuid } from "../state";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    setNotes(await getAllNotes());
  }

  function startEdit(n: Note) {
    setEditingId(n.id);
    setText(n.text);
  }

  async function save() {
    const now = Date.now();
    if (editingId) {
      const old = notes.find(n => n.id === editingId)!;
      await putNote({ ...old, text: text.trim(), updatedAt: now });
    } else if (text.trim()) {
      await putNote({
        id: uuid(),
        text: text.trim(),
        pinned: false,
        createdAt: now,
        updatedAt: now
      });
    }
    setText("");
    setEditingId(null);
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Ta bort anteckningen?")) return;
    await deleteNote(id);
    if (editingId === id) { setEditingId(null); setText(""); }
    await refresh();
  }

  async function togglePin(n: Note) {
    await putNote({ ...n, pinned: !n.pinned, updatedAt: Date.now() });
    await refresh();
  }

  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl">Anteckningar</h1>

      {/* Editor */}
      <div className="rounded-2xl border border-amber-100 bg-white/70 p-3 shadow-sm space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv en idé, ett tips eller ett minne…"
          rows={4}
          className="w-full rounded-xl border px-3 py-2"
        />
        <div className="flex items-center justify-between">
          <button
            className="btn-primary"
            onClick={save}
            disabled={!text.trim()}
          >
            {editingId ? "Uppdatera anteckning" : "Spara anteckning"}
          </button>
          {editingId && (
            <button
              className="btn-ghost"
              onClick={() => { setEditingId(null); setText(""); }}
            >
              Avbryt
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      {notes.length === 0 ? (
        <p className="text-neutral-600">Inga anteckningar än.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-2xl border border-amber-100 bg-white/70 p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap">{n.text}</p>
                <div className="flex gap-2 shrink-0">
                  <button className="btn-ghost text-xs" onClick={() => togglePin(n)}>
                    {n.pinned ? "Lossa" : "Fäst"}
                  </button>
                  <button className="btn-ghost text-xs" onClick={() => startEdit(n)}>
                    Redigera
                  </button>
                  <button className="btn text-xs border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => remove(n.id)}>
                    Ta bort
                  </button>
                </div>
              </div>
              <div className="mt-1 text-[11px] text-neutral-500">
                {fmt(n.updatedAt)} {n.pinned ? "• Fäst" : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function fmt(ts: number) {
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(ts);
  } catch {
    return new Date(ts).toLocaleString();
  }
}