'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Dark-theme chart constants — hardcoded so recharts inline styles resolve correctly
const GRID    = '#253347'   // --border
const LABELS  = '#94a3b8'   // --muted-foreground
const TT_BG   = '#161b27'   // --card
const TT_BDR  = '#253347'   // --border
const TT_TEXT = '#e2e8f0'   // --foreground

interface Point { date: string; pnl: number }

function shortDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${+m}/${+d}`
}

function fmt$(n: number) {
  return n >= 0 ? `$${n.toFixed(0)}` : `-$${Math.abs(n).toFixed(0)}`
}

export default function DailyPnLChart({ data }: { data: Point[] }) {
  const recent = data.slice(-30)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Daily P&amp;L</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={recent} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fontSize: 10, fill: LABELS }}
              tickLine={false}
              axisLine={false}
              interval={Math.max(0, Math.floor(recent.length / 8))}
            />
            <YAxis
              tickFormatter={fmt$}
              tick={{ fontSize: 10, fill: LABELS }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ fill: '#253347', opacity: 0.4 }}
              contentStyle={{
                background: TT_BG,
                border: `1px solid ${TT_BDR}`,
                borderRadius: 8,
                fontSize: 12,
                color: TT_TEXT,
              }}
              labelStyle={{ color: LABELS, marginBottom: 4 }}
              itemStyle={{ color: TT_TEXT }}
              formatter={(v: number) => [fmt$(v), 'Daily P&L']}
              labelFormatter={shortDate}
            />
            <ReferenceLine y={0} stroke={GRID} />
            <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={28}>
              {recent.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? '#34d399' : '#f87171'} opacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
