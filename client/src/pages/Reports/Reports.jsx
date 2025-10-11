import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getLibraryStats, clearError } from '../../store/slices/reportSlice'
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
  AlertCircle
} from 'lucide-react'

const Reports = () => {
  const dispatch = useDispatch()
  const { libraryStats, loading, error } = useSelector((state) => state.reports)

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

  if (loading && !libraryStats) {
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
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive library statistics and insights</p>
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
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Books</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {libraryStats.books.total}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {libraryStats.books.available} available
                    </p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-full">
                    <BookOpen className="h-8 w-8 text-blue-700" />
                  </div>
                </div>
              </div>

              {/* Total Users */}
              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Users</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      {libraryStats.users.total}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {libraryStats.users.admins} admins
                    </p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <Users className="h-8 w-8 text-green-700" />
                  </div>
                </div>
              </div>

              {/* Active Borrows */}
              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Active Borrows</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">
                      {libraryStats.borrows.active}
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Currently borrowed
                    </p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Library className="h-8 w-8 text-purple-700" />
                  </div>
                </div>
              </div>

              {/* Overdue Books */}
              <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Overdue Books</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">
                      {libraryStats.borrows.overdue}
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Need attention
                    </p>
                  </div>
                  <div className="p-3 bg-red-200 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-red-700" />
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
                      ${libraryStats.fines.totalFines?.toFixed(2) || '0.00'}
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
                      ${libraryStats.fines.paidFines?.toFixed(2) || '0.00'}
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
                      ${libraryStats.fines.unpaidFines?.toFixed(2) || '0.00'}
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
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Borrowing Trends</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View borrowing patterns over time with daily, weekly, and monthly trends
                </p>
                <p className="text-xs text-gray-500 mt-2">Coming soon</p>
              </div>
            </div>
          </div>

          {/* Popular Books */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Popular Books</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Most borrowed books and trending titles in your library
                </p>
                <p className="text-xs text-gray-500 mt-2">Coming soon</p>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Active users, new registrations, and top borrowers
                </p>
                <p className="text-xs text-gray-500 mt-2">Coming soon</p>
              </div>
            </div>
          </div>

          {/* Financial Report */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Financial Report</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Revenue from fines, pending payments, and monthly breakdown
                </p>
                <p className="text-xs text-gray-500 mt-2">Coming soon</p>
              </div>
            </div>
          </div>

          {/* Category Analysis */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start">
              <div className="p-3 bg-pink-100 rounded-lg">
                <PieChart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Category Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Books by genre and borrowing patterns by category
                </p>
                <p className="text-xs text-gray-500 mt-2">Coming soon</p>
              </div>
            </div>
          </div>

          {/* Overdue Report */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start">
              <div className="p-3 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Overdue Report</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed list of overdue books with user information
                </p>
                <p className="text-xs text-gray-500 mt-2">Coming soon</p>
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
              All reports are generated in real-time based on current library data. Detailed report pages with charts and visualizations are coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports

