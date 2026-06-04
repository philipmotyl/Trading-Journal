export default function Sidebar({ entries, activeId, onSelect, onNew, searchQuery, onSearch }) {
  const fmt = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  const filtered = entries.filter(e => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)
  })

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo">Journal</span>
        <button className="btn-new" onClick={onNew}>+ New</button>
      </div>
      <div className="search-wrap">
        <input
          className="search-input"
          type="search"
          placeholder="Search entries…"
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <ul className="entry-list">
        {filtered.length === 0 && (
          <li className="empty-msg">
            {searchQuery ? 'No matches.' : 'No entries yet.'}
          </li>
        )}
        {filtered.map(e => (
          <li
            key={e.id}
            className={`entry-item${e.id === activeId ? ' active' : ''}`}
            onClick={() => onSelect(e.id)}
          >
            <span className="entry-title">{e.title || 'Untitled'}</span>
            <span className="entry-date">{fmt(e.updatedAt)}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
