"use client";
import React, { useState } from 'react';

export default function DeleteListButton({ listId }: { listId: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        if (busy) return;
        if (!confirm('Delete this list? This cannot be undone.')) return;
        setBusy(true);
        try {
          const res = await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
          if (res.ok) {
            if (typeof window !== 'undefined') window.location.href = '/lists';
          } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || 'Failed to delete list');
          }
        } finally {
          setBusy(false);
        }
      }}
      className="text-sm px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
      disabled={busy}
    >
      {busy ? 'Deleting…' : 'Delete list'}
    </button>
  );
}
