import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import bookReducer from './slices/bookSlice'
import borrowReducer from './slices/borrowSlice'
import userReducer from './slices/userSlice'
import recommendationReducer from './slices/recommendationSlice'
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
  recommendations: recommendationReducer,
    suggestions: suggestionReducer,
    reservation: reservationReducer,
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
