import React from 'react'
import {
  Sparkles,
  Cloud,
  Plane,
  Compass,
  Cpu,
  Shield,
  Bot,
  Zap,
  Radio,
  Sliders,
  Wind,
} from 'lucide-react'

interface GemIconProps {
  iconName: string
  className?: string
}

export const GemIcon: React.FC<GemIconProps> = ({ iconName, className = 'w-4 h-4' }) => {
  switch (iconName) {
    case 'cloud':
      return <Cloud className={className} />
    case 'plane':
      return <Plane className={className} />
    case 'compass':
      return <Compass className={className} />
    case 'cpu':
      return <Cpu className={className} />
    case 'shield':
      return <Shield className={className} />
    case 'zap':
      return <Zap className={className} />
    case 'radio':
      return <Radio className={className} />
    case 'sliders':
      return <Sliders className={className} />
    case 'wind':
      return <Wind className={className} />
    case 'bot':
      return <Bot className={className} />
    case 'sparkles':
    default:
      return <Sparkles className={className} />
  }
}
