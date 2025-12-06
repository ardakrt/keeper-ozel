"use client";

import Link from "next/link";

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* God Rays - Yeşil Işık Huzmesi (Başarı Teması) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1800px] h-[1000px] bg-green-600 opacity-20 blur-[200px] rounded-full -translate-y-1/2" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-emerald-500 opacity-30 blur-[180px] rounded-full -translate-y-1/3" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-teal-500 opacity-25 blur-[150px] rounded-full" />
      </div>

      {/* Success Card */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl animate-fadeIn">
          {/* Success Icon - Animated */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center animate-scaleIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-3">
            E-posta Adresi Doğrulandı
          </h1>

          {/* Description */}
          <p className="text-zinc-400 text-center text-sm leading-relaxed mb-8">
            E-posta değiştirme işleminiz başarıyla tamamlandı. Bu sayfayı güvenle kapatabilirsiniz.
          </p>

          {/* Optional Dashboard Button */}
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 text-center border border-white/20 text-white hover:bg-white/5 rounded-xl transition-all font-medium text-sm"
          >
            Dashboard&apos;a Git
          </Link>
        </div>

        {/* Subtle Footer Text */}
        <p className="text-zinc-600 text-xs text-center mt-6">
          Keeper ile verileriniz güvende
        </p>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
