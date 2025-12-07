// frontend/src/components/Map.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/utils/api';
import LocationModal from '@/components/map/LocationModal';
import Toast from '@/components/map/Toast';
import MapHUD from '@/components/map/MapHUD';


// --- TYPES ---
type LocationLevel = 'world' | 'state' | 'district';

interface VisitedLocations {
  districts: Set<string>;
  states: Set<string>;
  countries: Set<string>;
}

interface GeoDataState {
  world: any;
  states: any;
  districts: any;
}

interface SelectedFeature {
  feature: any;
  level: LocationLevel;
}

// --- CONFIGURATION ---
const MAP_PROVIDER = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; OpenStreetMap contributors'
};

const ZOOM_THRESHOLDS = {
  STATES: 5,
  DISTRICTS: 7
};

const iconDefault = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = iconDefault;

// --- STYLES (Olive Theme) ---
const STYLES = {
  unvisited: { 
    fillColor: '#e7e5e4', 
    fillOpacity: 1, 
    weight: 1, 
    color: '#a8a29e' 
  },
  visited: { 
    fillColor: 'transparent', 
    fillOpacity: 0, 
    weight: 2, 
    color: '#556042' 
  },
  highlightLocked: { 
    weight: 2, 
    color: '#d97706', 
    fillColor: '#fbbf24', 
    fillOpacity: 0.3 
  },
  highlightUnlocked: { 
    weight: 3, 
    color: '#556042', 
    fillOpacity: 0.1,
    fillColor: '#6d7655'
  }
};

// --- SUB-COMPONENTS ---
function MapController({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });
  return null;
}

// --- MAIN COMPONENT ---
export default function Map() {
  const [zoom, setZoom] = useState(4);
  const [geoData, setGeoData] = useState<GeoDataState>({
    world: null,
    states: null,
    districts: null
  });
  
  const [visited, setVisited] = useState<VisitedLocations>({
    districts: new Set<string>(),
    states: new Set<string>(),
    countries: new Set<string>()
  });

  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const worldLayerKey = useRef(0);
  const statesLayerKey = useRef(0);
  const districtsLayerKey = useRef(0);

  const isLayerVisible = {
    states: zoom >= ZOOM_THRESHOLDS.STATES,
    districts: zoom >= ZOOM_THRESHOLDS.DISTRICTS
  };

  // 1. Load GeoJSON Data
  useEffect(() => {
    const loadGeoData = async () => {
      setIsLoadingData(true);
      try {
        const [w, s, d] = await Promise.all([
          fetch('/geojson/world-countries.json').then(r => r.json()),
          fetch('/geojson/india-states.json').then(r => r.json()),
          fetch('/geojson/india-districts.json').then(r => r.json()),
        ]);
        setGeoData({ world: w, states: s, districts: d });
      } catch (err) {
        console.error("Failed to load map data", err);
        setToast({ message: 'Failed to load map data', type: 'error' });
      } finally {
        setIsLoadingData(false);
      }
    };
    loadGeoData();
  }, []);

  // 2. Fetch User Progress
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

      worldLayerKey.current++;
      statesLayerKey.current++;
      districtsLayerKey.current++;
    } catch (err) {
      console.error("Failed to fetch user progress", err);
      setToast({ message: 'Failed to load your progress', type: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  // 3. Execute Location Action
  const executeLocationAction = async () => {
    if (!selectedFeature || isActionLoading) return;

    const { feature, level: layerLevel } = selectedFeature;
    const props = feature.properties;
    const name = props.name;
    
    setIsActionLoading(true);

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
    }

    const isAlreadyVisited = 
      layerLevel === 'district' ? visited.districts.has(name) :
      layerLevel === 'state' ? visited.states.has(name) :
      visited.countries.has(name);

    const previousVisited = { ...visited };
    setVisited(prev => {
      const next = {
        districts: new Set(prev.districts),
        states: new Set(prev.states),
        countries: new Set(prev.countries)
      };
      const targetSet = 
        layerLevel === 'district' ? next.districts :
        layerLevel === 'state' ? next.states :
        next.countries;

      if (isAlreadyVisited) targetSet.delete(name);
      else targetSet.add(name);
      return next;
    });

    try {
      const payload = { name, level: apiLevel, parent, grandparent };
      const response = isAlreadyVisited 
        ? await api.delete('/locations/mark/', { data: payload })
        : await api.post('/locations/mark/', payload);

      if (response.status === 200) {
        setToast({ 
          message: isAlreadyVisited ? `Removed ${name}` : `Marked ${name}`,
          type: 'success'
        });
        await fetchUserProgress();
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error("Sync failed:", err);
      setVisited(previousVisited);
      setToast({ message: 'Failed. Try again.', type: 'error' });
    } finally {
      setIsActionLoading(false);
      setSelectedFeature(null);
    }
  };

  // --- HELPERS ---
  const isVisitedCheck = (name: string, level: LocationLevel): boolean => {
    if (level === 'district') return visited.districts.has(name);
    if (level === 'state') return visited.states.has(name);
    if (level === 'world') return visited.countries.has(name);
    return false;
  };

  const getStyle = (feature: any, level: LocationLevel) => {
    return isVisitedCheck(feature.properties.name, level) 
      ? STYLES.visited 
      : STYLES.unvisited;
  };

  const onEachFeature = (feature: any, layer: any, level: LocationLevel) => {
    const name = feature.properties.name;
    
    layer.bindTooltip(name, { 
      sticky: true, 
      direction: 'top',
      className: 'custom-tooltip'
    });
    
    let isClickable = false;
    if (level === 'district') {
      isClickable = true;
    } else if (level === 'world' && name !== 'India') {
      isClickable = true;
    }

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        const isVisited = isVisitedCheck(name, level);
        
        l.setStyle(isVisited ? STYLES.highlightUnlocked : STYLES.highlightLocked);
        l.bringToFront();
        
        if (isClickable) {
          l.getElement().style.cursor = 'pointer';
        }
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(getStyle(feature, level));
      },
      click: (e: any) => {
        L.DomEvent.stopPropagation(e);
        if (isClickable) {
          setSelectedFeature({ feature, level });
        }
      }
    });
  };

  if (isLoadingData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-100">
        <div className="text-center">
          <div className="text-6xl mb-3">🗺</div>
          <p className="text-stone-600 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!geoData.world) return null;

  return (
    <div id="map-container" className="relative w-full h-screen bg-stone-200">
      
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {selectedFeature && (
        <LocationModal 
          feature={selectedFeature.feature}
          isVisited={isVisitedCheck(selectedFeature.feature.properties.name, selectedFeature.level)}
          onClose={() => !isActionLoading && setSelectedFeature(null)}
          onConfirm={executeLocationAction}
          isLoading={isActionLoading}
        />
      )}

      <MapHUD 
        zoom={zoom}
        visited={visited}
        isLayerVisible={isLayerVisible}
      />

      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={4} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
        style={{ background: '#c7c8cc' }}
        minZoom={2}
        maxZoom={10}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
      >
        <MapController onZoomChange={setZoom} />
        
        <TileLayer 
          url={MAP_PROVIDER.url} 
          attribution={MAP_PROVIDER.attribution}
          noWrap={true}
          bounds={[[-90, -180], [90, 180]]}
        />

        <GeoJSON 
          key={`world-${worldLayerKey.current}`}
          data={geoData.world} 
          style={(f) => getStyle(f, 'world')} 
          onEachFeature={(f, l) => onEachFeature(f, l, 'world')} 
        />

        {isLayerVisible.states && geoData.states && (
          <GeoJSON 
            key={`states-${statesLayerKey.current}`}
            data={geoData.states} 
            style={(f) => getStyle(f, 'state')} 
            onEachFeature={(f, l) => onEachFeature(f, l, 'state')} 
          />
        )}

        {isLayerVisible.districts && geoData.districts && (
          <GeoJSON 
            key={`districts-${districtsLayerKey.current}`}
            data={geoData.districts} 
            style={(f) => getStyle(f, 'district')} 
            onEachFeature={(f, l) => onEachFeature(f, l, 'district')} 
          />
        )}
      </MapContainer>
    </div>
  );
}