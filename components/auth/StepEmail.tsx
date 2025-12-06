import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface StepEmailProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPushLogin: () => void;
  loading: boolean;
  error: string | null;
  variants: any;
  itemVariants: any;
}

export default function StepEmail({
  email,
  onEmailChange,
  onSubmit,
  onPushLogin,
  loading,
  error,
  variants,
  itemVariants
}: StepEmailProps) {
  return (
    <motion.form
      key="emailInput"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={onSubmit}
      className="space-y-8"
    >
      {/* Başlık */}
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Keeper<span className="text-emerald-500 dark:text-emerald-500">.</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium mt-2">Hesabınıza erişmek için giriş yapın</p>
      </motion.div>

      {/* E-posta Input */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label htmlFor="email" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1 uppercase tracking-wider">E-posta Adresi</label>
        <div className="relative group">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 6l8 6 8-6M4 6v12h16V6" />
            </svg>
          </span>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="ornek@email.com"
            className="w-full h-12 pl-12 bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white rounded-xl placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:bg-zinc-50 dark:focus:bg-white/10 transition-all duration-300"
            required
          />
        </div>
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </motion.div>
      )}

      {/* Devam Et Butonu */}
      <motion.button
        variants={itemVariants}
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? "Yükleniyor..." : "Devam Et"}
      </motion.button>

      {/* OR Divider */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-300 dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500 dark:text-zinc-400">
            veya
          </span>
        </div>
      </motion.div>

      {/* Push to Login Button */}
      <motion.button
        variants={itemVariants}
        type="button"
        onClick={onPushLogin}
        disabled={loading || !email}
        className="w-full h-12 rounded-xl font-bold text-sm tracking-wide bg-transparent border-2 border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Mobil Onay ile Giriş
      </motion.button>
    </motion.form>
  );
}
