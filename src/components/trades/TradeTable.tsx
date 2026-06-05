'use client'

import { useState } from 'react'
import { Trash2, ChevronUp, ChevronDown, ImageIcon, X, FileText, ChevronRight } from 'lucide-react'
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
        <img src={src} alt="Trade chart" className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl" />
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

function ExpandedNotes({ trade }: { trade: Trade }) {
  const hasContent = trade.notes || trade.emotion || trade.mistakes?.length || trade.tags?.length || trade.setupTags?.length
  return (
    <div className="flex flex-wrap gap-6 px-6 py-4 bg-accent/5 border-t border-border/50">
      {!hasContent && (
        <p className="text-xs text-muted-foreground italic">No notes for this trade.</p>
      )}

      {trade.notes && (
        <div className="flex-1 min-w-[200px]">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Notes</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
        </div>
      )}

      {trade.emotion && (
        <div className="min-w-[100px]">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Emotion</p>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{trade.emotion}</span>
        </div>
      )}

      {trade.setupTags && trade.setupTags.length > 0 && (
        <div className="min-w-[80px]">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Setup Grade</p>
          <span className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
            {trade.setupTags[0]}
          </span>
        </div>
      )}

      {trade.mistakes && trade.mistakes.length > 0 && (
        <div className="min-w-[140px]">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mistakes</p>
          <div className="flex flex-wrap gap-1">
            {trade.mistakes.map(m => (
              <Badge key={m} variant="outline" className="text-xs text-orange-400 border-orange-400/30 bg-orange-400/10">{m}</Badge>
            ))}
          </div>
        </div>
      )}

      {trade.tags && trade.tags.length > 0 && (
        <div className="min-w-[120px]">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-1">
            {trade.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs text-primary/80 border-primary/20 bg-primary/5">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TradeTable({ trades, onDelete, onUpdate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('exitDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState('')
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function toggleExpand(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setExpandedId(prev => prev === id ? null : id)
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
          className="h-9 w-64 rounded-xl border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Filter by symbol, strategy…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />

        <div className="overflow-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="w-8 px-3 py-3" />
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chart</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium">No trades yet</p>
                      <p className="text-xs">Click <span className="text-primary font-semibold">+ Add Trade</span> to log your first trade.</p>
                    </div>
                  </td>
                </tr>
              )}
              {sorted.map(t => (
                <>
                  <tr
                    key={t.id}
                    className={cn(
                      'transition-colors cursor-pointer select-none',
                      expandedId === t.id ? 'bg-accent/20' : 'hover:bg-accent/30'
                    )}
                    onClick={e => toggleExpand(t.id, e)}
                  >
                    {/* Expand chevron */}
                    <td className="pl-3 pr-0 py-3">
                      <ChevronRight
                        className={cn(
                          'size-3.5 text-muted-foreground/50 transition-transform duration-200',
                          expandedId === t.id && 'rotate-90 text-primary'
                        )}
                      />
                    </td>
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
                    {/* Notes preview */}
                    <td className="px-4 py-3 max-w-[180px]">
                      {t.notes ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <FileText className="size-3 shrink-0 text-primary/60" />
                          <span className="truncate">{t.notes}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.screenshot ? (
                        <button
                          onClick={e => { e.stopPropagation(); setViewingScreenshot(t.screenshot!) }}
                          className="group relative mx-auto block size-9 overflow-hidden rounded-lg border border-border hover:border-primary transition-colors"
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
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
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
                  {expandedId === t.id && (
                    <tr key={`${t.id}-expanded`} className="bg-accent/5">
                      <td colSpan={12} className="p-0">
                        <ExpandedNotes trade={t} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{sorted.length} of {trades.length} trades</p>
      </div>
    </>
  )
}
