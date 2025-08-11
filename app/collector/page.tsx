'use client'

import React from 'react'

export default function Collector() {
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
            <p className="text-3xl text-gray-700 font-montserrat font-semibold">Collector</p>
            <div />
          </div>
        </div>
      </div>

      <div className="w-11/12 mx-auto px-6 py-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <p className="text-gray-700">This page is reserved for data collection tools and workflows. Coming soon.</p>
        </div>
      </div>
    </div>
  )
}


