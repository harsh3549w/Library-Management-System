import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyBorrowedBooks, renewBook, returnBorrowedBook, updateOverdueFines, clearError, clearSuccess } from '../../store/slices/borrowSlice'
import { 
  Library, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle,
  RotateCw,
  DollarSign,
  RotateCcw
} from 'lucide-react'

const BorrowedBooks = () => {
  const dispatch = useDispatch()
  const { myBorrowedBooks, loading, error, success, message } = useSelector((state) => state.borrow)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => {
    // First update overdue fines, then get borrowed books
    dispatch(updateOverdueFines()).then(() => {
      dispatch(getMyBorrowedBooks())
    })
  }, [dispatch])

  useEffect(() => {
    if (success && message) {
      dispatch(getMyBorrowedBooks()) // Refresh data after renewal
      setTimeout(() => {
        dispatch(clearSuccess())
      }, 3000)
    }
  }, [success, message, dispatch])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleRenew = (borrowId, bookTitle) => {
    setConfirmAction({
      type: 'renew',
      borrowId,
      bookTitle,
      message: 'This will extend the due date by 10 minutes.',
      confirmText: 'Yes, Renew',
      action: () => {
        dispatch(renewBook(borrowId))
      }
    })
    setShowConfirmModal(true)
  }

  const handleReturn = (borrowId, bookTitle) => {
    setConfirmAction({
      type: 'return',
      borrowId,
      bookTitle,
      message: 'Are you sure you want to return this book? This action cannot be undone.',
      confirmText: 'Yes, Return',
      action: () => {
        dispatch(returnBorrowedBook(borrowId))
      }
    })
    setShowConfirmModal(true)
  }

  const canRenew = (borrowed) => {
    if (borrowed.returnDate) return false // Already returned
    if (borrowed.renewalCount >= 1) return false // Already renewed
    const today = new Date()
    const dueDate = new Date(borrowed.dueDate)
    if (today > dueDate) return false // Overdue
    return true
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Borrowed Books</h1>
        <p className="text-gray-600">Track your borrowed books and due dates</p>
      </div>

      {/* Success Message */}
      {success && message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <Library className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Borrowed</p>
              <p className="text-2xl font-semibold text-gray-900">{myBorrowedBooks.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">On Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myBorrowedBooks.filter(book => getDaysRemaining(book.dueDate) > 3).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {myBorrowedBooks.filter(book => getDaysRemaining(book.dueDate) < 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Borrowed Books List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : myBorrowedBooks.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myBorrowedBooks.map((borrowed) => {
                  // Skip if book data is missing
                  if (!borrowed.book) return null;
                  
                  const statusInfo = getStatusInfo(borrowed)
                  const StatusIcon = statusInfo.icon
                  const renewalAllowed = canRenew(borrowed)

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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!borrowed.returnDate && (
                          <div className="flex flex-col gap-2">
                            {renewalAllowed && (
                              <button
                                onClick={() => handleRenew(borrowed._id, borrowed.book.title)}
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                              >
                                <RotateCw className="h-3 w-3 mr-1" />
                                Renew
                              </button>
                            )}
                            <button
                              onClick={() => handleReturn(borrowed._id, borrowed.book.title)}
                              disabled={loading}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Return
                            </button>
                            {!renewalAllowed && (
                              <div className="text-xs text-gray-500">
                                {borrowed.renewalCount >= 1 ? (
                                  <span className="text-yellow-600">Already renewed</span>
                                ) : getDaysRemaining(borrowed.dueDate) < 0 ? (
                                  <span className="text-red-600">Overdue</span>
                                ) : (
                                  '-'
                                )}
                              </div>
                            )}
                          </div>
                        )}
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
            You haven't borrowed any books yet. Visit the books section to start borrowing!
          </p>
        </div>
      )}

      {/* Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Important Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Due Dates</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Books are typically due in 10 minutes (testing mode)</li>
              <li>• You can renew books before they're due</li>
              <li>• Late returns may incur fines</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Fines</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• ₹1 per day for overdue books</li>
              <li>• No maximum fine limit</li>
              <li>• Fines must be paid before borrowing more books</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 ${confirmAction.type === 'renew' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'} text-white`}>
              <h3 className="text-xl font-semibold">
                {confirmAction.type === 'renew' ? 'Confirm Renewal' : 'Confirm Return'}
              </h3>
              <p className="text-sm opacity-90 mt-1">{confirmAction.bookTitle}</p>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">{confirmAction.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmAction.action()
                    setShowConfirmModal(false)
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                    confirmAction.type === 'renew' 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {confirmAction.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BorrowedBooks
