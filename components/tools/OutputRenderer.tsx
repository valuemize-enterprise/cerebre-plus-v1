'use client'

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy, Share2, FileDown, FileText, Bookmark,
  BookmarkCheck, RefreshCw, CheckCheck, Coins,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { Button } from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface OutputRendererProps {
  content: string
  isStreaming?: boolean
  toolName?: string
  toolId?: string
  generationId?: string
  coinCost?: number
  isSaved?: boolean
  onSave?: () => void | Promise<void>
  onRegenerate?: () => void | Promise<void>
  onExportPDF?: () => void | Promise<void>
  onExportDocx?: () => void | Promise<void>
  className?: string
}

// ─────────────────────────────────────────────────────────────
// STREAMING CURSOR
// ─────────────────────────────────────────────────────────────

const StreamCursor = () => (
  <motion.span
    className="inline-block w-[2px] h-[1.1em] bg-cerebre-gold rounded-sm ml-[2px] align-text-bottom"
    animate={{ opacity: [1, 0, 1] }}
    transition={{ duration: 0.9, repeat: Infinity }}
    aria-hidden="true"
  />
)

// ─────────────────────────────────────────────────────────────
// CEREBRE TIP CALLOUT
// ─────────────────────────────────────────────────────────────

const CerebreTip = ({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
    className={twMerge(
      'mt-6 p-4 rounded-card',
      'bg-cerebre-gold-dim border border-cerebre-gold/30',
      'relative overflow-hidden',
    )}
  >
    {/* Decorative gold shimmer */}
    <motion.div
      className="absolute inset-0 bg-gold-shine pointer-events-none"
      initial={{ x: '-100%' }}
      animate={{ x: '200%' }}
      transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
    />
    <div className="relative z-10">
      <p className="text-xs font-semibold text-cerebre-gold uppercase tracking-widest mb-2">
        💡 Cerebre Tip
      </p>
      <p className="text-sm text-cerebre-text leading-relaxed">
        {text}
      </p>
    </div>
  </motion.div>
)

// ─────────────────────────────────────────────────────────────
// SECTION COPY BUTTON
// ─────────────────────────────────────────────────────────────

const SectionCopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={twMerge(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium',
        'border transition-all duration-200',
        copied
          ? 'border-cerebre-teal/40 text-cerebre-teal bg-cerebre-teal/10'
          : 'border-cerebre-border text-cerebre-muted hover:border-cerebre-gold/40 hover:text-cerebre-gold bg-transparent',
      )}
      title="Copy section"
      aria-label="Copy this section"
    >
      {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// MARKDOWN RENDERERS (custom Cerebre styling)
// ─────────────────────────────────────────────────────────────

const createMarkdownComponents = (
  onSectionRef: (el: HTMLElement | null, text: string) => void,
) => ({
  // H1 — Display font, gold, large
  h1: ({ children, ...props }: any) => (
    <motion.h1
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="font-display font-semibold text-2xl text-cerebre-gold leading-tight mt-6 mb-3 first:mt-0"
      {...props}
    >
      {children}
    </motion.h1>
  ),

  // H2 — Section boundary, gets a copy button
  h2: ({ children, ...props }: any) => {
    const sectionRef = React.useRef<HTMLElement | null>(null)
    const [sectionText, setSectionText] = React.useState('')

    return (
      <div className="group mt-6 mb-3 first:mt-0">
        <div className="flex items-center justify-between gap-2">
          <h2
            className="font-body font-bold text-lg text-cerebre-text border-b border-cerebre-border/50 pb-2 flex-1"
            ref={(el) => {
              sectionRef.current = el
              if (el) {
                const next = el.closest('.prose-cerebre')?.querySelector(`[data-section="${el.textContent}"]`)
                setSectionText(next?.textContent ?? el.textContent ?? '')
              }
            }}
            {...props}
          >
            {children}
          </h2>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <SectionCopyButton text={sectionText || String(children)} />
          </div>
        </div>
      </div>
    )
  },

  // H3 — Teal accent
  h3: ({ children, ...props }: any) => (
    <h3 className="font-body font-semibold text-base text-cerebre-teal mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),

  // Paragraphs
  p: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : ''

    // Detect Cerebre Tip
    if (text.startsWith('💡 CEREBRE TIP:')) {
      const tipText = text.replace('💡 CEREBRE TIP:', '').trim()
      return <CerebreTip text={tipText} />
    }

    return (
      <p className="text-[15px] text-cerebre-text leading-[1.8] mb-3 last:mb-0" {...props}>
        {children}
      </p>
    )
  },

  // UL — Gold bullet dots
  ul: ({ children, ...props }: any) => (
    <ul className="space-y-2 mb-4 ml-0 list-none" {...props}>{children}</ul>
  ),

  li: ({ children, ...props }: any) => (
    <li className="flex items-start gap-2.5 text-[15px] text-cerebre-text leading-relaxed" {...props}>
      <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cerebre-gold" aria-hidden="true" />
      <span>{children}</span>
    </li>
  ),

  // OL — numbered
  ol: ({ children, ...props }: any) => (
    <ol className="space-y-2 mb-4 pl-5 list-decimal marker:text-cerebre-gold marker:font-semibold" {...props}>
      {children}
    </ol>
  ),

  // Blockquote — gold left border
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="border-l-[3px] border-cerebre-gold pl-4 py-1 my-4 italic text-cerebre-muted text-[15px] leading-relaxed"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Inline code
  code: ({ inline, className, children, ...props }: any) => {
    if (inline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded text-[13px] font-mono text-cerebre-teal bg-cerebre-navy border border-cerebre-border/50"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code className={twMerge('block', className)} {...props}>
        {children}
      </code>
    )
  },

  // Code block
  pre: ({ children, ...props }: any) => (
    <pre
      className="my-4 p-4 rounded-card bg-cerebre-navy border border-cerebre-border overflow-x-auto text-[13px] font-mono leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),

  // Strong
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-white" {...props}>{children}</strong>
  ),

  // Em
  em: ({ children, ...props }: any) => (
    <em className="italic text-cerebre-teal-light" {...props}>{children}</em>
  ),

  // HR
  hr: (props: any) => (
    <hr className="my-5 border-t border-cerebre-border/40" {...props} />
  ),

  // Table
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4 rounded-card border border-cerebre-border">
      <table className="w-full text-sm border-collapse" {...props}>{children}</table>
    </div>
  ),

  thead: ({ children, ...props }: any) => (
    <thead className="bg-cerebre-gold-dim border-b border-cerebre-gold/30" {...props}>
      {children}
    </thead>
  ),

  th: ({ children, ...props }: any) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-cerebre-gold uppercase tracking-wide" {...props}>
      {children}
    </th>
  ),

  td: ({ children, ...props }: any) => (
    <td className="px-4 py-3 text-[13px] text-cerebre-text border-b border-cerebre-border/30 last:border-0" {...props}>
      {children}
    </td>
  ),

  tbody: ({ children, ...props }: any) => (
    <tbody className="divide-y divide-cerebre-border/30" {...props}>{children}</tbody>
  ),

  // Link
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      className="text-cerebre-gold hover:text-cerebre-gold-light underline underline-offset-2 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
})

// ─────────────────────────────────────────────────────────────
// COPY BUTTON
// ─────────────────────────────────────────────────────────────

const CopyAllButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      leftIcon={copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      onClick={handleCopy}
      className={copied ? 'border-cerebre-teal/40 text-cerebre-teal' : ''}
    >
      {copied ? 'Copied!' : 'Copy all'}
    </Button>
  )
}

// ─────────────────────────────────────────────────────────────
// WHATSAPP SHARE BUTTON
// ─────────────────────────────────────────────────────────────

const WhatsAppShareButton = ({
  content,
  toolName,
}: {
  content: string
  toolName?: string
}) => {
  const handleShare = () => {
    const summary = content.slice(0, 500).trim()
    const text = encodeURIComponent(
      `${toolName ? `*${toolName}* — generated by Cerebre Plus\n\n` : ''}${summary}${content.length > 500 ? '…' : ''}`,
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener')
  }

  return (
    <Button
      variant="whatsapp"
      size="sm"
      leftIcon={
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      }
      onClick={handleShare}
    >
      WhatsApp
    </Button>
  )
}

// ─────────────────────────────────────────────────────────────
// ACTION BAR
// ─────────────────────────────────────────────────────────────

const ActionBar = ({
  content,
  toolName,
  coinCost,
  isSaved,
  onSave,
  onRegenerate,
  onExportPDF,
  onExportDocx,
}: {
  content: string
  toolName?: string
  coinCost?: number
  isSaved?: boolean
  onSave?: () => void | Promise<void>
  onRegenerate?: () => void | Promise<void>
  onExportPDF?: () => void | Promise<void>
  onExportDocx?: () => void | Promise<void>
}) => {
  const [savePending, setSavePending] = React.useState(false)
  const [regenPending, setRegenPending] = React.useState(false)
  const [showRegenConfirm, setShowRegenConfirm] = React.useState(false)

  const handleSave = async () => {
    setSavePending(true)
    await onSave?.()
    setSavePending(false)
  }

  const handleRegen = async () => {
    if (!showRegenConfirm) { setShowRegenConfirm(true); return }
    setShowRegenConfirm(false)
    setRegenPending(true)
    await onRegenerate?.()
    setRegenPending(false)
  }

  return (
    <div
      className={twMerge(
        'flex items-center gap-1.5 flex-wrap',
        // Desktop: top-right float. Mobile: sticky bottom bar.
        'md:justify-end',
      )}
    >
      <CopyAllButton content={content} />
      <WhatsAppShareButton content={content} toolName={toolName} />

      {onExportPDF && (
        <Button variant="ghost" size="sm" leftIcon={<FileDown className="h-3.5 w-3.5" />} onClick={onExportPDF}>
          PDF
        </Button>
      )}
      {onExportDocx && (
        <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={onExportDocx}>
          Word
        </Button>
      )}

      {onSave && (
        <Button
          variant="ghost"
          size="sm"
          loading={savePending}
          leftIcon={
            isSaved
              ? <BookmarkCheck className="h-3.5 w-3.5 text-cerebre-gold" />
              : <Bookmark className="h-3.5 w-3.5" />
          }
          onClick={handleSave}
          className={isSaved ? 'border-cerebre-gold/40 text-cerebre-gold' : ''}
        >
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      )}

      {onRegenerate && (
        <AnimatePresence mode="wait">
          {showRegenConfirm ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-button bg-cerebre-gold-dim border border-cerebre-gold/30 text-xs"
            >
              <Coins className="h-3 w-3 text-cerebre-gold" />
              <span className="text-cerebre-gold font-medium">
                Use {coinCost ?? '?'} coins?
              </span>
              <button
                className="ml-1.5 text-cerebre-gold hover:text-cerebre-gold-light font-semibold"
                onClick={handleRegen}
              >Yes</button>
              <button
                className="text-cerebre-muted hover:text-cerebre-text"
                onClick={() => setShowRegenConfirm(false)}
              >No</button>
            </motion.div>
          ) : (
            <motion.div key="regen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="ghost"
                size="sm"
                loading={regenPending}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={handleRegen}
              >
                Redo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// STREAMING TEXT (word-by-word reveal)
// ─────────────────────────────────────────────────────────────

// const StreamingText = ({ content }: { content: string }) => (
//   <div className="prose-cerebre whitespace-pre-wrap text-[15px] leading-[1.8] text-cerebre-text">
//     {content}
//     <StreamCursor />
//   </div>
// )

// ─────────────────────────────────────────────────────────────
// MAIN OUTPUT RENDERER
// ─────────────────────────────────────────────────────────────

export const OutputRenderer = ({
  content,
  isStreaming = false,
  toolName,
  coinCost,
  isSaved,
  onSave,
  onRegenerate,
  onExportPDF,
  onExportDocx,
  className,
}: OutputRendererProps) => {
  const sectionTextMap = React.useRef<Map<HTMLElement, string>>(new Map())

  const handleSectionRef = (el: HTMLElement | null, text: string) => {
    if (el) sectionTextMap.current.set(el, text)
  }

  if (!content && !isStreaming) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={twMerge('w-full', className)}
    >
      {/* Action bar — sticky on mobile, top on desktop */}
      {!isStreaming && content && (
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cerebre-muted uppercase tracking-widest">
              Output
            </span>
            {isStreaming && (
              <span className="badge-gold text-[10px] px-1.5 py-0.5">
                Streaming…
              </span>
            )}
          </div>
          <ActionBar
            content={content}
            toolName={toolName}
            coinCost={coinCost}
            isSaved={isSaved}
            onSave={onSave}
            onRegenerate={onRegenerate}
            onExportPDF={onExportPDF}
            onExportDocx={onExportDocx}
          />
        </div>
      )}

      {/* Content area */}
      <div
        className={twMerge(
          'relative rounded-card border border-cerebre-border bg-cerebre-navy',
          'p-4 md:p-5',
          isStreaming && 'min-h-[200px]',
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isStreaming ? 'streaming' : 'complete'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="prose-cerebre"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={createMarkdownComponents(handleSectionRef)}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && <StreamCursor />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile sticky action bar */}
      {!isStreaming && content && (
        <div className="md:hidden mt-3 p-3 rounded-card border border-cerebre-border bg-cerebre-surface sticky bottom-[73px] z-40 backdrop-blur-sm">
          <ActionBar
            content={content}
            toolName={toolName}
            coinCost={coinCost}
            isSaved={isSaved}
            onSave={onSave}
            onRegenerate={onRegenerate}
            onExportPDF={onExportPDF}
            onExportDocx={onExportDocx}
          />
        </div>
      )}
    </motion.div>
  )
}
