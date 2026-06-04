'use client'

import { Award, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Trade } from '@/types/trade'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function fmt$(n: number) {
  const abs = Math.abs(n)
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(2)}K` : `$${abs.toFixed(2)}`
  return n < 0 ? `-${s}` : `+${s}`
}

function TradeCard({ trade, kind }: { trade: Trade; kind: 'best' | 'worst' }) {
  const isBest = kind === 'best'
  return (
    <Card className={cn('border', isBest ? 'border-emerald-500/20' : 'border-red-500/20')}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
          {isBest ? <Award className="size-4 text-emerald-400" /> : <AlertTriangle className="size-4 text-red-400" />}
          {isBest ? 'Best Trade' : 'Worst Trade'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className={cn('text-3xl font-bold tabular-nums', isBest ? 'text-emerald-400' : 'text-red-400')}>
          {fmt$(trade.netPnL)}
        </p>
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            {trade.side} {trade.quantity} {trade.symbol}
          </p>
          <p>Entry @ {trade.entryPrice.toFixed(2)} · {fmtDate(trade.entryDate)}</p>
          <p>Exit @ {trade.exitPrice.toFixed(2)} · {fmtDate(trade.exitDate)}</p>
          {trade.strategy && <p className="text-primary">{trade.strategy}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export default function BestWorstTrades({ best, worst }: { best: Trade | null; worst: Trade | null }) {
  if (!best && !worst) {
    return (
      <div className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
        Add trades to see your best and worst performers.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {best  && <TradeCard trade={best}  kind="best" />}
      {worst && <TradeCard trade={worst} kind="worst" />}
    </div>
  )
}
