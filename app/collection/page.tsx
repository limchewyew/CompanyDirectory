'use client';

import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';

type CollectionItem = {
  id: string;
  name: string;
  // Add other collection item properties as needed
};

export default function CollectionPage() {
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated' && !!session?.user?.email;
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthed) {
      // TODO: Fetch user's collection data
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isAuthed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sign in to view your collection</h2>
          <p className="text-gray-600 mb-6">Please sign in to view and manage your collection.</p>
          <button
            onClick={() => signIn('google')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-100">
        <div className="px-5 py-3">
          <h1 className="text-3xl font-medium text-gray-700 tracking-wide ml-1 font-montserrat"> </h1>
        </div>
      </header>
      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b border-gray-50">
        <div className="w-11/12 mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-2xl text-gray-700 font-montserrat font-light tracking-wide">My Collection</p>
            <div />
          </div>
        </div>
      </div>

      <main className="container mx-auto p-6">
        {collection.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-700 mb-2">Your collection is empty</h2>
            <p className="text-gray-500">Start adding items to your collection to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                {/* Add more item details here */}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}