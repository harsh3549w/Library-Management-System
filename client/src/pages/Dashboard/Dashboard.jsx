import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllBooks } from '../../store/slices/bookSlice'
import { getMyBorrowedBooks } from '../../store/slices/borrowSlice'
import { 
  BookOpen, 
  Users, 
  Library, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { books, loading: booksLoading } = useSelector((state) => state.books)
  const { myBorrowedBooks, loading: borrowLoading } = useSelector((state) => state.borrow)

  useEffect(() => {
    dispatch(getAllBooks())
    dispatch(getMyBorrowedBooks())
  }, [dispatch])

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Books */}
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

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-blue-900 font-medium">Browse Books</span>
          </button>
          <button className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Library className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-green-900 font-medium">My Borrowed Books</span>
          </button>
          {isAdmin && (
            <button className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Users className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-purple-900 font-medium">Manage Users</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
