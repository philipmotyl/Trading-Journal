export type TradeSide = 'LONG' | 'SHORT'
export type TradeStatus = 'WIN' | 'LOSS' | 'BREAKEVEN'

export interface Trade {
  id: string
  symbol: string
  side: TradeSide
  entryDate: string    // ISO string
  exitDate: string
  entryPrice: number
  exitPrice: number
  quantity: number     // contracts
  grossPnL: number
  netPnL: number
  status: TradeStatus
  strategy?: string
  notes?: string
  mistakes?: string[]
  tags?: string[]
  duration?: number    // minutes
  screenshot?: string  // base64 compressed JPEG
}

export const STRATEGIES = [
  'Opening Drive',
  'Pullback Retest',
  'ICT Model 3',
  'Morning Top Reversal',
  'Absorption Reversal',
  'Breakout',
  'Gap Fill',
  'Other',
] as const

export const MISTAKE_OPTIONS = [
  'FOMO entry',
  'Ignored stop',
  'Revenge trade',
  'Oversize',
  'Early exit',
  'Late entry',
  'Counter-trend',
  'No setup',
] as const

export const SYMBOLS = ['MES', 'ES', 'MNQ', 'NQ', 'MCL', 'MGC', 'MBT'] as const
