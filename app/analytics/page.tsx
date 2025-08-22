'use client'

import React, { useState, useEffect, useRef } from 'react'
import { BarChart3, PieChart, TrendingUp, Building2, Globe, DollarSign, Users, Calendar, Filter as FilterIcon } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Add this custom hook for click-outside detection
const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback])
}

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
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])

  // Filter states (multi-select)
  const [countryFilter, setCountryFilter] = useState<string[]>([])
  const [industryFilter, setIndustryFilter] = useState<string[]>([])
  const [subIndustryFilter, setSubIndustryFilter] = useState<string[]>([])

  // Total min/max filter
  const [totalMin, setTotalMin] = useState<string>('')
  const [totalMax, setTotalMax] = useState<string>('')

  // Interactive chart filter states
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedScoreRange, setSelectedScoreRange] = useState<number | null>(null)

  // Dropdown open states
  const [openCountry, setOpenCountry] = useState(false)
  const [openIndustry, setOpenIndustry] = useState(false)
  const [openSubIndustry, setOpenSubIndustry] = useState(false)

  // Filter search states
  const [countrySearch, setCountrySearch] = useState('')
  const [industrySearch, setIndustrySearch] = useState('')
  const [subIndustrySearch, setSubIndustrySearch] = useState('')

  // Filter bar visibility
  const [showFilterBar, setShowFilterBar] = useState(false)

  // Add refs for dropdown containers
  const countryDropdownRef = useRef<HTMLDivElement>(null)
  const industryDropdownRef = useRef<HTMLDivElement>(null)
  const subIndustryDropdownRef = useRef<HTMLDivElement>(null)

  // Add click-outside handlers
  useClickOutside(countryDropdownRef, () => setOpenCountry(false))
  useClickOutside(industryDropdownRef, () => setOpenIndustry(false))
  useClickOutside(subIndustryDropdownRef, () => setOpenSubIndustry(false))

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

  // Unique filter options
  const countryOptions = Array.from(new Set((companies ?? []).map(c => c.country).filter(Boolean)))
  const industryOptions = Array.from(new Set((companies ?? []).map(c => c.industry).filter(Boolean)))
  const subIndustryOptions = Array.from(new Set((companies ?? []).map(c => c.subIndustry).filter(Boolean)))

  // Filtered options for dropdowns
  const filteredCountryOptions = countryOptions.filter(option => option.toLowerCase().includes(countrySearch.toLowerCase())).sort((a, b) => a.localeCompare(b))
  const filteredIndustryOptions = industryOptions.filter(option => option.toLowerCase().includes(industrySearch.toLowerCase())).sort((a, b) => a.localeCompare(b))
  const filteredSubIndustryOptions = subIndustryOptions.filter(option => option.toLowerCase().includes(subIndustrySearch.toLowerCase())).sort((a, b) => a.localeCompare(b))

  // Apply filters to companies
  useEffect(() => {
    let filtered = companies.filter(company => {
      const matchesCountry = countryFilter.length > 0 ? countryFilter.includes(company.country) : true
      const matchesIndustry = industryFilter.length > 0 ? industryFilter.includes(company.industry) : true
      const matchesSubIndustry = subIndustryFilter.length > 0 ? subIndustryFilter.includes(company.subIndustry) : true
      const matchesTotalMin = totalMin !== '' ? company.total >= Number(totalMin) : true
      const matchesTotalMax = totalMax !== '' ? company.total <= Number(totalMax) : true
      
      // Interactive chart filters
      const matchesSelectedIndustry = selectedIndustry ? company.industry === selectedIndustry : true
      const matchesSelectedCountry = selectedCountry ? company.country === selectedCountry : true
      const matchesSelectedScoreRange = selectedScoreRange ? 
        (company.total >= selectedScoreRange && company.total < selectedScoreRange + 5) : true
      
      return matchesCountry && matchesIndustry && matchesSubIndustry && matchesTotalMin && matchesTotalMax &&
             matchesSelectedIndustry && matchesSelectedCountry && matchesSelectedScoreRange
    })

    setFilteredCompanies(filtered)
  }, [companies, countryFilter, industryFilter, subIndustryFilter, totalMin, totalMax, 
      selectedIndustry, selectedCountry, selectedScoreRange])

  // Clear all filters handler
  const handleClearAllFilters = () => {
    setCountryFilter([])
    setIndustryFilter([])
    setSubIndustryFilter([])
    setCountrySearch('')
    setIndustrySearch('')
    setSubIndustrySearch('')
    setTotalMin('')
    setTotalMax('')
    setSelectedIndustry(null)
    setSelectedCountry(null)
    setSelectedScoreRange(null)
  }

  // Chart interaction handlers
  const handleIndustryClick = (industry: string) => {
    setSelectedIndustry(selectedIndustry === industry ? null : industry)
    setSelectedCountry(null)
    setSelectedScoreRange(null)
    setSubIndustryFilter([])
  }

  const handleSubIndustryClick = (subIndustry: string) => {
    setSubIndustryFilter(
      subIndustryFilter.includes(subIndustry) 
        ? subIndustryFilter.filter(s => s !== subIndustry)
        : [...subIndustryFilter, subIndustry]
    )
    setSelectedIndustry(null)
    setSelectedCountry(null)
    setSelectedScoreRange(null)
  }

  const handleCountryClick = (country: string) => {
    setSelectedCountry(selectedCountry === country ? null : country)
    setSelectedIndustry(null)
    setSelectedScoreRange(null)
  }

  const handleScoreRangeClick = (scoreRange: number) => {
    setSelectedScoreRange(selectedScoreRange === scoreRange ? null : scoreRange)
    setSelectedIndustry(null)
    setSelectedCountry(null)
  }

  // Calculate analytics data based on filtered companies
  const totalCompanies = filteredCompanies.length
  const countries = new Set(filteredCompanies.map(c => c.country)).size
  const industries = new Set(filteredCompanies.map(c => c.industry)).size
  
  // Top industries by company count
  const industryCounts = filteredCompanies.reduce((acc, company) => {
    acc[company.industry] = (acc[company.industry] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const allIndustries = Object.entries(industryCounts)
    .sort(([,a], [,b]) => b - a)

  // All sub-industries by company count
  const subIndustryCounts = filteredCompanies.reduce((acc, company) => {
    if (company.subIndustry) {
      acc[company.subIndustry] = (acc[company.subIndustry] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  const allSubIndustries = Object.entries(subIndustryCounts)
    .sort(([,a], [,b]) => b - a)

  // Top countries by company count
  const countryCounts = filteredCompanies.reduce((acc, company) => {
    acc[company.country] = (acc[company.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const allCountries = Object.entries(countryCounts)
    .sort(([,a], [,b]) => b - a)

  // Score distributions from 20 to 100 - using 5 as interval
  const scoreRanges: { [key: number]: number } = {}
  for (let i = 20; i <= 100; i += 5) {
    scoreRanges[i] = 0
  }

  filteredCompanies.forEach(company => {
    // Group all scores into 5-point intervals
    const interval = Math.floor(company.total / 5) * 5
    scoreRanges[interval] = (scoreRanges[interval] || 0) + 1
  })

  // Average scores by category
  const avgHistory = totalCompanies > 0 ? filteredCompanies.reduce((sum, c) => sum + c.history, 0) / totalCompanies : 0
  const avgBrandAwareness = totalCompanies > 0 ? filteredCompanies.reduce((sum, c) => sum + c.brandAwareness, 0) / totalCompanies : 0
  const avgMoat = totalCompanies > 0 ? filteredCompanies.reduce((sum, c) => sum + c.moat, 0) / totalCompanies : 0
  const avgSize = totalCompanies > 0 ? filteredCompanies.reduce((sum, c) => sum + c.size, 0) / totalCompanies : 0
  const avgInnovation = totalCompanies > 0 ? filteredCompanies.reduce((sum, c) => sum + c.innovation, 0) / totalCompanies : 0
  const avgTotal = totalCompanies > 0 ? filteredCompanies.reduce((sum, c) => sum + c.total, 0) / totalCompanies : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200">
        <div className="px-5 py-3">
          <h1 className="text-3xl font-semibold text-gray-700 uppercase tracking-wider ml-1 font-montserrat"> </h1>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-11/12 mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <p className="text-3xl text-gray-700 font-montserrat font-semibold">Analytics</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 border border-gray-300"
                  aria-label="Show filters"
                  onClick={() => setShowFilterBar(v => !v)}
                >
                  <FilterIcon className={`h-5 w-5 ${showFilterBar ? 'text-blue-600' : 'text-gray-500'}`} />
                </button>
                
                {/* Interactive Filter Indicator */}
                {(selectedIndustry || selectedCountry || selectedScoreRange) && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                    <span className="text-xs text-blue-700 font-medium">Active Filters:</span>
                    {selectedIndustry && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Industry: {selectedIndustry}
                      </span>
                    )}
                    {selectedCountry && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Country: {selectedCountry}
                      </span>
                    )}
                    {selectedScoreRange && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Score: {selectedScoreRange}-{selectedScoreRange + 4}
                      </span>
                    )}
                    <button
                      onClick={handleClearAllFilters}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Filter Bar - Only show if toggled */}
          {showFilterBar && (
            <div className="flex flex-wrap items-start gap-4 mt-4 z-10 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in">
              {/* Filter dropdowns */}
              <div className="flex flex-wrap gap-4 flex-1">
                {/* Total Min/Max Filter */}
                <div className="flex flex-col justify-end min-w-[170px]">
                  <label className="block font-sans text-xs text-gray-500 mb-1">Total Range</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      className="w-[150px] h-9 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400 text-sm"
                      placeholder="Min"
                      value={totalMin}
                      onChange={e => setTotalMin(e.target.value)}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      min="0"
                      className="w-[150px] h-9 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-400 text-sm"
                      placeholder="Max"
                      value={totalMax}
                      onChange={e => setTotalMax(e.target.value)}
                    />
                  </div>
                </div>
                {/* Country Multi-select */}
                <div className="relative min-w-[150px]" ref={countryDropdownRef}>
                  <label className="block font-sans text-xs text-gray-500 mb-1">Country</label>
                  <div
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white cursor-pointer flex flex-wrap gap-1 min-h-[36px] items-center"
                    onClick={() => { setOpenCountry(v => !v); setOpenIndustry(false); setOpenSubIndustry(false); }}
                  >
                    {countryFilter.length === 0 && <span className="text-gray-400">All</span>}
                    {countryFilter.map(opt => (
                      <span
                        key={opt}
                        className="bg-blue-500 text-white rounded px-2 py-0.5 font-sans text-xs mr-1 mb-1 flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          setCountryFilter(countryFilter.filter(c => c !== opt));
                        }}
                      >{opt} <span className="ml-1 cursor-pointer">×</span></span>
                    ))}
                    <span className="ml-auto text-xs text-gray-400">▼</span>
                  </div>
                  {openCountry && (
                    <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
                      <div className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-400 text-sm"
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                        />
                      </div>
                      {filteredCountryOptions.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm">No results</div>
                      )}
                      {filteredCountryOptions.map(option => (
                        <label key={option} className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            className="form-checkbox mr-2"
                            checked={countryFilter.includes(option)}
                            onChange={() => {
                              setCountryFilter(
                                countryFilter.includes(option)
                                  ? countryFilter.filter(f => f !== option)
                                  : [...countryFilter, option]
                              );
                            }}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {/* Industry Multi-select */}
                <div className="relative min-w-[150px]" ref={industryDropdownRef}>
                  <label className="block font-sans text-xs text-gray-500 mb-1">Industry</label>
                  <div
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white cursor-pointer flex flex-wrap gap-1 min-h-[36px] items-center"
                    onClick={() => { setOpenIndustry(v => !v); setOpenCountry(false); setOpenSubIndustry(false); }}
                  >
                    {industryFilter.length === 0 && <span className="text-gray-400">All</span>}
                    {industryFilter.map(opt => (
                      <span
                        key={opt}
                        className="bg-blue-500 text-white rounded px-2 py-0.5 font-sans text-xs mr-1 mb-1 flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          setIndustryFilter(industryFilter.filter(i => i !== opt));
                        }}
                      >{opt} <span className="ml-1 cursor-pointer">×</span></span>
                    ))}
                    <span className="ml-auto text-xs text-gray-400">▼</span>
                  </div>
                  {openIndustry && (
                    <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
                      <div className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-400 text-sm"
                          placeholder="Search industry..."
                          value={industrySearch}
                          onChange={e => setIndustrySearch(e.target.value)}
                        />
                      </div>
                      {filteredIndustryOptions.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm">No results</div>
                      )}
                      {filteredIndustryOptions.map(option => (
                        <label key={option} className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            className="form-checkbox mr-2"
                            checked={industryFilter.includes(option)}
                            onChange={() => {
                              setIndustryFilter(
                                industryFilter.includes(option)
                                  ? industryFilter.filter(f => f !== option)
                                  : [...industryFilter, option]
                              );
                            }}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {/* Subsector Multi-select */}
                <div className="relative min-w-[150px]" ref={subIndustryDropdownRef}>
                  <label className="block font-sans text-xs text-gray-500 mb-1">Subsector</label>
                  <div
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white cursor-pointer flex flex-wrap gap-1 min-h-[36px] items-center"
                    onClick={() => { setOpenSubIndustry(v => !v); setOpenCountry(false); setOpenIndustry(false); }}
                  >
                    {subIndustryFilter.length === 0 && <span className="text-gray-400">All</span>}
                    {subIndustryFilter.map(opt => (
                      <span
                        key={opt}
                        className="bg-blue-500 text-white rounded px-2 py-0.5 font-sans text-xs mr-1 mb-1 flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          setSubIndustryFilter(subIndustryFilter.filter(s => s !== opt));
                        }}
                      >{opt} <span className="ml-1 cursor-pointer">×</span></span>
                    ))}
                    <span className="ml-auto text-xs text-gray-400">▼</span>
                  </div>
                  {openSubIndustry && (
                    <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
                      <div className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-400 text-sm"
                          placeholder="Search sub-industry..."
                          value={subIndustrySearch}
                          onChange={e => setSubIndustrySearch(e.target.value)}
                        />
                      </div>
                      {filteredSubIndustryOptions.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm">No results</div>
                      )}
                      {filteredSubIndustryOptions.map(option => (
                        <label key={option} className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            className="form-checkbox mr-2"
                            checked={subIndustryFilter.includes(option)}
                            onChange={() => {
                              setSubIndustryFilter(
                                subIndustryFilter.includes(option)
                                  ? subIndustryFilter.filter(f => f !== option)
                                  : [...subIndustryFilter, option]
                              );
                            }}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Clear All Filters button at right */}
              <div className="ml-auto flex items-center">
                <button
                  type="button"
                  className="px-4 py-2 mt-4 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-600 font-sans text-xs font-medium transition-all self-center"
                  onClick={handleClearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

       <div className="w-11/12 mx-auto px-6 py-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Companies */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200">
                <Building2 className="h-6 w-6 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Companies</p>
                <p className="text-2xl font-bold text-slate-900">{totalCompanies.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200">
                <Globe className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Countries</p>
                <p className="text-2xl font-bold text-slate-900">{countries}</p>
              </div>
            </div>
          </div>

          {/* Industries */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-purple-50 border border-purple-200">
                <BarChart3 className="h-6 w-6 text-purple-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Industries</p>
                <p className="text-2xl font-bold text-slate-900">{industries}</p>
              </div>
            </div>
          </div>

          {/* Average Total Score */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-yellow-50 border border-yellow-200">
                <TrendingUp className="h-6 w-6 text-yellow-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Average Total Score</p>
                <p className="text-2xl font-bold text-slate-900">{avgTotal.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-700 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
                SCORE DISTRIBUTION
              </h3>
            </div>
            <div className="h-48">
              <Bar
                data={{
                  labels: Object.keys(scoreRanges).map(score => score),
                  datasets: [
                    {
                      label: 'Number of Companies',
                      data: Object.values(scoreRanges),
                      backgroundColor: Object.keys(scoreRanges).map(score => 
                        selectedScoreRange === Number(score) 
                          ? 'rgba(239, 68, 68, 0.9)' 
                          : 'rgba(59, 130, 246, 0.8)'
                      ),
                      borderColor: Object.keys(scoreRanges).map(score => 
                        selectedScoreRange === Number(score) 
                          ? 'rgba(239, 68, 68, 1)' 
                          : 'rgba(59, 130, 246, 1)'
                      ),
                      borderWidth: Object.keys(scoreRanges).map(score => 
                        selectedScoreRange === Number(score) ? 3 : 1
                      ),
                      borderRadius: 4,
                      borderSkipped: false,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  onClick: (event, elements) => {
                    if (elements.length > 0) {
                      const index = elements[0].index
                      const scoreRange = Number(Object.keys(scoreRanges)[index])
                      handleScoreRangeClick(scoreRange)
                    }
                  },
                  onHover: (event, elements) => {
                    const target = event.native.target as HTMLElement
                    target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        title: (context) => `Score ${context[0].label}-${Number(context[0].label) + 4}`,
                        label: (context) => `${context.parsed.y} companies`
                      }
                    }
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Score'
                      },
                      ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Number of Companies'
                      },
                      beginAtZero: true,
                      ticks: {
                        stepSize: 500
                      }
                    }
                  }
                }}
              />
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

        {/* Top Industries, Sub-Industries, and Countries */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Left column - Industry and Sub-industry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Industry Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                All Industries ({allIndustries.length})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {allIndustries.map(([industry, count], index) => {
                // Calculate bar width based on the highest count for better visibility
                const maxCount = Math.max(...allIndustries.map(([, c]) => c))
                const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
                const isSelected = selectedIndustry === industry
                
                return (
                  <div 
                    key={industry} 
                    className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleIndustryClick(industry)}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <span className={`text-sm font-medium w-8 flex-shrink-0 ${
                        isSelected ? 'text-purple-600' : 'text-gray-400'
                      }`}>#{index + 1}</span>
                      <span className={`text-sm font-medium break-words ${
                        isSelected ? 'text-purple-700' : 'text-gray-700'
                      }`} title={industry}>
                        {industry}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isSelected ? 'bg-purple-700' : 'bg-purple-600'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium w-16 text-right ${
                        isSelected ? 'text-purple-700' : 'text-gray-700'
                      }`}>{count}</span>
                    </div>
                  </div>
                )
                })}
              </div>
            </div>

            {/* Sub-industry Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                All Sub-Industries ({allSubIndustries.length})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {allSubIndustries.map(([subIndustry, count], index) => {
                  // Calculate bar width based on the highest count for better visibility
                  const maxCount = Math.max(...allSubIndustries.map(([, c]) => c))
                  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
                  const isSelected = subIndustryFilter.includes(subIndustry)
                  
                  return (
                    <div 
                      key={subIndustry} 
                      className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSubIndustryClick(subIndustry)}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <span className={`text-sm font-medium w-8 flex-shrink-0 ${
                          isSelected ? 'text-blue-600' : 'text-gray-400'
                        }`}>#{index + 1}</span>
                        <span className={`text-sm font-medium break-words ${
                          isSelected ? 'text-blue-700' : 'text-gray-700'
                        }`} title={subIndustry}>
                          {subIndustry}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              isSelected ? 'bg-blue-700' : 'bg-blue-600'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium w-16 text-right ${
                          isSelected ? 'text-blue-700' : 'text-gray-700'
                        }`}>{count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right column - Countries */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-green-600" />
                All Countries ({allCountries.length})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {allCountries.map(([country, count], index) => {
                // Calculate bar width based on the highest count for better visibility
                const maxCount = Math.max(...allCountries.map(([, c]) => c))
                const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
                const isSelected = selectedCountry === country
                
                return (
                  <div 
                    key={country} 
                    className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCountryClick(country)}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <span className={`text-sm font-medium w-8 flex-shrink-0 ${
                        isSelected ? 'text-green-600' : 'text-gray-400'
                      }`}>#{index + 1}</span>
                      <span className={`text-sm font-medium break-words ${
                        isSelected ? 'text-green-700' : 'text-gray-700'
                      }`} title={country}>
                        {country}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isSelected ? 'bg-green-700' : 'bg-green-600'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium w-16 text-right ${
                        isSelected ? 'text-green-700' : 'text-gray-700'
                      }`}>{count}</span>
                    </div>
                  </div>
                )
                })}
              </div>
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
