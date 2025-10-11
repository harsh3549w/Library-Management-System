import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import bookReducer from './slices/bookSlice'
import borrowReducer from './slices/borrowSlice'
import userReducer from './slices/userSlice'
import suggestionReducer from './slices/suggestionSlice'
import reservationReducer from './slices/reservationSlice'
import archiveReducer from './slices/archiveSlice'
import transactionReducer from './slices/transactionSlice'
import reportReducer from './slices/reportSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    borrow: borrowReducer,
    users: userReducer,
    suggestions: suggestionReducer,
    reservations: reservationReducer,
    archives: archiveReducer,
    transactions: transactionReducer,
    reports: reportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
