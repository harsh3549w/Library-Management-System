import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  getLibraryStats, 
  getBorrowingReport, 
  getPopularBooksReport, 
  getUserActivityReport, 
  getFinancialReport, 
  getOverdueReport, 
  getCategoryReport, 
  clearError 
} from '../../store/slices/reportSlice'
import { 
  BookOpen, 
  Users, 
  Library,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
  AlertCircle,
  X
} from 'lucide-react'

const Reports = () => {
  const dispatch = useDispatch()
  const { 
    libraryStats, 
    borrowingReport, 
    popularBooks, 
    userActivity, 
    financialReport, 
    overdueReport, 
    categoryReport, 
    loading, 
    error 
  } = useSelector((state) => state.report)
  
  const [selectedReport, setSelectedReport] = useState(null)
  const [borrowingPeriod, setBorrowingPeriod] = useState('monthly')
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    dispatch(getLibraryStats())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  // Handle modal loading state
  useEffect(() => {
    if (selectedReport && !loading) {
      setModalLoading(false)
    }
  }, [selectedReport, loading])


  const handleReportClick = (reportType) => {
    setSelectedReport(reportType)
    setModalLoading(true)
    
    switch (reportType) {
      case 'borrowing':
        dispatch(getBorrowingReport(borrowingPeriod))
        break
      case 'popular-books':
        dispatch(getPopularBooksReport(10))
        break
      case 'user-activity':
        dispatch(getUserActivityReport())
        break
      case 'financial':
        dispatch(getFinancialReport())
        break
      case 'overdue':
        dispatch(getOverdueReport())
        break
      case 'category':
        dispatch(getCategoryReport())
        break
      default:
        break
    }
  }

  const closeReportModal = () => {
    setSelectedReport(null)
  }

  if (loading && !libraryStats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header with gradient accent line */}
      <div className="relative">
        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2563EB] to-[#00b894] rounded-full"></div>
        <h1 className="text-[28px] text-gray-800">Reports & Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">Comprehensive library statistics and insights</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Library Statistics Overview */}
      {libraryStats && (
        <>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Library Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Books */}
              <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2563EB] to-transparent opacity-20 rounded-bl-full"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Books</p>
                    <p className="text-[28px] text-[#2563EB] mt-2">
                      {libraryStats.books.total}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {libraryStats.books.available} available
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Total Users */}
              <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#00b894] to-transparent opacity-20 rounded-bl-full"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-[28px] text-[#00b894] mt-2">
                      {libraryStats.users.total}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {libraryStats.users.admins} admins
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00b894] to-[#2563EB] flex items-center justify-center shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Active Borrows */}
              <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2563EB] to-transparent opacity-20 rounded-bl-full"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Borrows</p>
                    <p className="text-[28px] text-[#2563EB] mt-2">
                      {libraryStats.borrows.active}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Currently borrowed
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center shadow-lg">
                    <Library className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Overdue Books */}
              <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500 to-transparent opacity-20 rounded-bl-full"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Books</p>
                    <p className="text-[28px] text-red-600 mt-2">
                      {libraryStats.borrows.overdue}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Need attention
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Total Fines</p>
                    <p className="text-3xl font-bold text-yellow-900 mt-2">
                      ₹{libraryStats.fines.totalFines?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-200 rounded-full">
                    <DollarSign className="h-8 w-8 text-yellow-700" />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Paid Fines</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      ₹{libraryStats.fines.paidFines?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <DollarSign className="h-8 w-8 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Unpaid Fines</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">
                      ₹{libraryStats.fines.unpaidFines?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-red-200 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-red-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Report Categories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Borrowing Trends */}
          <div 
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleReportClick('borrowing')}
          >
            <div className="flex items-start">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Borrowing Trends</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View borrowing patterns over time with daily, weekly, and monthly trends
                </p>
                <p className="text-xs text-blue-600 mt-2 font-medium">Click to view report</p>
              </div>
            </div>
          </div>

          {/* Popular Books */}
          <div 
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleReportClick('popular-books')}
          >
            <div className="flex items-start">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Popular Books</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Most borrowed books and trending titles in your library
                </p>
                <p className="text-xs text-green-600 mt-2 font-medium">Click to view report</p>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div 
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleReportClick('user-activity')}
          >
            <div className="flex items-start">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Active users, new registrations, and top borrowers
                </p>
                <p className="text-xs text-purple-600 mt-2 font-medium">Click to view report</p>
              </div>
            </div>
          </div>

          {/* Financial Report */}
          <div 
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleReportClick('financial')}
          >
            <div className="flex items-start">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Financial Report</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Revenue from fines, pending payments, and monthly breakdown
                </p>
                <p className="text-xs text-yellow-600 mt-2 font-medium">Click to view report</p>
              </div>
            </div>
          </div>

          {/* Category Analysis */}
          <div 
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleReportClick('category')}
          >
            <div className="flex items-start">
              <div className="p-3 bg-pink-100 rounded-lg">
                <PieChart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Category Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Books by genre and borrowing patterns by category
                </p>
                <p className="text-xs text-pink-600 mt-2 font-medium">Click to view report</p>
              </div>
            </div>
          </div>

          {/* Overdue Report */}
          <div 
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleReportClick('overdue')}
          >
            <div className="flex items-start">
              <div className="p-3 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Overdue Report</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed list of overdue books with user information
                </p>
                <p className="text-xs text-red-600 mt-2 font-medium">Click to view report</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">About Reports</h3>
            <p className="text-sm text-blue-800 mt-1">
              All reports are generated in real-time based on current library data. Click on any report card above to view detailed analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedReport === 'borrowing' && 'Borrowing Trends Report'}
                  {selectedReport === 'popular-books' && 'Popular Books Report'}
                  {selectedReport === 'user-activity' && 'User Activity Report'}
                  {selectedReport === 'financial' && 'Financial Report'}
                  {selectedReport === 'overdue' && 'Overdue Report'}
                  {selectedReport === 'category' && 'Category Analysis Report'}
                </h2>
                <button
                  onClick={closeReportModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Report Content */}
              <div className="space-y-6">
                {modalLoading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {selectedReport === 'borrowing' && borrowingReport && (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <label className="text-sm font-medium text-gray-700">Period:</label>
                      <select
                        value={borrowingPeriod}
                        onChange={(e) => {
                          setBorrowingPeriod(e.target.value)
                          dispatch(getBorrowingReport(e.target.value))
                        }}
                        className="input-field"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {borrowingReport.trends.map((trend, index) => (
                        <div key={index} className="card">
                          <div className="text-sm text-gray-600">
                            {borrowingPeriod === 'daily' && `${trend._id.year}-${trend._id.month}-${trend._id.day}`}
                            {borrowingPeriod === 'weekly' && `${trend._id.year} Week ${trend._id.week}`}
                            {borrowingPeriod === 'monthly' && `${trend._id.year}-${trend._id.month}`}
                          </div>
                          <div className="text-2xl font-bold text-blue-600 mt-2">{trend.count}</div>
                          <div className="text-sm text-gray-500">Total Borrows</div>
                          <div className="text-sm text-green-600 mt-1">{trend.returned} Returned</div>
                          <div className="text-sm text-red-600">{trend.overdue} Overdue</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport === 'popular-books' && popularBooks && (
                  <div className="space-y-4">
                    {popularBooks.map((book, index) => (
                      <div key={index} className="card">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{book.bookDetails.title}</h3>
                            <p className="text-sm text-gray-600">by {book.bookDetails.author}</p>
                            <p className="text-xs text-gray-500">ISBN: {book.bookDetails.isbn}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{book.borrowCount}</div>
                            <div className="text-sm text-gray-500">Total Borrows</div>
                            <div className="text-sm text-blue-600">{book.currentlyBorrowed} Currently Borrowed</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedReport === 'user-activity' && userActivity && (
                  <div className="space-y-6">
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Users</h3>
                      <div className="text-3xl font-bold text-purple-600">{userActivity.activeUsersCount}</div>
                      <div className="text-sm text-gray-500">Users who have borrowed books</div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Borrowers</h3>
                      <div className="space-y-3">
                        {userActivity.topBorrowers.map((borrower, index) => (
                          <div key={index} className="card">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{borrower.userName}</h4>
                                <p className="text-sm text-gray-600">{borrower.userEmail}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-purple-600">{borrower.borrowCount}</div>
                                <div className="text-sm text-gray-500">Books Borrowed</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedReport === 'financial' && financialReport && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Fine Revenue</h3>
                        <div className="text-2xl font-bold text-green-600">₹{financialReport.fineRevenue.total?.toFixed(2) || '0.00'}</div>
                        <div className="text-sm text-gray-500">{financialReport.fineRevenue.count} transactions</div>
                      </div>
                      <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Purchases</h3>
                        <div className="text-2xl font-bold text-blue-600">₹{financialReport.bookPurchases.total?.toFixed(2) || '0.00'}</div>
                        <div className="text-sm text-gray-500">{financialReport.bookPurchases.count} purchases</div>
                      </div>
                      <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Fines</h3>
                        <div className="text-2xl font-bold text-red-600">₹{financialReport.pendingFines.total?.toFixed(2) || '0.00'}</div>
                        <div className="text-sm text-gray-500">{financialReport.pendingFines.count} unpaid</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReport === 'overdue' && !modalLoading && (
                  <div className="space-y-4">
                    {overdueReport ? (
                      <>
                        <div className="card">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Overdue Summary</h3>
                          <div className="text-3xl font-bold text-red-600">{overdueReport.count || 0}</div>
                          <div className="text-sm text-gray-500">Books currently overdue</div>
                        </div>
                        
                        {overdueReport.overdueBooks && overdueReport.overdueBooks.length > 0 ? (
                          <div className="space-y-3">
                            {overdueReport.overdueBooks.map((borrow, index) => (
                              <div key={index} className="card">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {borrow.book ? borrow.book.title : 'Unknown Book'}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      by {borrow.book ? borrow.book.author : 'Unknown Author'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Due: {new Date(borrow.dueDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-red-600 font-medium">
                                      {Math.ceil((new Date() - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24))} days overdue
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="card text-center py-8">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Overdue Books</h3>
                            <p className="text-gray-500">
                              Great news! There are currently no overdue books in the library.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="card text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Report</h3>
                        <p className="text-gray-500">
                          There was an error loading the overdue report. Please try again.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedReport === 'category' && categoryReport && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Books by Genre</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryReport.booksByGenre.map((genre, index) => (
                          <div key={index} className="card">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{genre._id || 'Unknown'}</h4>
                                <p className="text-sm text-gray-600">{genre.available} available</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-pink-600">{genre.count}</div>
                                <div className="text-sm text-gray-500">Total Books</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports

