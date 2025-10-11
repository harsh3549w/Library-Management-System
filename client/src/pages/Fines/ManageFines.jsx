import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllFines, markFineAsPaid, clearError, clearSuccess } from '../../store/slices/borrowSlice'
import { 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  BookOpen,
  User,
  Mail,
  CreditCard,
  X
} from 'lucide-react'

const ManageFines = () => {
  const [selectedBorrow, setSelectedBorrow] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const dispatch = useDispatch()
  const { allFines, loading, error, success, message } = useSelector((state) => state.borrow)

  useEffect(() => {
    dispatch(getAllFines())
  }, [dispatch])

  useEffect(() => {
    if (success && message) {
      setShowPaymentModal(false)
      setSelectedBorrow(null)
      dispatch(getAllFines()) // Refresh data
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleMarkAsPaid = () => {
    if (selectedBorrow) {
      dispatch(markFineAsPaid({ borrowId: selectedBorrow._id, paymentMethod }))
    }
  }

  const totalOutstandingFines = allFines?.usersWithFines?.reduce((sum, user) => sum + user.fineBalance, 0) || 0
  const totalPaidFines = allFines?.usersWithFines?.reduce((sum, user) => sum + user.totalFinesPaid, 0) || 0

  if (loading && !allFines) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Fines</h1>
        <p className="text-gray-600">View and manage all library fines</p>
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
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Outstanding</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                ${totalOutstandingFines.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-red-200 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Collected</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                ${totalPaidFines.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Users with Fines</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {allFines?.usersWithFines?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <User className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Users with Outstanding Fines */}
      {allFines && allFines.usersWithFines && allFines.usersWithFines.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Users with Outstanding Fines</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Paid
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allFines.usersWithFines.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {user.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Mail className="h-3 w-3 mr-2" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-red-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {user.fineBalance.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {user.totalFinesPaid.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Fines Details */}
      {allFines && allFines.borrowsWithFines && allFines.borrowsWithFines.length > 0 ? (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Fine Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fine Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allFines.borrowsWithFines.map((borrow) => (
                  <tr key={borrow._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{borrow.user.name}</div>
                      <div className="text-sm text-gray-500">{borrow.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {borrow.book?.title || 'Unknown Book'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {borrow.book?.author || 'Unknown Author'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(borrow.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-red-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {borrow.fine.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {borrow.finePaid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!borrow.finePaid && (
                        <button
                          onClick={() => {
                            setSelectedBorrow(borrow)
                            setShowPaymentModal(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Fines</h3>
          <p className="text-gray-500">
            There are currently no outstanding fines in the system.
          </p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBorrow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mark Fine as Paid</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedBorrow(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">User:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedBorrow.user.name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Book:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedBorrow.book?.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fine Amount:</span>
                  <span className="text-lg font-bold text-red-600">${selectedBorrow.fine.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input-field"
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedBorrow(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsPaid}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Confirm Payment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageFines

