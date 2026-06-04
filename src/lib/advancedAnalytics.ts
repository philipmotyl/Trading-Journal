import type { Trade } from '@/types/trade'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export interface DayOfWeekStat {
  day: string
  dayNum: number
  pnl: number
  count: number
  winRate: number
  avgPnL: number
}

export interface HourStat {
  hour: number
  label: string
  pnl: number
  count: number
  winRate: number
}

export interface DurationStats {
  avgMins: number
  avgWinMins: number
  avgLossMins: number
  totalLots: number
  activeDays: number
  avgTradesPerDay: number
}

export interface DirectionStats {
  longCount: number
  shortCount: number
  longPnL: number
  shortPnL: number
  longWinRate: number
  shortWinRate: number
  longPct: number   // % of total trades
}

function durMins(t: Trade) {
  return (new Date(t.exitDate).getTime() - new Date(t.entryDate).getTime()) / 60_000
}

export function analyzeDayOfWeek(trades: Trade[]): DayOfWeekStat[] {
  const byDay: Record<number, Trade[]> = {}
  for (const t of trades) {
    const d = new Date(t.exitDate).getDay()
    ;(byDay[d] ??= []).push(t)
  }
  return Object.entries(byDay)
    .map(([dn, ts]) => {
      const pnl = ts.reduce((s, t) => s + t.netPnL, 0)
      const wins = ts.filter(t => t.status === 'WIN').length
      return {
        day: DAYS[+dn],
        dayNum: +dn,
        pnl: +pnl.toFixed(2),
        count: ts.length,
        winRate: +(wins / ts.length * 100).toFixed(1),
        avgPnL: +(pnl / ts.length).toFixed(2),
      }
    })
    .sort((a, b) => a.dayNum - b.dayNum)
}

export function analyzeTimeOfDay(trades: Trade[]): HourStat[] {
  const byHour: Record<number, Trade[]> = {}
  for (const t of trades) {
    const h = new Date(t.entryDate).getHours()
    ;(byHour[h] ??= []).push(t)
  }
  return Object.entries(byHour)
    .map(([h, ts]) => {
      const hour = +h
      const pnl = ts.reduce((s, t) => s + t.netPnL, 0)
      const wins = ts.filter(t => t.status === 'WIN').length
      const ampm = hour < 12 ? 'AM' : 'PM'
      const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return {
        hour,
        label: `${h12} ${ampm}`,
        pnl: +pnl.toFixed(2),
        count: ts.length,
        winRate: +(wins / ts.length * 100).toFixed(1),
      }
    })
    .sort((a, b) => a.hour - b.hour)
}

export function analyzeDuration(trades: Trade[]): DurationStats {
  const wins   = trades.filter(t => t.status === 'WIN')
  const losses = trades.filter(t => t.status === 'LOSS')

  const avg = (arr: Trade[]) =>
    arr.length > 0 ? arr.reduce((s, t) => s + durMins(t), 0) / arr.length : 0

  const uniqueDays = new Set(trades.map(t => t.exitDate.slice(0, 10))).size

  return {
    avgMins:          +avg(trades).toFixed(1),
    avgWinMins:       +avg(wins).toFixed(1),
    avgLossMins:      +avg(losses).toFixed(1),
    totalLots:        trades.reduce((s, t) => s + t.quantity, 0),
    activeDays:       uniqueDays,
    avgTradesPerDay:  uniqueDays > 0 ? +(trades.length / uniqueDays).toFixed(1) : 0,
  }
}

export function analyzeDirection(trades: Trade[]): DirectionStats {
  const longs  = trades.filter(t => t.side === 'LONG')
  const shorts = trades.filter(t => t.side === 'SHORT')
  const wr = (arr: Trade[]) =>
    arr.length > 0 ? +(arr.filter(t => t.status === 'WIN').length / arr.length * 100).toFixed(1) : 0

  return {
    longCount:    longs.length,
    shortCount:   shorts.length,
    longPnL:      +longs.reduce((s, t) => s + t.netPnL, 0).toFixed(2),
    shortPnL:     +shorts.reduce((s, t) => s + t.netPnL, 0).toFixed(2),
    longWinRate:  wr(longs),
    shortWinRate: wr(shorts),
    longPct:      trades.length > 0 ? +(longs.length / trades.length * 100).toFixed(1) : 0,
  }
}

export function getBestWorstTrades(trades: Trade[]): { best: Trade | null; worst: Trade | null } {
  if (trades.length === 0) return { best: null, worst: null }
  const sorted = [...trades].sort((a, b) => b.netPnL - a.netPnL)
  return { best: sorted[0], worst: sorted[sorted.length - 1] }
}

export function getDayOfWeekInsights(stats: DayOfWeekStat[]) {
  if (stats.length === 0) return null
  const best        = [...stats].sort((a, b) => b.pnl - a.pnl)[0]
  const worst       = [...stats].sort((a, b) => a.pnl - b.pnl)[0]
  const mostActive  = [...stats].sort((a, b) => b.count - a.count)[0]
  const bestWinRate = [...stats].sort((a, b) => b.winRate - a.winRate)[0]
  return { best, worst, mostActive, bestWinRate }
}

export function fmtMins(m: number) {
  if (m <= 0) return '—'
  const mins = Math.floor(m)
  const secs = Math.round((m - mins) * 60)
  return `${mins} min${secs > 0 ? ` ${secs} sec` : ''}`
}

export function fmtMoney(n: number) {
  const abs = Math.abs(n)
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(2)}K` : `$${abs.toFixed(2)}`
  return n < 0 ? `-${s}` : `+${s}`
}
