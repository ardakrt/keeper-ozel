"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    sessionStorage.removeItem("pinVerified");
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (!error) {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="mt-4 border px-4 py-2 rounded disabled:opacity-50"
    >
      Çıkış Yap
    </button>
  );
}
