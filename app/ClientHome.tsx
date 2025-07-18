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

  // ... (rest of your Home component code, including rendering)

  // For brevity, you can copy the full Home function contents from your original page
}
