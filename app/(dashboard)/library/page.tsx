'use client'
// ═══════════════════════════════════════════════════════════════
// /app/(dashboard)/library/page.tsx
// Saved generations organised into named collections.
// Share collection → public read-only URL.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark, FolderPlus, Share2, Trash2,
  ChevronDown, ChevronRight, Check, X,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { getTool } from '@/lib/tools/registry'
import { useToast } from '@/components/ui/ModalToastSelect'
import { getServerUser } from '@/lib/supabase/server'

const NAVY = '#0B1F3A'
// const GOLD = '#E09818'

type SavedItem = {
  id: string
  generation_id: string
  collection: string
  note: string | null
  generations: {
    tool_id: string
    tool_name: string
    output: string | null
    created_at: string
  }
}

type ShareToken = {
  id: string
  token: string
  collection: string
  created_at: string
}

// ─────────────────────────────────────────────────────────────
// NEW COLLECTION DIALOG
// ─────────────────────────────────────────────────────────────

function NewCollectionDialog({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0B1F3A] p-6"
      >
        <h3 className="text-base font-bold text-white mb-4">New collection</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onCreate(name.trim())}
          placeholder="e.g. My Best Captions, November Campaign…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#E09818]/40"
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => name.trim() && onCreate(name.trim())}
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-[#E09818] py-2.5 text-sm font-bold text-[#0B1F3A] disabled:opacity-40"
          >
            Create
          </button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-white/60">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// COLLECTION SECTION
// ─────────────────────────────────────────────────────────────

function CollectionSection({
  name,
  items,
  shareToken,
  onShare,
  onDelete,
  onRemoveItem,
}: {
  name: string
  items: SavedItem[]
  shareToken: ShareToken | null
  onShare: () => void
  onDelete: () => void
  onRemoveItem: (id: string) => void
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)

  const copyShareLink = async () => {
    if (!shareToken) { onShare(); return }
    const url = `${window.location.origin}/share/${shareToken.token}`
    await navigator.clipboard.writeText(url)
    setLinkCopied(true)
    toast({ id: url, type: 'success', title: 'Link copied!', description: 'Share this link for public read-only access' })
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setOpen(!open)} className="flex flex-1 items-center gap-2 min-w-0">
          {open ? <ChevronDown className="h-4 w-4 text-white/40 shrink-0" /> : <ChevronRight className="h-4 w-4 text-white/40 shrink-0" />}
          <span className="font-semibold text-white truncate">{name}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40">{items.length}</span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={copyShareLink}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-all ${linkCopied
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                : shareToken
                  ? 'border-[#E09818]/30 bg-[#E09818]/10 text-[#E09818]'
                  : 'border-white/10 text-white/40 hover:text-white/60'
              }`}
          >
            {linkCopied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
            <span>{linkCopied ? 'Copied' : shareToken ? 'Shared' : 'Share'}</span>
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg border border-red-500/20 p-1 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-white/30">No items in this collection yet</p>
            ) : (
              <div className="divide-y divide-white/5">
                {items.map((item) => {
                  const tool = getTool(item.generations.tool_id)
                  const preview = (item.generations?.output ?? '').replace(/#{1,6}\s/g, '').slice(0, 80)
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5">
                      <span className="text-lg shrink-0">{tool?.icon || '✨'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white/60">{item.generations.tool_name}</p>
                        <p className="text-sm text-white/70 truncate">{preview}…</p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="shrink-0 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────




export default function LibraryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const [items, setItems] = useState<SavedItem[] | []>([])
  const [shareTokens, setShareTokens] = useState<ShareToken[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)

  const loadLibrary = useCallback(async () => {
    setLoading(true)
    const [{ data: saved }, { data: tokens }] = await Promise.all([
      supabase
        .from('saved_library')
        .select('id, generation_id, collection, note, generations(tool_id, tool_name, output, created_at)')
        .order('created_at', { ascending: false }),
      supabase
        .from('share_tokens')
        .select('id, token, collection, created_at'),
    ])
    setItems(
      ((saved || [])
        .filter(item => item.generations && !Array.isArray(item.generations))
        .map(item => ({
          ...item,
          generations: {
            ...(item.generations as any),
            output: (item.generations as any).output ?? '',
          }
        }))) as unknown as SavedItem[]
    )
    setShareTokens((tokens || []) as ShareToken[])
    setLoading(false)
  }, [])

  useEffect(() => { loadLibrary() }, [loadLibrary])

  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const user = await supabase.auth.getUser()
      setId(user.data.user?.id ?? null)
    }

    loadUser()
  }, [])

  // Group by collection
  const collections = items.reduce<Record<string, SavedItem[]>>((acc, item) => {
    const col = item.collection || 'Unsorted'
    if (!acc[col]) acc[col] = []
    acc[col].push(item)
    return acc
  }, {})

  const handleCreateCollection = async (name: string) => {
    setShowNewDialog(false)
    // Collections are created by saving items into them
    toast({ id: name, type: 'success', title: 'Collection created', description: `"${name}" is ready — save outputs to it from the History page` })
  }

  const handleShare = async (collection: string) => {
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const { error } = await supabase.from('share_tokens').insert({
      token,
      collection,
      user_id: id!,
      generation_id: null,
      expires_at: null,
    })
    if (error) {
      toast({ id: collection, type: 'error', title: 'Could not create share link', description: error.message })
    } else {
      const url = `${window.location.origin}/share/${token}`
      await navigator.clipboard.writeText(url)
      toast({ id: collection, type: 'success', title: 'Share link created!', description: 'Anyone with the link can view this collection' })
      loadLibrary()
    }
  }

  const handleDeleteCollection = async (collection: string) => {
    const { error } = await supabase.from('saved_library').delete().eq('collection', collection)
    if (!error) {
      await supabase.from('share_tokens').delete().eq('collection', collection)
      loadLibrary()
      toast({ id: collection, type: 'success', title: 'Collection deleted' })
    }
  }

  const handleRemoveItem = async (id: string) => {
    await supabase.from('saved_library').delete().eq('id', id)
    loadLibrary()
  }

  const collectionNames = Object.keys(collections)

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: NAVY }}>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Library</h1>
            <p className="mt-1 text-sm text-white/40">Your saved and starred outputs — organised into collections</p>
          </div>
          <button
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#E09818] px-3 py-2 text-xs font-bold text-[#0B1F3A] hover:opacity-90"
          >
            <FolderPlus className="h-3.5 w-3.5" /> New collection
          </button>
        </div>

        {/* ── Content ─────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />)}
          </div>
        ) : collectionNames.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 py-20 text-center">
            <Bookmark className="mx-auto mb-4 h-10 w-10 text-white/15" />
            <p className="text-base font-semibold text-white/40">No saved outputs yet</p>
            <p className="mt-2 text-sm text-white/25">Star any generation from History to save it here</p>
            <button
              onClick={() => router.push('/history')}
              className="mt-6 rounded-xl bg-[#E09818]/15 border border-[#E09818]/30 px-5 py-2.5 text-sm font-bold text-[#E09818] hover:bg-[#E09818]/25"
            >
              Browse your history →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {collectionNames.map((col) => (
              <CollectionSection
                key={col}
                name={col}
                items={collections[col]}
                shareToken={shareTokens.find((t) => t.collection === col) || null}
                onShare={() => handleShare(col)}
                onDelete={() => handleDeleteCollection(col)}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>
        )}

        {/* ── How to save tip ─────────────────────── */}
        {collectionNames.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-white/3 p-4 text-center">
            <p className="text-xs text-white/30">
              Save outputs from the{' '}
              <button onClick={() => router.push('/history')} className="text-[#E09818] hover:underline">History page</button>
              {' '}by clicking the Bookmark icon on any generation
            </p>
          </div>
        )}

      </div>

      {/* ── New collection dialog ──────────────────── */}
      <AnimatePresence>
        {showNewDialog && (
          <NewCollectionDialog
            onClose={() => setShowNewDialog(false)}
            onCreate={handleCreateCollection}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
