import { toast } from "react-hot-toast";

/**
 * Copy text to clipboard with visual feedback
 * @param text - Text to copy
 * @param message - Success message to show
 */
export async function copyToClipboard(text: string, message: string = "Kopyalandı!") {
  try {
    await navigator.clipboard.writeText(text);

    toast.success(message, {
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

    return true;
  } catch (error) {
    toast.error("Kopyalama başarısız", {
      duration: 2000,
      position: "bottom-center",
      style: {
        background: "#ef4444",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "500",
      },
    });

    return false;
  }
}

/**
 * Format card number for display
 * @param lastFour - Last 4 digits of card
 */
export function formatCardNumber(lastFour: string | null): string {
  if (!lastFour) return "•••• •••• •••• ••••";
  return `•••• •••• •••• ${lastFour}`;
}

/**
 * Format IBAN for display (with spaces every 4 characters)
 * @param iban - IBAN string
 */
export function formatIBAN(iban: string | null): string {
  if (!iban) return "";
  // Remove all spaces first
  const cleanIban = iban.replace(/\s/g, "");
  // Add space every 4 characters
  return cleanIban.match(/.{1,4}/g)?.join(" ") || cleanIban;
}

/**
 * Copy formatted card details
 * @param card - Card object
 */
export async function copyCardDetails(card: any) {
  const cardNumber = formatCardNumber(card.last_four);
  const expiry = `${card.exp_month_enc}/${card.exp_year_enc}`;
  const details = `Kart No: ${cardNumber}\nSKT: ${expiry}\nCVC: ${card.cvc_enc}\nKart Sahibi: ${card.holder_name_enc}`;

  return copyToClipboard(details, "Kart bilgileri kopyalandı!");
}

/**
 * Copy formatted IBAN
 * @param iban - IBAN string
 */
export async function copyFormattedIBAN(iban: string) {
  // Remove spaces for copying
  const cleanIban = iban.replace(/\s/g, "");
  return copyToClipboard(cleanIban, "IBAN kopyalandı!");
}

/**
 * Copy account credentials
 * @param account - Account object
 */
export async function copyAccountCredentials(account: any) {
  const details = `Servis: ${account.service}\nKullanıcı Adı: ${account.username_enc}\nŞifre: ${account.password_enc}`;
  return copyToClipboard(details, "Hesap bilgileri kopyalandı!");
}
