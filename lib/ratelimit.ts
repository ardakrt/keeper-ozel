import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Redis client'ını sadece env değişkenleri varsa oluştur
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiter oluştur (Redis varsa)
// Kural: 1 dakikada 5 istek (IP başına)
export const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

/**
 * Verilen anahtar (IP veya UserID) için limit kontrolü yapar.
 * Limit aşıldıysa hata fırlatır.
 * Redis yoksa (local dev ortamı gibi) her zaman izin verir.
 */
export async function checkRateLimit(identifier: string) {
  if (!ratelimit) {
    // Redis yapılandırılmamışsa rate limit'i atla (Fail-open)
    return;
  }

  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    throw new Error("Çok fazla deneme yaptınız. Lütfen 1 dakika bekleyip tekrar deneyin.");
  }
}
