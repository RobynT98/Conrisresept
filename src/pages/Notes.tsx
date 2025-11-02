import { useEffect, useMemo, useRef, useState } from "react";
import { getNotes, saveNotes, Note } from "../db";
import { uuid } from "../state";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [q, setQ] = useState("");
  const [newText, setNewText] = useState("");
  const [undo, setUndo] = useState<{ note: Note; timer: number } | null>(null);

  // inline edit-state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    getNotes().then(setNotes);
  }, []);

  // ------- helpers -------
  function persist(next: Note[]) {
    setNotes(next);
    saveNotes(next);
  }

  function addNote() {
    const text = newText.trim();
    if (!text) return;
    const now = Date.now();
    const n: Note = {
      id: uuid(),
      text,
      pinned: false,
      createdAt: now,
      updatedAt: now
    };
    const next = [n, ...notes];
    setNewText("");
    persist(next);
  }

  function pinToggle(id: string) {
    const next = notes.map(n =>
      n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n
    );
    persist(next);
  }

  function beginEdit(n: Note) {
    setEditingId(n.id);
    setEditingText(n.text);
  }

  function onEditChange(val: string) {
    setEditingText(val);
    // autosave med debounce 500ms
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (!editingId) return;
      const next = notes.map(n =>
        n.id === editingId ? { ...n, text: val, updatedAt: Date.now() } : n
      );
      persist(next);
    }, 500);
  }

  function finishEdit() {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setEditingId(null);
  }

  function softDelete(id: string) {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    const next = notes.filter(x => x.id !== id);
    persist(next);

    // visa ångra i 5 sek
    const timer = window.setTimeout(() => setUndo(null), 5000);
    setUndo({ note: n, timer });
  }

  function undoDelete() {
    if (!undo) return;
    window.clearTimeout(undo.timer);
    const next = [undo.note, ...notes];
    setUndo(null);
    persist(next);
  }

  // ------- filtrering + sortering -------
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = s
      ? notes.filter(n => n.text.toLowerCase().includes(s))
      : notes;

    // fästa överst, annars nyast uppdaterad först
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, q]);

  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl">Anteckningar</h1>

      {/* Skriv ny */}
      <div className="rounded-2xl border bg-white/70 p-3 space-y-2">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          rows={4}
          placeholder="Skriv en idé, ett tips eller ett minne…"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2"
        />
        <button
          onClick={addNote}
          className="px-4 py-2 rounded-lg bg-forest text-white"
        >
          Spara anteckning
        </button>
      </div>

      {/* Sök */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Sök i anteckningar…"
        className="w-full rounded-lg border border-neutral-300 px-3 py-2"
      />

      {/* Tomt-läge */}
      {list.length === 0 ? (
        <p className="text-neutral-600 text-sm">Inga anteckningar än.</p>
      ) : null}

      {/* Lista */}
      <div className="space-y-3">
        {list.map((n) => (
          <NoteRow
            key={n.id}
            note={n}
            isEditing={editingId === n.id}
            editingText={editingText}
            onStartEdit={() => beginEdit(n)}
            onChangeEdit={onEditChange}
            onEndEdit={finishEdit}
            onPin={() => pinToggle(n.id)}
            onDelete={() => softDelete(n.id)}
          />
        ))}
      </div>

      {/* Ångra-rad */}
      {undo && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-20">
          <div className="rounded-full border bg-white shadow-paper px-3 py-2 flex items-center gap-3">
            <span className="text-sm">Anteckning raderad.</span>
            <button
              className="px-3 py-1 rounded-full border border-forest/30 text-forest/80 bg-white hover:bg-forest/5"
              onClick={undoDelete}
            >
              Ångra
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function NoteRow({
  note,
  isEditing,
  editingText,
  onStartEdit,
  onChangeEdit,
  onEndEdit,
  onPin,
  onDelete,
}: {
  note: Note;
  isEditing: boolean;
  editingText: string;
  onStartEdit: () => void;
  onChangeEdit: (v: string) => void;
  onEndEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const updated = new Date(note.updatedAt).toLocaleString("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="rounded-2xl border bg-white/70 p-3">
      {/* text/inline edit */}
      {isEditing ? (
        <textarea
          autoFocus
          value={editingText}
          onChange={(e) => onChangeEdit(e.target.value)}
          onBlur={onEndEdit}
          rows={3}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 mb-2"
        />
      ) : (
        <div
          className="cursor-text whitespace-pre-wrap"
          onClick={onStartEdit}
          title="Klicka för att redigera"
        >
          {note.text}
        </div>
      )}

      {/* metadata + actions */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-neutral-500">Uppdaterad {updated}</div>
        <div className="flex gap-2">
          <button
            className={
              "px-3 py-1.5 rounded-lg border bg-white/70 transition " +
              (note.pinned
                ? "border-forest/40 text-forest/80"
                : "border-neutral-300 text-neutral-700 hover:bg-forest/5")
            }
            onClick={onPin}
          >
            {note.pinned ? "Fäst" : "Fäst"}
          </button>
          {!isEditing && (
            <button
              className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 bg-white/70 hover:bg-butter/40"
              onClick={onStartEdit}
            >
              Redigera
            </button>
          )}
          <button
            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-white/70 hover:bg-red-50"
            onClick={onDelete}
          >
            Ta bort
          </button>
        </div>
      </div>
    </div>
  );
}