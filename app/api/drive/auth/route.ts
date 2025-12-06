import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Generate the authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Crucial for getting refresh token
      scope: [
        'https://www.googleapis.com/auth/drive', // TAM YETKİ (Okuma, Yazma, Silme)
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent', // Force consent screen to ensure refresh token
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
