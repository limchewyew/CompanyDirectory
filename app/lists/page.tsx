"use client";
import React, { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

// Metadata is provided by app/lists/layout.tsx (server component)

type List = { id: string; ownerEmail: string; name: string; isPublic: boolean; createdAt: string; itemCount?: number };

export default function ListsPage() {
  const { data: session, status } = useSession();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListPublic, setNewListPublic] = useState(true);
  const isAuthed = status === 'authenticated' && !!session?.user?.email;

  async function loadLists() {
    setLoading(true);
    try {
      const res = await fetch('/api/lists', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setLists(data as List[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLists();
  }, [status]);

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName.trim()) return;
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newListName.trim(), isPublic: newListPublic }),
    });
    if (res.ok) {
      setNewListName('');
      await loadLists();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Failed to create list');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-100">
        <div className="px-5 py-3">
          <h1 className="text-3xl font-medium text-gray-700 tracking-wide ml-1 font-montserrat"> </h1>
        </div>
      </header>

      {/* Title Bar */}
      <div className="bg-white shadow-sm border-b border-gray-50">
        <div className="w-11/12 mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-2xl text-gray-700 font-montserrat font-light tracking-wide">Lists</p>
            <div>
              {isAuthed ? (
                <button 
                  onClick={() => signOut()} 
                  className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm border border-gray-200 transition-colors"
                >
                  Sign out
                </button>
              ) : (
                <button 
                  onClick={() => signIn('google')} 
                  className="px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-11/12 mx-auto px-6 py-6 space-y-8">
        {isAuthed && (
          <form onSubmit={handleCreateList} className="bg-white border rounded p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="New list name"
                className="flex-1 border rounded px-3 py-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={newListPublic} onChange={e => setNewListPublic(e.target.checked)} />
                Public
              </label>
              <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Create list</button>
            </div>
          </form>
        )}

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">All public lists{isAuthed ? ' + yours' : ''}</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : lists.length === 0 ? (
            <p className="text-sm text-gray-500">No lists yet.</p>
          ) : (
            <ul className="grid md:grid-cols-2 gap-3">
              {lists.map(l => (
                <li key={l.id} className="bg-white border rounded p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{l.name} {typeof l.itemCount === 'number' && (
                        <span className="ml-2 text-xs text-gray-500">({l.itemCount} {l.itemCount === 1 ? 'company' : 'companies'})</span>
                      )}</p>
                      <p className="text-xs text-gray-500">Owner: {l.ownerEmail}</p>
                    </div>
                    <a href={`/lists/${l.id}`} className="text-blue-600 hover:underline text-sm">Open</a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
