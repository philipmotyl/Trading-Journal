'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  data: { axis: string; value: number }[]
  score: number
}

function scoreLabel(s: number) {
  if (s >= 80) return { text: 'Excellent', color: 'text-emerald-500' }
  if (s >= 65) return { text: 'Good',      color: 'text-emerald-400' }
  if (s >= 50) return { text: 'Average',   color: 'text-yellow-500' }
  if (s >= 35) return { text: 'Below avg', color: 'text-orange-500' }
  return { text: 'Poor', color: 'text-red-500' }
}

export default function PerformanceRadar({ data, score }: Props) {
  const { text, color } = scoreLabel(score)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Performance Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 pb-4">
        <div className="text-center">
          <p className={cn('text-4xl font-bold tabular-nums', color)}>{score}</p>
          <p className={cn('text-sm font-medium', color)}>{text}</p>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <RadarChart data={data} outerRadius={80}>
            <PolarGrid stroke="#253347" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="value"
              stroke="#818cf8"
              fill="#818cf8"
              fillOpacity={0.25}
              strokeWidth={2}
              dot={{ r: 3, fill: '#818cf8' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
