'use client'

import { useState } from 'react'
import { Trash2, ChevronUp, ChevronDown, ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import TradeForm from '@/components/trades/TradeForm'
import type { Trade } from '@/types/trade'

interface Props {
  trades: Trade[]
  onDelete: (id: string) => void
  onUpdate: (id: string, data: Omit<Trade, 'id' | 'status' | 'netPnL'>) => void
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
}

function fmtMoney(n: number) {
  const abs = Math.abs(n)
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(2)}K` : `$${abs.toFixed(2)}`
  return n < 0 ? `-${s}` : `+${s}`
}

type SortKey = 'exitDate' | 'symbol' | 'netPnL' | 'strategy'

// Defined at module level — never recreated during render
function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronUp className="size-3 opacity-30" />
  return dir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
}

function ScreenshotViewer({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <img src={src} alt="Trade chart" className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl" />
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 rounded-full bg-background p-1.5 shadow-lg hover:bg-accent transition-colors border border-border"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default function TradeTable({ trades, onDelete, onUpdate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('exitDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState('')
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null)

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...trades]
    .filter(t =>
      !filter ||
      t.symbol.toLowerCase().includes(filter.toLowerCase()) ||
      (t.strategy ?? '').toLowerCase().includes(filter.toLowerCase()) ||
      t.status.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      let va: string | number = ''
      let vb: string | number = ''
      if (sortKey === 'exitDate')  { va = a.exitDate;        vb = b.exitDate }
      if (sortKey === 'symbol')    { va = a.symbol;          vb = b.symbol }
      if (sortKey === 'netPnL')    { va = a.netPnL;          vb = b.netPnL }
      if (sortKey === 'strategy')  { va = a.strategy ?? '';  vb = b.strategy ?? '' }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  return (
    <>
      {viewingScreenshot && (
        <ScreenshotViewer src={viewingScreenshot} onClose={() => setViewingScreenshot(null)} />
      )}

      <div className="flex flex-col gap-3">
        <input
          className="h-8 w-64 rounded-md border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Filter by symbol, strategy…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />

        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                {([['exitDate','Date'],['symbol','Symbol']] as [SortKey,string][]).map(([k,l]) => (
                  <th key={k} className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" onClick={() => toggleSort(k)}>
                    <span className="flex items-center gap-1">{l}<SortIcon active={sortKey === k} dir={sortDir} /></span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Side</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exit</th>
                <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" onClick={() => toggleSort('netPnL')}>
                  <span className="flex items-center gap-1">Net P&L<SortIcon active={sortKey === 'netPnL'} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" onClick={() => toggleSort('strategy')}>
                  <span className="flex items-center gap-1">Strategy<SortIcon active={sortKey === 'strategy'} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chart</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium">No trades yet</p>
                      <p className="text-xs">Click <span className="text-primary font-semibold">+ Add Trade</span> to log your first trade.</p>
                    </div>
                  </td>
                </tr>
              )}
              {sorted.map(t => (
                <tr key={t.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(t.exitDate)}</td>
                  <td className="px-4 py-3 font-semibold">{t.symbol}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn('text-xs font-semibold', t.side === 'LONG' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-blue-400 border-blue-400/30 bg-blue-400/10')}>
                      {t.side}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.quantity}</td>
                  <td className="px-4 py-3 tabular-nums text-xs">{t.entryPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 tabular-nums text-xs">{t.exitPrice.toFixed(2)}</td>
                  <td className={cn('px-4 py-3 font-bold tabular-nums', t.netPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {fmtMoney(t.netPnL)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn('text-xs font-semibold border-0', t.status === 'WIN' ? 'bg-emerald-500/15 text-emerald-400' : t.status === 'LOSS' ? 'bg-red-500/15 text-red-400' : 'bg-muted text-muted-foreground')}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.strategy ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {t.screenshot ? (
                      <button
                        onClick={() => setViewingScreenshot(t.screenshot!)}
                        className="group relative mx-auto block size-9 overflow-hidden rounded border border-border hover:border-primary transition-colors"
                        title="View chart"
                      >
                        <img src={t.screenshot} alt="Chart" className="size-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="size-3.5 text-white" />
                        </div>
                      </button>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <TradeForm trade={t} onUpdate={onUpdate} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-red-400"
                        onClick={() => { onDelete(t.id); toast.error('Trade deleted') }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{sorted.length} of {trades.length} trades</p>
      </div>
    </>
  )
}
