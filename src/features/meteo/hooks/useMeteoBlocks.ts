import { useState, useRef } from 'react'
import type { MeteoBlocksState, MeteoBlockKey } from '../types/meteo'

const DEFAULT_BLOCKS: MeteoBlocksState = {
  shortTerm: true,
  wind: true,
  windows: true,
  conclusion: true,
  weekly: true,
  sunMoon: true,
}

export function useMeteoBlocks() {
  const [blocks, setBlocks] = useState<MeteoBlocksState>(DEFAULT_BLOCKS)
  const [showGrid1, setShowGrid1] = useState(true)
  const [showGrid2, setShowGrid2] = useState(true)

  // Реф для компенсації стрибків скролу при зміні блоків
  const controlsRef = useRef<HTMLDivElement>(null)

  const handleToggleBlock = (key: MeteoBlockKey) => {
    const activeCount = Object.values(blocks).filter(Boolean).length
    // Запобігаємо вимкненню останнього видимого блоку
    if (activeCount === 1 && blocks[key]) return

    const prevTop = controlsRef.current?.getBoundingClientRect().top

    setBlocks((prev) => ({ ...prev, [key]: !prev[key] }))

    setTimeout(() => {
      if (controlsRef.current && prevTop !== undefined) {
        const newTop = controlsRef.current.getBoundingClientRect().top
        window.scrollBy(0, newTop - prevTop)
      }
    }, 0)
  }

  const hasGrid1Cards =
    blocks.shortTerm || blocks.wind || blocks.windows || blocks.conclusion

  const hasGrid2Cards = blocks.weekly || blocks.sunMoon

  return {
    blocks,
    handleToggleBlock,
    showGrid1,
    setShowGrid1,
    showGrid2,
    setShowGrid2,
    controlsRef,
    hasGrid1Cards,
    hasGrid2Cards,
  }
}
