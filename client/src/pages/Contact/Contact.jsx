import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Mail, Phone, MapPin, Clock, User, Shield } from 'lucide-react'

const Contact = () => {
  const { user } = useSelector((state) => state.auth)
  const [adminInfo, setAdminInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For now, we'll use the current user if they're admin, or show default admin info
    if (user?.role === 'Admin') {
      setAdminInfo({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      })
    } else {
      // Default admin information
      setAdminInfo({
        name: "Library Administrator",
        email: "admin@iiitdmk.ac.in",
        phone: "+91-XXXX-XXXXXX",
        role: "Admin"
      })
    }
    setLoading(false)
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b894]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 to-emerald-50/20 pointer-events-none"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
          <p className="text-gray-600">Get in touch with our library administration team</p>
        </div>
      </div>

      {/* Admin Information Card */}
      <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 to-emerald-50/20 pointer-events-none"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#00b894] rounded-full p-3 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Library Administrator</h2>
              <p className="text-gray-600">IIITDM Kurnool E-Library</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              
              <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg">
                <User className="h-5 w-5 text-[#00b894]" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-800">{adminInfo?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg">
                <Mail className="h-5 w-5 text-[#00b894]" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{adminInfo?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg">
                <Phone className="h-5 w-5 text-[#00b894]" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-800">{adminInfo?.phone}</p>
                </div>
              </div>
            </div>

            {/* Library Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Library Details</h3>
              
              <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg">
                <MapPin className="h-5 w-5 text-[#00b894]" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-800">IIITDM Kurnool, Andhra Pradesh</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg">
                <Clock className="h-5 w-5 text-[#00b894]" />
                <div>
                  <p className="text-sm text-gray-600">Working Hours</p>
                  <p className="font-medium text-gray-800">9:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/30 rounded-lg">
                <Shield className="h-5 w-5 text-[#00b894]" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium text-gray-800">{adminInfo?.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#00b894]/10 to-teal-100/20 rounded-lg border border-[#00b894]/20">
            <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600">
              For any library-related queries, book requests, or technical support, 
              please contact the administrator using the information provided above. 
              We're here to help you make the most of our digital library resources.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-6 shadow-lg border border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 to-emerald-50/20 pointer-events-none"></div>
        <div className="relative">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href={`mailto:${adminInfo?.email}`}
              className="flex items-center gap-3 p-4 bg-white/30 rounded-lg hover:bg-white/40 transition-colors"
            >
              <Mail className="h-5 w-5 text-[#00b894]" />
              <span className="font-medium text-gray-800">Send Email</span>
            </a>
            <a 
              href={`tel:${adminInfo?.phone}`}
              className="flex items-center gap-3 p-4 bg-white/30 rounded-lg hover:bg-white/40 transition-colors"
            >
              <Phone className="h-5 w-5 text-[#00b894]" />
              <span className="font-medium text-gray-800">Call Now</span>
            </a>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-3 p-4 bg-white/30 rounded-lg hover:bg-white/40 transition-colors"
            >
              <Shield className="h-5 w-5 text-[#00b894]" />
              <span className="font-medium text-gray-800">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact










