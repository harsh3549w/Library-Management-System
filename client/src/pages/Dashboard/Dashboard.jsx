import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllBooks } from '../../store/slices/bookSlice'
import { getMyBorrowedBooks, clearError as clearBorrowError, clearSuccess as clearBorrowSuccess } from '../../store/slices/borrowSlice'
import { getBookRecommendations } from '../../store/slices/recommendationSlice'
import ExtendDue from '../../components/ExtendDue/ExtendDue'
import { 
  BookOpen, 
  Users, 
  Library, 
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  Star
} from 'lucide-react'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { books, loading: booksLoading } = useSelector((state) => state.books)
  const { myBorrowedBooks, loading: borrowLoading, success: borrowSuccess, error: borrowError } = useSelector((state) => state.borrow)
  const { recommendations, basedOn, message: recommendationMessage, loading: recommendationLoading } = useSelector((state) => state.recommendations)

  useEffect(() => {
    dispatch(getAllBooks())
    dispatch(getMyBorrowedBooks())
    dispatch(getBookRecommendations())
  }, [dispatch])

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (borrowSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearBorrowSuccess())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [borrowSuccess, dispatch])

  useEffect(() => {
    if (borrowError) {
      const timer = setTimeout(() => {
        dispatch(clearBorrowError())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [borrowError, dispatch])

  const isAdmin = user?.role === 'Admin'

  const stats = [
    {
      name: 'Total Books',
      value: books.length,
      icon: BookOpen,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: 'My Borrowed Books',
      value: myBorrowedBooks.length,
      icon: Library,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    ...(isAdmin ? [
      {
        name: 'Total Users',
        value: 'N/A', // Will be fetched from users slice
        icon: Users,
        color: 'bg-purple-500',
        textColor: 'text-purple-600',
      },
    ] : []),
  ]

  const recentBooks = books.slice(0, 5)
  const recentBorrowed = myBorrowedBooks.slice(0, 5)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Admin Extend Due Section */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ExtendDue />
          </div>
          <div className="lg:col-span-2">
            {/* Recent Books for Admin */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Books</h2>
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              {booksLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : recentBooks.length > 0 ? (
                <div className="space-y-3">
                  {recentBooks.map((book) => (
                    <div key={book._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{book.title}</h3>
                        <p className="text-sm text-gray-500">by {book.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {book.available ? 'Available' : 'Borrowed'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {book.available ? `${book.quantity} copies` : 'Out of stock'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No books available</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Books - For Non-Admin Users */}
        {!isAdmin && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Books</h2>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            {booksLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : recentBooks.length > 0 ? (
              <div className="space-y-3">
                {recentBooks.map((book) => (
                  <div key={book._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-500">by {book.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {book.available ? 'Available' : 'Borrowed'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {book.available ? `${book.quantity} copies` : 'Out of stock'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No books available</p>
            )}
          </div>
        )}

        {/* My Borrowed Books */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Borrowed Books</h2>
            <Library className="h-5 w-5 text-gray-400" />
          </div>
          {borrowLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : recentBorrowed.length > 0 ? (
            <div className="space-y-3">
              {recentBorrowed.map((borrowed) => {
                if (!borrowed?.book) return null
                const daysRemaining = getDaysRemaining(borrowed.dueDate)
                const isOverdue = daysRemaining < 0
                const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0

                return (
                  <div key={borrowed._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{borrowed.book?.title || 'Unknown Book'}</h3>
                      <p className="text-sm text-gray-500">by {borrowed.book?.author || 'Unknown Author'}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formatDate(borrowed.dueDate)}
                        </span>
                      </div>
                      <p className={`text-xs font-medium ${
                        isOverdue ? 'text-red-600' : 
                        isDueSoon ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {isOverdue ? 'Overdue' : 
                         isDueSoon ? 'Due soon' : `${daysRemaining} days left`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No borrowed books</p>
          )}
        </div>
      </div>

      {/* Book Recommendations Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg mr-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
              {basedOn && (
                <p className="text-sm text-gray-500">
                  Based on "{basedOn.book}" ({basedOn.genre})
                </p>
              )}
            </div>
          </div>
          <Star className="h-5 w-5 text-gray-400" />
        </div>
        
        {recommendationLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((book) => (
              <div key={book._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                      by {book.author}
                    </p>
                    {book.genre && (
                      <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full mb-2">
                        {book.genre}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {book.quantity} copies
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      book.availability 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {book.availability ? 'Available' : 'Borrowed'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations available</p>
            <p className="text-sm text-gray-400 mt-1">
              Borrow some books to get personalized recommendations!
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard
