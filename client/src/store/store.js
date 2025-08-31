import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import bookReducer from './slices/bookSlice'
import borrowReducer from './slices/borrowSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    borrow: borrowReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
