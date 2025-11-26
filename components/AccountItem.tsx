"use client";

import { useState, useTransition } from "react";
import { revealPassword, deleteAccount, updateAccount } from "@/app/actions";
import { toast } from "react-hot-toast";

type Account = {
  id?: string | number;
  uuid?: string;
  service_name?: string | null;
  service?: string | null;
  username?: string | null;
  username_enc?: string | null;
  bt_token_id_password?: string | null;
};

export default function AccountItem({ account, onRefresh }: { account: Account; onRefresh?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  const handleCopyPassword = () => {
    if (!account.bt_token_id_password) return;
    startTransition(async () => {
      try {
        const full = await revealPassword(account.bt_token_id_password!);
        await navigator.clipboard.writeText(full);
        toast.success("Parola kopyalandı!");
      } catch (e) {
        console.error(e);
        toast.error("Parola kopyalanamadı.");
      }
    });
  };

  const handleCopyEmail = () => {
    const email = (account.username ?? account.username_enc ?? "").toString();
    if (!email) return;
    navigator.clipboard.writeText(email);
    toast.success("E-posta kopyalandı!");
  };

  const handleCopyEmailPassword = () => {
    if (!account.bt_token_id_password) return;
    startTransition(async () => {
      try {
        const password = await revealPassword(account.bt_token_id_password!);
        const email = (account.username ?? account.username_enc ?? "").toString();
        const combined = `${email}:${password}`;
        await navigator.clipboard.writeText(combined);
        toast.success("E-posta:Parola kopyalandı!");
      } catch (e) {
        console.error(e);
        toast.error("Kopyalama başarısız.");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        const identifier = account.uuid ?? account.id;
        if (!identifier) {
          throw new Error("Hesap kimliği bulunamadı");
        }
        formData.append(account.uuid ? "uuid" : "id", identifier.toString());
        if (account.bt_token_id_password) {
          formData.append("bt_token_id_password", account.bt_token_id_password);
        }
        await deleteAccount(formData);
        toast.success("Hesap silindi!");
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Hesap silme hatası:", error);
        toast.error("Hesap silinemedi.");
      }
    });
  };

  return (
    <li className="group relative">
      {isEditing ? (
        <form
          action={(formData) => {
            startTransition(async () => {
              await updateAccount(formData as FormData);
              setIsEditing(false);
              if (onRefresh) {
                onRefresh();
              }
            });
          }}
          className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white p-6 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-200 space-y-4 light:shadow-sm"
        >
          <input type="hidden" name="uuid" value={(account.uuid ?? account.id ?? "").toString()} />
          <input type="hidden" name="bt_token_id_password" value={account.bt_token_id_password ?? ""} />

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Hizmet Adı</label>
            <input
              name="service_name"
              type="text"
              defaultValue={account.service_name ?? account.service ?? ""}
              className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 outline-none"
              placeholder="Hizmet adı"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Kullanıcı Adı / E-posta</label>
            <input
              name="username"
              type="text"
              defaultValue={account.username ?? account.username_enc ?? ""}
              className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 outline-none"
              placeholder="Kullanıcı adı"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Yeni Parola (opsiyonel)</label>
            <input
              name="password"
              type="password"
              className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 outline-none"
              placeholder="Parola değiştirilecekse doldurun"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 bg-blue-600 rounded-lg text-white dark:text-white light:text-zinc-900 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 rounded-lg text-white dark:text-white light:text-zinc-900 dark:text-white dark:text-white light:text-zinc-900 light:text-zinc-900 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-zinc-300 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Action Buttons - Floating Bubble Above Card */}
          <div className="absolute -top-3 right-4 z-50 flex items-center gap-1 bg-white dark:bg-white dark:text-black light:bg-zinc-900 light:text-white rounded-full shadow-xl p-1.5 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out">
            <button
              type="button"
              onClick={handleCopyEmailPassword}
              disabled={isPending}
              className="p-1.5 hover:bg-zinc-200 rounded-full transition-colors active:scale-90 disabled:opacity-50"
              title="E-posta:Parola Kopyala"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-zinc-200 rounded-full transition-colors active:scale-90"
              title="Düzenle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="p-1.5 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors active:scale-90 disabled:opacity-50"
              title="Sil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Card Content - Glass Design in Dark, Solid in Light */}
          <div className="bg-white/[0.02] dark:bg-white/[0.02] light:bg-white border border-white/[0.05] dark:border-white/[0.05] light:border-zinc-200 hover:border-white/[0.1] dark:hover:border-white/[0.1] light:hover:border-zinc-300 hover:bg-white/[0.05] dark:hover:bg-white/[0.05] light:hover:bg-zinc-50/50 rounded-xl p-6 relative transition-all overflow-hidden light:shadow-sm light:hover:shadow-md">

            {/* Service Icon and Name */}
            <div className="flex items-start gap-3 mb-5 relative z-10">
              <div className="p-2.5 bg-blue-600/10 dark:bg-blue-600/10 light:bg-zinc-100 rounded-xl flex-shrink-0 border border-transparent light:border-zinc-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 dark:text-blue-400 light:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-lg font-bold text-white dark:text-white light:text-zinc-900 truncate tracking-tight">
                  {account.service_name ?? account.service ?? "(Hizmet)"}
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-0.5 font-medium">Hesap Bilgileri</p>
              </div>
            </div>

            {/* Email/Username Section */}
            <div className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/5 dark:border-white/5 light:border-zinc-200 rounded-lg p-3.5 mb-3 relative z-10 group/field">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 uppercase tracking-wider font-bold">E-POSTA / KULLANICI ADI</p>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 rounded-md transition-all active:scale-95 opacity-0 group-hover/field:opacity-100"
                  title="E-postayı Kopyala"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 light:text-zinc-500 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
              </div>
              <p className="text-zinc-200 dark:text-zinc-200 light:text-zinc-900 text-sm leading-relaxed break-all font-medium pl-0.5">
                {account.username ?? account.username_enc ?? "—"}
              </p>
            </div>

            {/* Password Section */}
            <div className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/5 dark:border-white/5 light:border-zinc-200 rounded-lg p-3.5 relative z-10 group/field">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 uppercase tracking-wider font-bold">PAROLA</p>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  disabled={isPending}
                  className="p-1.5 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 rounded-md transition-all active:scale-95 disabled:opacity-50 opacity-0 group-hover/field:opacity-100"
                  title="Parolayı Kopyala"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 light:text-zinc-500 hover:text-zinc-200 dark:hover:text-zinc-200 light:hover:text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
              </div>
              <p className="text-zinc-200 dark:text-zinc-200 light:text-zinc-900 text-sm font-mono tracking-wider font-semibold pl-0.5">••••••••••••</p>
            </div>
          </div>
        </>
      )}
    </li>
  );
}
