"use client";

import { useState, useTransition } from "react";
import { revealCard, deleteCard, updateCard } from "@/app/actions";
import { Radio } from "lucide-react";
import { toast } from "react-hot-toast";
import type { CardDisplay } from "@/types/card";
import { copyCardDetails, formatCardNumber } from "@/lib/clipboard";

const toTitleCase = (value: string | null | undefined) => {
  if (!value) return "";
  return value
    .toLocaleLowerCase("tr-TR")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1))
    .join(" ");
};

export default function CardItem({ card, onRefresh }: { card: CardDisplay; onRefresh?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [fullCardNumber, setFullCardNumber] = useState("");
  const [expiry, setExpiry] = useState(`${card.exp_month_enc ?? ""}/${card.exp_year_enc ?? ""}`);

  // Database'den gelen card_brand'i kullan
  const cardBrand = card.card_brand || "unknown";

  const onExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted = digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setExpiry(formatted);
  };

  const onCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.match(/.{1,4}/g)?.join(" ") || digits;
    setFullCardNumber(formatted);
  };

  const handleCopy = () => {
    if (!card.bt_token_id) return;
    startTransition(async () => {
      try {
        // Reveal full card details
        const fullCardNumber = await revealCard(card.bt_token_id!);

        // Create card details object for the helper
        const cardDetails = {
          last_four: card.last_four ?? "****",
          exp_month_enc: card.exp_month_enc ?? "**",
          exp_year_enc: card.exp_year_enc ?? "**",
          cvc_enc: card.cvc_enc ?? "***",
          holder_name_enc: card.holder_name_enc ?? card.label ?? "Kart Sahibi",
          fullCardNumber: fullCardNumber,
        };

        // Use the clipboard helper with full card number
        const details = `Kart No: ${fullCardNumber}\nSKT: ${cardDetails.exp_month_enc}/${cardDetails.exp_year_enc}\nCVC: ${cardDetails.cvc_enc}\nKart Sahibi: ${cardDetails.holder_name_enc}`;

        await navigator.clipboard.writeText(details);
        toast.success("Kart bilgileri kopyalandı!", {
          duration: 2000,
          position: "bottom-center",
          style: {
            background: "#10b981",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
          },
          icon: "✓",
        });
      } catch (e) {
        toast.error("Kart kopyalanamadı.", {
          duration: 2000,
          position: "bottom-center",
        });
        console.error(e);
      }
    });
  };

  const handleEditClick = () => {
    if (!card.bt_token_id) return setIsEditing(true);
    startTransition(async () => {
      try {
        const revealed = await revealCard(card.bt_token_id!);
        // Format the revealed card number with spaces
        const digits = (revealed || "").replace(/\D/g, "").slice(0, 16);
        const formatted = digits.match(/.{1,4}/g)?.join(" ") || digits;
        setFullCardNumber(formatted);
      } catch {
        setFullCardNumber("");
      } finally {
        setIsEditing(true);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (card.id) {
          formData.append("id", String(card.id));
        }
        if (card.bt_token_id) {
          formData.append("bt_token_id", card.bt_token_id);
        }
        if (!formData.has("id")) {
          throw new Error("Kart kimliği bulunamadı");
        }
        await deleteCard(formData);
        const { invalidateCache } = await import('@/components/DataPreloader');
        invalidateCache('cards');
        toast.success("Kart silindi!");
        onRefresh?.();
      } catch (error) {
        console.error("Kart silme hatası:", error);
        toast.error("Kart silinemedi.");
      }
    });
  };

  // Kart markası logosu - gerçek marka renkleriyle
  const renderCardLogo = () => {
    switch (cardBrand) {
      case "visa":
        return (
          <div className="flex flex-col items-end">
            <div className="dark:text-white light:text-[#1A1F71] font-bold text-3xl tracking-wide" style={{ fontFamily: 'Arial, sans-serif' }}>
              VISA
            </div>
          </div>
        );
      case "mastercard":
        return (
          <div className="flex items-center">
            <div className="w-11 h-11 rounded-full bg-[#EB001B]" />
            <div className="w-11 h-11 rounded-full bg-[#F79E1B] -ml-5" style={{ opacity: 0.9 }} />
          </div>
        );
      case "troy":
        return (
          <div className="flex items-center gap-1 bg-white dark:bg-white light:bg-white px-3 py-1.5 rounded shadow-md">
            <div className="w-2 h-6 bg-[#00A9CE] rounded-sm" />
            <div className="w-2 h-6 bg-[#E30613] rounded-sm" />
            <span className="text-[#003087] font-bold text-xl ml-1">troy</span>
          </div>
        );
      case "amex":
        return (
          <div className="bg-white dark:bg-white light:bg-white px-3 py-1.5 rounded shadow-md">
            <span className="text-[#006FCF] font-bold text-lg tracking-tight">AMEX</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1">
            <div className="w-10 h-10 rounded-full dark:bg-gray-500/80 light:bg-gray-300" />
            <div className="w-10 h-10 rounded-full dark:bg-gray-600/80 light:bg-gray-400 -ml-6" />
          </div>
        );
    }
  };

  // Professional Mastercard Logo Component
  const renderMastercardLogo = () => (
    <svg width="60" height="36" viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Red Circle */}
      <circle cx="18" cy="18" r="14" fill="#EB001B" />
      {/* Yellow/Orange Circle */}
      <circle cx="30" cy="18" r="14" fill="#F79E1B" />
      {/* Intersection (blend mode simulation with path) */}
      <path d="M24 4.5C27.5 7.5 30 12.5 30 18C30 23.5 27.5 28.5 24 31.5C20.5 28.5 18 23.5 18 18C18 12.5 20.5 7.5 24 4.5Z" fill="#FF5F00" />
    </svg>
  );

  return (
    <li className="group relative cursor-pointer">
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);

            // Clean card number - remove spaces and non-digits before sending
            const rawCardNumber = formData.get('card_number') as string;
            const cleanedCardNumber = rawCardNumber.replace(/\D/g, '');
            formData.set('card_number', cleanedCardNumber);

            startTransition(async () => {
              await updateCard(formData);
              setIsEditing(false);
              onRefresh?.();
            });
          }}
          className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white p-6 rounded-xl border border-white/5 dark:border-white/5 light:border-zinc-200 space-y-4 light:shadow-sm"
        >
          <input type="hidden" name="id" value={(card.id ?? "").toString()} />
          <input type="hidden" name="bt_token_id" value={card.bt_token_id ?? ""} />

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Etiket</label>
            <input
              name="label"
              type="text"
              defaultValue={card.label ?? ""}
              className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 outline-none"
              placeholder="Etiket"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Kart Sahibi</label>
            <input
              name="holder_name"
              type="text"
              defaultValue={card.holder_name_enc ?? ""}
              className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 uppercase outline-none"
              placeholder="Ad Soyad"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Kart Numarası</label>
            <input
              name="card_number"
              type="text"
              inputMode="numeric"
              value={fullCardNumber}
              onChange={onCardNumberChange}
              className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 font-mono outline-none"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500">Son K.T.</label>
              <input
                name="expiry_date"
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={onExpiryChange}
                className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 font-mono outline-none"
                placeholder="MM/YY"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-500">CVV</label>
              <input
                name="cvv"
                type="text"
                inputMode="numeric"
                defaultValue={card.cvc_enc ?? ""}
                className="bg-black/30 dark:bg-black/30 light:bg-zinc-50 border border-white/10 dark:border-white/10 light:border-zinc-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-4 py-2 text-white dark:text-white light:text-zinc-900 font-mono text-center outline-none"
                placeholder="•••"
                maxLength={3}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 bg-zinc-900 text-white hover:bg-black rounded-lg font-medium transition-colors disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
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
          <div className="absolute -top-4 right-4 z-50 flex items-center gap-1 bg-white dark:bg-white dark:text-black light:bg-zinc-900 light:text-white rounded-full shadow-xl p-1.5 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isPending}
              className="p-1.5 hover:bg-zinc-200 rounded-full transition-colors active:scale-90 disabled:opacity-50"
              title="Kart Numarasını Kopyala"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleEditClick}
              disabled={isPending}
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

        <div className="relative w-full max-w-sm h-56 rounded-2xl p-6 mx-auto overflow-hidden bg-white/5 dark:bg-white/5 light:bg-gradient-to-br light:from-zinc-50 light:to-zinc-100 backdrop-blur-lg border border-white/10 dark:border-white/10 light:border-zinc-200 transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-100 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-300 flex flex-col justify-between light:shadow-lg">

          {/* Top Row: Contactless Icon + Label & Logo */}
          <div className="flex justify-between items-start mb-4">
            {/* Contactless Icon + Card Label */}
            <div className="flex items-center gap-3">
              <Radio size={26} className="text-white/60 dark:text-white/60 light:text-zinc-400" />
              <span className="text-lg font-semibold text-white dark:text-white light:text-zinc-900">{card.label || "Kart"}</span>
            </div>
            {/* Mastercard Logo */}
            <div className="w-10">
              {cardBrand === "mastercard" ? renderMastercardLogo() : renderCardLogo()}
            </div>
          </div>

          {/* Middle Row: Card Number */}
          <div className="mb-6">
            <p className="text-2xl font-mono tracking-widest text-white dark:text-white light:text-zinc-900">
              {card.masked_card_number || `•••• •••• •••• ${card.last_four ?? "0000"}`}
            </p>
          </div>

          {/* Bottom Row: Holder & Expiry */}
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 block mb-1">Kart Sahibi</span>
              <span className="text-base font-medium text-white dark:text-white light:text-zinc-900">{toTitleCase(card.holder_name_enc) || card.label || "Kart Sahibi"}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 block mb-1">Son Kul. Tar.</span>
              <span className="text-base font-medium text-white dark:text-white light:text-zinc-900 font-mono">
                {card.exp_month_enc && card.exp_year_enc ? `${card.exp_month_enc}/${card.exp_year_enc}` : "••/••"}
              </span>
            </div>
          </div>
        </div>
        </>
      )}
    </li>
  );
}
