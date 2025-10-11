import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getAllBooks } from '../../store/slices/bookSlice'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'

const Books = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('title')

  const dispatch = useDispatch()
  const { books, loading } = useSelector((state) => state.books)
  const { user } = useSelector((state) => state.auth)

  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    dispatch(getAllBooks())
  }, [dispatch])

  // Filter and search books
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'available' && book.available) ||
                         (filterStatus === 'unavailable' && !book.available)
    
    return matchesSearch && matchesFilter
  })

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'author':
        return a.author.localeCompare(b.author)
      case 'quantity':
        return b.quantity - a.quantity
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt)
      default:
        return 0
    }
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-600">Browse and manage the library collection</p>
        </div>
        {isAdmin && (
          <Link
            to="/admin/add-book"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Books</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          {/* Sort By */}
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="date">Sort by Date Added</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-center text-sm text-gray-600">
            {sortedBooks.length} book{sortedBooks.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : sortedBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedBooks.map((book) => (
            <div key={book._id} className="card hover:shadow-lg transition-all duration-200 overflow-hidden p-0">
              {/* Book Cover Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                {book.coverImage?.url ? (
                  <img
                    src={book.coverImage.url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-blue-300" />
                  </div>
                )}
                
                {/* Admin Actions Overlay */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Link
                      to={`/admin/edit-book/${book._id}`}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Link>
                    <button
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this book?')) {
                          // dispatch(deleteBook(book._id))
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                )}

                {/* Availability Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg ${
                    book.available 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {book.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Book Details */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-lg">{book.title}</h3>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    {book.genre && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {book.genre}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-600 font-medium">
                    {book.quantity} {book.quantity !== 1 ? 'copies' : 'copy'}
                  </span>
                </div>

                {(book.isbn || book.publicationYear) && (
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {book.isbn && <p>ISBN: {book.isbn}</p>}
                    {book.publicationYear && <p>Published: {book.publicationYear}</p>}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex-1 btn-secondary text-sm py-2">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </button>
                    {isAdmin && book.available && (
                      <button className="flex-1 btn-primary text-sm py-2">
                        Borrow
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No books have been added to the library yet'
            }
          </p>
          {isAdmin && (
            <Link to="/admin/add-book" className="btn-primary mt-4 inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add First Book
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default Books
