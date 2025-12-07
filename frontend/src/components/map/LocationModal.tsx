// frontend/src/components/map/LocationModal.tsx
'use client';

import { useEffect } from 'react';

interface LocationModalProps {
  feature: any;
  isVisited: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function LocationModal({ 
  feature, 
  isVisited, 
  onClose, 
  onConfirm,
  isLoading 
}: LocationModalProps) {
  const props = feature.properties;
  const name = props.name;
  const parent = props.region || props.country || "World";
  const level = props.level === 2 ? 'District' : props.level === 1 ? 'State' : 'Country';

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div 
        className="bg-white border-4 border-stone-400 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-olive-800 border-b-4 border-olive-950 p-6 relative">
          {isVisited && (
            <div className="absolute top-3 right-3 bg-olive-950 text-olive-100 text-xs font-bold px-2 py-1 uppercase tracking-wide">
              Visited
            </div>
          )}
          <div className="text-stone-50">
            <div className="text-xs font-bold uppercase tracking-wider text-olive-300 mb-2">
              {level} {parent !== name && `• ${parent}`}
            </div>
            <h2 className="text-3xl font-serif font-bold">{name}</h2>
          </div>
        </div>

        <div className="p-6">
          {/* Photo Placeholder */}
          <div className="mb-6 p-8 border-4 border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center text-stone-400 gap-2 hover:border-olive-400 hover:bg-olive-50 transition cursor-pointer">
            <div className="text-4xl">📷</div>
            <div className="text-center">
              <p className="text-sm font-bold text-stone-700">Add Photo</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-5 py-3 text-stone-700 font-bold border-2 border-stone-300 hover:bg-stone-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-5 py-3 text-stone-50 font-bold border-2 transition disabled:opacity-50 ${
                isVisited 
                  ? 'bg-red-700 border-red-900 hover:bg-red-800' 
                  : 'bg-olive-700 border-olive-900 hover:bg-olive-800'
              }`}
            >
              {isLoading ? (
                isVisited ? 'Removing...' : 'Marking...'
              ) : (
                isVisited ? 'Remove' : 'Mark Visited'
              )}
            </button>
          </div>

          <p className="text-center text-xs text-stone-500 mt-4">
            Press <kbd className="px-2 py-1 bg-stone-200 border border-stone-400 text-stone-700 font-mono text-xs">ESC</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}