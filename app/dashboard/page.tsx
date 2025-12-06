import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

// Data Queries
import { 
  getUser, 
  getSubscriptionsTotal, 
  getFirstOTPCode 
} from "@/lib/dashboard-queries";

// Widgets
import DashboardHeader from "@/components/dashboard/widgets/DashboardHeader";
import WeatherWidget from "@/components/dashboard/widgets/WeatherWidget";
import NotesWidget from "@/components/dashboard/widgets/NotesWidget";
import WalletWidget from "@/components/dashboard/widgets/WalletWidget";
import SubscriptionsWidget from "@/components/dashboard/widgets/SubscriptionsWidget";
import AuthenticatorWidget from "@/components/dashboard/widgets/AuthenticatorWidget";

// --- ASYNC WIDGET WRAPPERS (Server Components) ---

async function SubscriptionsWidgetWrapper({ userId }: { userId: string }) {
  const totalSubscriptionCost = await getSubscriptionsTotal(userId);
  return <SubscriptionsWidget totalCost={totalSubscriptionCost} />;
}

async function AuthenticatorWidgetWrapper({ userId }: { userId: string }) {
  const otpCode = await getFirstOTPCode(userId);
  return <AuthenticatorWidget codeData={otpCode} />;
}

// --- MAIN PAGE COMPONENT ---

export default async function DashboardPage() {
  // 1. Critical User Check (Fast & Essential)
  // Sadece kullanıcıyı kontrol ediyoruz, widget verilerini BEKLEMİYORUZ.
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }

  const userId = user.id;

  return (
    <div className="w-full h-full flex items-center justify-center px-2 py-6 animate-fadeIn">
      {/* Ana Container */}
      <div className="w-full max-w-[99%] h-[82vh] flex flex-col rounded-3xl backdrop-blur-xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-black/30 dark:bg-black/30 light:bg-white/80 light:shadow-2xl overflow-hidden">
        
        {/* İç Scroll Container */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* HEADER */}
          <DashboardHeader user={user} />

          {/* BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
            
            {/* 1. Weather Widget (Client Component - Kendi state'ini yönetir) */}
            <WeatherWidget />

            {/* 2. Notes Widget (Eager Loaded) */}
            <NotesWidget />

            {/* 3. Wallet Widget (Eager Loaded) */}
            <WalletWidget />

            {/* 4. Subscriptions Widget (Streaming) */}
            <Suspense fallback={<WidgetLoading />}>
              <SubscriptionsWidgetWrapper userId={userId} />
            </Suspense>

            {/* 5. Authenticator Widget (Streaming) */}
            <Suspense fallback={<WidgetLoading />}>
              <AuthenticatorWidgetWrapper userId={userId} />
            </Suspense>

          </div>
        </div>
      </div>
    </div>
  );
}

// Basit Loading Skeleton
function WidgetLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full min-h-[180px] rounded-[2rem] bg-white/5 animate-pulse flex items-center justify-center border border-white/5 ${className}`}>
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  );
}