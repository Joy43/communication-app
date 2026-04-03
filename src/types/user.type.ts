export type TUser = {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'|'SUPER_ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
  isVerified: boolean
  lastLoginAt: string
  lastActiveAt: string
  profilePictureId: string | null
  profilePictureUrl: string | null
  createdAt: string
  updatedAt: string
}
