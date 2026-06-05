'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePlaybook } from '@/hooks/usePlaybook'
import { useTrades } from '@/hooks/useTrades'
import { cn } from '@/lib/utils'
import type { PlaybookEntry } from '@/types/trade'

function fmt$(n: number) {
  const abs = Math.abs(n)
  return `${n < 0 ? '-' : '+'}$${abs >= 1000 ? (abs / 1000).toFixed(2) + 'K' : abs.toFixed(2)}`
}

interface PlaybookFormProps {
  entry?: PlaybookEntry
  onSave: (data: Omit<PlaybookEntry, 'id' | 'createdAt'>) => void
  trigger: React.ReactNode
}

function PlaybookForm({ entry, onSave, trigger }: PlaybookFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(entry?.name ?? '')
  const [description, setDescription] = useState(entry?.description ?? '')
  const [entryRules, setEntryRules] = useState(entry?.entryRules ?? '')
  const [exitRules, setExitRules] = useState(entry?.exitRules ?? '')
  const [riskNotes, setRiskNotes] = useState(entry?.riskNotes ?? '')

  function handleOpen(v: boolean) {
    if (v && entry) {
      setName(entry.name)
      setDescription(entry.description ?? '')
      setEntryRules(entry.entryRules ?? '')
      setExitRules(entry.exitRules ?? '')
      setRiskNotes(entry.riskNotes ?? '')
    } else if (v) {
      setName(''); setDescription(''); setEntryRules(''); setExitRules(''); setRiskNotes('')
    }
    setOpen(v)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name is required'); return }
    onSave({ name: name.trim(), description, entryRules, exitRules, riskNotes })
    setOpen(false)
    toast.success(entry ? 'Strategy updated' : 'Strategy added to playbook')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Strategy' : 'Add to Playbook'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="space-y-1.5">
            <Label>Strategy Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Opening Drive, ICT Model 3…" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              className="h-16 w-full resize-none rounded-xl border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="What is this setup? When does it occur?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Entry Rules</Label>
            <textarea
              className="h-20 w-full resize-none rounded-xl border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="What conditions must be true to enter?&#10;• Price above VWAP&#10;• First 15 min candle closes bullish…"
              value={entryRules}
              onChange={e => setEntryRules(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Exit Rules</Label>
            <textarea
              className="h-20 w-full resize-none rounded-xl border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="When do you take profit or cut the trade?&#10;• Target: previous day high&#10;• Stop: below entry candle low…"
              value={exitRules}
              onChange={e => setExitRules(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Risk Management Notes</Label>
            <textarea
              className="h-16 w-full resize-none rounded-xl border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Max contracts, max loss, time limits…"
              value={riskNotes}
              onChange={e => setRiskNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{entry ? 'Update' : 'Add Strategy'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EntryCard({ entry, onUpdate, onDelete, trades }: {
  entry: PlaybookEntry
  onUpdate: (id: string, data: Omit<PlaybookEntry, 'id' | 'createdAt'>) => void
  onDelete: (id: string) => void
  linkedPnL: number
  linkedCount: number
  trades: never[]
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer pb-3 hover:bg-accent/10 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {expanded
              ? <ChevronDown className="size-4 shrink-0 text-primary" />
              : <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold">{entry.name}</CardTitle>
              {entry.description && (
                <p className={cn('mt-0.5 text-xs text-muted-foreground', !expanded && 'line-clamp-1')}>
                  {entry.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            <PlaybookForm
              entry={entry}
              onSave={data => onUpdate(entry.id, data)}
              trigger={
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-primary">
                  <Pencil className="size-3.5" />
                </Button>
              }
            />
            <Button
              variant="ghost" size="icon"
              className="size-7 text-muted-foreground hover:text-red-400"
              onClick={() => { onDelete(entry.id); toast.error('Strategy removed') }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="flex flex-col gap-4 pt-0">
          {/* Trade performance for this strategy */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-xs">{(trades as unknown as { length: number }).length ?? 0} trades tagged</Badge>
            {(trades as unknown as { netPnL: number }[]).length > 0 && (
              <Badge
                variant="outline"
                className={cn('text-xs font-semibold', (trades as unknown as { netPnL: number }[]).reduce((s, t) => s + t.netPnL, 0) >= 0 ? 'text-emerald-400 border-emerald-400/30' : 'text-red-400 border-red-400/30')}
              >
                {fmt$((trades as unknown as { netPnL: number }[]).reduce((s, t) => s + t.netPnL, 0))} total
              </Badge>
            )}
          </div>

          {entry.entryRules && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Entry Rules</p>
              <p className="text-sm whitespace-pre-wrap text-foreground">{entry.entryRules}</p>
            </div>
          )}
          {entry.exitRules && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Exit Rules</p>
              <p className="text-sm whitespace-pre-wrap text-foreground">{entry.exitRules}</p>
            </div>
          )}
          {entry.riskNotes && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Risk Management</p>
              <p className="text-sm whitespace-pre-wrap text-foreground">{entry.riskNotes}</p>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">
            Added {new Date(entry.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      )}
    </Card>
  )
}

export default function PlaybookPage() {
  const { entries, addEntry, updateEntry, deleteEntry } = usePlaybook()
  const { trades } = useTrades()

  function linkedTrades(name: string) {
    return trades.filter(t => t.strategy === name)
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              Playbook
            </h1>
            <p className="text-sm text-muted-foreground">
              {entries.length} {entries.length === 1 ? 'strategy' : 'strategies'} documented
            </p>
          </div>
          <PlaybookForm
            onSave={addEntry}
            trigger={
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Add Strategy
              </Button>
            }
          />
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <BookOpen className="size-10 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">No strategies documented yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click <span className="text-primary font-semibold">+ Add Strategy</span> to start building your playbook.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map(e => (
              <EntryCard
                key={e.id}
                entry={e}
                onUpdate={updateEntry}
                onDelete={deleteEntry}
                linkedPnL={linkedTrades(e.name).reduce((s, t) => s + t.netPnL, 0)}
                linkedCount={linkedTrades(e.name).length}
                trades={linkedTrades(e.name) as never[]}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
