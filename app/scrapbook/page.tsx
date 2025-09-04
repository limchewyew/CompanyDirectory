'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Building2, Lock, BookOpen, ArrowRight } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry: string;
  country: string;
}

export default function ScrapbookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [unlockedCompanies, setUnlockedCompanies] = useState<string[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchUnlockedCompanies();
      fetchAllCompanies();
    }
  }, [status, router]);

  const fetchUnlockedCompanies = async () => {
    try {
      const response = await fetch('/api/unlock');
      if (response.ok) {
        const data = await response.json();
        setUnlockedCompanies(data.unlockedCompanies || []);
      }
    } catch (error) {
      console.error('Error fetching unlocked companies:', error);
    }
  };

  const fetchAllCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setAllCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching all companies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Scrapbook</h1>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200">
        <div className="px-5 py-3">
          <h1 className="text-3xl font-semibold text-gray-700 uppercase tracking-wider ml-1 font-montserrat"> </h1>
        </div>
      </header>
      
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-11/12 mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <p className="text-3xl text-gray-700 font-montserrat font-semibold">My Scrapbook</p>
            <button
              onClick={() => router.push('/collector')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Collector
            </button>
          </div>
        </div>
      </div>

      <div className="w-11/12 mx-auto px-6 py-10">

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Collection</h2>
            <p className="text-gray-600 mb-6">
              {unlockedCompanies.length} of {allCompanies.length} companies unlocked
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allCompanies.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Your scrapbook is empty</h3>
                  <p className="text-gray-500 mb-4">Open packs in the collector to add companies to your collection</p>
                  <button
                    onClick={() => router.push('/collector')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Collector
                  </button>
                </div>
              ) : allCompanies.map((company) => {
                const isUnlocked = unlockedCompanies.includes(company.id);
                return (
                  <div
                    key={company.id}
                    className={`relative rounded-lg border p-4 transition-all duration-300 ${
                      isUnlocked ? 'bg-white shadow-md' : 'bg-gray-50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {company.logo ? (
                          <img
                            src={`/logos/${company.logo}`}
                            alt={company.name}
                            className="h-12 w-12 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-company.png';
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {company.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{company.industry}</p>
                      </div>
                    </div>
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
