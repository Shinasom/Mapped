// frontend/src/components/map/MapHUD.tsx
'use client';

import { useState } from 'react';

interface VisitedLocations {
  districts: Set<string>;
  states: Set<string>;
  countries: Set<string>;
}

interface MapHUDProps {
  zoom: number;
  visited: VisitedLocations;
  isLayerVisible: { states: boolean; districts: boolean };
}

export default function MapHUD({ 
  zoom, 
  visited, 
  isLayerVisible 
}: MapHUDProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const totalLocations = visited.countries.size + visited.states.size + visited.districts.size;

  if (isCollapsed) {
    return (
      <button 
        onClick={() => setIsCollapsed(false)}
        className="absolute top-4 right-4 z-[1000] bg-olive-700 border-2 border-olive-900 text-stone-50 p-3 shadow-xl hover:bg-olive-800 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-stone-50 border-4 border-stone-400 shadow-2xl w-72">
      {/* Header */}
      <div className="bg-olive-700 border-b-4 border-olive-900 p-3 flex items-center justify-between">
        <h3 className="text-stone-50 font-bold uppercase tracking-wide text-sm">
          Map Info
        </h3>
        <div className="flex items-center gap-2">
          <span className="bg-olive-950 text-olive-100 text-xs font-mono px-2 py-1">
            Z:{zoom}
          </span>
          <button 
            onClick={() => setIsCollapsed(true)}
            className="text-stone-50 hover:text-olive-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Ctry" value={visited.countries.size} />
          <StatBox label="State" value={visited.states.size} />
          <StatBox label="Dist" value={visited.districts.size} />
        </div>

        <div className="border-2 border-stone-300 bg-white p-3 text-center">
          <div className="text-xs text-stone-600 font-bold uppercase tracking-wide mb-1">Total</div>
          <div className="text-3xl font-bold text-olive-800">{totalLocations}</div>
        </div>

        {/* Layers */}
        <div className="border-t-2 border-stone-300 pt-3 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wide text-stone-700 mb-2">Layers</div>
          <LayerStatus label="World" active={true} />
          <LayerStatus label="States" active={isLayerVisible.states} />
          <LayerStatus label="Districts" active={isLayerVisible.districts} />
        </div>

        {/* Legend */}
        <div className="border-t-2 border-stone-300 pt-3">
          <div className="text-xs font-bold uppercase tracking-wide text-stone-700 mb-2">Legend</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-olive-600 bg-olive-100"></div>
              <span className="text-stone-600">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-stone-200 border-2 border-stone-400"></div>
              <span className="text-stone-600">Unvisited</span>
            </div>
          </div>
        </div>

        {zoom < 7 && (
          <div className="border-2 border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
            ⚠ Zoom in to mark districts
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-stone-300 bg-white p-2 text-center">
      <div className="text-xs text-stone-500 font-bold uppercase mb-1">{label}</div>
      <div className="text-xl font-bold text-olive-800">{value}</div>
    </div>
  );
}

function LayerStatus({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-stone-600 font-medium">{label}</span>
      <span className={`font-mono px-2 py-0.5 ${
        active 
          ? 'bg-olive-700 text-stone-50' 
          : 'bg-stone-300 text-stone-600'
      }`}>
        {active ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}