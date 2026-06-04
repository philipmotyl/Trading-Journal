'use client'

import AppShell from '@/components/layout/AppShell'
import TradeTable from '@/components/trades/TradeTable'
import TradeForm from '@/components/trades/TradeForm'
import { useTrades } from '@/hooks/useTrades'

export default function TradesPage() {
  const { trades, addTrade, updateTrade, deleteTrade } = useTrades()

  return (
    <AppShell>
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Trade Log</h1>
            <p className="text-sm text-muted-foreground">{trades.length} total trades</p>
          </div>
          <TradeForm onAdd={addTrade} />
        </div>
        <TradeTable trades={trades} onDelete={deleteTrade} onUpdate={updateTrade} />
      </div>
    </AppShell>
  )
}
