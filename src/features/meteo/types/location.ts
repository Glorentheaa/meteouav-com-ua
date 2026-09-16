export interface SectorBoundingBox {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

export interface SectorInfo {
  lat: number
  lon: number
  sectorId: string
  bbox: SectorBoundingBox
  approxSizeKm: string
}

export interface SavedLocation {
  id: string
  name: string
  settlement: string
  lat: number
  lon: number
  rawLat?: number
  rawLon?: number
  sectorId: string
  mgrs?: string
  isPinned: boolean
  createdAt: string
  lastUsedAt?: string
}
