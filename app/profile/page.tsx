import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfilePageManager from "@/components/ProfilePageManager";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-950 dark:bg-zinc-950 light:bg-[#F9FAFB]">
      {/* God Rays - 4 Layer Spotlight */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2000px] h-[1200px] dark:bg-purple-600 light:bg-blue-400 opacity-40 dark:opacity-40 light:opacity-20 blur-[200px] rounded-full -translate-y-1/2" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] dark:bg-blue-600 light:bg-purple-400 opacity-50 dark:opacity-50 light:opacity-15 blur-[180px] rounded-full -translate-y-1/3" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] dark:bg-cyan-500 light:bg-pink-300 opacity-60 dark:opacity-50 light:opacity-10 blur-[150px] rounded-full -translate-y-1/4" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] dark:bg-teal-500 light:bg-indigo-300 opacity-40 dark:opacity-40 light:opacity-10 blur-[120px] rounded-full" />
      </div>

      {/* Back to Dashboard Link */}
      <div className="relative z-10 pt-6 px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 dark:text-zinc-400 dark:hover:text-white light:text-zinc-600 light:hover:text-zinc-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard&apos;a Dön
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full">
          <ProfilePageManager user={user} />
        </div>
      </div>
    </div>
  );
}
