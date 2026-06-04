'use client'

import AppShell from '@/components/layout/AppShell'
import TradeCalendar from '@/components/calendar/TradeCalendar'
import TradeForm from '@/components/trades/TradeForm'
import { useTrades } from '@/hooks/useTrades'

export default function CalendarPage() {
  const { trades, addTrade } = useTrades()

  return (
    <AppShell>
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Calendar</h1>
          <TradeForm onAdd={addTrade} />
        </div>
        <TradeCalendar trades={trades} />
      </div>
    </AppShell>
  )
}
