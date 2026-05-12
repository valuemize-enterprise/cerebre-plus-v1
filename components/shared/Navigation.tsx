'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Zap, Clock, Library,
  Lightbulb, User, CreditCard, Users2, LifeBuoy,
  ChevronLeft, ChevronRight, Bell, ChevronDown,
  LogOut, Settings, HelpCircle, MessageSquare,
  Sparkles, Eye, Palette,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { Badge, planBadgeVariant, CoinDisplay } from '../../components/ui/CardBadgeSkeleton'

// ─────────────────────────────────────────────────────────────
// NAV ITEM DEFINITIONS
// ─────────────────────────────────────────────────────────────

interface NavItemDef {
  label: string
  href: string
  icon: React.ElementType
  section?: string
  badge?: string
}

const NAV_ITEMS: NavItemDef[] = [
  // ── Main ────────────────────────────────────────────────────
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'main' },
  { label: 'Tools', href: '/tools', icon: Zap, section: 'main' },
  { label: 'History', href: '/history', icon: Clock, section: 'main' },
  { label: 'library', href:'/library?tab=saved', icon: Library, section: 'main' },

  // ── Marketing ───────────────────────────────────────────────
  { label: 'Ideas', href: '/ideas', icon: Sparkles, section: 'marketing', badge: 'Daily' },
  { label: 'Competitor', href: '/competitor', icon: Eye, section: 'marketing' },
  { label: 'Brand Vault', href: '/brand', icon: Palette, section: 'marketing' },
  { label: 'Insights', href: '/insights', icon: Lightbulb, section: 'marketing' },

  // ── Account ─────────────────────────────────────────────────
  { label: 'Profile', href: '/profile', icon: User, section: 'account' },
  { label: 'Billing', href: '/billing', icon: CreditCard, section: 'account' },
  { label: 'Referrals', href: '/referral', icon: Users2, section: 'account' },
  { label: 'Settings', href: '/settings', icon: Settings, section: 'account' },

  // ── Support ─────────────────────────────────────────────────
  { label: 'Help', href: '/help', icon: LifeBuoy, section: 'support' },
]

const SECTION_LABELS: Record<string, string> = {
  main: 'Main',
  marketing: 'Marketing',
  account: 'Account',
  support: 'Support',
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR NAV ITEM
// ─────────────────────────────────────────────────────────────

const SidebarNavItem = ({
  item,
  collapsed,
  isActive,
  onClick,
}: {
  item: NavItemDef
  collapsed: boolean
  isActive: boolean
  onClick: () => void
}) => {
  const Icon = item.icon

  const inner = (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={twMerge(
        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm',
        'transition-all duration-150 focus-visible:ring-2 focus-visible:ring-cerebre-gold focus-visible:outline-none',
        'relative group',
        isActive
          ? 'bg-cerebre-gold-dim text-cerebre-gold font-semibold'
          : 'text-cerebre-muted hover:text-cerebre-text hover:bg-white/[0.04]',
        collapsed && 'justify-center px-2',
      )}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cerebre-gold rounded-r-full"
          transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        />
      )}

      <Icon className={twMerge('flex-shrink-0', collapsed ? 'h-4.5 w-4.5' : 'h-4 w-4')} />

      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {item.badge && (
            <Badge variant="new" size="xs">{item.badge}</Badge>
          )}
        </>
      )}
    </motion.button>
  )

  if (!collapsed) return inner

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{inner}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="right"
            sideOffset={8}
            className="z-tooltip px-2.5 py-1.5 rounded-lg bg-cerebre-surface border border-cerebre-border text-xs text-cerebre-text shadow-cerebre whitespace-nowrap"
          >
            {item.label}
            <TooltipPrimitive.Arrow className="fill-cerebre-border" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────

export interface SidebarProps {
  coinBalance: number
  planTier: string
  renewsInDays?: number
  userInitials?: string
  userName?: string
  userEmail?: string
  notifCount?: number
  onSignOut?: () => void
}

export const Sidebar = ({
  coinBalance,
  planTier,
  renewsInDays,
  userInitials = 'CB',
  userName,
  userEmail,
  onSignOut,
}: SidebarProps) => {
  const [collapsed, setCollapsed] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href.includes('?')) return pathname === href.split('?')[0]
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Group items by section
  const sections = React.useMemo(() => {
    const map: Record<string, NavItemDef[]> = {}
    for (const item of NAV_ITEMS) {
      const s = item.section ?? 'main'
      map[s] = map[s] ?? []
      map[s].push(item)
    }
    return Object.entries(map)
  }, [])

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={twMerge(
        'hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0',
        'bg-cerebre-ink border-r border-cerebre-border',
        'overflow-hidden',
      )}
      aria-label="Main navigation"
    >
      {/* Logo area */}
      <div className={twMerge(
        'flex items-center h-16 border-b border-cerebre-border px-3 flex-shrink-0',
        collapsed ? 'justify-center' : 'justify-between',
      )}>
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-cerebre-gold flex items-center justify-center flex-shrink-0">
                <span className="text-cerebre-ink font-black text-xs font-mono">C+</span>
              </div>
              <div>
                <p className="text-sm font-bold text-cerebre-text leading-none">Cerebre Plus</p>
                <p className="text-[10px] text-cerebre-muted leading-none mt-0.5">by Cerebre Media Africa</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-7 h-7 rounded-lg bg-cerebre-gold flex items-center justify-center"
            >
              <span className="text-cerebre-ink font-black text-xs font-mono">C+</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-cerebre-muted hover:text-cerebre-text hover:bg-cerebre-border/30 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Expand button (collapsed state) */}
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-1 h-7 w-7 flex items-center justify-center rounded-md text-cerebre-muted hover:text-cerebre-text hover:bg-cerebre-border/30 transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {sections.map(([section, items]) => (
          <div key={section} className="mb-4">
            {!collapsed && (
              <p className="px-2.5 mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-cerebre-subtle">
                {SECTION_LABELS[section]}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive(item.href)}
                  onClick={() => router.push(item.href)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: coin balance + user */}
      <div className="border-t border-cerebre-border p-2 flex-shrink-0 space-y-2">
        {/* Coin balance */}
        <CoinDisplay
          balance={coinBalance}
          renewsInDays={renewsInDays}
          planTier={planTier}
          variant={collapsed ? 'small' : 'medium'}
          className="w-full"
        />

        {/* User row */}
        {!collapsed ? (
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-cerebre-border/20 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-cerebre-gold flex items-center justify-center flex-shrink-0">
              <span className="text-cerebre-ink text-[10px] font-black">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              {userName && <p className="text-xs font-semibold text-cerebre-text truncate">{userName}</p>}
              {userEmail && <p className="text-[10px] text-cerebre-muted truncate">{userEmail}</p>}
            </div>
            <Badge variant={planBadgeVariant[planTier] ?? 'muted'} size="xs">
              {planTier.charAt(0).toUpperCase() + planTier.slice(1)}
            </Badge>
          </button>
        ) : (
          <div className="flex justify-center">
            <div className="w-7 h-7 rounded-full bg-cerebre-gold flex items-center justify-center">
              <span className="text-cerebre-ink text-[10px] font-black">{userInitials}</span>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}

// ─────────────────────────────────────────────────────────────
// MOBILE BOTTOM NAV
// ─────────────────────────────────────────────────────────────

const MOBILE_TABS = [
  { label: 'Home',       href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tools',      href: '/tools',     icon: Zap },
  { label: 'Ideas',      href: '/ideas',     icon: Sparkles },
  { label: 'You',        href: '/profile',   icon: User },
]

export interface MobileNavProps {
  notifCount?: number
}

export const MobileNav = ({ notifCount = 0 }: MobileNavProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <nav
      className={twMerge(
        'fixed bottom-0 left-0 right-0 z-nav',
        'md:hidden',
        'bg-cerebre-ink/95 backdrop-blur-xl border-t border-cerebre-border',
        'px-2 safe-area-bottom',
        'flex items-center justify-around',
        'h-[60px]',
      )}
      aria-label="Mobile navigation"
    >
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon
        const active = isActive(tab.href)
        const showBadge = tab.label === 'Home' && notifCount > 0

        return (
          <button
            key={tab.href}
            type="button"
            onClick={() => router.push(tab.href)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
            className={twMerge(
              'relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl',
              'transition-colors duration-150 min-w-[56px] touch-target',
              active ? 'text-cerebre-gold' : 'text-cerebre-muted',
            )}
          >
            <motion.div
              animate={{ scale: active ? 1.1 : 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <Icon className="h-[22px] w-[22px]" />
            </motion.div>

            <span className="text-[10px] font-medium leading-none">{tab.label}</span>

            {/* Active gold dot */}
            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="mobile-active-dot"
                  className="absolute -bottom-0 w-1 h-1 rounded-full bg-cerebre-gold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>

            {/* Notification badge */}
            {showBadge && (
              <span className="absolute top-1 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-cerebre-coral text-[9px] font-bold text-white">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────
// TOP NAV
// ─────────────────────────────────────────────────────────────

export interface TopNavProps {
  title?: string
  breadcrumbs?: { label: string; href?: string }[]
  coinBalance: number
  planTier: string
  notifCount?: number
  userInitials?: string
  userName?: string
  userEmail?: string
  onSignOut?: () => void
  renewsInDays?: number
}

export const TopNav = ({
  title,
  breadcrumbs,
  coinBalance,
  planTier,
  notifCount = 0,
  userInitials = 'CB',
  userName,
  userEmail,
  onSignOut,
  renewsInDays,
}: TopNavProps) => {
  const router = useRouter()
  const [scrolled, setScrolled] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className={twMerge(
        'sticky top-0 z-nav h-16 flex items-center gap-4 px-4 md:px-6',
        'bg-cerebre-ink/95 backdrop-blur-xl',
        'transition-all duration-200',
        scrolled ? 'border-b border-cerebre-border shadow-cerebre' : 'border-b border-transparent',
      )}
    >
      {/* Mobile logo (hidden on desktop where sidebar has logo) */}
      <div className="md:hidden flex items-center gap-2 mr-1">
        <div className="w-7 h-7 rounded-lg bg-cerebre-gold flex items-center justify-center">
          <span className="text-cerebre-ink font-black text-xs font-mono">C+</span>
        </div>
      </div>

      {/* Title / breadcrumbs */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-cerebre-border">/</span>}
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => router.push(crumb.href!)}
                    className="text-cerebre-muted hover:text-cerebre-text transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-semibold text-cerebre-text truncate">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : title ? (
          <h1 className="font-display font-semibold text-lg text-cerebre-text truncate">{title}</h1>
        ) : null}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-shrink-0" ref={menuRef}>
        {/* Coin balance chip */}
        <CoinDisplay
          balance={coinBalance}
          renewsInDays={renewsInDays}
          planTier={planTier}
          variant="small"
          className="hidden sm:flex"
        />

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false) }}
            className="relative h-9 w-9 flex items-center justify-center rounded-lg text-cerebre-muted hover:text-cerebre-text hover:bg-cerebre-border/30 transition-colors"
            aria-label={`Notifications${notifCount > 0 ? ` (${notifCount} unread)` : ''}`}
          >
            <Bell className="h-4.5 w-4.5" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cerebre-coral text-[8px] font-bold text-white">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className={twMerge(
                  'absolute right-0 top-full mt-2 z-modal',
                  'w-80 rounded-card border border-cerebre-border',
                  'bg-cerebre-surface shadow-cerebre-xl overflow-hidden',
                )}
                role="menu"
                aria-label="Notifications"
              >
                <div className="px-4 py-3 border-b border-cerebre-border">
                  <p className="text-sm font-semibold text-cerebre-text">Notifications</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-sm text-cerebre-muted">You're all caught up! 🎉</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-cerebre-border/30 transition-colors"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="w-7 h-7 rounded-full bg-cerebre-gold flex items-center justify-center flex-shrink-0">
              <span className="text-cerebre-ink text-[10px] font-black">{userInitials}</span>
            </div>
            <ChevronDown className={twMerge(
              'hidden sm:block h-3.5 w-3.5 text-cerebre-muted transition-transform duration-200',
              userMenuOpen && 'rotate-180',
            )} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className={twMerge(
                  'absolute right-0 top-full mt-2 z-modal',
                  'w-60 rounded-card border border-cerebre-border',
                  'bg-cerebre-surface shadow-cerebre-xl overflow-hidden',
                )}
                role="menu"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-cerebre-border">
                  {userName && (
                    <p className="text-sm font-semibold text-cerebre-text truncate">{userName}</p>
                  )}
                  {userEmail && (
                    <p className="text-xs text-cerebre-muted truncate">{userEmail}</p>
                  )}
                  <div className="mt-1.5">
                    <Badge variant={planBadgeVariant[planTier] ?? 'muted'} size="xs">
                      {planTier.charAt(0).toUpperCase() + planTier.slice(1)} plan
                    </Badge>
                  </div>
                </div>

                {/* Menu items */}
                {[
                  { label: 'Profile', icon: User, href: '/profile' },
                  { label: 'Billing & Coins', icon: CreditCard, href: '/billing' },
                  { label: 'Settings', icon: Settings, href: '/settings' },
                  { label: 'Help & Support', icon: HelpCircle, href: '/help' },
                  { label: 'Give feedback', icon: MessageSquare, href: '/feedback' },
                ].map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    role="menuitem"
                    onClick={() => { router.push(item.href); setUserMenuOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-cerebre-muted hover:text-cerebre-text hover:bg-cerebre-border/20 transition-colors"
                  >
                    <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                    {item.label}
                  </button>
                ))}

                {/* Sign out */}
                {onSignOut && (
                  <>
                    <div className="border-t border-cerebre-border my-1" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setUserMenuOpen(false); onSignOut() }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-cerebre-coral hover:bg-cerebre-coral/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
                      Sign out
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
