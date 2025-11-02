import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AlertTriangle, RefreshCw, Search, CheckCircle2 } from 'lucide-react'
import { getIssues, markIssue, resolveIssue, clearError, clearSuccess } from '../../store/slices/inventorySlice'
import axiosInstance from '../../utils/axios'

export default function MissingStolen() {
  const dispatch = useDispatch()
  const { issues, loading, error, success, message } = useSelector((s) => s.inventory || {})

  const [status, setStatus] = useState('missing')
  const [bookRef, setBookRef] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [bookQuery, setBookQuery] = useState('')
  const [bookOptions, setBookOptions] = useState([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const [note, setNote] = useState('')
  const [filter, setFilter] = useState('active')
  const [query, setQuery] = useState('')

  useEffect(() => {
    dispatch(getIssues({}))
  }, [dispatch])

  useEffect(() => {
    if (error) {
      // Keep consistent UX: error toasts are handled globally in App, but we clear here to avoid stale
      const t = setTimeout(() => dispatch(clearError()), 100)
      return () => clearTimeout(t)
    }
  }, [error, dispatch])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => dispatch(clearSuccess()), 500)
      return () => clearTimeout(t)
    }
  }, [success, dispatch])

  const filtered = useMemo(() => {
    let list = issues || []
    if (filter === 'active') list = list.filter(i => !i.resolved)
    if (filter === 'resolved') list = list.filter(i => i.resolved)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(i => {
        const title = i.book?.title?.toLowerCase() || ''
        const author = (Array.isArray(i.book?.authors) ? i.book.authors.join(' ') : i.book?.author || '').toLowerCase()
        const isbn = i.book?.isbn?.toLowerCase() || ''
        const by = i.reportedBy?.name?.toLowerCase() || ''
        return title.includes(q) || author.includes(q) || isbn.includes(q) || by.includes(q)
      })
    }
    return list
  }, [issues, filter, query])

  // Debounced book search
  useEffect(() => {
    let active = true
    if (!bookQuery || selectedBook) {
      setBookOptions([])
      return
    }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const res = await axiosInstance.get('/book/all', { params: { search: bookQuery, limit: 8, page: 1 } })
        if (active) setBookOptions(res.data?.books || [])
      } catch (_) {
        if (active) setBookOptions([])
      } finally {
        if (active) setSearching(false)
      }
    }, 250)
    return () => { active = false; clearTimeout(t) }
  }, [bookQuery, selectedBook])

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showDropdown])

  const onSubmit = (e) => {
    e.preventDefault()
    const ref = selectedBook?._id || bookQuery.trim()
    if (!ref) return
    dispatch(markIssue({ bookRef: ref, status, note: note.trim() || undefined }))
      .then(() => dispatch(getIssues({})))
    setNote('')
    setBookRef('')
    setBookQuery('')
    setBookOptions([])
    setSelectedBook(null)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Missing/Stolen Books</h1>
        </div>
        <button
          onClick={() => dispatch(getIssues({}))}
          className="btn btn-secondary btn-sm flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Create */}
      <div className="glass-card p-4 mb-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3" ref={dropdownRef}>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Status</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm ${status==='missing' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setStatus('missing')}
              >
                Missing
              </button>
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm ${status==='stolen' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setStatus('stolen')}
              >
                Stolen
              </button>
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col relative">
            <label className="text-sm text-gray-600 mb-1">Book</label>
            {!selectedBook ? (
              <div className="bg-white/70 backdrop-blur-sm h-[44px] sm:h-[48px] rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 border border-white/50 shadow-sm">
                <Search className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600 flex-shrink-0" />
                <input
                  value={bookQuery}
                  onChange={(e) => { setBookQuery(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by title or ISBN"
                  className="ml-2 sm:ml-3 bg-transparent border-none outline-none flex-1 text-[15px] sm:text-sm text-gray-800 placeholder:text-gray-500 min-w-0 py-2"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-xl bg-white/70 border border-white/50 shadow-sm text-sm text-gray-800">
                  {selectedBook.title} <span className="text-gray-500">·</span> {selectedBook.author} {selectedBook.isbn ? <span className="text-gray-500">· ISBN: {selectedBook.isbn}</span> : null}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                  onClick={() => { setSelectedBook(null); setBookQuery(''); setShowDropdown(false); }}
                >
                  Change
                </button>
              </div>
            )}

            {/* Suggestions dropdown */}
            {showDropdown && !selectedBook && (bookOptions.length > 0 || searching) && (
              <div className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-72 overflow-auto">
                {searching && (
                  <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
                )}
                {!searching && bookOptions.map((b) => (
                  <button
                    type="button"
                    key={b._id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col"
                    onClick={() => { setSelectedBook(b); setBookRef(b._id); setShowDropdown(false) }}
                  >
                    <span className="text-gray-900 text-sm font-medium">{b.title}</span>
                    <span className="text-gray-600 text-xs">{b.author}{b.isbn ? ` · ISBN: ${b.isbn}` : ''}</span>
                  </button>
                ))}
                {!searching && bookOptions.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">No matches</div>
                )}
              </div>
            )}
            
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Note (optional)</label>
            <div className="bg-white/70 backdrop-blur-sm h-[44px] sm:h-[48px] rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 border border-white/50 shadow-sm">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add context"
                className="bg-transparent border-none outline-none flex-1 text-[15px] sm:text-sm text-gray-800 placeholder:text-gray-500 min-w-0 py-2"
              />
            </div>
          </div>
          <div className="md:col-span-4 flex gap-2 justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              disabled={loading}
            >
              Mark
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button className={`chip ${filter==='active'?'chip-active':''}`} onClick={() => setFilter('active')}>Active</button>
          <button className={`chip ${filter==='resolved'?'chip-active':''}`} onClick={() => setFilter('resolved')}>Resolved</button>
          <button className={`chip ${filter==='all'?'chip-active':''}`} onClick={() => setFilter('all')}>All</button>
        </div>
        <div className="w-full sm:w-96">
          <div className="bg-white/70 backdrop-blur-sm h-[44px] sm:h-[48px] rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 border border-white/50 shadow-sm">
            <Search className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
              placeholder="Search by title, author, ISBN, reporter"
              className="ml-2 sm:ml-3 bg-transparent border-none outline-none flex-1 text-[15px] sm:text-sm text-gray-800 placeholder:text-gray-500 min-w-0 py-2"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Book</th>
              <th className="px-4 py-2">ISBN</th>
              <th className="px-4 py-2">Reported By</th>
              <th className="px-4 py-2">Reported At</th>
              <th className="px-4 py-2">Note</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i._id} className="border-t border-gray-200/60">
                <td className="px-4 py-2 capitalize">{i.status}</td>
                <td className="px-4 py-2">{i.book?.title || '—'}</td>
                <td className="px-4 py-2">{i.book?.isbn || '—'}</td>
                <td className="px-4 py-2">{i.reportedBy?.name || '—'}</td>
                <td className="px-4 py-2">{new Date(i.reportedAt).toLocaleString()}</td>
                <td className="px-4 py-2">{i.note || '—'}</td>
                <td className="px-4 py-2">
                  {i.resolved ? (
                    <span className="inline-flex items-center gap-1 text-green-700 text-xs"><CheckCircle2 className="w-4 h-4"/> Resolved</span>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={loading}
                      onClick={() => dispatch(resolveIssue({ id: i._id })).then(() => dispatch(getIssues({})))}
                    >
                      Mark Resolved
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
