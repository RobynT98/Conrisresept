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

  function autosize(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }

  async function onSave() {
    const t = text.trim();
    if (!t) return;

    if (editingId) {
      const existing = notes.find((n) => n.id === editingId);
      if (!existing) return;
      await putNote({ ...existing, text: t, updatedAt: Date.now() });
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

  function onEdit(n: Note) {
    setEditingId(n.id);
    setText(n.text);
    requestAnimationFrame(() => autosize(inputRef.current));
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
      e.preventDefault();
      onSave();
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl">Anteckningar</h1>

      {/* Editor */}
      <div className="rounded-2xl border border-amber-100 bg-white/70 p-3 sm:p-4 space-y-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autosize(e.currentTarget);
          }}
          onKeyDown={onKeyDown}
          placeholder="Skriv en idé, ett tips eller ett minne…"
          rows={4}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        <div className="flex items-center gap-2">
          <button onClick={onSave} className="px-4 py-1.5 rounded-lg bg-forest text-white">
            {editingId ? "Spara ändring" : "Spara anteckning"}
          </button>
          {editingId && (
            <button
              className="px-4 py-1.5 rounded-lg border border-neutral-300 bg-white"
              onClick={() => {
                setEditingId(null);
                setText("");
              }}
            >
              Avbryt
            </button>
          )}
          <span className="ml-auto text-xs text-neutral-500 hidden sm:inline">
            Ctrl/⌘ + Enter för att spara
          </span>
        </div>
      </div>

      {/* Header info */}
      <div className="text-sm text-neutral-600">
        {notes.length === 0 ? "Inga anteckningar än." : `${notes.length} anteckning${notes.length > 1 ? "ar" : ""}`}
      </div>

      {/* Lista */}
      <ul className="space-y-3">
        {notes.map((n) => (
          <li
            key={n.id}
            className={
              "rounded-2xl border p-3 sm:p-4 transition-colors " +
              (n.pinned
                ? "bg-butter/20 border-amber-200"
                : "bg-white/70 border-amber-100")
            }
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 whitespace-pre-wrap">{n.text}</div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  className={
                    "px-3 py-1.5 rounded-lg border text-sm transition-colors " +
                    (n.pinned
                      ? "border-forest/30 text-forest/80 bg-forest/5"
                      : "border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50")
                  }
                  onClick={() => onPinToggle(n)}
                  title={n.pinned ? "Lossa" : "Fäst"}
                >
                  {n.pinned ? "Lossa" : "Fäst"}
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm bg-white hover:bg-neutral-50"
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
            <div className="mt-2 text-xs text-neutral-500 text-right">
              {formatDate(n.updatedAt)}
            </div>
          </li>
        ))}
      </ul>
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