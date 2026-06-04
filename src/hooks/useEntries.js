import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'journal_entries'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function save(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useEntries() {
  const [entries, setEntries] = useState(load)

  useEffect(() => {
    save(entries)
  }, [entries])

  const createEntry = useCallback(() => {
    const entry = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setEntries(prev => [entry, ...prev])
    return entry.id
  }, [])

  const updateEntry = useCallback((id, patch) => {
    setEntries(prev =>
      prev.map(e =>
        e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e
      )
    )
  }, [])

  const deleteEntry = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  return { entries, createEntry, updateEntry, deleteEntry }
}
