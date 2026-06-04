import type { Trade } from '@/types/trade'

export interface Analytics {
  totalTrades: number
  winCount: number
  lossCount: number
  breakevenCount: number
  winRate: number
  netPnL: number
  grossPnL: number
  totalCommission: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  avgWinLossRatio: number
  maxDrawdown: number
  largestWin: number
  largestLoss: number
  expectancy: number
  recoveryFactor: number
  performanceScore: number
  // Radar axes (0-100)
  radarData: { axis: string; value: number }[]
}

export interface DayStats {
  pnl: number
  count: number
  winRate: number
  trades: Trade[]
}

export function computeAnalytics(trades: Trade[]): Analytics {
  if (trades.length === 0) return emptyAnalytics()

  const wins = trades.filter(t => t.status === 'WIN')
  const losses = trades.filter(t => t.status === 'LOSS')
  const breakevens = trades.filter(t => t.status === 'BREAKEVEN')

  const netPnL = trades.reduce((s, t) => s + t.netPnL, 0)
  const grossPnL = trades.reduce((s, t) => s + t.grossPnL, 0)
  const totalCommission = trades.reduce((s, t) => s + t.commission, 0)

  const grossWins = wins.reduce((s, t) => s + t.netPnL, 0)
  const grossLosses = Math.abs(losses.reduce((s, t) => s + t.netPnL, 0))

  const winRate = wins.length / trades.length
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : wins.length > 0 ? 99 : 0

  const avgWin = wins.length > 0 ? grossWins / wins.length : 0
  const avgLoss = losses.length > 0 ? grossLosses / losses.length : 0
  const avgWinLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 99 : 0

  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.netPnL)) : 0
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.netPnL)) : 0
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss

  // Max drawdown via equity curve
  const sorted = [...trades].sort((a, b) => +new Date(a.exitDate) - +new Date(b.exitDate))
  let peak = 0, equity = 0, maxDD = 0
  for (const t of sorted) {
    equity += t.netPnL
    if (equity > peak) peak = equity
    const dd = peak - equity
    if (dd > maxDD) maxDD = dd
  }
  const recoveryFactor = maxDD > 0 ? netPnL / maxDD : netPnL > 0 ? 99 : 0

  // Normalize each axis to 0-100
  const wrScore = winRate * 100
  const pfScore = Math.min((profitFactor / 3) * 100, 100)
  const ratioScore = Math.min((avgWinLossRatio / 2.5) * 100, 100)
  const ddScore = peak > 0 ? Math.max(0, 100 - (maxDD / peak) * 200) : 100
  const rfScore = Math.min((recoveryFactor / 4) * 100, 100)
  const consistencyScore = trades.length >= 10
    ? Math.max(0, 100 - (maxDD / Math.max(Math.abs(netPnL), 1)) * 80)
    : 50

  const performanceScore = trades.length > 0
    ? Math.round(wrScore * 0.25 + pfScore * 0.25 + ratioScore * 0.2 + ddScore * 0.15 + rfScore * 0.15)
    : 0

  const radarData = [
    { axis: 'Win Rate', value: Math.round(wrScore) },
    { axis: 'Profit Factor', value: Math.round(pfScore) },
    { axis: 'Avg W/L', value: Math.round(ratioScore) },
    { axis: 'Consistency', value: Math.round(consistencyScore) },
    { axis: 'Max DD', value: Math.round(ddScore) },
    { axis: 'Recovery', value: Math.round(rfScore) },
  ]

  return {
    totalTrades: trades.length,
    winCount: wins.length,
    lossCount: losses.length,
    breakevenCount: breakevens.length,
    winRate: winRate * 100,
    netPnL, grossPnL, totalCommission,
    profitFactor, avgWin, avgLoss, avgWinLossRatio,
    maxDrawdown: maxDD,
    largestWin, largestLoss, expectancy, recoveryFactor,
    performanceScore, radarData,
  }
}

export function buildEquityCurve(trades: Trade[]): { date: string; equity: number }[] {
  const sorted = [...trades].sort((a, b) => +new Date(a.exitDate) - +new Date(b.exitDate))
  let running = 0
  return [
    { date: '', equity: 0 },
    ...sorted.map(t => {
      running += t.netPnL
      return { date: t.exitDate.slice(0, 10), equity: +running.toFixed(2) }
    }),
  ]
}

export function buildDailyPnL(trades: Trade[]): { date: string; pnl: number }[] {
  const map = tradesByDay(trades)
  return Object.entries(map)
    .map(([date, d]) => ({ date, pnl: +d.pnl.toFixed(2) }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function tradesByDay(trades: Trade[]): Record<string, DayStats> {
  const groups: Record<string, Trade[]> = {}
  for (const t of trades) {
    const day = t.exitDate.slice(0, 10)
    if (!groups[day]) groups[day] = []
    groups[day].push(t)
  }
  const result: Record<string, DayStats> = {}
  for (const [day, ts] of Object.entries(groups)) {
    const pnl = ts.reduce((s, t) => s + t.netPnL, 0)
    const wins = ts.filter(t => t.status === 'WIN').length
    result[day] = { pnl, count: ts.length, winRate: (wins / ts.length) * 100, trades: ts }
  }
  return result
}

function emptyAnalytics(): Analytics {
  return {
    totalTrades: 0, winCount: 0, lossCount: 0, breakevenCount: 0,
    winRate: 0, netPnL: 0, grossPnL: 0, totalCommission: 0,
    profitFactor: 0, avgWin: 0, avgLoss: 0, avgWinLossRatio: 0,
    maxDrawdown: 0, largestWin: 0, largestLoss: 0,
    expectancy: 0, recoveryFactor: 0, performanceScore: 0,
    radarData: [
      { axis: 'Win Rate', value: 0 },
      { axis: 'Profit Factor', value: 0 },
      { axis: 'Avg W/L', value: 0 },
      { axis: 'Consistency', value: 0 },
      { axis: 'Max DD', value: 0 },
      { axis: 'Recovery', value: 0 },
    ],
  }
}
