'use client'

import { Clock, TrendingUp, TrendingDown, Activity, BarChart2, CalendarCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DurationStats } from '@/lib/advancedAnalytics'
import { fmtMins } from '@/lib/advancedAnalytics'

function StatTile({ icon: Icon, label, value, sub, color = 'text-foreground' }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-primary/10 p-2">
            <Icon className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`mt-0.5 text-xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TradeDurationStats({ d, totalTrades }: { d: DurationStats; totalTrades: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatTile icon={Activity}      label="Total Trades"        value={String(totalTrades)} />
      <StatTile icon={BarChart2}     label="Total Lots Traded"   value={String(d.totalLots)} />
      <StatTile icon={CalendarCheck} label="Active Days"         value={String(d.activeDays)} sub={`${d.avgTradesPerDay} avg/day`} />
      <StatTile icon={Clock}         label="Avg Trade Duration"  value={fmtMins(d.avgMins)} />
      <StatTile icon={TrendingUp}    label="Avg Win Duration"    value={fmtMins(d.avgWinMins)} color="text-emerald-400" />
      <StatTile icon={TrendingDown}  label="Avg Loss Duration"   value={fmtMins(d.avgLossMins)} color="text-red-400" />
    </div>
  )
}
