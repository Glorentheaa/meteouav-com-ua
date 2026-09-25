import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface GeminiMarkdownProps {
  content: string
  className?: string
}

export const GeminiMarkdown: React.FC<GeminiMarkdownProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (e) {
      console.error('Не вдалося скопіювати код:', e)
    }
  }

  // Розбиваємо текст на блоки (блоки коду ``` та звичайний текст/таблиці)
  const renderFormattedBlocks = (text: string) => {
    const parts: React.ReactNode[] = []
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    let blockCounter = 0

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const precedingText = text.substring(lastIndex, match.index)
      if (precedingText) {
        parts.push(
          <React.Fragment key={`text-${blockCounter}`}>
            {renderMarkdownParagraphs(precedingText)}
          </React.Fragment>
        )
      }

      const lang = match[1] || 'plaintext'
      const code = match[2]
      const currentBlockId = blockCounter

      parts.push(
        <div
          key={`code-${currentBlockId}`}
          className="my-3 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-100 shadow-md font-mono text-sm"
        >
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 border-b border-slate-700 text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">{lang}</span>
            <button
              type="button"
              onClick={() => handleCopyCode(code, currentBlockId)}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors py-0.5 px-1.5 rounded hover:bg-slate-700"
              title="Скопіювати код"
            >
              {copiedIndex === currentBlockId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs">Скопійовано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копіювати</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 overflow-x-auto text-xs sm:text-sm leading-relaxed text-slate-200">
            <code>{code}</code>
          </pre>
        </div>
      )

      blockCounter++
      lastIndex = match.index + match[0].length
    }

    const remainingText = text.substring(lastIndex)
    if (remainingText) {
      parts.push(
        <React.Fragment key={`text-final-${blockCounter}`}>
          {renderMarkdownParagraphs(remainingText)}
        </React.Fragment>
      )
    }

    return parts
  }

  // Рендер абзаців, списків, заголовків, цитат та таблиць
  const renderMarkdownParagraphs = (raw: string) => {
    const lines = raw.split('\n')
    const elements: React.ReactNode[] = []
    let inList = false
    let listItems: React.ReactNode[] = []
    let inTable = false
    let tableRows: string[][] = []

    const flushList = (keyPrefix: string) => {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`${keyPrefix}-ul`} className="list-disc pl-5 my-2 space-y-1">
            {listItems}
          </ul>
        )
        listItems = []
        inList = false
      }
    }

    const flushTable = (keyPrefix: string) => {
      if (inTable && tableRows.length > 0) {
        const [headerRow, ...bodyRows] = tableRows
        elements.push(
          <div key={`${keyPrefix}-table`} className="my-3 overflow-x-auto rounded-lg border border-slate-300 dark:border-slate-700">
            <table className="w-full text-left text-sm border-collapse">
              {headerRow && (
                <thead className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-300 dark:border-slate-700">
                  <tr>
                    {headerRow.map((cell, idx) => (
                      <th key={idx} className="px-3 py-2">
                        {renderInline(cell.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {bodyRows
                  .filter((r) => !r.every((c) => c.trim().match(/^:?-+:?$/)))
                  .map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                          {renderInline(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
        inTable = false
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Таблиця (рядки з |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList(`flush-list-${i}`)
        inTable = true
        const cells = trimmed
          .slice(1, -1)
          .split('|')
        tableRows.push(cells)
        continue
      } else {
        flushTable(`flush-tbl-${i}`)
      }

      // Маркований список
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true
        listItems.push(
          <li key={`li-${i}`} className="text-slate-800 dark:text-slate-200">
            {renderInline(trimmed.substring(2))}
          </li>
        )
        continue
      } else if (trimmed.match(/^\d+\.\s/)) {
        // Нумерований список
        flushList(`flush-list-num-${i}`)
        elements.push(
          <div key={`num-${i}`} className="flex items-start gap-2 my-1">
            <span className="font-semibold text-sky-600 dark:text-sky-400 shrink-0">
              {trimmed.match(/^\d+\./)?.[0]}
            </span>
            <span className="text-slate-800 dark:text-slate-200">
              {renderInline(trimmed.replace(/^\d+\.\s*/, ''))}
            </span>
          </div>
        )
        continue
      } else {
        flushList(`flush-list-end-${i}`)
      }

      // Заголовки ###, ##, #
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h4-${i}`} className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1.5">
            {renderInline(trimmed.substring(4))}
          </h4>
        )
        continue
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2">
            {renderInline(trimmed.substring(3))}
          </h3>
        )
        continue
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-6 mb-3">
            {renderInline(trimmed.substring(2))}
          </h2>
        )
        continue
      }

      // Цитати >
      if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote
            key={`quote-${i}`}
            className="border-l-4 border-sky-500 pl-3 my-2.5 py-1 text-slate-700 dark:text-slate-300 bg-sky-500/5 dark:bg-sky-500/10 rounded-r-lg italic text-sm"
          >
            {renderInline(trimmed.substring(2))}
          </blockquote>
        )
        continue
      }

      // Звичайний текст
      if (trimmed.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="my-1.5 leading-relaxed text-slate-800 dark:text-slate-200 text-sm sm:text-base">
            {renderInline(line)}
          </p>
        )
      }
    }

    flushList('flush-final-list')
    flushTable('flush-final-tbl')

    return elements
  }

  // Інлайн парсер для жирного шрифту, курсиву, посилань та інлайн коду
  const renderInline = (str: string): React.ReactNode => {
    // Розбираємо **bold**, `code`, *italic*
    const tokens: React.ReactNode[] = []
    const inlineRegex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g
    let last = 0
    let m: RegExpExecArray | null
    let key = 0

    while ((m = inlineRegex.exec(str)) !== null) {
      if (m.index > last) {
        tokens.push(str.substring(last, m.index))
      }
      const tok = m[0]
      if (tok.startsWith('**') && tok.endsWith('**')) {
        tokens.push(
          <strong key={key++} className="font-semibold text-slate-900 dark:text-slate-100">
            {tok.slice(2, -2)}
          </strong>
        )
      } else if (tok.startsWith('`') && tok.endsWith('`')) {
        tokens.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-300 font-mono text-xs sm:text-sm border border-slate-300 dark:border-slate-700"
          >
            {tok.slice(1, -1)}
          </code>
        )
      } else if (tok.startsWith('*') && tok.endsWith('*')) {
        tokens.push(
          <em key={key++} className="italic text-slate-700 dark:text-slate-300">
            {tok.slice(1, -1)}
          </em>
        )
      }
      last = m.index + tok.length
    }

    if (last < str.length) {
      tokens.push(str.substring(last))
    }

    return tokens.length > 0 ? tokens : str
  }

  return <div className={`gemini-markdown space-y-1 ${className}`}>{renderFormattedBlocks(content)}</div>
}
