"use client";
import React, { useState } from 'react';

export default function RemoveItemButton({ listId, companyId }: { listId: string; companyId: string | number }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        if (busy) return;
        setBusy(true);
        try {
          const res = await fetch(`/api/lists/${listId}/items/${companyId}`, { method: 'DELETE' });
          if (res.ok) {
            if (typeof window !== 'undefined') window.location.reload();
          } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || 'Failed to remove company');
          }
        } finally {
          setBusy(false);
        }
      }}
      className="text-sm px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
      disabled={busy}
    >
      {busy ? 'Removing…' : 'Remove'}
    </button>
  );
}
