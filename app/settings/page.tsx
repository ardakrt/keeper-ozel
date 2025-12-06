import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import AccentColorPicker from "@/components/AccentColorPicker";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("theme_mode_web, accent_color")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen p-6 space-y-6 relative dark:bg-zinc-950 light:bg-[#F9FAFB]">
      <h1 className="text-2xl font-bold dark:text-white light:text-zinc-900">Ayarlar</h1>

      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold dark:text-white light:text-zinc-900">Görünüm</h2>
          <div className="p-4 rounded-2xl bg-white/5 dark:bg-white/5 light:bg-white border border-white/10 dark:border-white/10 light:border-zinc-200">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3 dark:text-white light:text-zinc-900">Tema</h3>
                <ThemeToggle />
              </div>
              
              <div className="border-t border-white/10 dark:border-white/10 light:border-zinc-100 my-4"></div>

              <div>
                <h3 className="text-sm font-medium mb-3 dark:text-white light:text-zinc-900">Vurgu Rengi</h3>
                <AccentColorPicker currentColor={preferences?.accent_color || "#3b82f6"} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
