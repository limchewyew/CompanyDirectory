'use client'

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react'
import { Lock, ArrowRight, BookOpen } from 'lucide-react'

type Company = {
  id: number | string
  name: string
  logo?: string
  website?: string
  country?: string
  industry?: string
  subIndustry?: string
  yearFounded?: string | number
  employees?: string | number
  history?: number
  brandAwareness?: number
  moat?: number
  size?: number
  innovation?: number
  total?: number
  description?: string
}

export default function Collector() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [opening, setOpening] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<Company | null>(null);
  const [unlockedCompanies, setUnlockedCompanies] = useState<string[]>([]);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/companies', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) setCompanies(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function randPick<T>(arr: T[]): T | null {
    if (!arr || arr.length === 0) return null
    const i = Math.floor(Math.random() * arr.length)
    return arr[i]
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUnlockedCompanies();
    }
  }, [status]);

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

  async function handleOpenPack() {
    if (opening) return;
    
    if (!session) {
      setShowSignInPrompt(true);
      return;
    }
    
    setRevealed(false);
    setSelected(null);
    setOpening(true);
    
    try {
      // Simple opening animation timeline
      await new Promise(r => setTimeout(r, 900));
      const pick = randPick(companies);
      setSelected(pick);
      
      // Add to unlocked companies if not already unlocked
      if (pick && status === 'authenticated') {
        try {
          await fetch('/api/unlock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyId: pick.id }),
          });
          setUnlockedCompanies(prev => [...prev, String(pick.id)]);
        } catch (error) {
          console.error('Error unlocking company:', error);
        }
      }
      
      await new Promise(r => setTimeout(r, 250));
      setRevealed(true);
    } finally {
      setOpening(false);
    }
  }

  const canOpen = useMemo(() => !loading && companies.length > 0 && !opening, [loading, companies.length, opening])

  const handleViewScrapbook = () => {
    if (status === 'authenticated') {
      router.push('/scrapbook');
    } else {
      signIn('google');
    }
  };

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
            <p className="text-3xl text-gray-700 font-montserrat font-semibold">Collector's Scrapbook</p>
            <div className="flex items-center space-x-4">
              {status === 'authenticated' && (
                <button
                  onClick={() => router.push('/scrapbook')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BookOpen size={18} />
                  <span>View My Scrapbook</span>
                </button>
              )}
              {status !== 'authenticated' && (
                <button
                  onClick={() => signIn('google')}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Lock size={18} />
                  <span>Sign In to Save</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-11/12 mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Pack Simulator */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Pack Opening Simulator</h2>
                <p className="text-sm text-gray-500">Open a pack to reveal a random company card.</p>
              </div>
              {showSignInPrompt && !session && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-6 rounded-2xl z-10">
                  <Lock className="h-10 w-10 text-white mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Sign In Required</h3>
                  <p className="text-gray-200 text-center mb-6">Sign in to unlock and save companies to your scrapbook collection.</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowSignInPrompt(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={() => signIn('google')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <span>Sign In with Google</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={handleOpenPack}
                disabled={!canOpen}
                className={`px-6 py-3 rounded-full font-medium text-white transition-all duration-300 transform relative overflow-hidden ${
                  canOpen ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:scale-105' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {opening ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Opening...
                  </span>
                ) : (
                  <span>Open Pack</span>
                )}
              </button>
            </div>

            {/* Pack visual */}
            <div className="relative h-56 flex items-center justify-center">
              <div
                className={`w-52 h-32 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-md flex items-center justify-center transition-all duration-700 ease-out ${
                  opening ? 'scale-110 rotate-3 shadow-xl' : ''
                }`}
              >
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider text-gray-500">Company Pack</div>
                  <div className="mt-1 text-lg font-semibold text-gray-700">Series A</div>
                  {/* Shimmer */}
                  <div className={`mt-3 h-8 w-28 rounded-md bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-[length:200%_100%] ${opening ? 'animate-pulse' : ''}`}></div>
                </div>
              </div>
              {/* Glow effect when opening */}
              {opening && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/20 via-cyan-100/10 to-purple-100/20 blur-2xl" />
                </div>
              )}
            </div>

            {/* Helper text */}
            <div className="text-xs text-gray-500 mt-4">
              {loading ? 'Loading companies…' : companies.length === 0 ? 'No companies available.' : 'Click "Open Pack" to reveal a card.'}
            </div>
          </div>

          {/* Reveal Area */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[22rem] flex items-center justify-center">
            {!revealed || !selected ? (
              <div className="text-center text-gray-500">
                <div className="text-sm">Your card will appear here.</div>
              </div>
            ) : (
              <div className="relative">
              <CompanyCard 
                company={selected} 
                isUnlocked={status === 'authenticated' && unlockedCompanies.includes(String(selected.id))}
              />
              {selected && status === 'unauthenticated' && (
                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                  <Lock className="h-8 w-8 text-white mb-2" />
                  <p className="text-white font-medium mb-3">Sign in to save this company to your collection</p>
                  <button
                    onClick={() => signIn('google')}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <span>Sign In with Google</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: number | string | undefined }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
      <span className="text-[11px] uppercase tracking-wider text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value ?? '-'}</span>
    </div>
  )
}

function CompanyCard({ company, isUnlocked = true }: { company: Company; isUnlocked?: boolean }) {
  return (
    <div className="w-full max-w-md">
      {/* Card wrapper */}
      <div className={`relative ${!isUnlocked ? 'opacity-70' : ''}`}>
        {/* subtle border gradient */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" aria-hidden />
        <div className="relative rounded-2xl bg-white p-6 shadow-lg">
          {!isUnlocked && (
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-2xl flex items-center justify-center z-10">
              <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                <Lock size={16} />
                <span className="text-sm font-medium">Locked</span>
              </div>
            </div>
          )}
          <div className="flex items-start gap-4">
            {/* Logo */}
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt="logo" className="w-10 h-10 object-contain bg-white border border-gray-200 rounded-md" />
            ) : (
              <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 truncate">{company.name}</h3>
                {company.total != null && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">Score: {company.total}</span>
                )}
              </div>
              {company.industry && (
                <div className="mt-0.5 text-sm text-gray-600 truncate">{company.industry}</div>
              )}
              {company.website && (
                <a href={company.website} target="_blank" className="mt-1 inline-block text-[13px] text-blue-600 hover:underline truncate">
                  {company.website}
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatPill label="Country" value={company.country || '-'} />
            <StatPill label="Founded" value={company.yearFounded ?? '-'} />
            <StatPill label="Employees" value={company.employees ?? '-'} />
            <StatPill label="Sub-industry" value={company.subIndustry ?? '-'} />
          </div>

          {/* Scores */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatPill label="History" value={company.history} />
            <StatPill label="Brand" value={company.brandAwareness} />
            <StatPill label="Moat" value={company.moat} />
            <StatPill label="Size" value={company.size} />
            <StatPill label="Innov." value={company.innovation} />
          </div>

          {/* View details */}
          <div className="mt-6 flex items-center justify-end">
            <a
              href={`/companies/${company.id}`}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              View details
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}


