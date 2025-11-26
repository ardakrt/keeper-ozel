import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Başarılı olursa yönlendirilecek adres
  const next = "/dashboard/drive?success=connected";

  if (!code) {
    return NextResponse.json({ error: "Google kod göndermedi" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();

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
    if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

    // Google Token Al
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Veritabanı Verisi Hazırla
    const upsertData = {
      user_id: user.id, // BU ÇOK ÖNEMLİ: ID ile eşleşecek
      google_access_token: tokens.access_token,
      google_token_expiry: tokens.expiry_date,
      updated_at: new Date().toISOString(),
      // Eğer refresh token geldiyse onu da ekle (Sadece ilk bağlantıda gelir)
      ...(tokens.refresh_token && { google_refresh_token: tokens.refresh_token }),
    };

    // KRİTİK DÜZELTME: 'update' yerine 'upsert' kullanıyoruz
    const { error: dbError } = await supabase
      .from("user_preferences")
      .upsert(upsertData, { onConflict: "user_id" });

    if (dbError) {
      console.error("DB Kayıt Hatası:", dbError);
      return NextResponse.json({ error: "Veritabanına yazılamadı", details: dbError }, { status: 500 });
    }

    return NextResponse.redirect(new URL(next, request.url));

  } catch (error: any) {
    return NextResponse.json({ error: "Beklenmeyen hata", details: error.message }, { status: 500 });
  }
}