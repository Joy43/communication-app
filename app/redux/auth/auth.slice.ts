import { TUser } from '@/app/types/user.type'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
// import { RootState } from '../../store'
// import { TUser } from '@renderer/types/user'

type TState = {
  user: TUser | null
  accessToken: string | null
}

const initialState: TState = {
  user: null,
  accessToken: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: TUser; accessToken?: string | null }>) => {
      const { user, accessToken } = action.payload || {}

      if (!user) {
        console.error('Invalid payload received:', action.payload)
        return
      }

      // ✅ Update user info
      state.user = user

      // ✅ Only replace accessToken if a valid one exists
      if (accessToken) {
        state.accessToken = accessToken
      }
    },

    logout: (state) => {
      state.user = null
      state.accessToken = null
    }
  }
})

export const { setUser, logout } = authSlice.actions

export const selectUser = (state: RootState) => state.auth?.user
export const selectaccessToken = (state: RootState) => state.auth?.accessToken

export default authSlice.reducer