import React, { useState, useRef, useEffect } from 'react'
import { MapPin, ChevronDown, Map, List } from 'lucide-react'

interface LocationSelectorProps {
  currentLocation?: string
  onSelectLocation?: (location: string) => void
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation = 'Запоріжжя',
  onSelectLocation,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (loc: string) => {
    onSelectLocation?.(loc)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={menuRef}>
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
        Оберіть локацію
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-slate-50 dark:bg-slate-900 transition-colors h-[42px]"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">
            {currentLocation}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-[70px] left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <Map className="w-4 h-4 text-emerald-500" /> Обрати на мапі
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <List className="w-4 h-4 text-emerald-500" /> Редагувати список місць
            </button>
          </div>
          <div className="p-1.5 max-h-48 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
              Закріплені
            </div>
            {['Київ', 'Запоріжжя'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                {city}
              </button>
            ))}
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase mt-1">
              Збережені
            </div>
            {['Дніпро', 'Одеса'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
