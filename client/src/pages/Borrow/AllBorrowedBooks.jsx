import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getBorrowedBooksForAdmin, adminReturnBorrowedBook } from '../../store/slices/borrowSlice'
import { 
  Library, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Search as SearchIcon
} from 'lucide-react'

const AllBorrowedBooks = () => {
  const dispatch = useDispatch()
  const { allBorrowedBooks, loading } = useSelector((state) => state.borrow)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [returningId, setReturningId] = useState(null)

  useEffect(() => {
    dispatch(getBorrowedBooksForAdmin())
  }, [dispatch])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusInfo = (borrowed) => {
    const daysRemaining = getDaysRemaining(borrowed.dueDate)
    const isOverdue = daysRemaining < 0
    const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0

    if (isOverdue) {
      return {
        status: 'Overdue',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: AlertTriangle,
        daysText: `${Math.abs(daysRemaining)} days overdue`,
      }
    } else if (isDueSoon) {
      return {
        status: 'Due Soon',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: Clock,
        daysText: `${daysRemaining} days left`,
      }
    } else {
      return {
        status: 'On Time',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle,
        daysText: `${daysRemaining} days left`,
      }
    }
  }

  const handleAdminReturn = async (borrowed) => {
    if (!borrowed?.book?._id || !borrowed?.user?.email) return
    const payload = {
      bookId: borrowed.book._id,
      email: borrowed.user.email,
      borrowId: borrowed._id,
    }
    try {
      setReturningId(borrowed._id)
      await dispatch(adminReturnBorrowedBook(payload))
    } finally {
      setReturningId(null)
    }
  }


  const stats = [
    {
      name: 'Total Borrowed',
      value: allBorrowedBooks.length,
      icon: Library,
      color: 'bg-blue-500',
    },
    {
      name: 'Overdue',
      value: allBorrowedBooks.filter(book => getDaysRemaining(book.dueDate) < 0).length,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ]

  const filteredBorrowed = allBorrowedBooks.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const title = b.book?.title?.toLowerCase() || ''
    const author = b.book?.author?.toLowerCase() || ''
    const isbn = b.book?.isbn?.toLowerCase() || ''
    const email = b.user?.email?.toLowerCase() || ''
    const name = b.user?.name?.toLowerCase() || ''
    return (
      title.includes(q) ||
      author.includes(q) ||
      isbn.includes(q) ||
      email.includes(q) ||
      name.includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Borrowed Books</h1>
        <p className="text-gray-600">Manage all borrowed books across the library</p>
      </div>

      {/* Search (full-width, above widgets) */}
      <div className="card p-4">
        <div className="flex items-center gap-3 w-full flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <div className="bg-white/70 backdrop-blur-sm h-[44px] sm:h-[48px] rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 border border-white/50 shadow-sm">
              <SearchIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600 flex-shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setSearchQuery(searchInput.trim()) } }}
                placeholder="Search by title, author, ISBN, borrower name or email"
                className="ml-2 sm:ml-3 bg-transparent border-none outline-none flex-1 text-[15px] sm:text-sm text-gray-800 placeholder:text-gray-500 min-w-0 py-2"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchQuery(searchInput.trim())}
              className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Search
            </button>
            {searchQuery && (
              <button
                onClick={() => { setSearchInput(''); setSearchQuery('') }}
                className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats (keep large size; don't shrink) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Borrowed Books List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredBorrowed.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrowed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBorrowed.map((borrowed) => {
                  // Skip if book data is missing
                  if (!borrowed.book || !borrowed.user) return null;
                  
                  const statusInfo = getStatusInfo(borrowed)
                  const StatusIcon = statusInfo.icon

                  return (
                    <tr key={borrowed._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {borrowed.book.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {borrowed.book.author}
                          </div>
                          {borrowed.book.isbn && (
                            <div className="text-xs text-gray-400">
                              ISBN: {borrowed.book.isbn}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {borrowed.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {borrowed.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(borrowed.borrowDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(borrowed.dueDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.status}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {statusInfo.daysText}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrowed.fine ? `₹${borrowed.fine.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleAdminReturn(borrowed)}
                          disabled={loading || returningId === borrowed._id}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${
                            loading || returningId === borrowed._id ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                        >
                          {loading || returningId === borrowed._id ? 'Returning…' : 'Mark Returned'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Library className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowed books</h3>
          <p className="text-gray-500">
            No books are currently borrowed from the library.
          </p>
        </div>
      )}

    </div>
  )
}

export default AllBorrowedBooks
