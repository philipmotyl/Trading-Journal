import { useState } from 'react'
import { useEntries } from './hooks/useEntries'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import './App.css'

export default function App() {
  const { entries, createEntry, updateEntry, deleteEntry } = useEntries()
  const [activeId, setActiveId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const activeEntry = entries.find(e => e.id === activeId)

  function handleNew() {
    const id = createEntry()
    setActiveId(id)
    setSearchQuery('')
  }

  function handleDelete(id) {
    deleteEntry(id)
    setActiveId(null)
  }

  return (
    <div className="app">
      <Sidebar
        entries={entries}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNew}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />
      <main className="main">
        {activeEntry ? (
          <Editor
            key={activeEntry.id}
            entry={activeEntry}
            onUpdate={updateEntry}
            onDelete={handleDelete}
          />
        ) : (
          <div className="empty-state">
            <p>Select an entry or create a new one.</p>
            <button className="btn-new-lg" onClick={handleNew}>
              + New Entry
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
