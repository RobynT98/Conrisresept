// src/pages/Notes.tsx
import { useEffect, useRef, useState } from "react";
import { getAllNotes, putNote, deleteNote } from "../db";
import type { Note } from "../types";
import { uuid } from "../state";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const list = await getAllNotes();
    setNotes(list);
  }

  async function onSave() {
    const t = text.trim();
    if (!t) return;

    if (editingId) {
      const existing = notes.find(n => n.id === editingId);
      if (!existing) return;
      const updated: Note = {
        ...existing,
        text: t,
        updatedAt: Date.now(),
      };
      await putNote(updated);
      setEditingId(null);
    } else {
      const newNote: Note = {
        id: uuid(),
        text: t,
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await putNote(newNote);
    }
    setText("");
    await refresh();
    inputRef.current?.focus();
  }

  async function onEdit(n: Note) {
    setEditingId(n.id);
    setText(n.text);
    inputRef.current?.focus();
  }

  async function onPinToggle(n: Note) {
    await putNote({ ...n, pinned: !n.pinned, updatedAt: Date.now() });
    await refresh();
  }

  async function onDelete(n: Note) {
    if (!confirm("Ta bort anteckningen?")) return;
    await deleteNote(n.id);
    if (editingId === n.id) {
      setEditingId(null);
      setText("");
    }
    await refresh();
  }

  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl">Anteckningar</h1>

      {/* Editor */}
      <div className="rounded-2xl border border-amber-100 bg-white/70 p-3 sm:p-4 space-y-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv en idé, ett tips eller ett minne…"
          rows={4}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        <div className="flex items-center gap-2">
          <button onClick={onSave} className="btn-primary">
            {editingId ? "Spara ändring" : "Spara anteckning"}
          </button>
          {editingId && (
            <button
              className="btn-ghost"
              onClick={() => {
                setEditingId(null);
                setText("");
              }}
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
        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-2xl border border-amber-100 bg-white/70 p-3 sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="whitespace-pre-wrap">{n.text}</div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    className={
                      "px-3 py-1.5 rounded-lg border text-sm " +
                      (n.pinned
                        ? "border-forest/30 text-forest/80 bg-forest/5"
                        : "border-neutral-300 text-neutral-700 bg-white")
                    }
                    onClick={() => onPinToggle(n)}
                    title={n.pinned ? "Lossa" : "Fäst"}
                  >
                    {n.pinned ? "Fäst" : "Fäst?"}
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm bg-white"
                    onClick={() => onEdit(n)}
                  >
                    Redigera
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-sm text-red-700 bg-white hover:bg-red-50"
                    onClick={() => onDelete(n)}
                  >
                    Ta bort
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                {formatDate(n.updatedAt)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatDate(ts: number) {
  try {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return "";
  }
}