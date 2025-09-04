'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Building2, ArrowLeft } from 'lucide-react'

type Company = {
  id: number | string
  name: string
  logo?: string
  industry?: string
  description?: string
  history?: number
  brandAwareness?: number
  moat?: number
  size?: number
  innovation?: number
  total?: number
}

export default function CollectionPage() {
  const [collection, setCollection] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    async function loadCollection() {
      if (!session?.user?.email) {
        setLoading(false)
        return
      }

      try {
        // First get the collection items
        const collectionRes = await fetch('/api/collection')
        if (!collectionRes.ok) throw new Error('Failed to load collection')
        
        const collectionItems = await collectionRes.json()
        if (!collectionItems.length) {
          setLoading(false)
          return
        }

        // Get the company details for each collected item
        const companiesRes = await fetch('/api/companies')
        if (!companiesRes.ok) throw new Error('Failed to load companies')
        
        const allCompanies = await companiesRes.json()
        const collectedCompanies = allCompanies.filter((company: Company) =>
          collectionItems.some((item: any) => String(item.companyId) === String(company.id))
        )

        setCollection(collectedCompanies)
      } catch (error) {
        console.error('Error loading collection:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCollection()
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/collector" className="mr-4">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Collection</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-500">Loading your collection...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/collector" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Collection</h1>
          <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {collection.length} {collection.length === 1 ? 'card' : 'cards'}
          </span>
        </div>

        {collection.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your collection is empty</h2>
            <p className="text-gray-500 mb-6">Open packs in the collector to add cards to your collection</p>
            <Link
              href="/collector"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Collector
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collection.map((company) => (
              <div key={company.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-center space-x-4 mb-4">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/default-company.png'
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{company.name}</h3>
                      {company.industry && (
                        <p className="text-sm text-gray-500 truncate">{company.industry}</p>
                      )}
                    </div>
                  </div>
                  
                  {company.total !== undefined && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Score</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {company.total}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
