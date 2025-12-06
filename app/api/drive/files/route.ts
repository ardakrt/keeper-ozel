// src/app/api/drive/files/route.ts

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
    const cookieStore = await cookies();

    // URL'den folderId parametresini al
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || 'root'; // Yoksa 'root' (ana dizin) olsun

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) { try { } catch { } },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: prefs } = await supabase
        .from("user_preferences")
        .select("google_access_token, google_refresh_token, google_token_expiry")
        .eq("user_id", user.id)
        .single();

    if (!prefs || !prefs.google_access_token) {
        return NextResponse.json({ error: "Not connected" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: prefs.google_access_token,
        refresh_token: prefs.google_refresh_token,
        expiry_date: prefs.google_token_expiry,
    });

    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            await supabase.from("user_preferences").update({
                google_access_token: tokens.access_token,
                google_token_expiry: tokens.expiry_date,
            }).eq("user_id", user.id);
        }
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
        // Klasör Sorgusu (Dinamik parent ID)
        const response = await drive.files.list({
            pageSize: 50,
            // BURASI GÜNCELLENDİ: 'root' yerine gelen folderId değişkenini kullanıyoruz
            q: `'${folderId}' in parents and trashed = false`,
            orderBy: 'folder, name',
            fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, iconLink, thumbnailLink, webViewLink, owners(displayName, photoLink, me))',
        });

        const about = await drive.about.get({
            fields: 'storageQuota'
        });

        return NextResponse.json({
            files: response.data.files,
            storage: about.data.storageQuota
        });

    } catch (error: any) {
        console.error("Drive API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}