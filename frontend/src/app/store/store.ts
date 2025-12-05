import {configureStore} from "@reduxjs/toolkit";
import authReducer from '../../features/auth/model/slice/authSlice.ts'
import {baseApi} from "@shared/api/baseApi.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware)
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;