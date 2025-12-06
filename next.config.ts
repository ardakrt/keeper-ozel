import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : undefined;

const remotePatterns = [
  // Supabase Storage
  ...(supabaseHostname
    ? [
      {
        protocol: "https" as const,
        hostname: supabaseHostname,
      },
    ]
    : []),
  // Google Auth / Profile Images
  {
    protocol: "https" as const,
    hostname: "lh3.googleusercontent.com",
  },
  {
    protocol: "https" as const,
    hostname: "play-lh.googleusercontent.com",
  },
  // GitHub Auth / Profile Images
  {
    protocol: "https" as const,
    hostname: "avatars.githubusercontent.com",
  },
  // Gravatar
  {
    protocol: "https" as const,
    hostname: "www.gravatar.com",
  },
  // Unavatar (Fallback)
  {
    protocol: "https" as const,
    hostname: "unavatar.io",
  },
  // Logo Services (Clearbit, Brandfetch) - Sadece güvenilir olanlar
  {
    protocol: "https" as const,
    hostname: "logo.clearbit.com",
  },
  {
    protocol: "https" as const,
    hostname: "cdn.brandfetch.io",
  },
  {
    protocol: "https" as const,
    hostname: "img.logo.dev",
  },
  {
    protocol: "https" as const,
    hostname: "cdn.simpleicons.org",
  },
  // Custom CDN
  {
    protocol: "https" as const,
    hostname: "cdn.ardakaratas.com.tr",
  },
  // Placeholder Images (Development)
  {
    protocol: "https" as const,
    hostname: "picsum.photos",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    // Olası kötü niyetli SVG yüklemelerine karşı koruma
    dangerouslyAllowSVG: false, 
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;