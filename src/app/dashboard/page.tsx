'use client'

import { useMemo } from 'react'
import { Award, AlertTriangle } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import StatsCards from '@/components/dashboard/StatsCards'
import EquityCurve from '@/components/dashboard/EquityCurve'
import DailyPnLChart from '@/components/dashboard/DailyPnLChart'
import PerformanceRadar from '@/components/dashboard/PerformanceRadar'
import RecentTrades from '@/components/dashboard/RecentTrades'
import DrawdownBreakdown from '@/components/dashboard/DrawdownBreakdown'
import TradeForm from '@/components/trades/TradeForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTrades } from '@/hooks/useTrades'
import { computeAnalytics, buildEquityCurve, buildDailyPnL } from '@/lib/analytics'
import { getBestWorstTrades } from '@/lib/advancedAnalytics'
import type { Trade } from '@/types/trade'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
}

function TradeHighlightCard({ trade, kind }: { trade: Trade; kind: 'best' | 'last-worst' }) {
  const isBest = kind === 'best'
  return (
    <Card className={isBest ? 'border-emerald-500/20' : 'border-red-500/20'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {isBest
            ? <Award className="size-4 text-emerald-400" />
            : <AlertTriangle className="size-4 text-red-400" />}
          {isBest ? 'Best Trade' : 'Last Worst Trade'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className={`text-2xl font-bold tabular-nums ${isBest ? 'text-emerald-400' : 'text-red-400'}`}>
          {isBest ? '+' : '-'}${Math.abs(trade.netPnL).toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {trade.side} {trade.quantity} {trade.symbol} · {fmtDate(trade.exitDate)}
        </p>
        {trade.strategy && <p className="text-xs text-primary">{trade.strategy}</p>}
        {trade.notes && (
          <p className="text-xs text-muted-foreground italic line-clamp-2 pt-0.5">{trade.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { trades, addTrade } = useTrades()

  const analytics = useMemo(() => computeAnalytics(trades), [trades])
  const equityCurveData = useMemo(() => buildEquityCurve(trades), [trades])
  const dailyPnLData = useMemo(() => buildDailyPnL(trades), [trades])
  const { best: bestTrade } = useMemo(() => getBestWorstTrades(trades), [trades])
  const lastWorstTrade = useMemo(() => {
    const losses = [...trades]
      .filter(t => t.status === 'LOSS')
      .sort((a, b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime())
    return losses[0] ?? null
  }, [trades])

  return (
    <AppShell>
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {trades.length} trades · all time
            </p>
          </div>
          <TradeForm onAdd={addTrade} />
        </div>

        {/* KPI cards */}
        <StatsCards a={analytics} />

        {/* Recent trades table */}
        <RecentTrades trades={trades} />

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EquityCurve data={equityCurveData} />
          </div>
          <PerformanceRadar data={analytics.radarData} score={analytics.performanceScore} />
        </div>

        {/* Daily P&L + Drawdown row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DailyPnLChart data={dailyPnLData} />
          <DrawdownBreakdown trades={trades} />
        </div>

        {/* Best / Last Worst Trade highlights */}
        {(bestTrade || lastWorstTrade) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {bestTrade      && <TradeHighlightCard trade={bestTrade}      kind="best" />}
            {lastWorstTrade && <TradeHighlightCard trade={lastWorstTrade} kind="last-worst" />}
          </div>
        )}
      </div>
    </AppShell>
  )
}
