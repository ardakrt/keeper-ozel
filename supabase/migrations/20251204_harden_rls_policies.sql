-- Tüm RLS politikalarını sıfırlayıp yeniden oluşturuyoruz (Temiz Başlangıç)

-- 1. CARDS Tablosu
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own cards" ON cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON cards;
DROP POLICY IF EXISTS "Users can update own cards" ON cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON cards;

CREATE POLICY "Users can view own cards" ON cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cards" ON cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cards" ON cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cards" ON cards FOR DELETE USING (auth.uid() = user_id);

-- 2. NOTES Tablosu
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- 3. USER_PREFERENCES Tablosu
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 4. IBANS Tablosu
ALTER TABLE ibans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own ibans" ON ibans;
DROP POLICY IF EXISTS "Users can insert own ibans" ON ibans;
DROP POLICY IF EXISTS "Users can update own ibans" ON ibans;
DROP POLICY IF EXISTS "Users can delete own ibans" ON ibans;

CREATE POLICY "Users can view own ibans" ON ibans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ibans" ON ibans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ibans" ON ibans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ibans" ON ibans FOR DELETE USING (auth.uid() = user_id);

-- 5. ACCOUNTS Tablosu
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

-- 6. OTP_CODES Tablosu
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own otp_codes" ON otp_codes;
DROP POLICY IF EXISTS "Users can insert own otp_codes" ON otp_codes;
DROP POLICY IF EXISTS "Users can update own otp_codes" ON otp_codes;
DROP POLICY IF EXISTS "Users can delete own otp_codes" ON otp_codes;

CREATE POLICY "Users can view own otp_codes" ON otp_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own otp_codes" ON otp_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own otp_codes" ON otp_codes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own otp_codes" ON otp_codes FOR DELETE USING (auth.uid() = user_id);

-- 7. SUBSCRIPTIONS Tablosu
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON subscriptions;

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON subscriptions FOR DELETE USING (auth.uid() = user_id);