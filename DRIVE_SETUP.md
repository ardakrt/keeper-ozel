# Keeper Drive Setup Instructions

## Prerequisites

1. **Google Cloud Console Setup** ✅ (Already done)
   - Google OAuth2 credentials created
   - Authorized redirect URIs configured

2. **Environment Variables** ✅ (Already done)
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Database Schema** (Required)

   Add these columns to your `profiles` table in Supabase:

   ```sql
   -- Run this SQL in Supabase SQL Editor
   ALTER TABLE profiles
   ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
   ADD COLUMN IF NOT EXISTS google_access_token TEXT,
   ADD COLUMN IF NOT EXISTS google_token_expiry TIMESTAMPTZ;
   ```

## Files Created

1. **`app/api/drive/auth/route.ts`**
   - Generates Google OAuth2 authorization URL
   - Redirects user to Google consent screen

2. **`app/api/drive/callback/route.ts`**
   - Handles OAuth callback from Google
   - Exchanges code for tokens
   - Saves tokens to user's profile
   - Redirects to Drive page

3. **`app/dashboard/drive/page.tsx`**
   - Beautiful VisionOS-style glassmorphic UI
   - Two states: Connect prompt and File manager
   - Mock data for demonstration

## Testing

1. Navigate to `/dashboard/drive`
2. Click "Google Drive'ı Bağla"
3. Complete Google OAuth flow
4. You'll be redirected back with success message
5. File manager interface will appear

## Features

✨ **State A (Not Connected):**
- Beautiful connection prompt card
- Feature highlights
- One-click connect button

✨ **State B (Connected):**
- File manager interface
- Storage usage bar
- Folder grid (mock data)
- Recent files list (mock data)
- Search functionality
- Upload button

## Next Steps

To enable real file operations:
1. Implement file listing using Google Drive API
2. Add file upload functionality
3. Add file download/preview
4. Add folder navigation
5. Implement search

## Design Style

- **Theme:** VisionOS Glassmorphism
- **Colors:** Dark zinc-900 base, Emerald green accents
- **Effects:** Heavy backdrop-blur, frosted glass
- **Borders:** Thin white/10 borders
- **Shadows:** Subtle 2xl shadows
