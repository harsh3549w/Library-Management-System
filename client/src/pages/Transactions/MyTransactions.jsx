import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserTransactions, clearError } from '../../store/slices/transactionSlice'
import { 
  DollarSign, 
  AlertCircle,
  Calendar,
  BookOpen,
  Filter,
  ArrowUpDown
} from 'lucide-react'

const MyTransactions = () => {
  const [filterType, setFilterType] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc')

  const dispatch = useDispatch()
  const { myTransactions, loading, error } = useSelector((state) => state.transactions)

  useEffect(() => {
    dispatch(getUserTransactions())
  }, [dispatch])

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
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeColor = (type) => {
    const colors = {
      borrow: 'bg-blue-100 text-blue-800',
      return: 'bg-green-100 text-green-800',
      renewal: 'bg-purple-100 text-purple-800',
      fine_payment: 'bg-red-100 text-red-800',
      book_purchase: 'bg-yellow-100 text-yellow-800',
      donation: 'bg-pink-100 text-pink-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type) => {
    const labels = {
      borrow: 'Borrow',
      return: 'Return',
      renewal: 'Renewal',
      fine_payment: 'Fine Payment',
      book_purchase: 'Book Purchase',
      donation: 'Donation'
    }
    return labels[type] || type
  }

  // Filter and sort transactions
  const filteredTransactions = myTransactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

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
        <h1 className="text-2xl font-bold text-gray-900">My Transactions</h1>
        <p className="text-gray-600">View your library transaction history</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="borrow">Borrow</option>
              <option value="return">Return</option>
              <option value="renewal">Renewal</option>
              <option value="fine_payment">Fine Payment</option>
              <option value="book_purchase">Book Purchase</option>
              <option value="donation">Donation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ArrowUpDown className="inline h-4 w-4 mr-1" />
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input-field"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                        {getTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      {transaction.book ? (
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.book.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.book.author}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.amount > 0 ? (
                        <div className="flex items-center text-sm font-semibold text-red-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {transaction.amount.toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
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
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions</h3>
          <p className="text-gray-500">
            {filterType === 'all' 
              ? "You don't have any transactions yet."
              : `No ${getTypeLabel(filterType).toLowerCase()} transactions found.`}
          </p>
        </div>
      )}
    </div>
  )
}

export default MyTransactions

