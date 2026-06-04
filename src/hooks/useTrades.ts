'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Trade, TradeSide, TradeStatus } from '@/types/trade'

const KEY = 'trading_journal_v2'

function load(): Trade[] {
  if (typeof window === 'undefined') return []
  try {
    return (JSON.parse(localStorage.getItem(KEY) ?? 'null') as Trade[]) ?? []
  } catch {
    return []
  }
}

function persist(trades: Trade[]) {
  localStorage.setItem(KEY, JSON.stringify(trades))
}

function deriveStatus(_side: TradeSide, _entry: number, _exit: number, netPnL: number): TradeStatus {
  if (netPnL > 0) return 'WIN'
  if (netPnL < 0) return 'LOSS'
  return 'BREAKEVEN'
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(load)

  useEffect(() => {
    persist(trades)
  }, [trades])

  const addTrade = useCallback((data: Omit<Trade, 'id' | 'status' | 'netPnL'>) => {
    const netPnL = data.grossPnL - data.commission
    const trade: Trade = {
      ...data,
      id: crypto.randomUUID(),
      netPnL,
      status: deriveStatus(data.side, data.entryPrice, data.exitPrice, netPnL),
    }
    setTrades(prev => [trade, ...prev])
    return trade
  }, [])

  const updateTrade = useCallback((id: string, patch: Partial<Trade>) => {
    setTrades(prev => prev.map(t => {
      if (t.id !== id) return t
      const updated = { ...t, ...patch }
      updated.netPnL = updated.grossPnL - updated.commission
      updated.status = deriveStatus(updated.side, updated.entryPrice, updated.exitPrice, updated.netPnL)
      return updated
    }))
  }, [])

  const deleteTrade = useCallback((id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setTrades([])
  }, [])

  const importTrades = useCallback((newTrades: Trade[]) => {
    setTrades(prev => [...newTrades, ...prev])
  }, [])

  return { trades, addTrade, updateTrade, deleteTrade, clearAll, importTrades }
}
