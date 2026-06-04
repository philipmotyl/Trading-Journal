'use client'

import { TrendingUp, TrendingDown, Zap, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DayOfWeekStat } from '@/lib/advancedAnalytics'
import { getDayOfWeekInsights, fmtMoney } from '@/lib/advancedAnalytics'

export default function DayOfWeekCards({ stats }: { stats: DayOfWeekStat[] }) {
  const insights = getDayOfWeekInsights(stats)

  if (!insights) {
    return (
      <div className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
        Add trades to see day-of-week insights.
      </div>
    )
  }

  const { best, worst, mostActive, bestWinRate } = insights

  const cards = [
    {
      label: 'Best performing day',
      day: best.day,
      sub: `${best.count} trades · ${fmtMoney(best.pnl)}`,
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      valueColor: 'text-emerald-400',
    },
    {
      label: 'Worst performing day',
      day: worst.day,
      sub: `${worst.count} trades · ${fmtMoney(worst.pnl)}`,
      icon: TrendingDown,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      valueColor: 'text-red-400',
    },
    {
      label: 'Most active day',
      day: mostActive.day,
      sub: `${mostActive.count} trades`,
      icon: Zap,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      valueColor: 'text-foreground',
    },
    {
      label: 'Best win rate day',
      day: bestWinRate.day,
      sub: `${bestWinRate.winRate.toFixed(0)}% · ${bestWinRate.count} trades`,
      icon: Trophy,
      iconColor: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      valueColor: 'text-foreground',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map(c => (
        <Card key={c.label} className="border-border">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className={cn('mt-0.5 rounded-md p-2', c.bgColor)}>
                <c.icon className={cn('size-4', c.iconColor)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className={cn('mt-0.5 text-2xl font-bold', c.valueColor)}>{c.day}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{c.sub}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
