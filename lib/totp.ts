import * as OTPAuth from "otpauth";

/**
 * Generate TOTP code from secret
 */
export function generateTOTP(
  secret: string,
  options: {
    algorithm?: "SHA1" | "SHA256" | "SHA512";
    digits?: number;
    period?: number;
  } = {}
): string {
  const { algorithm = "SHA1", digits = 6, period = 30 } = options;

  const totp = new OTPAuth.TOTP({
    issuer: "Keeper",
    label: "Account",
    algorithm,
    digits,
    period,
    secret,
  });

  return totp.generate();
}

/**
 * Get remaining seconds until next code
 */
export function getRemainingSeconds(period: number = 30): number {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

/**
 * Parse OTP Auth URI (from QR codes)
 * Format: otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google
 */
export function parseOTPAuthURI(uri: string): {
  type: string;
  issuer: string;
  account: string;
  secret: string;
  algorithm?: string;
  digits?: number;
  period?: number;
} | null {
  try {
    console.log("Parsing URI:", uri);

    // Handle URL encoding issues
    let cleanUri = uri.trim();

    // Try to parse as URL
    const url = new URL(cleanUri);

    console.log("Protocol:", url.protocol);
    console.log("Host:", url.host);
    console.log("Pathname:", url.pathname);
    console.log("Search params:", url.searchParams.toString());

    if (url.protocol !== "otpauth:") {
      console.error("Invalid protocol:", url.protocol);
      return null;
    }

    const type = url.host; // totp or hotp

    // Parse the path (format: /issuer:account or /account)
    let pathParts = url.pathname.slice(1).split(":");

    // Handle empty path
    if (!pathParts[0]) {
      console.error("Empty path in URI");
      return null;
    }

    let issuer = "";
    let account = "";

    if (pathParts.length > 1) {
      // Format: /issuer:account
      issuer = decodeURIComponent(pathParts[0]);
      account = decodeURIComponent(pathParts.slice(1).join(":"));
    } else {
      // Format: /account (no issuer in path)
      account = decodeURIComponent(pathParts[0]);
    }

    console.log("Extracted issuer:", issuer);
    console.log("Extracted account:", account);

    const secret = url.searchParams.get("secret");
    if (!secret) {
      console.error("No secret found in URI");
      return null;
    }

    console.log("Secret found:", secret.substring(0, 4) + "...");

    const algorithm = url.searchParams.get("algorithm") || "SHA1";
    const digits = parseInt(url.searchParams.get("digits") || "6");
    const period = parseInt(url.searchParams.get("period") || "30");

    // issuer parameter takes precedence over path issuer
    const finalIssuer = url.searchParams.get("issuer") || issuer || account.split("@")[0];

    const result = {
      type,
      issuer: finalIssuer,
      account,
      secret,
      algorithm: algorithm as "SHA1" | "SHA256" | "SHA512",
      digits,
      period,
    };

    console.log("Parse result:", result);
    return result;
  } catch (error) {
    console.error("Failed to parse OTP Auth URI:", error);
    console.error("URI was:", uri);
    return null;
  }
}

/**
 * Validate secret key format
 */
export function isValidSecret(secret: string): boolean {
  // Base32 alphabet
  const base32Regex = /^[A-Z2-7]+=*$/;
  return base32Regex.test(secret) && secret.length >= 16;
}

/**
 * Format secret for display (add spaces every 4 chars)
 */
export function formatSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") || secret;
}

/**
 * Generate QR code data URL for manual setup
 */
export function generateOTPAuthURI(
  issuer: string,
  account: string,
  secret: string,
  options: {
    algorithm?: string;
    digits?: number;
    period?: number;
  } = {}
): string {
  const { algorithm = "SHA1", digits = 6, period = 30 } = options;

  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm,
    digits: digits.toString(),
    period: period.toString(),
  });

  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?${params}`;
}
