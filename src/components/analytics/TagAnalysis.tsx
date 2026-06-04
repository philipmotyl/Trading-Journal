'use client'

import { TrendingUp, TrendingDown, Tag, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Trade } from '@/types/trade'

interface TagStat {
  tag: string
  pnl: number
  count: number
  winRate: number
}

function buildTagStats(trades: Trade[]): TagStat[] {
  const map: Record<string, Trade[]> = {}
  for (const t of trades) {
    const s = t.strategy ?? 'Untagged'
    ;(map[s] ??= []).push(t)
  }
  return Object.entries(map).map(([tag, ts]) => ({
    tag,
    pnl: +ts.reduce((s, t) => s + t.netPnL, 0).toFixed(2),
    count: ts.length,
    winRate: +(ts.filter(t => t.status === 'WIN').length / ts.length * 100).toFixed(1),
  }))
}

function fmt$(n: number) {
  const abs = Math.abs(n)
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(2)}K` : `$${abs.toFixed(2)}`
  return n < 0 ? `-${s}` : `+${s}`
}

function TagColumn({ title, icon: Icon, iconColor, tags }: {
  title: string; icon: React.ElementType; iconColor: string; tags: TagStat[]
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className={cn('size-4', iconColor)} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {tags.slice(0, 5).map(t => (
              <div key={t.tag} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.tag}</p>
                  <p className="text-xs text-muted-foreground">{t.count} trades · {t.winRate}% WR</p>
                </div>
                <p className={cn('text-sm font-bold tabular-nums', t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {fmt$(t.pnl)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function TagAnalysis({ trades }: { trades: Trade[] }) {
  const all = buildTagStats(trades)
  const byPnL   = [...all].sort((a, b) => b.pnl - a.pnl)
  const byWR    = [...all].sort((a, b) => b.winRate - a.winRate)
  const byCount = [...all].sort((a, b) => b.count - a.count)
  const worst   = [...all].sort((a, b) => a.pnl - b.pnl)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <TagColumn title="Best Performing"  icon={TrendingUp}   iconColor="text-emerald-400" tags={byPnL} />
      <TagColumn title="Worst Performing" icon={TrendingDown}  iconColor="text-red-400"    tags={worst} />
      <TagColumn title="Most Used"        icon={Tag}          iconColor="text-blue-400"    tags={byCount} />
      <TagColumn title="Highest Win Rate" icon={Trophy}       iconColor="text-amber-400"   tags={byWR} />
    </div>
  )
}
