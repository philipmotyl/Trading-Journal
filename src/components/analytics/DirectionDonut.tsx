'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DirectionStats } from '@/lib/advancedAnalytics'

const TT_BG = '#161b27', TT_BDR = '#253347', TT_TEXT = '#e2e8f0'

export default function DirectionDonut({ d }: { d: DirectionStats }) {
  const total = d.longCount + d.shortCount
  const pieData = [
    { name: 'Long',  value: d.longCount,  pnl: d.longPnL,  wr: d.longWinRate },
    { name: 'Short', value: d.shortCount, pnl: d.shortPnL, wr: d.shortWinRate },
  ]

  function fmt$(n: number) {
    const abs = Math.abs(n)
    const s = abs >= 1000 ? `$${(abs / 1000).toFixed(2)}K` : `$${abs.toFixed(2)}`
    return n < 0 ? `-${s}` : `+${s}`
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Trade Direction</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">No data yet.</p>
        ) : (
          <div className="flex items-center gap-6">
            <div className="relative">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={44} outerRadius={64}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#0d1117"
                  >
                    <Cell fill="#34d399" />
                    <Cell fill="#f87171" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: TT_BG, border: `1px solid ${TT_BDR}`, borderRadius: 8, fontSize: 11, color: TT_TEXT }}
                    formatter={(v: number, name, props) => [`${v} trades · ${props.payload?.wr}% WR · ${fmt$(props.payload?.pnl)}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">Long</p>
                <p className="text-base font-bold text-emerald-400">{d.longPct}%</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                  <span className="text-sm font-medium text-foreground">Long</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.longCount} trades · {d.longWinRate}% WR</p>
                <p className={cn('text-sm font-semibold', d.longPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>{fmt$(d.longPnL)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="text-sm font-medium text-foreground">Short</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.shortCount} trades · {d.shortWinRate}% WR</p>
                <p className={cn('text-sm font-semibold', d.shortPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>{fmt$(d.shortPnL)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
