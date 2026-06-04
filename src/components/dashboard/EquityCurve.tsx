'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const GRID    = '#253347'
const LABELS  = '#94a3b8'
const TT_BG   = '#161b27'
const TT_BDR  = '#253347'
const TT_TEXT = '#e2e8f0'

interface Point { date: string; equity: number }

function fmt$(n: number) {
  return n >= 0 ? `$${n.toFixed(0)}` : `-$${Math.abs(n).toFixed(0)}`
}

export default function EquityCurve({ data }: { data: Point[] }) {
  const isPositive = (data[data.length - 1]?.equity ?? 0) >= 0
  const lineColor  = isPositive ? '#34d399' : '#f87171'

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={lineColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: LABELS }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={fmt$}
              tick={{ fontSize: 10, fill: LABELS }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ stroke: GRID, strokeWidth: 1 }}
              contentStyle={{
                background: TT_BG,
                border: `1px solid ${TT_BDR}`,
                borderRadius: 8,
                fontSize: 12,
                color: TT_TEXT,
              }}
              labelStyle={{ color: LABELS, marginBottom: 4 }}
              itemStyle={{ color: TT_TEXT }}
              formatter={(v: number) => [fmt$(v), 'Equity']}
            />
            <ReferenceLine y={0} stroke={GRID} strokeDasharray="4 2" />
            <Area
              type="monotone"
              dataKey="equity"
              stroke={lineColor}
              strokeWidth={2}
              fill="url(#eqGrad)"
              dot={false}
              activeDot={{ r: 4, fill: lineColor, stroke: TT_BG, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
