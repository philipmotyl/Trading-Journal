'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Trade } from '@/types/trade'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function fmtMoney(n: number) {
  const abs = Math.abs(n)
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(2)}K` : `$${abs.toFixed(2)}`
  return n < 0 ? `-${s}` : `+${s}`
}

export default function RecentTrades({ trades }: { trades: Trade[] }) {
  const recent = [...trades]
    .sort((a, b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime())
    .slice(0, 7)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground">Recent Trades</CardTitle>
          <Link
            href="/trades"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recent.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">No trades yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {recent.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/20 transition-colors">
                {/* Date + symbol */}
                <div className="w-14 shrink-0">
                  <p className="text-[11px] text-muted-foreground">{fmtDate(t.exitDate)}</p>
                  <p className="text-sm font-bold">{t.symbol}</p>
                </div>

                {/* Side badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-semibold shrink-0',
                    t.side === 'LONG'
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      : 'text-blue-400 border-blue-400/30 bg-blue-400/10'
                  )}
                >
                  {t.side}
                </Badge>

                {/* Strategy */}
                <span className="flex-1 truncate text-xs text-muted-foreground">
                  {t.strategy ?? '—'}
                </span>

                {/* Emotion pill */}
                {t.emotion && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary/80">
                    {t.emotion}
                  </span>
                )}

                {/* P&L */}
                <span className={cn(
                  'w-20 shrink-0 text-right text-sm font-bold tabular-nums',
                  t.netPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {fmtMoney(t.netPnL)}
                </span>

                {/* Status */}
                <Badge className={cn(
                  'shrink-0 text-[10px] font-semibold border-0 w-16 justify-center',
                  t.status === 'WIN'  ? 'bg-emerald-500/15 text-emerald-400' :
                  t.status === 'LOSS' ? 'bg-red-500/15 text-red-400' :
                  'bg-muted text-muted-foreground'
                )}>
                  {t.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
