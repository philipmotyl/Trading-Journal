'use client'

import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Analytics } from '@/lib/analytics'

function fmt(n: number, prefix = '$') {
  const abs = Math.abs(n)
  const str = abs >= 1000 ? `${(abs / 1000).toFixed(2)}K` : abs.toFixed(2)
  return `${n < 0 ? '-' : ''}${prefix}${str}`
}

function pct(n: number) {
  return `${n.toFixed(1)}%`
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  positive?: boolean | null
  icon: React.ReactNode
}

function StatCard({ label, value, sub, positive, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className={cn(
              'mt-1.5 text-2xl font-bold tabular-nums',
              positive === true && 'text-emerald-500 dark:text-emerald-400',
              positive === false && 'text-red-500 dark:text-red-400',
              positive === null && 'text-foreground',
            )}>
              {value}
            </p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={cn(
            'rounded-lg p-2',
            positive === true && 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
            positive === false && 'bg-red-500/10 text-red-500 dark:text-red-400',
            positive === null && 'bg-muted text-muted-foreground',
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StatsCards({ a }: { a: Analytics }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Net P&L"
        value={fmt(a.netPnL)}
        sub={`${a.totalTrades} trades`}
        positive={a.netPnL >= 0}
        icon={<TrendingUp className="size-5" />}
      />
      <StatCard
        label="Win Rate"
        value={pct(a.winRate)}
        sub={`${a.winCount}W / ${a.lossCount}L`}
        positive={a.winRate >= 50}
        icon={<Target className="size-5" />}
      />
      <StatCard
        label="Profit Factor"
        value={a.profitFactor === 99 ? '∞' : a.profitFactor.toFixed(2)}
        sub={a.profitFactor >= 1.5 ? 'Strong edge' : a.profitFactor >= 1 ? 'Positive' : 'Negative'}
        positive={a.profitFactor >= 1}
        icon={<Activity className="size-5" />}
      />
      <StatCard
        label="Avg Win"
        value={fmt(a.avgWin)}
        sub={`Avg loss ${fmt(a.avgLoss)}`}
        positive={a.avgWin >= a.avgLoss}
        icon={<Award className="size-5" />}
      />
      <StatCard
        label="Max Drawdown"
        value={fmt(a.maxDrawdown)}
        sub="Peak to trough"
        positive={a.maxDrawdown === 0 ? null : false}
        icon={<TrendingDown className="size-5" />}
      />
      <StatCard
        label="Expectancy"
        value={fmt(a.expectancy)}
        sub="Per trade"
        positive={a.expectancy >= 0}
        icon={<AlertTriangle className="size-5" />}
      />
    </div>
  )
}
