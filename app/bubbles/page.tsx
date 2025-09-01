'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { forceSimulation, forceCollide, forceX, forceY } from 'd3-force';

interface Company {
  id: number;
  name: string;
  description: string;
  country: string;
  industry: string;
  subIndustry: string;
  yearFounded: string;
  employees: string;
  history: number;
  brandAwareness: number;
  moat: number;
  size: number;
  innovation: number;
  total: number;
  website: string;
  logo: string;
  companyType: string;
}

const BubbleChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{visible: boolean, company: Company | null, x: number, y: number}>({
    visible: false,
    company: null,
    x: 0,
    y: 0
  });
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch company data from your API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/companies');
        const companies = await response.json();
        
        // Filter out companies with no sub-industry or total score
        const validCompanies = companies.filter((company: Company) => 
          company.subIndustry && company.total > 0
        );
        
        // If no valid companies, show error
        if (validCompanies.length === 0) {
          console.error('No valid companies found with required data');
          return;
        }
        
        setData(validCompanies);
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length === 0 || !svgRef.current) return;

    const width = 1200;
    const height = 1000;
    const padding = 20;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100vh') // Make the chart take full viewport height
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', '#ffffff');

    // Set bubble size scale
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.total) || 100])
      .range([15, 80]); // Adjusted size range for better visibility

    // Create force simulation
    const simulation = forceSimulation(data as any)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', forceCollide<d3.SimulationNodeDatum & Company>()
        .radius(d => sizeScale(d.total) + 2) // Add more padding between bubbles
        .strength(0.9) // Increase strength to prevent overlap
        .iterations(2) // Run collision detection multiple times per tick
      )
      .force('x', forceX<d3.SimulationNodeDatum & Company>(width / 2).strength(0.05))
      .force('y', forceY<d3.SimulationNodeDatum & Company>(height / 2).strength(0.05));

    // Create bubbles
    const bubbles = svg.selectAll('.bubble')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('r', d => sizeScale(d.total))
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)
      .on('mouseover', (event, d) => {
        setTooltip({
          visible: true,
          company: d,
          x: event.pageX,
          y: event.pageY
        });
        d3.select(event.currentTarget).attr('opacity', 1);
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX,
          y: event.pageY
        }));
      })
      .on('mouseout', (event) => {
        setTooltip(prev => ({ ...prev, visible: false }));
        d3.select(event.currentTarget).attr('opacity', 0.7);
      });

    // Add company name inside bubbles (only if bubble is large enough)
    const labels = svg.selectAll('.bubble-label')
      .data(data)
      .enter()
      .filter(d => sizeScale(d.total) > 30) // Only show label if bubble is large enough
      .append('text')
      .attr('class', 'bubble-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .style('font-size', d => `${Math.min(12, sizeScale(d.total) / 3)}px`)
      .style('pointer-events', 'none')
      .text(d => d.name);

    // Update positions on each tick
    simulation.on('tick', () => {
      bubbles
        .attr('cx', d => Math.max(sizeScale(d.total), Math.min(width - sizeScale(d.total), (d as any).x)))
        .attr('cy', d => Math.max(sizeScale(d.total), Math.min(height - sizeScale(d.total), (d as any).y)));
      
      labels
        .attr('x', d => Math.max(sizeScale(d.total), Math.min(width - sizeScale(d.total), (d as any).x)))
        .attr('y', d => Math.max(sizeScale(d.total), Math.min(height - sizeScale(d.total), (d as any).y)));
    });


    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [data]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center p-4 w-full" style={{ height: 'calc(100vh - 80px)' }}>
      <h1 className="text-3xl font-bold mb-4">Company Bubble Chart</h1>
      <div className="w-full h-full border rounded-lg shadow-lg overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      
      {/* Tooltip */}
      {tooltip.visible && tooltip.company && (
        <div 
          className="fixed bg-white p-4 rounded-lg shadow-lg border border-gray-200 pointer-events-none z-50 max-w-xs"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y + 10}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="flex items-start gap-3 mb-2">
            {tooltip.company.logo && (
              <img 
                src={tooltip.company.logo} 
                alt={`${tooltip.company.name} logo`} 
                className="w-12 h-12 object-contain mt-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <h3 className="font-bold text-lg">{tooltip.company.name}</h3>
              <p className="text-sm text-gray-600">{tooltip.company.industry} • {tooltip.company.country}</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">Sub-Industry:</span> {tooltip.company.subIndustry}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <p className="font-medium">Score</p>
              <p className="text-lg font-bold">{tooltip.company.total.toFixed(1)}</p>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <p className="font-medium">Size</p>
              <p>{tooltip.company.employees} employees</p>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <p className="font-medium">Moat</p>
              <p>{tooltip.company.moat.toFixed(1)}</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <p className="font-medium">Innovation</p>
              <p>{tooltip.company.innovation.toFixed(1)}</p>
            </div>
          </div>
          {tooltip.company.website && (
            <a 
              href={tooltip.company.website.startsWith('http') ? tooltip.company.website : `https://${tooltip.company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-blue-600 hover:underline text-sm"
            >
              {tooltip.company.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default function BubblesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BubbleChart />
    </div>
  );
}
