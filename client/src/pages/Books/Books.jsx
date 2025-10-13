import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getAllBooks, deleteBook, updateBook } from '../../store/slices/bookSlice'
import { borrowBookForSelf, clearError as clearBorrowError, clearSuccess as clearBorrowSuccess } from '../../store/slices/borrowSlice'
import { reserveBook, clearError as clearReserveError, clearSuccess as clearReserveSuccess } from '../../store/slices/reservationSlice'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Plus,
  Edit,
  Trash2,
  Eye,
  BookMarked,
  CheckCircle,
  AlertCircle,
  Bell
} from 'lucide-react'

const Books = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [detailBook, setDetailBook] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const dispatch = useDispatch()
  const { books, loading } = useSelector((state) => state.books)
  const { user } = useSelector((state) => state.auth)
  const { loading: borrowLoading, success: borrowSuccess, error: borrowError, message: borrowMessage } = useSelector((state) => state.borrow)
  const { loading: reserveLoading, success: reserveSuccess, error: reserveError, message: reserveMessage } = useSelector((state) => state.reservation)

  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    dispatch(getAllBooks())
  }, [dispatch])

  useEffect(() => {
    if (borrowSuccess && borrowMessage) {
      // Refresh books after successful borrow
      dispatch(getAllBooks())
      setTimeout(() => {
        dispatch(clearBorrowSuccess())
      }, 3000)
    }
  }, [borrowSuccess, borrowMessage, dispatch])

  useEffect(() => {
    if (borrowError) {
      setTimeout(() => {
        dispatch(clearBorrowError())
      }, 5000)
    }
  }, [borrowError, dispatch])

  useEffect(() => {
    if (reserveSuccess && reserveMessage) {
      // Refresh books after successful reservation
      dispatch(getAllBooks())
      setTimeout(() => {
        dispatch(clearReserveSuccess())
      }, 3000)
    }
  }, [reserveSuccess, reserveMessage, dispatch])

  useEffect(() => {
    if (reserveError) {
      setTimeout(() => {
        dispatch(clearReserveError())
      }, 5000)
    }
  }, [reserveError, dispatch])

  const handleBorrowBook = (bookId) => {
    if (window.confirm('Are you sure you want to borrow this book?')) {
      dispatch(borrowBookForSelf(bookId))
    }
  }

  const handleReserveBook = (bookId) => {
    if (window.confirm('Reserve this book? You will be notified when it becomes available.')) {
      dispatch(reserveBook(bookId))
    }
  }

  // Filter and search books
  const isAvailable = (book) => (typeof book.availability === 'boolean' ? book.availability : (book.quantity || 0) > 0)
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'available' && isAvailable(book)) ||
                         (filterStatus === 'unavailable' && !isAvailable(book))
    
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

      {/* Success Message */}
      {borrowSuccess && borrowMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <p className="text-green-800">{borrowMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {borrowError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <p className="text-red-800">{borrowError}</p>
        </div>
      )}

      {/* Reservation Success Message */}
      {reserveSuccess && reserveMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
          <p className="text-blue-800">{reserveMessage}</p>
        </div>
      )}

      {/* Reservation Error Message */}
      {reserveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <p className="text-red-800">{reserveError}</p>
        </div>
      )}

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
                          dispatch(deleteBook(book._id))
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
                    isAvailable(book) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {isAvailable(book) ? 'Available' : 'Unavailable'}
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
                    <button className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2" onClick={() => setDetailBook(book)}>
                      <Eye className="h-4 w-4" />
                      <span>Details</span>
                    </button>
                    {!isAdmin && (
                      <>
                        {isAvailable(book) ? (
                          <button 
                            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2"
                            onClick={() => handleBorrowBook(book._id)}
                            disabled={borrowLoading}
                          >
                            <BookMarked className="h-4 w-4" />
                            <span>{borrowLoading ? 'Borrowing...' : 'Borrow'}</span>
                          </button>
                        ) : (
                          <button 
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => handleReserveBook(book._id)}
                            disabled={reserveLoading}
                          >
                            <Bell className="h-4 w-4" />
                            <span>{reserveLoading ? 'Reserving...' : 'Reserve'}</span>
                          </button>
                        )}
                      </>
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
    {/* Details Modal */}
    {detailBook && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { setDetailBook(null); setCoverFile(null); setCoverPreview(''); setUploadError('') }}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-5 text-white flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold leading-tight">{detailBook.title}</h3>
              <p className="text-sm opacity-90">by {detailBook.author}</p>
            </div>
            <button className="text-white/80 hover:text-white" onClick={() => { setDetailBook(null); setCoverFile(null); setCoverPreview(''); setUploadError('') }}>✕</button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="w-full aspect-[3/4] rounded-lg bg-gray-50 border flex items-center justify-center overflow-hidden">
                {(coverPreview || detailBook.coverImage?.url) ? (
                  <img src={coverPreview || detailBook.coverImage?.url} alt={detailBook.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-16 w-16 text-gray-300" />
                )}
              </div>
              <div className="text-xs text-gray-500">ISBN: {detailBook.isbn || '—'}</div>
              <div className="text-xs text-gray-500">Published: {detailBook.publicationYear || '—'}</div>
              <div className="text-xs text-gray-500">Publisher: {detailBook.publisher || '—'}</div>
              <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isAvailable(detailBook) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isAvailable(detailBook) ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="space-y-4">
              {detailBook.genre && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">{detailBook.genre}</span>
              )}
              {detailBook.description && (
                <p className="text-sm text-gray-700 whitespace-pre-line">{detailBook.description}</p>
              )}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Cover Image</label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors outline-none focus:ring-2 focus:ring-indigo-300"
                    tabIndex={0}
                    role="button"
                    contentEditable={false}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setCoverFile(file);
                        setCoverPreview(URL.createObjectURL(file));
                        setUploadError('');
                      }
                    }}
                    onPaste={(e) => {
                      const files = e.clipboardData?.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        setCoverFile(file);
                        setCoverPreview(URL.createObjectURL(file));
                        setUploadError('');
                        return;
                      }
                      const items = e.clipboardData?.items;
                      if (items) {
                        for (let i = 0; i < items.length; i++) {
                          const it = items[i];
                          if (it.kind === 'file' && it.type.startsWith('image/')) {
                            const file = it.getAsFile();
                            if (file) {
                              setCoverFile(file);
                              setCoverPreview(URL.createObjectURL(file));
                              setUploadError('');
                              break;
                            }
                          }
                        }
                      }
                    }}
                    onClick={() => document.getElementById('coverInputHidden')?.click()}
                  >
                    {coverPreview ? (
                      <div className="mb-2">Ready to upload new cover</div>
                    ) : (
                      <>
                        <div className="mb-1 font-medium">Drag & drop, paste (Ctrl+V), or click to select</div>
                        <div className="text-xs text-gray-500">PNG, JPG up to ~5MB</div>
                      </>
                    )}
                  </div>
                  <input id="coverInputHidden" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCoverFile(file);
                      setCoverPreview(URL.createObjectURL(file));
                      setUploadError('');
                    }
                  }} />
                  {uploadError && <p className="text-sm text-red-600 mt-2">{uploadError}</p>}
                  <div className="mt-3 flex gap-2">
                    <button
                      className="btn-primary disabled:opacity-50"
                      disabled={!coverFile || uploading}
                      onClick={async () => {
                        if (!coverFile) return;
                        try {
                          setUploading(true);
                          const fd = new FormData();
                          fd.append('coverImage', coverFile);
                          await dispatch(updateBook({ id: detailBook._id, bookData: fd }));
                          await dispatch(getAllBooks());
                          setCoverFile(null);
                          setCoverPreview('');
                        } catch (err) {
                          setUploadError('Upload failed');
                        } finally {
                          setUploading(false);
                        }
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Save Cover'}
                    </button>
                    <button className="btn-secondary" onClick={() => { setCoverFile(null); setCoverPreview(''); setUploadError('') }}>Reset</button>
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

export default Books
