import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllTransactions, getTransactionStats, clearError } from '../../store/slices/transactionSlice'
import { 
  DollarSign, 
  AlertCircle,
  Calendar,
  BookOpen,
  Filter,
  ArrowUpDown,
  User,
  TrendingUp,
  Download
} from 'lucide-react'

const AllTransactions = () => {
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const dispatch = useDispatch()
  const { allTransactions, stats, loading, error } = useSelector((state) => state.transactions)

  useEffect(() => {
    dispatch(getAllTransactions())
    dispatch(getTransactionStats())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleApplyFilters = () => {
    const filters = {}
    if (filterType !== 'all') filters.type = filterType
    if (filterStatus !== 'all') filters.status = filterStatus
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    
    dispatch(getAllTransactions(filters))
    
    const dateRange = {}
    if (startDate) dateRange.startDate = startDate
    if (endDate) dateRange.endDate = endDate
    dispatch(getTransactionStats(dateRange))
  }

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

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Sort transactions
  const sortedTransactions = [...allTransactions].sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  if (loading && !allTransactions.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-600">View and manage all library transactions</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Fine Revenue</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  ${stats.fineRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <DollarSign className="h-8 w-8 text-green-700" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Book Purchases</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  ${stats.bookPurchases?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <BookOpen className="h-8 w-8 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Transactions</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {allTransactions.length}
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <TrendingUp className="h-8 w-8 text-purple-700" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
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
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
          
          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="btn-primary mt-6"
          >
            <Filter className="h-4 w-4 mr-2 inline" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      {sortedTransactions.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.user ? (
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.user.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                        {getTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-gray-900 truncate">{transaction.description}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.paymentStatus)}`}>
                        {transaction.paymentStatus}
                      </span>
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
            No transactions found matching your filters.
          </p>
        </div>
      )}
    </div>
  )
}

export default AllTransactions

