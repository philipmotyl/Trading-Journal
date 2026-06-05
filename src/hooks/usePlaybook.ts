'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PlaybookEntry } from '@/types/trade'

const KEY = 'ts_playbook_v1'

function load(): PlaybookEntry[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

function save(entries: PlaybookEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries))
}

export function usePlaybook() {
  const [entries, setEntries] = useState<PlaybookEntry[]>([])

  useEffect(() => { setEntries(load()) }, [])

  const addEntry = useCallback((data: Omit<PlaybookEntry, 'id' | 'createdAt'>) => {
    const entry: PlaybookEntry = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setEntries(prev => {
      const next = [entry, ...prev]
      save(next)
      return next
    })
  }, [])

  const updateEntry = useCallback((id: string, data: Omit<PlaybookEntry, 'id' | 'createdAt'>) => {
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...data } : e)
      save(next)
      return next
    })
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id)
      save(next)
      return next
    })
  }, [])

  return { entries, addEntry, updateEntry, deleteEntry }
}
