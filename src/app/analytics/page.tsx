'use client'

import { useMemo, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import TradeForm from '@/components/trades/TradeForm'
import DayOfWeekCards from '@/components/analytics/DayOfWeekCards'
import DayOfWeekChart from '@/components/analytics/DayOfWeekChart'
import TimeOfDayChart from '@/components/analytics/TimeOfDayChart'
import DirectionDonut from '@/components/analytics/DirectionDonut'
import TradeDurationStats from '@/components/analytics/TradeDurationStats'
import BestWorstTrades from '@/components/analytics/BestWorstTrades'
import TagAnalysis from '@/components/analytics/TagAnalysis'
import { useTrades } from '@/hooks/useTrades'
import {
  analyzeDayOfWeek, analyzeTimeOfDay, analyzeDuration,
  analyzeDirection, getBestWorstTrades,
} from '@/lib/advancedAnalytics'
import { cn } from '@/lib/utils'

const TABS = ['Performance Summary', 'Trade Stats', 'Strategy Analysis'] as const
type Tab = typeof TABS[number]

export default function AnalyticsPage() {
  const { trades, addTrade } = useTrades()
  const [tab, setTab] = useState<Tab>('Performance Summary')

  const dayStats    = useMemo(() => analyzeDayOfWeek(trades), [trades])
  const hourStats   = useMemo(() => analyzeTimeOfDay(trades), [trades])
  const duration    = useMemo(() => analyzeDuration(trades),  [trades])
  const direction   = useMemo(() => analyzeDirection(trades), [trades])
  const bestWorst   = useMemo(() => getBestWorstTrades(trades), [trades])

  return (
    <AppShell>
      <div className="flex flex-col gap-6 overflow-y-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <TradeForm onAdd={addTrade} />
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted/20 p-1 w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ─── Tab 1: Performance Summary ─── */}
        {tab === 'Performance Summary' && (
          <div className="flex flex-col gap-6">
            {/* Day of week insight cards */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Day of Week Insights
              </h2>
              <DayOfWeekCards stats={dayStats} />
            </section>

            {/* Day of week + time of day charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <DayOfWeekChart data={dayStats} />
              <TimeOfDayChart data={hourStats} />
            </div>

            {/* Tag analysis */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Strategy Performance
              </h2>
              <TagAnalysis trades={trades} />
            </section>
          </div>
        )}

        {/* ─── Tab 2: Trade Stats ─── */}
        {tab === 'Trade Stats' && (
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Trade Activity
              </h2>
              <TradeDurationStats d={duration} totalTrades={trades.length} />
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <DirectionDonut d={direction} />
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Avg Winning Trade</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-400">
                      {direction.longCount + direction.shortCount > 0
                        ? `+$${(trades.filter(t => t.status === 'WIN').reduce((s, t) => s + t.netPnL, 0) / Math.max(trades.filter(t => t.status === 'WIN').length, 1)).toFixed(2)}`
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Avg Losing Trade</p>
                    <p className="mt-1 text-2xl font-bold text-red-400">
                      {trades.filter(t => t.status === 'LOSS').length > 0
                        ? `-$${Math.abs(trades.filter(t => t.status === 'LOSS').reduce((s, t) => s + t.netPnL, 0) / trades.filter(t => t.status === 'LOSS').length).toFixed(2)}`
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Best &amp; Worst Trade
              </h2>
              <BestWorstTrades best={bestWorst.best} worst={bestWorst.worst} />
            </section>
          </div>
        )}

        {/* ─── Tab 3: Strategy Analysis ─── */}
        {tab === 'Strategy Analysis' && (
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Strategy Breakdown
              </h2>
              <TagAnalysis trades={trades} />
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <DayOfWeekChart data={dayStats} />
              <TimeOfDayChart data={hourStats} />
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
