import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("id");

    if (!fileId) return NextResponse.json({ error: "Missing file ID" }, { status: 400 });

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
        await drive.files.delete({ fileId: fileId });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}