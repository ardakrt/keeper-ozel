export interface LoginRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  ip_address: string | null;
  device_info: string | null;
  browser_info: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
}

export interface UsePushLoginReturn {
  requestPushLogin: (email: string) => Promise<void>;
  isWaiting: boolean;
  error: string | null;
  cancelRequest: () => void;
  requestId: string | null;
  timeRemaining: number;
}
