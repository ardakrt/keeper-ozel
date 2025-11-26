import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(request: Request) {
    const { name, parentId } = await request.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: prefs } = await supabase.from("user_preferences").select("google_access_token, google_refresh_token").eq("user_id", user.id).single();

    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({ access_token: prefs?.google_access_token, refresh_token: prefs?.google_refresh_token });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId && parentId !== 'root' ? [parentId] : [] // Eğer bir klasörün içindeysek, onun içine oluştur
        };

        const file = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name, mimeType',
        });

        return NextResponse.json(file.data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}