import React from 'react'
import {
  Bot,
  Sparkles,
  Brain,
  Cpu,
  Zap,
  Flame,
  Shield,
  Code,
  FileText,
  Terminal,
  Compass,
  Plane,
  Cloud,
  Eye,
  Layers,
  Settings,
  Radio,
  Search,
  MessageSquare,
  Rocket,
  Heart,
  Bookmark,
  Atom,
  Coffee,
  Wrench,
  Lightbulb,
  Globe,
  Sliders,
  Wind,
} from 'lucide-react'

interface GemIconProps {
  iconName: string
  className?: string
}

export const GemIcon: React.FC<GemIconProps> = ({ iconName, className = 'w-4 h-4' }) => {
  switch (iconName) {
    case 'brain':
      return <Brain className={className} />
    case 'flame':
      return <Flame className={className} />
    case 'code':
      return <Code className={className} />
    case 'terminal':
      return <Terminal className={className} />
    case 'rocket':
      return <Rocket className={className} />
    case 'heart':
      return <Heart className={className} />
    case 'bookmark':
      return <Bookmark className={className} />
    case 'atom':
      return <Atom className={className} />
    case 'coffee':
      return <Coffee className={className} />
    case 'wrench':
      return <Wrench className={className} />
    case 'lightbulb':
      return <Lightbulb className={className} />
    case 'globe':
      return <Globe className={className} />
    case 'message-square':
      return <MessageSquare className={className} />
    case 'search':
      return <Search className={className} />
    case 'eye':
      return <Eye className={className} />
    case 'layers':
      return <Layers className={className} />
    case 'settings':
      return <Settings className={className} />
    case 'file-text':
      return <FileText className={className} />
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
    case 'sparkles':
      return <Sparkles className={className} />
    case 'bot':
    default:
      return <Bot className={className} />
  }
}

// Функція для отримання CSS-класів кольору бейджа іконки профілю
export function getProfileColorClasses(colorName: string): string {
  switch (colorName) {
    case 'sky':
      return 'bg-sky-500 text-white shadow-sky-500/20'
    case 'indigo':
      return 'bg-indigo-500 text-white shadow-indigo-500/20'
    case 'purple':
      return 'bg-purple-500 text-white shadow-purple-500/20'
    case 'pink':
      return 'bg-pink-500 text-white shadow-pink-500/20'
    case 'rose':
      return 'bg-rose-500 text-white shadow-rose-500/20'
    case 'amber':
      return 'bg-amber-500 text-white shadow-amber-500/20'
    case 'orange':
      return 'bg-orange-500 text-white shadow-orange-500/20'
    case 'teal':
      return 'bg-teal-500 text-white shadow-teal-500/20'
    case 'cyan':
      return 'bg-cyan-500 text-white shadow-cyan-500/20'
    case 'violet':
      return 'bg-violet-500 text-white shadow-violet-500/20'
    case 'slate':
      return 'bg-slate-600 text-white shadow-slate-600/20'
    case 'emerald':
    default:
      return 'bg-emerald-500 text-white shadow-emerald-500/20'
  }
}

// Текстовий колір для іконок без фону
export function getProfileTextColor(colorName: string): string {
  switch (colorName) {
    case 'sky':
      return 'text-sky-500'
    case 'indigo':
      return 'text-indigo-500'
    case 'purple':
      return 'text-purple-500'
    case 'pink':
      return 'text-pink-500'
    case 'rose':
      return 'text-rose-500'
    case 'amber':
      return 'text-amber-500'
    case 'orange':
      return 'text-orange-500'
    case 'teal':
      return 'text-teal-500'
    case 'cyan':
      return 'text-cyan-500'
    case 'violet':
      return 'text-violet-500'
    case 'slate':
      return 'text-slate-500'
    case 'emerald':
    default:
      return 'text-emerald-500'
  }
}
