import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyFines, updateOverdueFines, clearError, clearSuccess } from '../../store/slices/borrowSlice'
import { 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  BookOpen,
  CreditCard
} from 'lucide-react'
import RazorpayPayment from '../../components/Payment/RazorpayPayment'

const MyFines = () => {
  const dispatch = useDispatch()
  const { myFines, loading, error, success, message } = useSelector((state) => state.borrow)
  const { user } = useSelector((state) => state.auth)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedBorrow, setSelectedBorrow] = useState(null)

  useEffect(() => {
    // First update overdue fines, then get fines
    dispatch(updateOverdueFines()).then(() => {
      dispatch(getMyFines())
    })
  }, [dispatch])

  useEffect(() => {
    if (success && message) {
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

  if (loading) {
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
        <h1 className="text-2xl font-bold text-gray-900">My Fines</h1>
        <p className="text-gray-600">View and manage your library fines</p>
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

      {/* Fine Balance Summary */}
      {myFines && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Outstanding Balance</p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  ₹{myFines.fineBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <DollarSign className="h-8 w-8 text-red-700" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Paid</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  ₹{myFines.totalFinesPaid?.toFixed(2) || '0.00'}
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
                <p className="text-sm font-medium text-blue-600">Total Fines</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {myFines.borrowsWithFines?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <AlertCircle className="h-8 w-8 text-blue-700" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning if user has unpaid fines */}
      {myFines && myFines.fineBalance > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-900">Borrowing Restricted</p>
                <p className="text-yellow-800 text-sm mt-1">
                  You cannot borrow new books until your outstanding fines are paid.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Create a temporary borrow object with the total fine balance
                setSelectedBorrow({
                  _id: 'total_balance',
                  fine: myFines.fineBalance,
                  book: {
                    title: 'Outstanding Fine Balance',
                    author: 'Multiple Books'
                  }
                })
                setShowPayment(true)
              }}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ₹{myFines.fineBalance.toFixed(2)} Now
            </button>
          </div>
        </div>
      )}

      {/* Fines List */}
      {myFines && myFines.borrowsWithFines && myFines.borrowsWithFines.length > 0 ? (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fine Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
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
                {myFines.borrowsWithFines.map((borrow) => (
                  <tr key={borrow._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
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
                      <div className="text-sm text-gray-900">
                        {borrow.returnDate ? formatDate(borrow.returnDate) : 'Not returned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-red-600">
                        ₹{borrow.fine.toFixed(2)}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!borrow.finePaid && (
                        <button
                          onClick={() => {
                            setSelectedBorrow(borrow)
                            setShowPayment(true)
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Pay Now
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
            You don't have any library fines. Keep up the good work!
          </p>
        </div>
      )}

      {/* Payment Information */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <CreditCard className="h-6 w-6 text-blue-600 mt-1 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">How to Pay Fines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Pay Now" button next to any unpaid fine</li>
              <li>• Pay securely using UPI, Cards, Net Banking, or Wallets via Razorpay</li>
              <li>• Fines must be paid in full before borrowing new books</li>
              <li>• Receipt will be sent to your email upon successful payment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedBorrow && (
        <RazorpayPayment
          borrow={selectedBorrow}
          onClose={() => {
            setShowPayment(false)
            setSelectedBorrow(null)
          }}
          onSuccess={(successMessage) => {
            setShowPayment(false)
            setSelectedBorrow(null)
            // Refresh fines data
            dispatch(getMyFines())
            // Show success message
            alert(successMessage || 'Payment successful!')
          }}
        />
      )}
    </div>
  )
}

export default MyFines

