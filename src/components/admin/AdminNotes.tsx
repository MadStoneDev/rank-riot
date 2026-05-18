"use client";

import { useState, useEffect } from "react";
import {
  IconNote,
  IconTrash,
  IconSend,
  IconLoader2,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_email?: string;
  author_name?: string;
}

interface AdminNotesProps {
  targetType: "user" | "project";
  targetId: string;
  initialNotes: Note[];
}

export default function AdminNotes({
  targetType,
  targetId,
  initialNotes,
}: AdminNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  async function handleAdd() {
    if (!content.trim()) return;

    setAdding(true);
    setError(null);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          targetType,
          targetId,
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add note");
        return;
      }

      setNotes((prev) => [data.note, ...prev]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    setError(null);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_note", noteId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete note");
        return;
      }

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--color-border-default)] flex items-center gap-2">
        <IconNote className="h-4 w-4 text-[var(--color-text-muted)]" />
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Admin Notes
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          ({notes.length})
        </span>
      </div>

      {/* Add note form */}
      <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="flex-1 rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-colors resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAdd();
              }
            }}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !content.trim()}
            className="self-end inline-flex items-center gap-1 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {adding ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconSend className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && (
          <p className="mt-1 text-xs text-[var(--color-score-critical)]">
            {error}
          </p>
        )}
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="px-5 py-6 text-center text-sm text-[var(--color-text-muted)]">
          No notes yet
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border-subtle)]">
          {notes.map((note) => (
            <div
              key={note.id}
              className="px-5 py-3 group hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap flex-1">
                  {note.content}
                </p>
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-score-critical)] hover:bg-[var(--color-score-critical)]/10 transition-all disabled:opacity-40"
                  title="Delete note"
                >
                  {deletingId === note.id ? (
                    <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <IconTrash className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {note.author_name ||
                    note.author_email ||
                    note.author_id.slice(0, 8)}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {note.created_at
                    ? formatDistanceToNow(new Date(note.created_at), {
                        addSuffix: true,
                      })
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
