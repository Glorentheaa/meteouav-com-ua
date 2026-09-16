import React from 'react'
import type { MeteoBlocksState, MeteoBlockKey, BlockMeta } from '../types/meteo'

const BLOCK_DEFINITIONS: readonly BlockMeta[] = [
  { key: 'shortTerm', label: 'Найближчий час' },
  { key: 'wind', label: 'Вітер/Хмари' },
  { key: 'windows', label: 'Вікна польотів' },
  { key: 'conclusion', label: 'Висновки метеолога' },
  { key: 'weekly', label: 'Тижневий' },
  { key: 'sunMoon', label: 'Сонце/Місяць' },
]

interface BlockVisibilityBarProps {
  blocks: MeteoBlocksState
  onToggleBlock: (key: MeteoBlockKey) => void
}

export const BlockVisibilityBar: React.FC<BlockVisibilityBarProps> = ({
  blocks,
  onToggleBlock,
}) => {
  return (
    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 mb-4">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2 w-full lg:w-auto">
        Відображення:
      </span>
      {BLOCK_DEFINITIONS.map(({ key, label }) => {
        const isActive = blocks[key]
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggleBlock(key)}
            className={`px-3 py-1.5 text-[11px] font-semibold rounded-full transition-colors border ${
              isActive
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
