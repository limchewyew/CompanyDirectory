import React from 'react';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lists | Companies Directory',
  description: 'Manage and view your saved lists.'
};

export default function ListsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
