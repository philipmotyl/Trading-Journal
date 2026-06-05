'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  data: { axis: string; value: number }[]
  score: number
}

function scoreLabel(s: number) {
  if (s >= 80) return { text: 'Excellent', color: '#10b981' }
  if (s >= 65) return { text: 'Good',      color: '#34d399' }
  if (s >= 50) return { text: 'Average',   color: '#eab308' }
  if (s >= 35) return { text: 'Below Avg', color: '#f97316' }
  return { text: 'Poor', color: '#ef4444' }
}

function CircularGauge({ score }: { score: number }) {
  const R = 44
  const C = 2 * Math.PI * R
  const pct = Math.max(0, Math.min(score, 100)) / 100
  const filled = C * pct
  const empty  = C - filled
  const { text, color } = scoreLabel(score)

  return (
    <div className="flex justify-center items-center py-1">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx="60" cy="60" r={R} fill="none" stroke="#253347" strokeWidth="10" />
        {/* Progress arc */}
        <circle
          cx="60" cy="60" r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${empty}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        {/* Score number */}
        <text
          x="60" y="54"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight="700"
          fill={color}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {score}
        </text>
        {/* Label */}
        <text
          x="60" y="73"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9.5"
          fill="#94a3b8"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {text}
        </text>
      </svg>
    </div>
  )
}

export default function PerformanceRadar({ data, score }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Performance Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-1 pb-4">
        <CircularGauge score={score} />
        <ResponsiveContainer width="100%" height={190}>
          <RadarChart data={data} outerRadius={72}>
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
