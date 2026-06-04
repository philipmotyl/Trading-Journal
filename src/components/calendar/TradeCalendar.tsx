'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { tradesByDay } from '@/lib/analytics'
import type { Trade } from '@/types/trade'

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function fmt$(n: number) {
  if (Math.abs(n) >= 1000) return `${n < 0 ? '-' : ''}$${(Math.abs(n) / 1000).toFixed(2)}K`
  return `${n < 0 ? '-$' : '$'}${Math.abs(n).toFixed(0)}`
}

function fmtFull$(n: number) {
  const abs = Math.abs(n)
  return `${n < 0 ? '-' : '+'}$${abs.toFixed(2)}`
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function fmtLongDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function weeksInMonth(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const weeks: (Date | null)[][] = [[]]
  let cur = weeks[0]
  for (let i = 0; i < first.getDay(); i++) cur.push(null)
  for (let d = 1; d <= last.getDate(); d++) {
    if (cur.length === 7) { cur = []; weeks.push(cur) }
    cur.push(new Date(year, month, d))
  }
  while (cur.length < 7) cur.push(null)
  return weeks
}

// ── Day detail panel ──────────────────────────────────────────────────────────
function DayPanel({ dateKey, trades, onClose }: {
  dateKey: string
  trades: Trade[]
  onClose: () => void
}) {
  const pnl     = trades.reduce((s, t) => s + t.netPnL, 0)
  const wins    = trades.filter(t => t.status === 'WIN').length
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0

  return (
    <div className="flex w-80 shrink-0 flex-col border-l border-border bg-card">
      {/* Panel header */}
      <div className="flex items-start justify-between p-4">
        <div>
          <p className="text-xs text-muted-foreground">{fmtLongDate(dateKey)}</p>
          <p className={cn('mt-0.5 text-2xl font-bold tabular-nums', pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {fmtFull$(pnl)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {trades.length} trade{trades.length !== 1 ? 's' : ''} · {winRate.toFixed(0)}% win rate
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <Separator />

      {/* Trade list */}
      <div className="flex-1 overflow-y-auto">
        {trades.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">No trades this day.</p>
        ) : (
          <ul className="divide-y divide-border">
            {trades.map(t => (
              <li key={t.id} className="p-4 hover:bg-accent/20 transition-colors">
                {/* Row 1: symbol + side + P&L */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{t.symbol}</span>
                    <Badge
                      variant="outline"
                      className={cn('text-xs px-1.5 py-0 border-0',
                        t.side === 'LONG'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-blue-500/15 text-blue-400'
                      )}
                    >
                      {t.side}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn('text-xs px-1.5 py-0 border-0',
                        t.status === 'WIN'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : t.status === 'LOSS'
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {t.status}
                    </Badge>
                  </div>
                  <span className={cn('font-bold tabular-nums text-sm', t.netPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {fmtFull$(t.netPnL)}
                  </span>
                </div>

                {/* Row 2: entry → exit prices */}
                <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  {t.side === 'LONG'
                    ? <TrendingUp className="size-3 text-emerald-400" />
                    : <TrendingDown className="size-3 text-blue-400" />
                  }
                  <span>{t.entryPrice.toFixed(2)}</span>
                  <span>→</span>
                  <span>{t.exitPrice.toFixed(2)}</span>
                  <span className="mx-1">·</span>
                  <span>{t.quantity} contract{t.quantity !== 1 ? 's' : ''}</span>
                </div>

                {/* Row 3: times */}
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {fmtTime(t.entryDate)} → {fmtTime(t.exitDate)}
                </div>

                {/* Row 4: strategy + screenshot */}
                {(t.strategy || t.screenshot) && (
                  <div className="mt-2 flex items-start gap-2">
                    {t.strategy && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {t.strategy}
                      </span>
                    )}
                    {t.screenshot && (
                      <a
                        href={t.screenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto shrink-0"
                      >
                        <img
                          src={t.screenshot}
                          alt="Chart"
                          className="h-12 w-20 rounded border border-border object-cover hover:opacity-80 transition-opacity"
                        />
                      </a>
                    )}
                  </div>
                )}

                {/* Notes */}
                {t.notes && (
                  <p className="mt-1.5 text-xs italic text-muted-foreground line-clamp-2">{t.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Main calendar ─────────────────────────────────────────────────────────────
export default function TradeCalendar({ trades }: { trades: Trade[] }) {
  const now = new Date()
  const [year,        setYear]       = useState(now.getFullYear())
  const [month,       setMonth]      = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const dayStats = tradesByDay(trades)
  const weeks    = weeksInMonth(year, month)

  const weeklyPnL = weeks.map(week =>
    week.reduce((sum, d) => {
      if (!d) return sum
      return sum + (dayStats[isoDate(year, month, d.getDate())]?.pnl ?? 0)
    }, 0)
  )

  const monthTotal  = weeklyPnL.reduce((s, w) => s + w, 0)
  const tradingDays = Object.keys(dayStats).filter(k =>
    k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  ).length

  function prev() { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  function next() { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  function handleDayClick(key: string) {
    setSelectedDay(prev => prev === key ? null : key)
  }

  const selectedTrades = selectedDay ? (dayStats[selectedDay]?.trades ?? []) : []

  return (
    <div className="flex gap-0 overflow-hidden rounded-lg border border-border">

      {/* ── Left: calendar ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-7" onClick={prev}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-36 text-center text-sm font-semibold text-foreground">
              {MONTHS[month]} {year}
            </span>
            <Button variant="outline" size="icon" className="size-7" onClick={next}>
              <ChevronRight className="size-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs"
              onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}>
              Today
            </Button>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Monthly:</span>
            <span className={cn('font-bold', monthTotal >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {fmt$(monthTotal)}
            </span>
            <span className="text-muted-foreground">{tradingDays} days</span>
          </div>
        </div>

        {/* Day-name headers */}
        <div className="grid grid-cols-8 border-b border-border bg-muted/30">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
          ))}
          <div className="py-2 text-center text-xs font-medium text-muted-foreground">Week</div>
        </div>

        {/* Week rows */}
        <div className="flex-1 overflow-y-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-8 border-b border-border last:border-0">
              {week.map((day, di) => {
                if (!day) return (
                  <div key={di} className="min-h-[76px] border-r border-border bg-muted/10" />
                )
                const key    = isoDate(year, month, day.getDate())
                const stats  = dayStats[key]
                const isToday    = key === isoDate(now.getFullYear(), now.getMonth(), now.getDate())
                const isSelected = key === selectedDay
                const hasTrades  = !!stats

                return (
                  <div
                    key={di}
                    onClick={() => hasTrades && handleDayClick(key)}
                    className={cn(
                      'min-h-[76px] border-r border-border p-2 transition-colors last:border-0',
                      hasTrades && 'cursor-pointer',
                      hasTrades && !isSelected && stats.pnl > 0 && 'bg-emerald-500/8 hover:bg-emerald-500/15',
                      hasTrades && !isSelected && stats.pnl < 0 && 'bg-red-500/8 hover:bg-red-500/15',
                      isSelected && 'bg-primary/15 ring-1 ring-inset ring-primary',
                      isToday && !isSelected && 'ring-1 ring-inset ring-primary/50',
                      !hasTrades && 'opacity-60',
                    )}
                  >
                    <div className={cn(
                      'mb-1 text-xs font-medium',
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {day.getDate()}
                    </div>
                    {stats && (
                      <div className="space-y-0.5">
                        <p className={cn(
                          'text-sm font-bold leading-none',
                          stats.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          {fmt$(stats.pnl)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {stats.count} trade{stats.count !== 1 ? 's' : ''}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {stats.winRate.toFixed(0)}% WR
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Weekly total */}
              <div className="flex min-h-[76px] flex-col justify-center border-r-0 px-2">
                <p className="text-[10px] text-muted-foreground">Wk {wi + 1}</p>
                <p className={cn(
                  'text-sm font-bold',
                  weeklyPnL[wi] > 0 ? 'text-emerald-400' : weeklyPnL[wi] < 0 ? 'text-red-400' : 'text-muted-foreground'
                )}>
                  {weeklyPnL[wi] !== 0 ? fmt$(weeklyPnL[wi]) : '$0'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: day detail panel ─────────────────────────────────────── */}
      {selectedDay && (
        <DayPanel
          dateKey={selectedDay}
          trades={selectedTrades}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
