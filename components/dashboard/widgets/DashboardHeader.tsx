import { getGreeting } from "@/lib/textUtils";

export default function DashboardHeader({ user }: { user: any }) {
  // Server component olduğu için saat bilgisini sunucuda veya client'ta hesaplamamız gerek.
  // Hydration mismatch olmaması için basit bir selamlama veya client component kullanabiliriz.
  // Ancak burada sadece prop olarak geçilen user bilgisini kullanacağız.
  // "getGreeting" fonksiyonu client-side time kullanıyorsa hydration hatası verebilir.
  // Bu yüzden basit bir selamlama yapalım veya client component'e çevirelim.
  // Şimdilik basit tutuyorum.
  
  const userName = user?.user_metadata?.name || "Kullanıcı";
  
  // Selamlamayı dinamik yapmak için ufak bir script veya client component gerekebilir ama 
  // Server Component içinde statik bir başlık daha performanslıdır.
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
        Hoş geldin, <span className="text-emerald-600 dark:text-emerald-400">{userName}</span>
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-1">
        Dijital yaşamın bugün çok sakin.
      </p>
    </div>
  );
}
