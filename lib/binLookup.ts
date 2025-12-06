type BinData = {
  bankName: string;
  cardBrand: "Visa" | "MasterCard" | "Troy" | "Amex" | "CUP" | string;
  cardProgram: string | null;
  cardType: string;
  cvvRequired: boolean;
  installment: boolean;
  countryCode: string;
  cardLength: number;
  cardBrandIcon: string;
  cardProgramIcon: string | null;
};

let binListCache: Record<string, BinData> | null = null;

export async function loadBinList(): Promise<Record<string, BinData>> {
  if (binListCache) {
    return binListCache;
  }

  try {
    const response = await fetch("https://pay.enuygun.com/api/v2/binlist.js");
    const text = await response.text();

    // JavaScript dosyasından binlist objesini çıkar
    // Format: var binlist = { ... };
    const startIndex = text.indexOf("{");
    const endIndex = text.lastIndexOf("}");

    if (startIndex !== -1 && endIndex !== -1) {
      const jsonStr = text.substring(startIndex, endIndex + 1);
      binListCache = JSON.parse(jsonStr);
      return binListCache!;
    } else {
      console.error("Could not find JSON in BIN list response");
    }
  } catch (error) {
    console.error("BIN list yüklenemedi:", error);
  }

  return {};
}

export async function getBinInfo(cardNumber: string): Promise<BinData | null> {
  if (!cardNumber || cardNumber.length < 6) {
    return null;
  }

  const bin = cardNumber.substring(0, 6);
  const binList = await loadBinList();

  const result = binList[bin];

  if (!result) {
    console.error("BIN not found in database");
  }

  return result || null;
}

// Fallback: Kart numarasının ilk hanesine göre marka tahmin et
export function detectBrandFromCardNumber(cardNumber: string): "visa" | "mastercard" | "troy" | "amex" | "unknown" {
  if (!cardNumber || cardNumber.length < 1) return "unknown";

  const firstDigit = cardNumber[0];
  const firstTwoDigits = cardNumber.substring(0, 2);

  // Visa: 4 ile başlar
  if (firstDigit === "4") return "visa";

  // Mastercard: 51-55 veya 2221-2720 ile başlar
  if (firstDigit === "5" && ["1", "2", "3", "4", "5"].includes(cardNumber[1])) return "mastercard";
  if (firstTwoDigits === "22" || firstTwoDigits === "27") return "mastercard";

  // American Express: 34 veya 37 ile başlar
  if (firstTwoDigits === "34" || firstTwoDigits === "37") return "amex";

  // Troy: 9792 ile başlar (Türkiye'ye özel)
  if (cardNumber.substring(0, 4) === "9792") return "troy";

  return "unknown";
}

export function getCardBrandFromBin(binInfo: BinData | null, cardNumber?: string): "visa" | "mastercard" | "troy" | "amex" | "unknown" {
  if (!binInfo) {
    // BIN bulunamadıysa fallback kullan
    if (cardNumber) {
      const fallbackBrand = detectBrandFromCardNumber(cardNumber);
      return fallbackBrand;
    }
    return "unknown";
  }

  const brand = binInfo.cardBrand.toLowerCase();

  if (brand.includes("visa")) return "visa";
  if (brand.includes("master")) return "mastercard";
  if (brand.includes("troy")) return "troy";
  if (brand.includes("amex") || brand.includes("american express")) return "amex";
  return "unknown";
}
