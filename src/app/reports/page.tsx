'use client'

import { useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import StatsCards from '@/components/dashboard/StatsCards'
import EquityCurve from '@/components/dashboard/EquityCurve'
import DailyPnLChart from '@/components/dashboard/DailyPnLChart'
import { useTrades } from '@/hooks/useTrades'
import { computeAnalytics, buildEquityCurve, buildDailyPnL } from '@/lib/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function fmt$(n: number) {
  const abs = Math.abs(n)
  return `${n < 0 ? '-' : ''}$${abs.toFixed(2)}`
}

export default function ReportsPage() {
  const { trades } = useTrades()
  const a = useMemo(() => computeAnalytics(trades), [trades])
  const equity = useMemo(() => buildEquityCurve(trades), [trades])
  const daily = useMemo(() => buildDailyPnL(trades), [trades])

  // Strategy breakdown
  const byStrategy = useMemo(() => {
    const map: Record<string, { pnl: number; wins: number; total: number }> = {}
    for (const t of trades) {
      const s = t.strategy ?? 'Untagged'
      if (!map[s]) map[s] = { pnl: 0, wins: 0, total: 0 }
      map[s].pnl += t.netPnL
      map[s].total++
      if (t.status === 'WIN') map[s].wins++
    }
    return Object.entries(map).sort((a, b) => b[1].pnl - a[1].pnl)
  }, [trades])

  // Mistake frequency
  const mistakes = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of trades) for (const m of (t.mistakes ?? [])) map[m] = (map[m] ?? 0) + 1
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [trades])

  return (
    <AppShell>
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <h1 className="text-xl font-bold">Reports</h1>
        <StatsCards a={a} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EquityCurve data={equity} />
          <DailyPnLChart data={daily} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Strategy breakdown */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Strategy Breakdown</CardTitle></CardHeader>
            <CardContent>
              {byStrategy.length === 0 ? (
                <p className="text-sm text-muted-foreground">No strategies tagged yet.</p>
              ) : (
                <div className="space-y-2">
                  {byStrategy.map(([name, d]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate max-w-40">{name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{d.wins}/{d.total} wins</span>
                        <span className={cn('font-semibold tabular-nums w-24 text-right', d.pnl >= 0 ? 'text-emerald-500' : 'text-red-500')}>{fmt$(d.pnl)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mistakes */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Common Mistakes</CardTitle></CardHeader>
            <CardContent>
              {mistakes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No mistakes tagged yet.</p>
              ) : (
                <div className="space-y-2">
                  {mistakes.map(([m, count]) => (
                    <div key={m} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{m}</span>
                      <span className="tabular-nums font-bold text-red-500">{count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
