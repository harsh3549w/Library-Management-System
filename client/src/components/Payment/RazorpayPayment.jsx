import { useState } from 'react'
import axios from 'axios'
import { X, CreditCard, Loader } from 'lucide-react'

const API_URL = 'http://localhost:4000/api/v1'

export const RazorpayPayment = ({ borrow, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setError('')

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.')
        setIsProcessing(false)
        return
      }

      // Create order
      const response = await axios.post(
        `${API_URL}/payment/create-order/${borrow._id}`,
        {},
        { withCredentials: true }
      )

      const { orderId, amount, currency, key, bookTitle } = response.data

      // Razorpay options
      const options = {
        key: key,
        amount: amount * 100, // Convert to paise
        currency: currency,
        name: 'Library Management System',
        description: `Fine payment for "${bookTitle}"`,
        order_id: orderId,
        config: {
          display: {
            blocks: {
              utib: { //name of the bank
                name: 'Pay using Razorpay',
                instruments: [
                  {
                    method: 'upi'
                  },
                  {
                    method: 'card'
                  }
                ]
              }
            },
            sequence: ['block.utib'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${API_URL}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                borrowId: borrow._id,
                paymentType: borrow._id === 'total_balance' ? 'total_balance' : 'individual'
              },
              { withCredentials: true }
            )

            if (verifyResponse.data.success) {
              onSuccess(verifyResponse.data.message)
            }
          } catch (error) {
            setError('Payment verification failed. Please contact admin.')
            console.error('Verification error:', error)
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: borrow.user?.name || '',
          email: borrow.user?.email || '',
        },
        notes: {
          borrowId: borrow._id,
          bookTitle: bookTitle
        },
        theme: {
          color: '#4F46E5' // Indigo color
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false)
            setError('Payment cancelled')
          }
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to initiate payment')
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Pay Fine</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Book Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Book Details</h3>
            <p className="text-lg font-semibold text-gray-900">
              {borrow.book?.title || 'Book'}
            </p>
            <p className="text-sm text-gray-600">
              by {borrow.book?.author || 'Author'}
            </p>
          </div>

          {/* Fine Amount */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Fine Amount:</span>
              <span className="text-3xl font-bold text-indigo-600">
                ₹{borrow.fine?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Payment via Razorpay</p>
                <p className="text-xs mt-1">
                  Supports UPI, Cards, Net Banking, and Wallets
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Pay ₹{borrow.fine?.toFixed(2)}</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Powered by Razorpay • Secure & Encrypted Payment
          </p>
        </div>
      </div>
    </div>
  )
}

export default RazorpayPayment

