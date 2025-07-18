'use client'

import React, { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Building2, Globe, DollarSign, Star, Filter as FilterIcon } from 'lucide-react'

interface Company {
  id: number
  name: string
  description: string
  country: string
  industry: string
  subIndustry: string
  history: number
  brandAwareness: number
  moat: number
  size: number
  innovation: number
  total: number
  website: string
  logo: string
}

// No mockCompanies, live data will be fetched from API

function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`
  }
  return `$${value.toLocaleString()}`
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Home() {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50); // You can adjust this default value

  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'history' | 'brandAwareness' | 'moat' | 'size' | 'innovation' | 'total' | 'name'>('total');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter states (multi-select)
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [subIndustryFilter, setSubIndustryFilter] = useState<string[]>([]);

  // Total min/max filter
  const [totalMin, setTotalMin] = useState<string>('');
  const [totalMax, setTotalMax] = useState<string>('');

  // Dropdown open states
  const [openCountry, setOpenCountry] = useState(false);
  const [openIndustry, setOpenIndustry] = useState(false);
  const [openSubIndustry, setOpenSubIndustry] = useState(false);

  // Filter search states
  const [countrySearch, setCountrySearch] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');
  const [subIndustrySearch, setSubIndustrySearch] = useState('');

  // Filter bar visibility
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Fetch companies from API on mount
  useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then((data) => {
        console.log('Fetched data:', data);
        if (Array.isArray(data)) {
          setCompanies(data);
        } else if (Array.isArray(data?.companies)) {
          setCompanies(data.companies);
        } else {
          setCompanies([]);
        }
      });
  }, []);

  // Unique filter options
  const countryOptions = Array.from(new Set((companies ?? []).map(c => c.country).filter(Boolean)));
  const industryOptions = Array.from(new Set((companies ?? []).map(c => c.industry).filter(Boolean)));
  const subIndustryOptions = Array.from(new Set((companies ?? []).map(c => c.subIndustry).filter(Boolean)));

  // Filtered options for dropdowns
  const filteredCountryOptions = countryOptions.filter(option => option.toLowerCase().includes(countrySearch.toLowerCase())).sort((a, b) => a.localeCompare(b));
  const filteredIndustryOptions = industryOptions.filter(option => option.toLowerCase().includes(industrySearch.toLowerCase())).sort((a, b) => a.localeCompare(b));
  const filteredSubIndustryOptions = subIndustryOptions.filter(option => option.toLowerCase().includes(subIndustrySearch.toLowerCase())).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    let filtered = companies.filter(company => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.subIndustry.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = countryFilter.length > 0 ? countryFilter.includes(company.country) : true;
      const matchesIndustry = industryFilter.length > 0 ? industryFilter.includes(company.industry) : true;
      const matchesSubIndustry = subIndustryFilter.length > 0 ? subIndustryFilter.includes(company.subIndustry) : true;
      const matchesTotalMin = totalMin !== '' ? company.total >= Number(totalMin) : true;
      const matchesTotalMax = totalMax !== '' ? company.total <= Number(totalMax) : true;
      return matchesSearch && matchesCountry && matchesIndustry && matchesSubIndustry && matchesTotalMin && matchesTotalMax;
    });

    if (["history", "brandAwareness", "moat", "size", "innovation", "total"].includes(sortBy)) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = Number(a[sortBy]) || 0;
        const bVal = Number(b[sortBy]) || 0;
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      });
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, sortBy, sortOrder, companies, countryFilter, industryFilter, subIndustryFilter, totalMin, totalMax]);

  

  // Clear all filters handler
  const handleClearAllFilters = () => {
    setCountryFilter([]);
    setIndustryFilter([]);
    setSubIndustryFilter([]);
    setCountrySearch('');
    setIndustrySearch('');
    setSubIndustrySearch('');
    setTotalMin('');
    setTotalMax('');
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-16">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200">
        <div className="px-5 py-3">
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap items-start gap-4 mt-4 justify-between mb-4 sm:mb-6">
            <p className="text-3xl text-gray-600">Company Directory</p>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 border border-gray-300 mr-2"
                aria-label="Show filters"
                onClick={() => setShowFilterBar(v => !v)}
              >
                <FilterIcon className={`h-5 w-5 ${showFilterBar ? 'text-blue-600' : 'text-gray-500'}`} />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-64 max-w-full focus:outline-none focus:border-blue-400 text-sm"
                  placeholder="  Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* Filter Bar - Only show if toggled */}
          {showFilterBar && (
            <div className="flex flex-wrap items-start gap-4 mt-4 z-10 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in">
              {/* Filter dropdowns */}
              <div className="flex flex-wrap gap-4 items-center mb-4">
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
                <div className="relative min-w-[150px]">
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
                <div className="relative min-w-[150px]">
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
                <div className="relative min-w-[150px]">
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

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Total Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredCompanies.length > 0 ? (filteredCompanies.reduce((sum, company) => sum + Number(company.total ?? 0), 0) / filteredCompanies.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{filteredCompanies.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredCompanies.map(c => c.country)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto rounded shadow">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-10 bg-white">Logo</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-16 z-10 bg-white">Name</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[32rem]">Description</th>
                  <th className="px-4 py-2 whitespace-nowrap text-sm text-center">Website</th>
                  <th className="px-4 py-2 whitespace-nowrap text-sm text-center">Country</th>
                  <th className="px-4 py-2 whitespace-nowrap text-sm text-center">Industry</th>
                  <th className="px-4 py-2 whitespace-nowrap text-sm text-center">Sub-Industry</th>
                  <th className="px-2 sm:px-4 py-2 w-20 sm:w-24 whitespace-nowrap text-xs sm:text-sm text-center cursor-pointer select-none" onClick={() => {
                    setSortBy('history');
                    setSortOrder(sortBy === 'history' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    History {sortBy === 'history' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-2 sm:px-4 py-2 w-20 sm:w-24 whitespace-nowrap text-xs sm:text-sm text-center cursor-pointer select-none" onClick={() => {
                    setSortBy('brandAwareness');
                    setSortOrder(sortBy === 'brandAwareness' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    Brand Awareness {sortBy === 'brandAwareness' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-2 sm:px-4 py-2 w-20 sm:w-24 whitespace-nowrap text-xs sm:text-sm text-center cursor-pointer select-none" onClick={() => {
                    setSortBy('moat');
                    setSortOrder(sortBy === 'moat' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    Moat {sortBy === 'moat' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-2 sm:px-4 py-2 w-20 sm:w-24 whitespace-nowrap text-xs sm:text-sm text-center cursor-pointer select-none" onClick={() => {
                    setSortBy('size');
                    setSortOrder(sortBy === 'size' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    Size {sortBy === 'size' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-2 sm:px-4 py-2 w-20 sm:w-24 whitespace-nowrap text-xs sm:text-sm text-center cursor-pointer select-none" onClick={() => {
                    setSortBy('innovation');
                    setSortOrder(sortBy === 'innovation' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    Innovation {sortBy === 'innovation' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-center cursor-pointer select-none" onClick={() => {
                    setSortBy('total');
                    setSortOrder(sortBy === 'total' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    Total {sortBy === 'total' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Compute min/max for total and color mapping */}
                {(() => {
                  const totals = filteredCompanies.map(c => c.total);
                  const minTotal = Math.min(...totals);
                  const maxTotal = Math.max(...totals);
                  // Helper to map total to color (red to green)
                  const getTotalColor = (value: number) => {
                    if (maxTotal === minTotal) return 'hsl(120, 70%, 80%)'; // all same, use green
                    // Linear interpolation: 0 -> red, 0.5 -> yellow, 1 -> green
                    const ratio = (value - minTotal) / (maxTotal - minTotal);
                    const hue = 0 + (120 - 0) * ratio; // 0=red, 120=green
                    return `hsl(${hue}, 70%, 80%)`;
                  };
                  // Pagination: calculate current page's companies
                  const startIdx = (currentPage - 1) * rowsPerPage;
                  const endIdx = startIdx + rowsPerPage;
                  const paginatedCompanies = filteredCompanies.slice(startIdx, endIdx);
                  return paginatedCompanies.map((company, index) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{startIdx + index + 1}</td>
                      <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-center sticky left-0 bg-white z-10">
                        <img
                          className="h-10 w-10 rounded-full mx-auto object-contain bg-white"
                          style={{ objectFit: 'contain', width: '40px', height: '40px', borderRadius: '9999px', background: 'white' }}
                          src={company.logo || `https://ui-avatars.com/api/?name=${company.name}&background=random`}
                          alt={company.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${company.name}&background=random`;
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center sticky left-16 bg-white z-10">{company.name}</td>
                      <td className="px-4 py-2 whitespace-normal text-sm text-left break-words min-w-[32rem]">{company.description}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                        {company.website ? (
                          <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {company.website}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">{company.country}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">{company.industry}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">{company.subIndustry}</td>
                      <td className="px-4 py-2 w-24 whitespace-nowrap text-sm text-center">{company.history}</td>
                      <td className="px-4 py-2 w-24 whitespace-nowrap text-sm text-center">{company.brandAwareness}</td>
                      <td className="px-4 py-2 w-24 whitespace-nowrap text-sm text-center">{company.moat}</td>
                      <td className="px-4 py-2 w-24 whitespace-nowrap text-sm text-center">{company.size}</td>
                      <td className="px-4 py-2 w-24 whitespace-nowrap text-sm text-center">{company.innovation}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                        <span
                          style={{
                            background: getTotalColor(company.total),
                            color: '#222',
                            borderRadius: '9999px',
                            padding: '0.25em 0.8em',
                            fontWeight: 700,
                            display: 'inline-block',
                            minWidth: 40,
                          }}
                        >
                          {company.total}
                        </span>
                      </td>
                    </tr>
                  ));
                })()}

              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {Math.max(1, Math.ceil(filteredCompanies.length / rowsPerPage))}
            </span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredCompanies.length / rowsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(filteredCompanies.length / rowsPerPage) || filteredCompanies.length === 0}
            >
              Next
            </button>
          </div>
          <div>
            <label className="mr-2">Rows per page:</label>
            <select
              className="border rounded px-2 py-1"
              value={rowsPerPage}
              onChange={e => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page on page size change
              }}
            >
              {[10, 25, 50, 100, 250, 500].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-4">
            The following database is for education purposes only.
          </p>
          <p>Company details & logos might not be fully up to date.</p>
        </footer>
      </div>
    </div>
  )
}
