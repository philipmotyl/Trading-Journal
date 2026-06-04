'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListOrdered, CalendarDays, BarChart3, LineChart, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/trades',    icon: ListOrdered,     label: 'Trade Log' },
  { href: '/calendar',  icon: CalendarDays,    label: 'Calendar' },
  { href: '/analytics', icon: LineChart,       label: 'Analytics' },
  { href: '/reports',   icon: BarChart3,       label: 'Reports' },
]

export default function NavSidebar() {
  const path = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  // resolvedTheme is undefined during SSR; default to dark (matches defaultTheme)
  const isDark = resolvedTheme !== 'light'

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 py-3">
        <Image
          src="/trader-society-logo.svg"
          alt="Trader Society"
          width={36}
          height={36}
          className="rounded-lg shrink-0"
        />
        <div className="leading-tight">
          <p className="text-xs font-bold tracking-wide text-sidebar-foreground">TRADER</p>
          <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground">SOCIETY</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-2 pt-3">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <span className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              path === href || path.startsWith(href + '/')
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )}>
              <Icon className="size-4 shrink-0" />
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto p-2">
        <Separator className="mb-2 bg-sidebar-border" />
        <Link href="/settings">
          <span className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            path === '/settings'
              ? 'bg-sidebar-accent text-sidebar-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
          )}>
            <Settings className="size-4" />
            Settings
          </span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 w-full justify-start gap-3 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          <span suppressHydrationWarning>
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </span>
          <span suppressHydrationWarning>
            {isDark ? 'Light mode' : 'Dark mode'}
          </span>
        </Button>
      </div>
    </aside>
  )
}
