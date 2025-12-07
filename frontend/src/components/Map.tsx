'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';

// --- CONFIGURATION ---
const MAP_PROVIDER = {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; OpenStreetMap contributors'
};

const iconDefault = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = iconDefault;

// --- STYLES ---
const STYLES = {
  unvisited: { fillColor: '#f1f5f9', fillOpacity: 1, weight: 1, color: '#94a3b8' },
  visited: { fillColor: 'transparent', fillOpacity: 0, weight: 2, color: '#3b82f6' },
  highlightLocked: { weight: 2, color: '#d97706', fillColor: '#fbbf24', fillOpacity: 1 },
  highlightUnlocked: { weight: 4, color: '#f59e0b', fillOpacity: 0 }
};

// --- SUB-COMPONENTS ---

function MapController({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  return null;
}

// 🆕 THE CONFIRMATION MODAL
function LocationModal({ 
    feature, 
    isVisited, 
    onClose, 
    onConfirm 
}: { 
    feature: any, 
    isVisited: boolean, 
    onClose: () => void, 
    onConfirm: () => void 
}) {
    if (!feature) return null;

    const props = feature.properties;
    const name = props.name;
    const parent = props.region || props.country || "World";

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                
                {/* Header Image Placeholder */}
                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white/50">
                    <span className="text-4xl">📸</span>
                </div>

                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                    <p className="text-gray-500 text-sm mb-6">{parent}</p>

                    {/* Placeholder for Future Photo Feature */}
                    <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2 hover:bg-gray-50 transition cursor-pointer">
                        <span>📷</span>
                        <span className="text-xs font-medium">Add a photo (Coming Soon)</span>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 text-white font-bold rounded-lg shadow-lg transition transform active:scale-95 ${
                                isVisited 
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                            }`}
                        >
                            {isVisited ? 'Remove Visit' : 'Mark Visited'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---

export default function Map() {
  const [zoom, setZoom] = useState(4);
  const [geoData, setGeoData] = useState<{ world: any, states: any, districts: any }>({
    world: null, states: null, districts: null
  });
  
  const [visited, setVisited] = useState({
    districts: new Set<string>(),
    states: new Set<string>(),
    countries: new Set<string>()
  });

  // 🆕 Modal State
  const [selectedFeature, setSelectedFeature] = useState<{ feature: any, level: 'world'|'state'|'district' } | null>(null);

  // 1. Load Data
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const [w, s, d] = await Promise.all([
          fetch('/geojson/world-countries.json').then(r => r.json()),
          fetch('/geojson/india-states.json').then(r => r.json()),
          fetch('/geojson/india-districts.json').then(r => r.json()),
        ]);
        setGeoData({ world: w, states: s, districts: d });
      } catch (err) {
        console.error("Failed to load map data", err);
      }
    };
    loadGeoData();
  }, []);

  // 2. Fetch Progress
  const fetchUserProgress = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/locations/my-map/');
      setVisited({
        districts: new Set(res.data.districts),
        states: new Set(res.data.states),
        countries: new Set(res.data.countries)
      });
    } catch (err) {
      console.error("Failed to fetch user progress", err);
    }
  }, []);

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  // 3. EXECUTE ACTION (Called by Modal)
  const executeLocationAction = async () => {
    if (!selectedFeature) return;

    const { feature, level: layerLevel } = selectedFeature;
    const props = feature.properties;
    const name = props.name;
    
    // Close modal immediately
    setSelectedFeature(null);

    // Prepare Logic
    let apiLevel = 0;
    let parent = null;
    let grandparent = null;

    if (layerLevel === 'district') {
        apiLevel = 2;
        parent = props.region;
        grandparent = props.country;
    } else if (layerLevel === 'state') {
        apiLevel = 1;
        parent = props.country;
    } else { 
        apiLevel = 0;
    }

    let isAlreadyVisited = false;
    if (layerLevel === 'district') isAlreadyVisited = visited.districts.has(name);
    else if (layerLevel === 'state') isAlreadyVisited = visited.states.has(name);
    else isAlreadyVisited = visited.countries.has(name);

    // Optimistic Update
    setVisited(prev => {
        const next = {
            districts: new Set(prev.districts),
            states: new Set(prev.states),
            countries: new Set(prev.countries)
        };
        const targetSet = layerLevel === 'district' ? next.districts 
            : layerLevel === 'state' ? next.states 
            : next.countries;

        if (isAlreadyVisited) targetSet.delete(name); 
        else targetSet.add(name);
        return next;
    });

    // Server Sync
    try {
      const payload = { name, level: apiLevel, parent, grandparent };
      const response = isAlreadyVisited 
        ? await api.delete('/locations/mark/', { data: payload })
        : await api.post('/locations/mark/', payload);

      if (response.status !== 200) throw new Error("Server error");
      fetchUserProgress(); 

    } catch (err) {
      console.error("Sync failed:", err);
      // Rollback
      setVisited(prev => {
        const next = { ...prev }; 
        const targetSet = layerLevel === 'district' ? next.districts 
            : layerLevel === 'state' ? next.states 
            : next.countries;
        if (isAlreadyVisited) targetSet.add(name); 
        else targetSet.delete(name);
        return next;
      });
      alert("Connection failed. Reverting.");
    }
  };

  // --- HELPERS ---
  const isVisitedCheck = (name: string, level: string) => {
    if (level === 'district') return visited.districts.has(name);
    if (level === 'state') return visited.states.has(name);
    if (level === 'world') return visited.countries.has(name);
    return false;
  };

  const getStyle = (feature: any, level: 'world' | 'state' | 'district') => {
    return isVisitedCheck(feature.properties.name, level) ? STYLES.visited : STYLES.unvisited;
  };

  const onEachFeature = (feature: any, layer: any, level: string) => {
    layer.bindTooltip(feature.properties.name, { sticky: true, direction: 'top' });
    
    let isClickable = false;
    const countryName = feature.properties.name;

    if (level === 'district') isClickable = true; 
    else if (level === 'state') isClickable = false; 
    else if (level === 'world' && countryName !== 'India') isClickable = true;

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        const isVisited = isVisitedCheck(feature.properties.name, level);
        if (isVisited) l.setStyle(STYLES.highlightUnlocked);
        else l.setStyle(STYLES.highlightLocked);
        l.bringToFront();
        if (isClickable) l.getElement().style.cursor = 'pointer';
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(getStyle(feature, level as any));
      },
      click: (e: any) => {
        L.DomEvent.stopPropagation(e);
        if (isClickable) {
            // 🆕 INSTEAD OF MARKING IMMEDIATELY, OPEN MODAL
            setSelectedFeature({ feature, level: level as any });
        }
      }
    });
  };

  if (!geoData.world) return null;

  return (
    <div id="map-container" className="relative w-full h-screen bg-slate-200">
      
      {/* 🆕 RENDER MODAL IF SELECTED */}
      {selectedFeature && (
          <LocationModal 
            feature={selectedFeature.feature}
            isVisited={isVisitedCheck(selectedFeature.feature.properties.name, selectedFeature.level)}
            onClose={() => setSelectedFeature(null)}
            onConfirm={executeLocationAction}
          />
      )}

      {/* HUD */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg w-64">
        <h3 className="font-bold text-slate-800 mb-2">🌍 Travel Layers</h3>
        <div className="flex justify-between text-sm mb-2">
          <span>Zoom: <strong className="text-blue-600">{zoom}</strong></span>
          <span className="text-xs text-gray-500">{visited.districts.size} districts</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-2">
            <div className="w-3 h-3 border-2 border-blue-500 bg-white/20 rounded-sm"></div>
            <span>Revealed</span>
            <div className="w-3 h-3 bg-slate-200 border border-slate-300 rounded-sm ml-2"></div>
            <span>Fog (Unvisited)</span>
        </div>
      </div>

      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={4} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
        style={{ background: '#aad3df' }}
      >
        <MapController onZoomChange={setZoom} />
        
        <TileLayer url={MAP_PROVIDER.url} attribution={MAP_PROVIDER.attribution} />

        <GeoJSON 
          data={geoData.world} 
          style={(f) => getStyle(f, 'world')} 
          onEachFeature={(f, l) => onEachFeature(f, l, 'world')} 
        />

        {zoom >= 5 && geoData.states && (
          <GeoJSON 
            data={geoData.states} 
            style={(f) => getStyle(f, 'state')} 
            onEachFeature={(f, l) => onEachFeature(f, l, 'state')} 
          />
        )}

        {zoom >= 7 && geoData.districts && (
          <GeoJSON 
            data={geoData.districts} 
            style={(f) => getStyle(f, 'district')} 
            onEachFeature={(f, l) => onEachFeature(f, l, 'district')} 
          />
        )}
      </MapContainer>
    </div>
  );
}