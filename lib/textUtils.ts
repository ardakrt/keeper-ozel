import DOMPurify from 'isomorphic-dompurify';

/**
 * HTML etiketlerini ve entity'leri temizleyerek düz metin döndürür
 * Güvenlik: isomorphic-dompurify kullanarak XSS koruması sağlar
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  // Configure DOMPurify to strip all tags
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

/**
 * Metni belirtilen karakterde keser ve sonuna '...' ekler
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text;

  // Kelimenin ortasında kesmeyi önlemek için en yakın boşluğa geri dön
  let truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    truncated = truncated.substring(0, lastSpace);
  }

  return truncated + '...';
}

/**
 * HTML içeriğinden ilk satırı başlık olarak çıkarır
 */
export function extractTitleFromHtml(html: string): string {
  if (!html) return '(Başlıksız)';

  const plainText = stripHtml(html);

  // İlk satırı veya ilk 50 karakteri başlık yap
  const firstLine = plainText.split('\n')[0] || plainText;
  return truncateText(firstLine, 50);
}

/**
 * Saate göre selamlama mesajı döndürür
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Günaydın";
  if (hour >= 12 && hour < 18) return "İyi Günler";
  if (hour >= 18 && hour < 22) return "İyi Akşamlar";
  return "İyi Geceler";
}