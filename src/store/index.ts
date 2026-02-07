import { configureStore } from '@reduxjs/toolkit'
import authReducer from './../features/authSlice'
import logger from 'redux-logger'
import { apiSlice } from '@/features/apiSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger, apiSlice.middleware),
  devTools: true,
})

// ✅ ADD THESE EXPORTS
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
