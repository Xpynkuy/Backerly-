import type {AuthState, User} from "@features/auth/model/type/authStateType.ts";
import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      accessToken: string,
      user?: User
    }>) => {
      const {accessToken, user} = action.payload
      state.accessToken = accessToken
      state.isAuthenticated = true
      state.error = null

      localStorage.setItem('accessToken', accessToken)

      if (user) {
        state.user = user
        localStorage.setItem('user', JSON.stringify(user))
      }
    },
    logout: (state) => {
      state.accessToken = null
      state.user = null
      state.isAuthenticated = false
      state.error = null

      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})


export const {setCredentials, logout, setUser, setError} = authSlice.actions;
export default authSlice.reducer;