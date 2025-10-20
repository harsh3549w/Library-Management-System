import express from 'express'
import {
  createDonationRequest,
  getUserDonations,
  getUserDonationById,
  getAllDonations,
  getDonationStats,
  approveDonation,
  rejectDonation,
  completeDonation,
  getDonationById
} from '../controllers/donationController.js'
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js'

const router = express.Router()

// User routes
router.post('/request', isAuthenticated, createDonationRequest)
router.get('/my-donations', isAuthenticated, getUserDonations)
router.get('/my-donations/:id', isAuthenticated, getUserDonationById)

// Admin routes
router.get('/all', isAuthenticated, isAuthorized('Admin'), getAllDonations)
router.get('/stats', isAuthenticated, isAuthorized('Admin'), getDonationStats)
router.get('/:id', isAuthenticated, isAuthorized('Admin'), getDonationById)
router.put('/approve/:id', isAuthenticated, isAuthorized('Admin'), approveDonation)
router.put('/reject/:id', isAuthenticated, isAuthorized('Admin'), rejectDonation)
router.put('/complete/:id', isAuthenticated, isAuthorized('Admin'), completeDonation)

export default router
