"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Company = { id: string | number; name?: string };

export default function AddToListForm({ listId }: { listId: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [showList, setShowList] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}&limit=12`, { signal: ac.signal, cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setShowList(true);
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedId }),
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
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedId('');
          }}
          onFocus={() => query && setShowList(true)}
          placeholder="Search company by name…"
          className="w-full border rounded px-3 py-2"
        />
        {showList && results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-h-72 overflow-auto bg-white border rounded shadow">
            {results.map((c) => (
              <li
                key={String(c.id)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => {
                  setQuery(c.name || '');
                  setSelectedId(String(c.id));
                  setShowList(false);
                }}
              >
                {c.name || `Company`}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!selectedId || busy}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded"
        >
          {busy ? 'Adding…' : 'Add to list'}
        </button>
        {selectedId && (
          <span className="text-xs text-gray-500 self-center">Selected</span>
        )}
      </div>
    </form>
  );
}
