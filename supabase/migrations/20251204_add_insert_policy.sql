-- Kullanıcıların kendi cihazlarını eklemesine izin ver
CREATE POLICY "Users can insert own devices" ON trusted_devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcıların kendi cihazlarını güncellemesine izin ver (last_used_at için RPC dışında da gerekebilir)
CREATE POLICY "Users can update own devices" ON trusted_devices
  FOR UPDATE USING (auth.uid() = user_id);
