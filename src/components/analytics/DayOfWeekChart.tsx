'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DayOfWeekStat } from '@/lib/advancedAnalytics'

const GRID = '#253347', LABELS = '#94a3b8', TT_BG = '#161b27', TT_BDR = '#253347', TT_TEXT = '#e2e8f0'

function fmt$(n: number) {
  const abs = Math.abs(n)
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}K` : `$${abs.toFixed(0)}`
  return n < 0 ? `-${s}` : `+${s}`
}

export default function DayOfWeekChart({ data }: { data: DayOfWeekStat[] }) {
  const chartData = data.map(d => ({ name: d.day.slice(0, 3), pnl: d.pnl, count: d.count }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">P&amp;L by Day of Week</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: LABELS }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmt$} tick={{ fontSize: 10, fill: LABELS }} tickLine={false} axisLine={false} width={56} />
              <Tooltip
                cursor={{ fill: '#253347', opacity: 0.4 }}
                contentStyle={{ background: TT_BG, border: `1px solid ${TT_BDR}`, borderRadius: 8, fontSize: 12, color: TT_TEXT }}
                labelStyle={{ color: LABELS }}
                itemStyle={{ color: TT_TEXT }}
                formatter={(v: number, _n, props) => [`${fmt$(v)} (${props.payload?.count} trades)`, 'P&L']}
              />
              <ReferenceLine y={0} stroke={GRID} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#34d399' : '#f87171'} opacity={0.9} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
