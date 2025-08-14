"use client";
import React, { useState } from 'react';

type Company = { id: string | number; name?: string };

export default function AddToListForm({ listId, companies }: { listId: string; companies: Company[] }) {
  const [companyId, setCompanyId] = useState<string>('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to add company');
      } else if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <select
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        className="border rounded px-3 py-2 min-w-[260px]"
      >
        <option value="">Select a company…</option>
        {companies.map((c) => (
          <option key={String(c.id)} value={String(c.id)}>
            {c.name ? `${c.name} (#${c.id})` : `Company #${c.id}`}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!companyId || busy}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded"
      >
        {busy ? 'Adding…' : 'Add to list'}
      </button>
    </form>
  );
}
