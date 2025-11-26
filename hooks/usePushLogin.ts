"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import type { LoginRequest, DeviceInfo, UsePushLoginReturn } from '@/types/pushAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';

const EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export function usePushLogin(): UsePushLoginReturn {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds

  const channelRef = useRef<RealtimeChannel | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expirationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get device info
  const getDeviceInfo = useCallback((): DeviceInfo => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
  }, []);

  // Get IP address (using public API)
  const getIpAddress = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return null;
    }
  }, []);

  // Parse user agent for browser info
  const getBrowserInfo = useCallback((userAgent: string): string => {
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Unknown Browser';
  }, []);

  // Get user by email (helper function that uses Supabase RPC)
  const getUserByEmail = useCallback(async (email: string): Promise<string | null> => {
    try {
      console.log('🔍 Calling RPC: get_user_id_by_email with email:', email);

      // Query auth.users via a custom RPC function
      const { data, error } = await supabase.rpc('get_user_id_by_email', {
        email_input: email.toLowerCase().trim()
      });

      console.log('📊 RPC Response - Data:', data, 'Error:', error);

      if (error) {
        console.error('❌ RPC Error getting user by email:', error);
        throw new Error(`RPC Error: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        console.warn('⚠️ RPC returned null/undefined for email:', email);
        return null;
      }

      console.log('✅ User ID found:', data);
      return data;
    } catch (error: any) {
      console.error('💥 Exception in getUserByEmail:', error);
      throw error;
    }
  }, [supabase]);

  // Request push login
  const requestPushLogin = useCallback(async (email: string) => {
    try {
      console.log('🚀 Starting push login request for:', email);
      setError(null);
      setIsWaiting(true);
      setTimeRemaining(300);

      // 1. Get user ID by email
      console.log('📧 Getting user ID by email...');
      const userId = await getUserByEmail(email);
      console.log('👤 User ID result:', userId);

      if (!userId) {
        console.error('❌ No user found for email:', email);
        throw new Error('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı');
      }

      // 2. Get device and IP info
      console.log('🖥️ Getting device info...');
      const deviceInfo = getDeviceInfo();
      console.log('📍 Getting IP address...');
      const ipAddress = await getIpAddress();
      const browserInfo = getBrowserInfo(deviceInfo.userAgent);
      console.log('✅ Device info collected:', { ipAddress, browserInfo, platform: deviceInfo.platform });

      // 3. Create login request
      console.log('💾 Inserting login request to Supabase...');
      const { data: loginRequest, error: insertError } = await supabase
        .from('login_requests')
        .insert({
          user_id: userId,
          status: 'pending',
          ip_address: ipAddress,
          device_info: `${deviceInfo.platform} - ${deviceInfo.screenResolution}`,
          browser_info: browserInfo,
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }

      console.log('✅ Login request created:', loginRequest);

      setRequestId(loginRequest.id);

      // 4. Subscribe to realtime updates for this specific request
      const channel = supabase
        .channel(`login_request_${loginRequest.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'login_requests',
            filter: `id=eq.${loginRequest.id}`,
          },
          (payload) => {
            console.log('📡 Realtime UPDATE event:', payload);

            const updatedRequest = payload.new as LoginRequest;

            if (updatedRequest.status === 'approved') {
              // Login successful! Call API to get direct login link
              handleApproved(loginRequest.id, email);
            } else if (updatedRequest.status === 'rejected') {
              // Login rejected
              setError('Giriş isteği mobil cihazdan reddedildi');
              setIsWaiting(false);
              cleanup();
            } else if (updatedRequest.status === 'expired') {
              // Login expired
              setError('Giriş isteği zaman aşımına uğradı');
              setIsWaiting(false);
              cleanup();
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status);
        });

      channelRef.current = channel;

      // 5. Start countdown timer (1 second intervals)
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 6. Set timeout for auto-expiration (5 minutes)
      expirationTimerRef.current = setTimeout(() => {
        if (isWaiting) {
          expireRequest(loginRequest.id);
        }
      }, EXPIRATION_TIME);

    } catch (err: any) {
      console.error('💥 Push login request failed:', err);
      console.error('💥 Error details:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        stack: err?.stack
      });
      setError(err.message || 'Giriş isteği gönderilemedi');
      setIsWaiting(false);
      cleanup();
    }
  }, [isWaiting, supabase, getUserByEmail, getDeviceInfo, getIpAddress, getBrowserInfo]);

  // Handle approved login
  const handleApproved = useCallback(async (requestId: string, email: string) => {
    try {
      console.log('✅ Login approved! Getting direct login link...');

      // Call our API to get the direct login link
      const response = await fetch('/api/auth/complete-push-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete login');
      }

      const { url } = await response.json();

      console.log('✅ Login link received, redirecting...');

      setIsWaiting(false);
      cleanup();

      // Redirect to the magic link URL (instant login)
      window.location.href = url;

    } catch (err: any) {
      console.error('Failed to complete login:', err);
      setError('Giriş tamamlanamadı: ' + (err.message || 'Bilinmeyen hata'));
      setIsWaiting(false);
      cleanup();
    }
  }, []);

  // Expire request
  const expireRequest = useCallback(async (requestId: string) => {
    try {
      await supabase
        .from('login_requests')
        .update({ status: 'expired' })
        .eq('id', requestId);

      setError('Giriş isteği zaman aşımına uğradı (5 dakika)');
      setIsWaiting(false);
      cleanup();
    } catch (err) {
      console.error('Failed to expire request:', err);
    }
  }, [supabase]);

  // Cancel request
  const cancelRequest = useCallback(() => {
    if (requestId) {
      supabase
        .from('login_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .then(() => {
          setIsWaiting(false);
          setRequestId(null);
          setError(null);
          cleanup();
        });
    }
  }, [requestId, supabase]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Remove realtime channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
  }, [supabase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    requestPushLogin,
    isWaiting,
    error,
    cancelRequest,
    requestId,
    timeRemaining,
  };
}
