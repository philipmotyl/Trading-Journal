'use client'

import { useState } from 'react'
import { Plus, Pencil, ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STRATEGIES, SYMBOLS, EMOTIONS, SETUP_GRADES } from '@/types/trade'
import type { Trade } from '@/types/trade'

interface Props {
  onAdd?: (data: Omit<Trade, 'id' | 'status' | 'netPnL'>) => void
  onUpdate?: (id: string, data: Omit<Trade, 'id' | 'status' | 'netPnL'>) => void
  trade?: Trade
}

function today() {
  return new Date().toISOString().slice(0, 16)
}

const DEFAULT: Partial<Trade> = {
  symbol: 'MES',
  side: 'LONG',
  quantity: 1,
  entryPrice: 0,
  exitPrice: 0,
  grossPnL: 0,
}

function compressImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 900
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = url
  })
}

export default function TradeForm({ onAdd, onUpdate, trade }: Props) {
  const isEdit = !!trade
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<Partial<Trade>>(DEFAULT)
  const [uploading, setUploading] = useState(false)

  function handleOpenChange(val: boolean) {
    if (val) {
      setF(isEdit ? { ...trade } : { ...DEFAULT, entryDate: today(), exitDate: today() })
    }
    setOpen(val)
  }

  function set(key: keyof Trade, value: string | number | string[]) {
    setF(prev => {
      const next = { ...prev, [key]: value }
      if (['entryPrice', 'exitPrice', 'quantity', 'side', 'symbol'].includes(key)) {
        const ep   = key === 'entryPrice' ? +value : +(prev.entryPrice ?? 0)
        const xp   = key === 'exitPrice'  ? +value : +(prev.exitPrice ?? 0)
        const qty  = key === 'quantity'   ? +value : +(prev.quantity ?? 1)
        const sym  = key === 'symbol'     ? value as string : (prev.symbol ?? 'MES')
        const side = key === 'side'       ? value as string : (prev.side ?? 'LONG')
        const POINT_VALUE: Record<string, number> = {
          MES: 5,
          ES:  50,
          MNQ: 2,
          NQ:  20,
          MCL: 100,
          MGC: 10,
          MBT: 5,
        }
        const tick = POINT_VALUE[sym] ?? 5
        const diff = side === 'LONG' ? xp - ep : ep - xp
        next.grossPnL = +(diff * qty * tick).toFixed(2)
      }
      return next
    })
  }

  async function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      setF(prev => ({ ...prev, screenshot: compressed }))
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!f.symbol || !f.side || !f.entryDate || !f.exitDate) {
      toast.error('Fill in all required fields')
      return
    }
    const data: Omit<Trade, 'id' | 'status' | 'netPnL'> = {
      symbol: f.symbol!,
      side: f.side!,
      entryDate: f.entryDate!,
      exitDate: f.exitDate!,
      entryPrice: f.entryPrice ?? 0,
      exitPrice: f.exitPrice ?? 0,
      quantity: f.quantity ?? 1,
      grossPnL: f.grossPnL ?? 0,
      strategy: f.strategy,
      emotion: f.emotion,
      emotionNotes: f.emotionNotes,
      setupTags: f.setupTags,
      notes: f.notes,
      mistakes: f.mistakes,
      tags: f.tags,
      screenshot: f.screenshot,
    }
    if (isEdit && trade && onUpdate) {
      onUpdate(trade.id, data)
      toast.success('Trade updated')
    } else if (onAdd) {
      onAdd(data)
      toast.success('Trade logged')
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-primary">
            <Pencil className="size-3.5" />
          </Button>
        ) : (
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Add Trade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Trade' : 'Log a Trade'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-2">

          {/* Symbol */}
          <div className="space-y-1.5">
            <Label>Symbol</Label>
            <Select value={f.symbol} onValueChange={v => set('symbol', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SYMBOLS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Side */}
          <div className="space-y-1.5">
            <Label>Side</Label>
            <Select value={f.side} onValueChange={v => set('side', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LONG">Long</SelectItem>
                <SelectItem value="SHORT">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entry date */}
          <div className="space-y-1.5">
            <Label>Entry date/time</Label>
            <Input type="datetime-local" value={(f.entryDate ?? '').slice(0, 16)} onChange={e => set('entryDate', e.target.value + ':00Z')} />
          </div>

          {/* Exit date */}
          <div className="space-y-1.5">
            <Label>Exit date/time</Label>
            <Input type="datetime-local" value={(f.exitDate ?? '').slice(0, 16)} onChange={e => set('exitDate', e.target.value + ':00Z')} />
          </div>

          {/* Entry price */}
          <div className="space-y-1.5">
            <Label>Entry price</Label>
            <Input type="number" step="0.25" value={f.entryPrice || ''} onChange={e => set('entryPrice', +e.target.value)} placeholder="5210.50" />
          </div>

          {/* Exit price */}
          <div className="space-y-1.5">
            <Label>Exit price</Label>
            <Input type="number" step="0.25" value={f.exitPrice || ''} onChange={e => set('exitPrice', +e.target.value)} placeholder="5215.00" />
          </div>

          {/* Contracts */}
          <div className="col-span-2 space-y-1.5">
            <Label>Contracts</Label>
            <Input type="number" min="1" value={f.quantity || ''} onChange={e => set('quantity', +e.target.value)} />
          </div>

          {/* P&L */}
          <div className="col-span-2 space-y-1.5">
            <Label className="flex items-center gap-2">
              P&L
              {!!f.grossPnL && (
                <span className={`text-sm font-semibold tabular-nums ${f.grossPnL >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                  {f.grossPnL >= 0 ? '+' : ''}{f.grossPnL.toFixed(2)}
                </span>
              )}
            </Label>
            <Input type="number" step="0.01" value={f.grossPnL || ''} onChange={e => set('grossPnL', +e.target.value)} placeholder="Auto-calculated from prices" />
          </div>

          {/* Strategy */}
          <div className="col-span-2 space-y-1.5">
            <Label>Strategy</Label>
            <Select value={f.strategy ?? ''} onValueChange={v => set('strategy', v)}>
              <SelectTrigger><SelectValue placeholder="Select strategy…" /></SelectTrigger>
              <SelectContent>
                {STRATEGIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Emotion */}
          <div className={f.emotion ? 'col-span-2 space-y-1.5' : 'space-y-1.5'}>
            <Label>Emotion</Label>
            <Select value={f.emotion ?? ''} onValueChange={v => set('emotion', v)}>
              <SelectTrigger><SelectValue placeholder="How did you feel?" /></SelectTrigger>
              <SelectContent>
                {EMOTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Setup grade — only show when emotion is NOT selected (stays on same row) */}
          {!f.emotion && (
            <div className="space-y-1.5">
              <Label>Setup Grade</Label>
              <Select
                value={f.setupTags?.[0] ?? ''}
                onValueChange={v => set('setupTags', v ? [v] : [])}
              >
                <SelectTrigger><SelectValue placeholder="A+, A, B…" /></SelectTrigger>
                <SelectContent>
                  {SETUP_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Emotion "why?" follow-up — spans both columns, replaces empty slot */}
          {f.emotion && (
            <div className="col-span-2 space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                Why did you feel <span className="text-foreground font-semibold">{f.emotion}</span>?
              </Label>
              <textarea
                className="h-16 w-full resize-none rounded-xl border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="What caused this feeling? Was it news, price action, a previous trade…?"
                value={f.emotionNotes ?? ''}
                onChange={e => set('emotionNotes', e.target.value)}
              />
            </div>
          )}

          {/* Setup grade — below emotion notes when emotion is selected */}
          {f.emotion && (
            <div className="col-span-2 space-y-1.5">
              <Label>Setup Grade</Label>
              <div className="flex flex-wrap gap-2">
                {SETUP_GRADES.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('setupTags', f.setupTags?.[0] === g ? [] : [g])}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      f.setupTags?.[0] === g
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="col-span-2 space-y-1.5">
            <Label>Notes</Label>
            <textarea
              className="h-20 w-full resize-none rounded-xl border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="What did you see? What worked or failed?"
              value={f.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {/* Chart screenshot */}
          <div className="col-span-2 space-y-2">
            <Label className="flex items-center gap-2">
              <ImagePlus className="size-4 text-muted-foreground" />
              Chart Screenshot
              <span className="text-xs text-muted-foreground">(optional — compressed automatically)</span>
            </Label>
            {f.screenshot ? (
              <div className="relative inline-block">
                <img
                  src={f.screenshot}
                  alt="Chart screenshot"
                  className="h-32 w-full rounded-md object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={() => setF(prev => ({ ...prev, screenshot: undefined }))}
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 hover:bg-destructive hover:text-white transition-colors"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <ImagePlus className="size-5" />
                {uploading ? 'Compressing…' : 'Click to upload chart image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{isEdit ? 'Update Trade' : 'Save Trade'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
