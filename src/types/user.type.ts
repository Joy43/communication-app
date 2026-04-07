export type TUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  isVerified: boolean;
  lastLoginAt: string;
  lastActiveAt: string;
  profilePictureId: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // Extended profile fields
  username?: string;
  title?: string;
  bio?: string;
  location?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  experience?: string;
  coverUrl?: string;
  isToggleNotification?: boolean;
};
