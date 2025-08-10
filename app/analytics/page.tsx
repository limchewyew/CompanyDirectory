'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, PieChart, TrendingUp, Building2, Globe, DollarSign, Users, Calendar } from 'lucide-react'

interface Company {
  id: number
  name: string
  description: string
  country: string
  industry: string
  subIndustry: string
  yearFounded: string
  employees: string
  history: number
  brandAwareness: number
  moat: number
  size: number
  innovation: number
  total: number
  website: string
  logo: string
}

export default function Analytics() {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCompanies(data)
        } else if (Array.isArray(data?.companies)) {
          setCompanies(data.companies)
        } else {
          setCompanies([])
        }
      })
  }, [])

  // Calculate analytics data
  const totalCompanies = companies.length
  const countries = new Set(companies.map(c => c.country)).size
  const industries = new Set(companies.map(c => c.industry)).size
  
  // Top industries by company count
  const industryCounts = companies.reduce((acc, company) => {
    acc[company.industry] = (acc[company.industry] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topIndustries = Object.entries(industryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)

  // Top countries by company count
  const countryCounts = companies.reduce((acc, company) => {
    acc[company.country] = (acc[company.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topCountries = Object.entries(countryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)

  // Score distributions
  const scoreRanges = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  }

  companies.forEach(company => {
    if (company.total <= 20) scoreRanges['0-20']++
    else if (company.total <= 40) scoreRanges['21-40']++
    else if (company.total <= 60) scoreRanges['41-60']++
    else if (company.total <= 80) scoreRanges['61-80']++
    else scoreRanges['81-100']++
  })

  // Average scores by category
  const avgHistory = companies.reduce((sum, c) => sum + c.history, 0) / totalCompanies
  const avgBrandAwareness = companies.reduce((sum, c) => sum + c.brandAwareness, 0) / totalCompanies
  const avgMoat = companies.reduce((sum, c) => sum + c.moat, 0) / totalCompanies
  const avgSize = companies.reduce((sum, c) => sum + c.size, 0) / totalCompanies
  const avgInnovation = companies.reduce((sum, c) => sum + c.innovation, 0) / totalCompanies
  const avgTotal = companies.reduce((sum, c) => sum + c.total, 0) / totalCompanies

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200">
        <div className="px-5 py-3">
          <h1 className="text-3xl font-light text-gray-500 uppercase tracking-wider ml-1"> </h1>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-11/12 mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <p className="text-3xl text-gray-600">Analytics</p>
            <div className="flex items-center space-x-4">
              {/* Analytics page doesn't need search/filter controls, but keeping the structure */}
            </div>
          </div>
        </div>
      </div>

      <div className="w-11/12 mx-auto px-6 py-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 shadow-lg border border-blue-300">
                <Building2 className="h-8 w-8 text-blue-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{totalCompanies.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-green-200 via-green-400 to-green-600 shadow-lg border border-green-300">
                <Globe className="h-8 w-8 text-green-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-2xl font-bold text-gray-900">{countries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-200 via-purple-400 to-purple-600 shadow-lg border border-purple-300">
                <BarChart3 className="h-8 w-8 text-purple-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Industries</p>
                <p className="text-2xl font-bold text-gray-900">{industries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-lg border border-yellow-300">
                <TrendingUp className="h-8 w-8 text-yellow-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Total Score</p>
                <p className="text-2xl font-bold text-gray-900">{avgTotal.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Score Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(scoreRanges).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{range}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / totalCompanies) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Average Scores by Category */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-green-600" />
              Average Scores by Category
            </h3>
            <div className="space-y-3">
              {[
                { label: 'History', value: avgHistory, color: 'bg-blue-500' },
                { label: 'Brand Awareness', value: avgBrandAwareness, color: 'bg-green-500' },
                { label: 'Moat', value: avgMoat, color: 'bg-purple-500' },
                { label: 'Size', value: avgSize, color: 'bg-yellow-500' },
                { label: 'Innovation', value: avgInnovation, color: 'bg-red-500' },
                { label: 'Total', value: avgTotal, color: 'bg-indigo-500' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${(item.value / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{item.value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Industries and Countries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Industries */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-purple-600" />
              Top Industries
            </h3>
            <div className="space-y-3">
              {topIndustries.map(([industry, count], index) => (
                <div key={industry} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-400 w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={industry}>
                      {industry}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(count / totalCompanies) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-green-600" />
              Top Countries
            </h3>
            <div className="space-y-3">
              {topCountries.map(([country, count], index) => (
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-400 w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={country}>
                      {country}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(count / totalCompanies) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-4">
            Analytics dashboard for educational purposes only.
          </p>
          <p>Data visualization and insights from the company database.</p>
        </footer>
      </div>
    </div>
  )
}
