"use client";

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Building2, Globe, DollarSign, Star, Filter as FilterIcon } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  description: string;
  country: string;
  industry: string;
  subIndustry: string;
  history: number;
  brandAwareness: number;
  moat: number;
  size: number;
  innovation: number;
  total: number;
  website: string;
  logo: string;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getTotalColor(value: number) {
  // Helper to map total to color (red to green)
  const percent = Math.max(0, Math.min(1, (value - 40) / 60));
  const hue = percent * 120; // 0 (red) to 120 (green)
  return `hsl(${hue}, 70%, 70%)`;
}

export default function ClientHome() {
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
    fetch('/api/companies', { cache: 'no-store' })
      .then(res => res.json())
      .then((data) => {
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

      const matchesCountry = countryFilter.length === 0 || countryFilter.includes(company.country);
      const matchesIndustry = industryFilter.length === 0 || industryFilter.includes(company.industry);
      const matchesSubIndustry = subIndustryFilter.length === 0 || subIndustryFilter.includes(company.subIndustry);

      const matchesTotalMin = totalMin === '' || company.total >= Number(totalMin);
      const matchesTotalMax = totalMax === '' || company.total <= Number(totalMax);

      return matchesSearch && matchesCountry && matchesIndustry && matchesSubIndustry && matchesTotalMin && matchesTotalMax;
    });

    // Sorting
    filtered = filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCompanies(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [companies, searchTerm, countryFilter, industryFilter, subIndustryFilter, totalMin, totalMax, sortBy, sortOrder]);

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 ml-16">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200">
        <div className="px-5 py-3">
          <h1 className="text-2xl font-bold text-gray-800">Company Directory</h1>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilterBar(!showFilterBar)}
                className="px-4 py-2 bg-white border rounded-md flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FilterIcon className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterBar && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search countries..."
                      className="w-full p-2 border rounded-md"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                    />
                    <div className="mt-1 max-h-40 overflow-y-auto border rounded-md">
                      {filteredCountryOptions.map((country) => (
                        <label key={country} className="flex items-center p-2 hover:bg-gray-100">
                          <input
                            type="checkbox"
                            className="rounded text-blue-600"
                            checked={countryFilter.includes(country)}
                            onChange={() => {
                              setCountryFilter(
                                countryFilter.includes(country)
                                  ? countryFilter.filter((c) => c !== country)
                                  : [...countryFilter, country]
                              );
                            }}
                          />
                          <span className="ml-2 text-sm">{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search industries..."
                      className="w-full p-2 border rounded-md"
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                    />
                    <div className="mt-1 max-h-40 overflow-y-auto border rounded-md">
                      {filteredIndustryOptions.map((industry) => (
                        <label key={industry} className="flex items-center p-2 hover:bg-gray-100">
                          <input
                            type="checkbox"
                            className="rounded text-blue-600"
                            checked={industryFilter.includes(industry)}
                            onChange={() => {
                              setIndustryFilter(
                                industryFilter.includes(industry)
                                  ? industryFilter.filter((i) => i !== industry)
                                  : [...industryFilter, industry]
                              );
                            }}
                          />
                          <span className="ml-2 text-sm">{industry}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total Score Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Score Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Min"
                      className="w-1/2 p-2 border rounded-md"
                      value={totalMin}
                      onChange={(e) => setTotalMin(e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Max"
                      className="w-1/2 p-2 border rounded-md"
                      value={totalMax}
                      onChange={(e) => setTotalMax(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {filteredCompanies.length} companies found
                </div>
                <button
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Companies</p>
                <p className="text-2xl font-bold">{filteredCompanies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Globe className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Countries</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredCompanies.map(c => c.country)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Avg. Score</p>
                <p className="text-2xl font-bold">
                  {filteredCompanies.length > 0
                    ? (filteredCompanies.reduce((sum, c) => sum + c.total, 0) / filteredCompanies.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => {
                      setSortBy('total');
                      setSortOrder(sortBy === 'total' && sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center">
                      Total Score
                      {sortBy === 'total' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={company.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`}
                            alt={company.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {company.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.industry}</div>
                      <div className="text-sm text-gray-500">{company.subIndustry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="text-sm font-medium text-center py-1 px-2 rounded-full"
                        style={{
                          backgroundColor: getTotalColor(company.total),
                          color: '#000',
                          width: 'fit-content',
                          minWidth: '40px',
                          display: 'inline-block'
                        }}
                      >
                        {company.total}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * rowsPerPage, filteredCompanies.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredCompanies.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Calculate page numbers to show (current page in the middle when possible)
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
