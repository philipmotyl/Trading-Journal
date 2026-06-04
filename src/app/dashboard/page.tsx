'use client'

import { useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import StatsCards from '@/components/dashboard/StatsCards'
import EquityCurve from '@/components/dashboard/EquityCurve'
import DailyPnLChart from '@/components/dashboard/DailyPnLChart'
import PerformanceRadar from '@/components/dashboard/PerformanceRadar'
import TradeForm from '@/components/trades/TradeForm'
import { useTrades } from '@/hooks/useTrades'
import { computeAnalytics, buildEquityCurve, buildDailyPnL } from '@/lib/analytics'

export default function DashboardPage() {
  const { trades, addTrade } = useTrades()

  const analytics = useMemo(() => computeAnalytics(trades), [trades])
  const equityCurveData = useMemo(() => buildEquityCurve(trades), [trades])
  const dailyPnLData = useMemo(() => buildDailyPnL(trades), [trades])

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

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EquityCurve data={equityCurveData} />
          </div>
          <PerformanceRadar data={analytics.radarData} score={analytics.performanceScore} />
        </div>

        {/* Daily P&L */}
        <DailyPnLChart data={dailyPnLData} />
      </div>
    </AppShell>
  )
}
