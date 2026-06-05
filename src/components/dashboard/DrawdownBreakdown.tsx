'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Trade } from '@/types/trade'

const LABELS  = '#94a3b8'
const TT_BG   = '#161b27'
const TT_BDR  = '#253347'
const TT_TEXT = '#e2e8f0'

function fmt$(n: number) {
  const abs = Math.abs(n)
  return `${n < 0 ? '-' : ''}$${abs >= 1000 ? (abs / 1000).toFixed(2) + 'K' : abs.toFixed(2)}`
}

interface DrawdownStats {
  maxDrawdown: number
  avgDrawdown: number
  currentDrawdown: number
  numPeriods: number
  longestPeriodTrades: number
  drawdownCurve: { date: string; dd: number }[]
}

function computeDrawdown(trades: Trade[]): DrawdownStats {
  if (trades.length === 0) return {
    maxDrawdown: 0, avgDrawdown: 0, currentDrawdown: 0,
    numPeriods: 0, longestPeriodTrades: 0, drawdownCurve: [],
  }

  const sorted = [...trades].sort((a, b) => +new Date(a.exitDate) - +new Date(b.exitDate))
  let equity = 0, peak = 0, maxDD = 0
  let inDD = false, ddPeriods = 0, ddLengths: number[] = [], curLen = 0
  const ddSums: number[] = []
  const curve: { date: string; dd: number }[] = []

  for (const t of sorted) {
    equity += t.netPnL
    if (equity > peak) {
      peak = equity
      if (inDD) { ddPeriods++; ddLengths.push(curLen); curLen = 0; inDD = false }
    }
    const dd = peak - equity
    if (dd > 0) { inDD = true; curLen++; ddSums.push(dd) }
    if (dd > maxDD) maxDD = dd
    curve.push({ date: t.exitDate.slice(0, 10), dd: -(dd) })
  }
  if (inDD) { ddPeriods++; ddLengths.push(curLen) }

  const currentDrawdown = peak - equity
  const avgDD = ddSums.length > 0 ? ddSums.reduce((s, v) => s + v, 0) / ddSums.length : 0
  const longest = ddLengths.length > 0 ? Math.max(...ddLengths) : 0

  return {
    maxDrawdown: maxDD,
    avgDrawdown: avgDD,
    currentDrawdown,
    numPeriods: ddPeriods,
    longestPeriodTrades: longest,
    drawdownCurve: curve,
  }
}

function StatRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-bold tabular-nums', danger ? 'text-red-400' : 'text-foreground')}>{value}</span>
    </div>
  )
}

export default function DrawdownBreakdown({ trades }: { trades: Trade[] }) {
  const stats = useMemo(() => computeDrawdown(trades), [trades])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Drawdown Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {trades.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">Add trades to see drawdown analysis.</p>
        ) : (
          <>
            {/* Drawdown curve */}
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={stats.drawdownCurve} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: LABELS }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tickFormatter={fmt$} tick={{ fontSize: 9, fill: LABELS }} tickLine={false} axisLine={false} width={50} />
                <Tooltip
                  contentStyle={{ background: TT_BG, border: `1px solid ${TT_BDR}`, borderRadius: 10, fontSize: 11, color: TT_TEXT }}
                  labelStyle={{ color: LABELS }}
                  formatter={(v: number) => [fmt$(v), 'Drawdown']}
                />
                <ReferenceLine y={0} stroke="#253347" strokeDasharray="3 2" />
                <Area type="monotone" dataKey="dd" stroke="#f87171" strokeWidth={1.5} fill="url(#ddGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Stats */}
            <div>
              <StatRow label="Max Drawdown"    value={fmt$(stats.maxDrawdown)}          danger />
              <StatRow label="Avg Drawdown"    value={fmt$(stats.avgDrawdown)}          danger={stats.avgDrawdown > 0} />
              <StatRow label="Current Drawdown" value={fmt$(stats.currentDrawdown)}     danger={stats.currentDrawdown > 0} />
              <StatRow label="DD Periods"      value={`${stats.numPeriods}`} />
              <StatRow label="Longest DD (trades)" value={`${stats.longestPeriodTrades}`} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
