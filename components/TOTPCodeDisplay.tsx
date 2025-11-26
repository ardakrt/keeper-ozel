"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { generateTOTP, getRemainingSeconds } from "@/lib/totp";
import { copyToClipboard } from "@/lib/clipboard";
import { getServiceInfo } from "@/lib/serviceIcons";
import ServiceLogo from "@/components/finance/ServiceLogo";

interface TOTPCodeDisplayProps {
  secret: string;
  serviceName: string;
  accountName?: string | null;
  issuer?: string | null;
  algorithm?: string;
  digits?: number;
  period?: number;
  iconUrl?: string | null;
  color?: string | null;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export default function TOTPCodeDisplay({
  secret,
  serviceName,
  accountName,
  issuer,
  algorithm = "SHA1",
  digits = 6,
  period = 30,
  iconUrl,
  color,
  onDelete,
  isDeleting = false,
}: TOTPCodeDisplayProps) {
  const [code, setCode] = useState<string>("");
  const [remaining, setRemaining] = useState<number>(30);
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Generate code and update countdown
  useEffect(() => {
    const updateCode = () => {
      try {
        const newCode = generateTOTP(secret, {
          algorithm: algorithm as "SHA1" | "SHA256" | "SHA512",
          digits,
          period,
        });
        setCode(newCode);
      } catch (error) {
        console.error("Failed to generate TOTP:", error);
        setCode("ERROR");
      }
    };

    const updateCountdown = () => {
      const remaining = getRemainingSeconds(period);

      // Detect reset (when we go from 1 back to period)
      if (remaining === period && !isResetting) {
        setIsResetting(true);
        updateCode();
        setTimeout(() => setIsResetting(false), 100);
      }

      setRemaining(remaining);
    };

    // Initial generation
    updateCode();
    updateCountdown();

    // Update every second
    const interval = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [secret, algorithm, digits, period]);

  const handleCopy = () => {
    copyToClipboard(code, "2FA kodu kopyalandı!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = issuer || serviceName;
  const displayAccount = accountName || "";

  // Get brand info using the new system
  // Note: getServiceInfo returns BrandInfo | null
  const brandInfo = getServiceInfo(displayName);

  // Progress percentage for countdown
  const progressPercentage = (remaining / period) * 100;

  // Calculate circular progress (SVG strokeDashoffset)
  const circumference = 2 * Math.PI * 24; // radius = 24
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Get progress color based on remaining time
  const getProgressColor = () => {
    if (remaining <= 5) return '#ef4444'; // red-500
    if (remaining <= 10) return '#f97316'; // orange-500
    return '#10b981'; // emerald-500
  };

  return (
    <div className="group relative">
      <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] hover:border-zinc-300 dark:hover:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.05] rounded-xl p-3 relative transition-all overflow-hidden shadow-sm dark:shadow-none">

        <div className="flex items-center justify-between">
          {/* Left: Service Info */}
          <div className="flex items-center gap-4">
            {/* Icon with circular progress */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Circular progress SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                {/* Background circle */}
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-zinc-200 dark:text-white/5"
                />
                {/* Progress circle */}
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke={getProgressColor()}
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all"
                  style={{
                    transitionDuration: isResetting ? '200ms' : '1000ms',
                    transitionTimingFunction: isResetting ? 'ease-out' : 'linear',
                    transitionProperty: 'stroke-dashoffset, stroke',
                  }}
                />
              </svg>

              {/* Icon in center - using ServiceLogo */}
              <div className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full overflow-hidden">
                 <ServiceLogo 
                    brand={brandInfo} 
                    fallbackText={displayName} 
                    size="md" 
                    className="w-10 h-10 !rounded-full !text-xs" // Override styles for circular container
                 />
              </div>
            </div>

            {/* Service name and account */}
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                {displayName}
              </h3>
              {displayAccount && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {displayAccount}
                </p>
              )}
            </div>
          </div>

          {/* Right: Code and Countdown */}
          <div className="flex items-center gap-4">
            {/* TOTP Code */}
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-white tracking-wider">
                {code.slice(0, 3)} {code.slice(3)}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-500">
                {remaining}s
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 transition-all"
                title="Kopyala"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                )}
              </button>

              {/* Delete Button */}
              {onDelete && (
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
