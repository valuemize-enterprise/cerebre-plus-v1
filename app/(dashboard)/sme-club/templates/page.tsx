'use client'
// /app/(dashboard)/sme-club/templates/page.tsx
// Template Thursday vault — all downloadable templates.

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Download, ArrowLeft, Search } from 'lucide-react'

const N2    = '#0D2040'
const GOLD  = '#E09818'
const GL    = '#F5B830'
const TEAL  = '#12D4B4'
const W     = '#EBF2FC'
const DIM   = 'rgba(205,217,236,0.65)'
const MUTED = 'rgba(205,217,236,0.35)'
const B     = 'rgba(255,255,255,0.08)'

const CATEGORY_COLORS: Record<string, string> = {
  captions:  '#E1306C',
  strategy:  '#8B5CF6',
  email:     GOLD,
  whatsapp:  '#25D366',
  sales:     TEAL,
  ads:       '#3B82F6',
  general:   '#6B7280',
}

const CATEGORIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'captions',  label: 'Captions' },
  { value: 'strategy',  label: 'Strategy' },
  { value: 'email',     label: 'Email' },
  { value: 'whatsapp',  label: 'WhatsApp' },
  { value: 'sales',     label: 'Sales' },
  { value: 'ads',       label: 'Ads' },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [category,  setCategory]  = useState('all')
  const [search,    setSearch]    = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const url = category !== 'all' ? `/api/club/templates?category=${category}` : '/api/club/templates'
    fetch(url).then(r => r.json()).then(d => {
      setTemplates(d.templates ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [category])

  const handleDownload = async (template: any) => {
    if (!template.file_url) return
    setDownloading(template.id)
    await fetch('/api/club/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: template.id }),
    }).catch(() => {})
    window.open(template.file_url, '_blank')
    setDownloading(null)
  }

  const filtered = templates.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/sme-club" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: MUTED, textDecoration: 'none', marginBottom: 12 }}>
          <ArrowLeft size={14} /> SME Club
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>📄</span>
          <h1 style={{ fontFamily: "'Georgia',serif", fontSize: 24, fontWeight: 900, color: W, margin: 0 }}>Templates Vault</h1>
        </div>
        <p style={{ fontSize: 14, color: MUTED, maxWidth: 520 }}>
          Every Template Thursday drop — ready to download and use. Earn 2 points every time you download.
        </p>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${B}`, borderRadius: 10,
              color: W, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setCategory(cat.value)}
              style={{
                padding: '8px 14px', borderRadius: 20, border: `1px solid ${category === cat.value ? GL + '40' : B}`,
                background: category === cat.value ? `${GL}12` : 'transparent',
                color: category === cat.value ? GL : MUTED,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ background: N2, borderRadius: 14, height: 180, border: `1px solid ${B}`, opacity: 0.4 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: N2, border: `1px solid ${B}`, borderRadius: 16, padding: 60, textAlign: 'center' }}>
          <FileText size={40} style={{ color: MUTED, marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: W, marginBottom: 6 }}>
            {search ? 'No templates match your search' : 'Templates coming soon'}
          </p>
          <p style={{ fontSize: 13, color: MUTED }}>
            {search ? 'Try a different search term.' : 'New templates drop every Thursday. Check back soon!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {filtered.map((t: any) => {
            const catColor = CATEGORY_COLORS[t.category] ?? MUTED
            return (
              <div key={t.id} style={{ background: N2, border: `1px solid ${B}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${catColor}40` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = B }}>

                {/* Thumbnail */}
                <div style={{ height: 120, background: `${catColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {t.thumbnail_url
                    ? <img src={t.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <FileText size={36} style={{ color: catColor, opacity: 0.5 }} />
                  }
                  {t.week_label && (
                    <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.65)', color: W }}>
                      {t.week_label}
                    </span>
                  )}
                  <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: `${catColor}CC`, color: '#fff', textTransform: 'capitalize' }}>
                    {t.category}
                  </span>
                </div>

                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: W, margin: '0 0 4px' }}>{t.title}</p>
                  {t.description && (
                    <p style={{ fontSize: 12.5, color: DIM, margin: '0 0 10px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                      {t.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: MUTED }}>{t.download_count} downloads</span>
                    <button
                      onClick={() => handleDownload(t)}
                      disabled={downloading === t.id || !t.file_url}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                        borderRadius: 8, border: 'none', cursor: t.file_url ? 'pointer' : 'not-allowed',
                        background: t.file_url ? `linear-gradient(135deg,${GOLD},${GL})` : 'rgba(255,255,255,0.06)',
                        color: t.file_url ? '#071528' : MUTED,
                        fontWeight: 700, fontSize: 12, fontFamily: 'inherit', opacity: downloading === t.id ? 0.7 : 1,
                      }}>
                      <Download size={12} />
                      {downloading === t.id ? 'Opening…' : t.file_url ? 'Download' : 'Coming soon'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
