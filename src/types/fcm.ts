export interface FCMTokenState {
  fcmToken: string | null;
  permissionStatus: 'granted' | 'denied' | 'undetermined' | null;
  loading: boolean;
  error: string | null;
}

export interface FCMTokenHook extends FCMTokenState {
  regenerate: () => Promise<string | null>;
}