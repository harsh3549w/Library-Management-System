import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllBooks } from '../../store/slices/bookSlice'
import { getMyBorrowedBooks, clearError as clearBorrowError } from '../../store/slices/borrowSlice'
import { getBookRecommendations } from '../../store/slices/recommendationSlice'
import { getLibraryStats } from '../../store/slices/reportSlice'
import { getAllUsers } from '../../store/slices/userSlice'
import ExtendDue from '../../components/ExtendDue/ExtendDue'
import { 
  BookOpen, 
  Users, 
  Library, 
  TrendingUp,
  Calendar,
  Sparkles,
  Star,
  X,
  Mail,
  User as UserIcon,
  Hash
} from 'lucide-react'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { books, loading: booksLoading } = useSelector((state) => state.books)
  const { myBorrowedBooks, loading: borrowLoading, error: borrowError } = useSelector((state) => state.borrow)
  const { recommendations, basedOn, loading: recommendationLoading } = useSelector((state) => state.recommendations)
  const { libraryStats, loading: statsLoading } = useSelector((state) => state.report)
  const { users, loading: usersLoading } = useSelector((state) => state.users)
  
  const [showUsersModal, setShowUsersModal] = useState(false)

  useEffect(() => {
    // Only fetch library stats for admin users
    if (user?.role === 'Admin') {
      dispatch(getLibraryStats())
    }
    dispatch(getAllBooks())
    dispatch(getMyBorrowedBooks())
    dispatch(getBookRecommendations())
  }, [dispatch, user])

  // Clear error messages after 5 seconds

  useEffect(() => {
    if (borrowError) {
      const timer = setTimeout(() => {
        dispatch(clearBorrowError())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [borrowError, dispatch])

  const isAdmin = user?.role === 'Admin'

  const stats = isAdmin
    ? [
        {
          name: 'Total Books',
          value: booksLoading ? '...' : books.length,
          icon: BookOpen,
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
        },
        {
          name: 'Total Users',
          value: statsLoading ? '...' : (libraryStats?.users?.total ?? 0),
          icon: Users,
          color: 'bg-purple-500',
          textColor: 'text-purple-600',
        },
      ]
    : [
        {
          name: 'Total Books',
          value: booksLoading ? '...' : books.length,
          icon: BookOpen,
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
        },
        {
          name: 'My Borrowed Books',
          value: borrowLoading ? '...' : myBorrowedBooks.length,
          icon: Library,
          color: 'bg-green-500',
          textColor: 'text-green-600',
        },
      ]

  // Show only available books from database
  const recentBooks = books
    .filter(book => book._id && book.title && book.author && book.availability === true)
    .slice(0, 5)

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

  const handleShowUsers = () => {
    setShowUsersModal(true)
    dispatch(getAllUsers())
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Logo in top-left corner with header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <img 
            src="/images/dashboard-logo.jpeg" 
            alt="Dashboard Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg shadow-lg object-cover border-2 border-white/50"
          />
        </div>
        {/* Page Header with gradient accent line */}
        <div className="relative flex-1">
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2563EB] to-[#00b894] rounded-full"></div>
          <h1 className="text-[28px] text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name || 'User'}!</p>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={stat.name} 
            className={`bg-white/40 backdrop-blur-md rounded-[18px] p-4 sm:p-6 shadow-lg border border-white/50 relative overflow-hidden ${
              isAdmin && stat.name === 'Total Users' ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
            }`}
            onClick={isAdmin && stat.name === 'Total Users' ? handleShowUsers : undefined}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2563EB] to-transparent opacity-20 rounded-bl-full"></div>
            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center shadow-lg flex-shrink-0">
                <stat.icon className="text-white" size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm truncate">{stat.name}</p>
                <p className="text-2xl sm:text-[28px] text-[#2563EB] font-bold">{stat.value}</p>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-center gap-1 text-xs text-[#2563EB]">
              <TrendingUp size={14} />
              <span>{isAdmin && stat.name === 'Total Users' ? 'Click to view all' : 'Active collection'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Extend Due Section */}
      {isAdmin && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Tools</h2>
            <ExtendDue />
          </div>
          <div className="grid grid-cols-1 gap-6">
             {/* Available Books for Admin */}
             <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2563EB] opacity-5 rounded-full"></div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                 <h2 className="text-gray-800">Available Books</h2>
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#00b894] flex items-center justify-center">
                   <BookOpen size={18} className="text-white" />
                 </div>
               </div>
              {booksLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : recentBooks.length > 0 ? (
                <div className="space-y-3">
                  {recentBooks.map((book) => (
                    <div key={book._id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg border border-white/40 hover:bg-white/40 transition-colors">
                      <div>
                        <h3 className="font-medium text-gray-900">{book.title}</h3>
                        <p className="text-sm text-gray-500">by {book.author}</p>
                        {book.createdAt && (
                          <p className="text-xs text-blue-600 mt-1">
                            Added {new Date(book.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          book.availability 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {book.availability ? 'Available' : 'Borrowed'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {book.quantity ? `${book.quantity} copies` : 'No quantity data'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No available books</p>
                  <p className="text-gray-400 text-sm mt-2">All books are currently borrowed</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Books - For Non-Admin Users */}
        {!isAdmin && (
          <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2563EB] opacity-5 rounded-full"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="text-gray-800">Available Books</h2>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#00b894] flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
            </div>
            {booksLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : recentBooks.length > 0 ? (
              <div className="space-y-3">
                {recentBooks.map((book) => (
                  <div key={book._id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg border border-white/40 hover:bg-white/40 transition-colors">
                    <div>
                      <h3 className="font-medium text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-500">by {book.author}</p>
                      {book.createdAt && (
                        <p className="text-xs text-blue-600 mt-1">
                          Added {new Date(book.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        book.availability 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.availability ? 'Available' : 'Borrowed'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {book.quantity ? `${book.quantity} copies` : 'No quantity data'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No available books</p>
                <p className="text-gray-400 text-sm mt-2">All books are currently borrowed</p>
              </div>
            )}
          </div>
        )}

        {/* My Borrowed Books - hidden for Admin */}
        {!isAdmin && (
        <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00b894] opacity-5 rounded-full"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-gray-800">My Borrowed Books</h2>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00b894] to-[#2563EB] flex items-center justify-center">
              <Library size={18} className="text-white" />
            </div>
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
                  <div key={borrowed._id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg border border-white/40">
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
        )}
      </div>

      {/* Book Recommendations Section */}
      <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#2563EB] to-[#00b894] opacity-5 rounded-full"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-gradient-to-br from-[#2563EB] to-[#00b894] rounded-lg mr-3 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-gray-800">Recommended for You</h2>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00b894] to-[#2563EB] flex items-center justify-center">
            <Star size={18} className="text-white" />
          </div>
        </div>
        
        {recommendationLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendations.map((book) => (
              <div key={book._id} className="bg-white/30 rounded-lg p-3 sm:p-4 hover:bg-white/40 transition-colors border border-white/40 flex flex-col">
                <div className="flex-1 flex flex-col">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 min-h-[40px]">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    by {book.author}
                  </p>
                  {book.genre && (
                    <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full mb-2 w-fit">
                      {book.genre}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 flex-wrap gap-2">
                  <span className="text-xs text-gray-500">
                    {book.quantity} copies
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    book.availability 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {book.availability ? 'Available' : 'Borrowed'}
                  </span>
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

      {/* Users Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowUsersModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">All Registered Users</h2>
                <p className="text-sm opacity-90 mt-1">Total: {users.length} users</p>
              </div>
              <button 
                onClick={() => setShowUsersModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {usersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((userItem, index) => (
                        <tr key={userItem._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {userItem.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {userItem.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Hash className="h-4 w-4 mr-2 text-gray-400" />
                              {userItem.rollNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userItem.role === 'Admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {userItem.role || 'User'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                  <p className="text-gray-500">No registered users in the system.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setShowUsersModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard
