// /app/cerebre-admin/page.tsx
// Root redirect — this file MUST exist or Next.js 404s all child routes.
import { redirect } from 'next/navigation'

export default function AdminRoot() {
  redirect('/cerebre-admin/dashboard')
}
