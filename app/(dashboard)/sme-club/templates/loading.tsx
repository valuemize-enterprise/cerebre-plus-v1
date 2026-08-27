import React from 'react'
export default function Loading() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, height: 180, border: '1px solid rgba(255,255,255,0.06)', opacity: 0.5 }} />
        ))}
      </div>
    </div>
  )
}
