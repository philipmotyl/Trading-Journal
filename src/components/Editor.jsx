import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Editor({ entry, onUpdate, onDelete }) {
  const [tab, setTab] = useState('write')
  const [title, setTitle] = useState(entry.title)
  const [body, setBody] = useState(entry.body)

  // Sync when switching entries
  useEffect(() => {
    setTitle(entry.title)
    setBody(entry.body)
    setTab('write')
  }, [entry.id])

  // Debounced auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      onUpdate(entry.id, { title, body })
    }, 400)
    return () => clearTimeout(t)
  }, [title, body])

  const fmt = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

  return (
    <div className="editor-pane">
      <div className="editor-topbar">
        <input
          className="title-input"
          placeholder="Untitled"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button
          className="btn-delete"
          onClick={() => {
            if (confirm('Delete this entry?')) onDelete(entry.id)
          }}
        >
          Delete
        </button>
      </div>
      <div className="entry-meta">{fmt(entry.createdAt)}</div>
      <div className="tab-bar">
        <button
          className={`tab${tab === 'write' ? ' active' : ''}`}
          onClick={() => setTab('write')}
        >
          Write
        </button>
        <button
          className={`tab${tab === 'preview' ? ' active' : ''}`}
          onClick={() => setTab('preview')}
        >
          Preview
        </button>
      </div>
      {tab === 'write' ? (
        <textarea
          className="body-textarea"
          placeholder="Write your entry in Markdown…"
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      ) : (
        <div className="markdown-preview">
          {body.trim() ? (
            <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
          ) : (
            <p className="preview-empty">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
