"use client";
import React, { useEffect, useState } from 'react';

export default function EditModeToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const cls = 'edit-mode-on';
    if (on) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
    return () => document.body.classList.remove(cls);
  }, [on]);
  return (
    <button
      type="button"
      onClick={() => {
        setOn(v => {
          const next = !v;
          // notify listeners
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('edit-mode-change', { detail: next }));
          }
          return next;
        });
      }}
      className={`text-sm px-3 py-1.5 rounded ${on ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-200 hover:bg-gray-300'} text-white`}
      title="Toggle edit mode for this page"
    >
      {on ? 'Editing…' : 'Edit mode'}
    </button>
  );
}
