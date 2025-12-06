import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Token al
    const { data: prefs } = await supabase.from("user_preferences").select("google_access_token, google_refresh_token").eq("user_id", user.id).single();
    if (!prefs?.google_access_token) return NextResponse.json({ error: "Not connected" }, { status: 400 });

    // Google Auth
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({ access_token: prefs.google_access_token, refresh_token: prefs.google_refresh_token });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
        // Form verisini al
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        // Dosyayı Buffer'a çevir
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        // Drive'a Yükle
        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                mimeType: file.type,
            },
            media: {
                mimeType: file.type,
                body: stream,
            },
        });

        return NextResponse.json({ success: true, file: response.data });

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}