import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateUserPin } from "@/app/actions";

interface StepPinProps {
  onSuccess: () => void;
  variants: any;
  itemVariants: any;
}

export default function StepPin({ onSuccess, variants, itemVariants }: StepPinProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const pinRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)
  ];

  const confirmPinRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)
  ];

  const handlePinChange = (
    index: number,
    value: string,
    state: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<HTMLInputElement | null>[]
  ) => {
    if (value && !/^\d$/.test(value)) return;
    const newPin = [...state];
    newPin[index] = value;
    setState(newPin);
    if (value && index < 5) refs[index + 1].current?.focus();
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    state: string[],
    refs: React.MutableRefObject<HTMLInputElement | null>[]
  ) => {
    if (e.key === "Backspace" && !state[index] && index > 0) refs[index - 1].current?.focus();
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<HTMLInputElement | null>[]
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("").slice(0, 6);
      const newPin = Array(6).fill("");
      digits.forEach((digit, i) => { if (i < 6) newPin[i] = digit; });
      setState(newPin);
      const nextIndex = digits.length < 6 ? digits.length : 5;
      refs[nextIndex].current?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullPin = pin.join("");
    const fullConfirmPin = confirmPin.join("");

    if (fullPin.length !== 6 || fullConfirmPin.length !== 6) return;
    if (fullPin !== fullConfirmPin) {
      setError("PIN kodları eşleşmiyor.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("new_pin", fullPin);
      formData.append("confirm_pin", fullConfirmPin);
      formData.append("update_auth_password", "false"); // Just set PIN for session user

      await updateUserPin(formData);
      onSuccess();
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "PIN oluşturulamadı.");
    }
  };

  return (
    <motion.div
      key="pinCreate"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-white/5 border-4 border-zinc-300 dark:border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-zinc-900 dark:text-white" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">PIN Oluşturun</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Hesabınızı korumak için 6 haneli bir PIN belirleyin.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        {/* New PIN */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 text-center uppercase tracking-wider">Yeni PIN</label>
          <div className="flex justify-center gap-2">
            {pin.map((digit, index) => (
              <input
                key={`pin-${index}`}
                ref={pinRefs[index]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value, pin, setPin, pinRefs)}
                onKeyDown={(e) => handlePinKeyDown(index, e, pin, pinRefs)}
                onPaste={(e) => handlePaste(e, setPin, pinRefs)}
                className="w-10 h-14 bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white text-center text-2xl font-bold rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-zinc-50 dark:focus:bg-white/10 transition-all"
              />
            ))}
          </div>
        </div>

        {/* Confirm PIN */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 text-center uppercase tracking-wider">PIN Tekrar</label>
          <div className="flex justify-center gap-2">
            {confirmPin.map((digit, index) => (
              <input
                key={`confirm-${index}`}
                ref={confirmPinRefs[index]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value, confirmPin, setConfirmPin, confirmPinRefs)}
                onKeyDown={(e) => handlePinKeyDown(index, e, confirmPin, confirmPinRefs)}
                onPaste={(e) => handlePaste(e, setConfirmPin, confirmPinRefs)}
                className="w-10 h-14 bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white text-center text-2xl font-bold rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-zinc-50 dark:focus:bg-white/10 transition-all"
              />
            ))}
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </motion.div>
      )}

      <motion.button
        variants={itemVariants}
        onClick={handleSubmit}
        disabled={status === "loading" || pin.join("").length !== 6 || confirmPin.join("").length !== 6}
        className="w-full h-12 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {status === "loading" ? "Kaydediliyor..." : "PIN Oluştur ve Tamamla"}
      </motion.button>
    </motion.div>
  );
}