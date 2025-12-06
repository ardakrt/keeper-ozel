"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import * as OTPAuth from "otpauth";
import { revealOTPSecret } from "@/app/actions";
import ServiceLogo from "@/components/finance/ServiceLogo";
import { getServiceInfo } from "@/lib/serviceIcons";
import { getOTPSecretsCache } from "@/components/OTPPreloader";

function generateOTPCode(secret: string): string {
  try {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
      digits: 6,
      period: 30,
    });
    return totp.generate();
  } catch (error) {
    return "------";
  }
}

function getRemainingSeconds(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}

export default function AuthenticatorWidget({ codeData }: { codeData: any }) {
  const [currentOTP, setCurrentOTP] = useState<string>("------");
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [otpSecret, setOtpSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!codeData || !codeData.bt_token_id_secret) return;

    const fetchSecret = async () => {
      // Check cache first
      const secretCache = getOTPSecretsCache();
      const cached = secretCache.get(codeData.bt_token_id_secret);
      
      if (cached) {
        setOtpSecret(cached);
      } else {
        try {
          // Server Action to reveal secret
          const secret = await revealOTPSecret(codeData.bt_token_id_secret);
          secretCache.set(codeData.bt_token_id_secret, secret);
          setOtpSecret(secret);
        } catch (error) {
          console.error("OTP secret çözülemedi:", error);
        }
      }
    };

    fetchSecret();
  }, [codeData]);

  useEffect(() => {
    if (!otpSecret) return;
    const updateOTP = () => {
      const code = generateOTPCode(otpSecret);
      setCurrentOTP(`${code.slice(0, 3)} ${code.slice(3)}`);
      setRemainingTime(getRemainingSeconds());
    };
    updateOTP();
    const interval = setInterval(updateOTP, 1000);
    return () => clearInterval(interval);
  }, [otpSecret]);

  const handleCopyOTP = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const code = currentOTP.replace(" ", "");
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Kod kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-white/70 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/[0.08] hover:border-blue-500/40 dark:hover:border-blue-500/30 rounded-[2rem] p-6 flex flex-col justify-center transition-all duration-500 min-h-[180px] backdrop-blur-2xl shadow-xl hover:shadow-2xl overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <Link href="/dashboard/authenticator" className="absolute inset-0 z-0" />
      
      {codeData ? (
        <>
          {/* Header with Logo */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-3">
              {(() => {
                const brandInfo = getServiceInfo(codeData.service_name || codeData.issuer || "");
                if (brandInfo) {
                  return <ServiceLogo brand={brandInfo} fallbackText={codeData.service_name || "?"} size="sm" />;
                }
                return (
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-500">{(codeData.service_name || codeData.issuer || "?").slice(0, 2).toUpperCase()}</span>
                  </div>
                );
              })()}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{codeData.service_name || codeData.issuer || "Account"}</h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500">{codeData.account_name || "2FA Kodu"}</p>
              </div>
            </div>
            
            {/* Copy Button */}
            <button
              onClick={handleCopyOTP}
              className="relative z-20 p-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-zinc-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all active:scale-95"
              title="Kodu kopyala"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              )}
            </button>
          </div>
          
          {/* OTP Code */}
          <div className="text-3xl font-mono font-bold text-zinc-900 dark:text-white tracking-[0.25em] mb-3 group-hover:scale-105 transition-transform origin-left relative z-10">
            {currentOTP}
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${remainingTime <= 5 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${(remainingTime / 30) * 100}%` }}
              ></div>
            </div>
            <span className={`text-xs font-mono font-bold ${remainingTime <= 5 ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
              {remainingTime}s
            </span>
          </div>
        </>
      ) : (
        <Link href="/dashboard/authenticator" className="flex flex-col items-center justify-center py-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-sm text-zinc-500 text-center">2FA kodu ekle</p>
        </Link>
      )}
    </div>
  );
}
