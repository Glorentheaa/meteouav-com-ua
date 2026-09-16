import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronDown, Map, List, Navigation, Pin } from 'lucide-react'
import type { SavedLocation } from '../types/location'
import { getStoredLocations, setActiveLocation } from '../utils/geoUtils'
import { ManualCoordinatesModal } from './ManualCoordinatesModal'

interface LocationSelectorProps {
  currentLocation: SavedLocation
  onSelectLocation: (location: SavedLocation) => void
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  onSelectLocation,
}) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [locations, setLocations] = useState<SavedLocation[]>(() => getStoredLocations())

  const refreshLocations = () => {
    setLocations(getStoredLocations())
  }

  const handleToggleOpen = () => {
    const nextState = !isOpen
    if (nextState) {
      refreshLocations()
    }
    setIsOpen(nextState)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (loc: SavedLocation) => {
    setActiveLocation(loc)
    onSelectLocation(loc)
    setIsOpen(false)
  }

  const handleManualLocationSelected = (loc: SavedLocation) => {
    setActiveLocation(loc)
    onSelectLocation(loc)
    refreshLocations()
  }

  const pinnedLocations = locations.filter((l) => l.isPinned)
  const otherLocations = locations.filter((l) => !l.isPinned)

  return (
    <>
      <div className="relative w-full" ref={menuRef}>
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
          Оберіть локацію
        </label>
        <button
          type="button"
          onClick={handleToggleOpen}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-slate-50 dark:bg-slate-900 transition-colors h-[42px]"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="flex items-center gap-1.5 overflow-hidden text-left">
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                {currentLocation.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 hidden sm:inline">
                [{currentLocation.sectorId}]
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-[70px] left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Швидкі дії */}
            <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/map?returnTo=/app')
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg transition-colors"
              >
                <Map className="w-4 h-4 text-emerald-500" />
                <span>Обрати на мапі</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setIsManualModalOpen(true)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg transition-colors"
              >
                <Navigation className="w-4 h-4 text-emerald-500" />
                <span>Ввести координати</span>
              </button>
            </div>

            {/* Списки локацій */}
            <div className="p-1.5 max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Закріплені */}
              {pinnedLocations.length > 0 && (
                <div className="pt-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Pin className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    <span>Закріплені локації</span>
                  </div>
                  {pinnedLocations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentLocation.id === loc.id || currentLocation.sectorId === loc.sectorId
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                        {loc.settlement && loc.settlement !== loc.name && (
                          <span className="text-[10px] text-slate-400 truncate">
                            ({loc.settlement})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 ml-2 shrink-0">
                        {loc.sectorId}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Збережені */}
              {otherLocations.length > 0 && (
                <div className="pt-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Збережені локації
                  </div>
                  {otherLocations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentLocation.id === loc.id || currentLocation.sectorId === loc.sectorId
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{loc.name}</span>
                        {loc.settlement && loc.settlement !== loc.name && (
                          <span className="text-[10px] text-slate-400 truncate">
                            ({loc.settlement})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 ml-2 shrink-0">
                        {loc.sectorId}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Посилання на редагування */}
            <div className="p-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/settings')
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
              >
                <List className="w-3.5 h-3.5" />
                <span>Редагувати список місць</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Модальне вікно ручного введення координат */}
      <ManualCoordinatesModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onLocationSelected={handleManualLocationSelected}
        initialLat={currentLocation.lat}
        initialLon={currentLocation.lon}
      />
    </>
  )
}
