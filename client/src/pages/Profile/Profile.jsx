import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit, 
  BookOpen, 
  Clock, 
  DollarSign,
  Award,
  ArrowLeft
} from 'lucide-react'

const Profile = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('overview')

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800'
      case 'User':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationStatus = () => {
    return user?.accountVerified ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Shield className="w-3 h-3 mr-1" />
        Verified
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending Verification
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
        </div>
        <Link
          to="/edit-info"
          className="btn-primary flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                {user?.name || 'User Name'}
              </h2>
              <div className="flex flex-wrap items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role || 'User'}
                </span>
                {getVerificationStatus()}
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span className="truncate">{user?.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{user?.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Member since {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fine Balance */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Fine Balance</h3>
              <p className="text-2xl font-bold text-red-600">
                ₹{user?.fineBalance || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Fines Paid */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Fines Paid</h3>
              <p className="text-2xl font-bold text-green-600">
                ₹{user?.totalFinesPaid || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Borrowing Status</h3>
              <p className={`text-lg font-bold ${(user?.canBorrow !== false && user?.fineBalance === 0) ? 'text-green-600' : 'text-red-600'}`}>
                {(user?.canBorrow !== false && user?.fineBalance === 0) ? 'Can Borrow' : 'Cannot Borrow'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.name || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.email || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.phone || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.role || 'User'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user?.accountVerified ? 'Verified' : 'Pending Verification'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(user?.createdAt)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current Fine Balance</dt>
                    <dd className="mt-1 text-sm text-gray-900">₹{user?.fineBalance || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Fines Paid</dt>
                    <dd className="mt-1 text-sm text-gray-900">₹{user?.totalFinesPaid || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Borrowing Eligibility</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {(user?.canBorrow !== false && user?.fineBalance === 0) ? 'Eligible to borrow books' : 'Cannot borrow due to outstanding fines'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Activity tracking will be available soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This will show your recent book borrows, returns, and other activities
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/edit-info"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Edit Profile</span>
          </Link>
          
          <Link
            to="/my-borrowed-books"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">My Books</span>
          </Link>
          
          <Link
            to="/my-fines"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DollarSign className="h-5 w-5 text-red-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">My Fines</span>
          </Link>
          
          <Link
            to="/my-transactions"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Award className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Transactions</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Profile
