/**
 * Google Authenticator Migration Parser
 * Parses otpauth-migration:// URIs from Google Authenticator export
 */

// Google Authenticator Migration Payload structure
interface MigrationPayload {
  otp_parameters?: OtpParameters[];
  version?: number;
  batch_size?: number;
  batch_index?: number;
  batch_id?: number;
}

interface OtpParameters {
  secret?: Uint8Array;
  name?: string;
  issuer?: string;
  algorithm?: number; // 0=unspecified, 1=SHA1, 2=SHA256, 3=SHA512, 4=MD5
  digits?: number; // 0=unspecified, 1=6, 2=8
  type?: number; // 0=unspecified, 1=HOTP, 2=TOTP
  counter?: number;
}

/**
 * Convert base32 string to Uint8Array
 */
function base32ToBytes(base32: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";

  for (let i = 0; i < base32.length; i++) {
    const char = base32[i].toUpperCase();
    if (char === "=") break;
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }

  return bytes;
}

/**
 * Convert Uint8Array to base32 string
 */
function bytesToBase32(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let result = "";

  for (let i = 0; i < bytes.length; i++) {
    bits += bytes[i].toString(2).padStart(8, "0");
  }

  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substr(i, 5).padEnd(5, "0");
    result += alphabet[parseInt(chunk, 2)];
  }

  // Add padding
  while (result.length % 8 !== 0) {
    result += "=";
  }

  return result;
}

/**
 * Decode Google Authenticator migration URI
 */
export function parseGoogleAuthMigration(uri: string): Array<{
  serviceName: string;
  accountName: string;
  secret: string;
  issuer?: string;
  algorithm: "SHA1" | "SHA256" | "SHA512";
  digits: number;
  type: "TOTP" | "HOTP";
}> | null {
  try {
    console.log("Parsing Google Auth Migration URI:", uri.substring(0, 100));

    // Extract the data parameter
    const url = new URL(uri);
    const dataParam = url.searchParams.get("data");

    if (!dataParam) {
      console.error("No data parameter found");
      return null;
    }

    console.log("Data parameter:", dataParam.substring(0, 50));

    // Decode base64
    const decoded = atob(decodeURIComponent(dataParam));
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }

    console.log("Decoded bytes length:", bytes.length);

    // Parse protobuf manually (simple parser for this specific format)
    const payload = parseProtobuf(bytes);

    console.log("Parsed payload:", payload);

    if (!payload.otp_parameters || payload.otp_parameters.length === 0) {
      console.error("No OTP parameters found");
      return null;
    }

    // Convert to our format
    const results = payload.otp_parameters.map((param) => {
      const secret = param.secret ? bytesToBase32(param.secret) : "";
      const name = param.name || "";
      const issuer = param.issuer || "";

      // Parse name (format: "Issuer:account" or just "account")
      const nameParts = name.split(":");
      const accountName = nameParts.length > 1 ? nameParts[1] : name;
      const nameIssuer = nameParts.length > 1 ? nameParts[0] : "";

      // Algorithm mapping: 0=unspecified/SHA1, 1=SHA1, 2=SHA256, 3=SHA512
      let algorithm: "SHA1" | "SHA256" | "SHA512" = "SHA1";
      if (param.algorithm === 2) algorithm = "SHA256";
      else if (param.algorithm === 3) algorithm = "SHA512";

      // Digits mapping: 0=unspecified/6, 1=6, 2=8
      const digits = param.digits === 2 ? 8 : 6;

      // Type mapping: 0=unspecified/TOTP, 1=HOTP, 2=TOTP
      const type = param.type === 1 ? "HOTP" : "TOTP";

      return {
        serviceName: issuer || nameIssuer || accountName.split("@")[0] || "Unknown",
        accountName,
        secret,
        issuer: issuer || nameIssuer,
        algorithm,
        digits,
        type: type as "TOTP" | "HOTP",
      };
    });

    console.log("Parsed results:", results);
    return results;
  } catch (error) {
    console.error("Failed to parse Google Auth migration:", error);
    return null;
  }
}

/**
 * Simple protobuf parser for Google Authenticator migration format
 * This is a minimal implementation that works for this specific format
 */
function parseProtobuf(bytes: Uint8Array): MigrationPayload {
  const payload: MigrationPayload = {
    otp_parameters: [],
  };

  let i = 0;

  while (i < bytes.length) {
    // Read field number and wire type
    const key = bytes[i++];
    const fieldNumber = key >> 3;
    const wireType = key & 0x07;

    if (fieldNumber === 1 && wireType === 2) {
      // otp_parameters (repeated, length-delimited)
      const length = readVarint(bytes, i);
      i += varintLength(bytes, i);

      const paramBytes = bytes.slice(i, i + length);
      const param = parseOtpParameter(paramBytes);
      payload.otp_parameters?.push(param);

      i += length;
    } else if (fieldNumber === 2 && wireType === 0) {
      // version (varint)
      payload.version = readVarint(bytes, i);
      i += varintLength(bytes, i);
    } else if (fieldNumber === 3 && wireType === 0) {
      // batch_size (varint)
      payload.batch_size = readVarint(bytes, i);
      i += varintLength(bytes, i);
    } else if (fieldNumber === 4 && wireType === 0) {
      // batch_index (varint)
      payload.batch_index = readVarint(bytes, i);
      i += varintLength(bytes, i);
    } else if (fieldNumber === 5 && wireType === 0) {
      // batch_id (varint)
      payload.batch_id = readVarint(bytes, i);
      i += varintLength(bytes, i);
    } else {
      // Skip unknown field
      i++;
    }
  }

  return payload;
}

function parseOtpParameter(bytes: Uint8Array): OtpParameters {
  const param: OtpParameters = {};
  let i = 0;

  while (i < bytes.length) {
    const key = bytes[i++];
    const fieldNumber = key >> 3;
    const wireType = key & 0x07;

    if (fieldNumber === 1 && wireType === 2) {
      // secret (bytes)
      const length = readVarint(bytes, i);
      i += varintLength(bytes, i);
      param.secret = bytes.slice(i, i + length);
      i += length;
    } else if (fieldNumber === 2 && wireType === 2) {
      // name (string)
      const length = readVarint(bytes, i);
      i += varintLength(bytes, i);
      param.name = new TextDecoder().decode(bytes.slice(i, i + length));
      i += length;
    } else if (fieldNumber === 3 && wireType === 2) {
      // issuer (string)
      const length = readVarint(bytes, i);
      i += varintLength(bytes, i);
      param.issuer = new TextDecoder().decode(bytes.slice(i, i + length));
      i += length;
    } else if (fieldNumber === 4 && wireType === 0) {
      // algorithm (enum)
      param.algorithm = readVarint(bytes, i);
      i += varintLength(bytes, i);
    } else if (fieldNumber === 5 && wireType === 0) {
      // digits (enum)
      param.digits = readVarint(bytes, i);
      i += varintLength(bytes, i);
    } else if (fieldNumber === 6 && wireType === 0) {
      // type (enum)
      param.type = readVarint(bytes, i);
      i += varintLength(bytes, i);
    } else if (fieldNumber === 7 && wireType === 0) {
      // counter (int64)
      param.counter = readVarint(bytes, i);
      i += varintLength(bytes, i);
    } else {
      // Skip unknown field
      i++;
    }
  }

  return param;
}

function readVarint(bytes: Uint8Array, offset: number): number {
  let result = 0;
  let shift = 0;
  let i = offset;

  while (i < bytes.length) {
    const byte = bytes[i];
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
    i++;
  }

  return result;
}

function varintLength(bytes: Uint8Array, offset: number): number {
  let length = 0;
  let i = offset;

  while (i < bytes.length) {
    length++;
    if ((bytes[i] & 0x80) === 0) break;
    i++;
  }

  return length;
}
