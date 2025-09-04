'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react';

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
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated' && !!session?.user?.email;
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [opening, setOpening] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<Company | null>(null)

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

  async function handleOpenPack() {
    if (opening) return
    setRevealed(false)
    setSelected(null)
    setOpening(true)
    // Simple opening animation timeline
    await new Promise(r => setTimeout(r, 900))
    const pick = randPick(companies)
    setSelected(pick)
    await new Promise(r => setTimeout(r, 250))
    setRevealed(true)
    setOpening(false)
  }

  const canOpen = useMemo(() => !loading && companies.length > 0 && !opening, [loading, companies.length, opening])

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
            <div>
              {isAuthed ? (
                <button onClick={() => signOut()} className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm">Sign out</button>
              ) : (
                <button onClick={() => signIn('google')} className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">Sign in with Google</button>
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
              <button
                onClick={handleOpenPack}
                disabled={!canOpen}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                  canOpen ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {opening ? 'Opening…' : 'Open Pack'}
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
              <CompanyCard company={selected} />
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

function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="w-full max-w-md">
      {/* Card wrapper */}
      <div className="relative">
        {/* subtle border gradient */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" aria-hidden />
        <div className="relative rounded-2xl bg-white p-6 shadow-lg">
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
