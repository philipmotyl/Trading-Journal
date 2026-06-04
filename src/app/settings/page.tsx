'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTrades } from '@/hooks/useTrades'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { trades, clearAll } = useTrades()
  const [confirming, setConfirming] = useState(false)

  function handleClearAll() {
    if (!confirming) { setConfirming(true); return }
    clearAll()
    setConfirming(false)
    toast.success('All trades cleared — fresh start!')
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 overflow-y-auto p-6 max-w-2xl">
        <h1 className="text-xl font-bold">Settings</h1>

        {/* Data management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Management</CardTitle>
            <CardDescription>Your trades are stored locally in your browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Trade journal</p>
                <p className="text-xs text-muted-foreground">{trades.length} trades stored</p>
              </div>
              <div className="flex items-center gap-3">
                {confirming && (
                  <span className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle className="size-3.5" />
                    Click again to confirm
                  </span>
                )}
                <Button
                  variant={confirming ? 'destructive' : 'outline'}
                  size="sm"
                  className="gap-2"
                  onClick={handleClearAll}
                  onBlur={() => setConfirming(false)}
                >
                  <Trash2 className="size-3.5" />
                  {confirming ? 'Yes, clear all' : 'Clear all trades'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Broker sync (coming soon) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Broker / Prop Firm Sync</CardTitle>
            <CardDescription>Auto-import trades from your platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Topstep',  platform: 'TopstepX / Rithmic' },
              { name: 'APEX',     platform: 'Rithmic / NinjaTrader' },
              { name: 'TradeDay', platform: 'Rithmic' },
              { name: 'NinjaTrader CSV', platform: 'Import trade performance export' },
            ].map(b => (
              <div key={b.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.platform}</p>
                </div>
                <Badge label="Coming soon" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {label}
    </span>
  )
}
