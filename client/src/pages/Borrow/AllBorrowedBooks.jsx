import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getBorrowedBooksForAdmin, returnBorrowedBook } from '../../store/slices/borrowSlice'
import { 
  Library, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  User
} from 'lucide-react'

const AllBorrowedBooks = () => {
  const [selectedBook, setSelectedBook] = useState(null)
  const [showReturnModal, setShowReturnModal] = useState(false)

  const dispatch = useDispatch()
  const { allBorrowedBooks, loading } = useSelector((state) => state.borrow)

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

  const handleReturn = (bookId) => {
    dispatch(returnBorrowedBook(bookId))
    setShowReturnModal(false)
    setSelectedBook(null)
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
    {
      name: 'Due Soon',
      value: allBorrowedBooks.filter(book => {
        const days = getDaysRemaining(book.dueDate)
        return days <= 3 && days >= 0
      }).length,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'On Time',
      value: allBorrowedBooks.filter(book => getDaysRemaining(book.dueDate) > 3).length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Borrowed Books</h1>
        <p className="text-gray-600">Manage all borrowed books across the library</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      ) : allBorrowedBooks.length > 0 ? (
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
                {allBorrowedBooks.map((borrowed) => {
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
                          {formatDate(borrowed.borrowedDate)}
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
                        {borrowed.fine ? `$${borrowed.fine.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedBook(borrowed)
                            setShowReturnModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Return
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

      {/* Return Confirmation Modal */}
      {showReturnModal && selectedBook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <RotateCcw className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Return Book</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to return "{selectedBook.book.title}" borrowed by {selectedBook.user.name}?
                </p>
                {selectedBook.fine > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    Fine amount: ${selectedBook.fine.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReturn(selectedBook.book._id)}
                  className="btn-primary"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllBorrowedBooks
