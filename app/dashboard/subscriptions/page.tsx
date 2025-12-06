"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Subscription, enrichSubscription } from "@/types/finance";
import SubscriptionCard from "@/components/finance/SubscriptionCard";
import AddFinanceModal from "@/components/finance/AddFinanceModal";
import AddLoanModal from "@/components/finance/AddLoanModal";
import { CreditCard, AlertCircle, X } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

type TabType = "subscriptions" | "loans";

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("subscriptions");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"list" | "create">("list");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const supabase = createBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter data based on active tab
  const filteredData = useMemo(() => {
    const filtered = subscriptions.filter((item) =>
      activeTab === "subscriptions" ? item.type === "subscription" : item.type === "loan"
    );
    return filtered.map(enrichSubscription);
  }, [activeTab, subscriptions]);

  // Search filter
  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return filteredData;
    const query = searchQuery.toLowerCase();
    return filteredData.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      (item.linked_card_details && item.linked_card_details.toLowerCase().includes(query))
    );
  }, [filteredData, searchQuery]);

  const getAddButtonText = () => {
    return activeTab === "subscriptions" ? "Yeni Abonelik Ekle" : "Yeni Kredi Ekle";
  };

  // Handle URL actions
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new-subscription') {
      setActiveTab('subscriptions');
      setCurrentView('create');
    } else if (action === 'new-loan') {
      setActiveTab('loans');
      setCurrentView('create');
    }
  }, [searchParams]);

  // Load subscriptions from database
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading subscriptions:", error);
    } else if (data) {
      setSubscriptions(data as Subscription[]);
    }
    setIsLoading(false);
  };

  const handleAddNew = () => {
    setCurrentView("create");
    // Scroll to top when opening modal
    const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setEditingItem(null);
  };

  const handleSuccess = async () => {
    await loadSubscriptions();
    setCurrentView("list");
    setEditingItem(null);
  };

  const openDeleteModal = (item: any) => {
    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", deletingItem.id);

      if (error) throw error;

      // Close modal and reload
      setDeletingItem(null);
      await loadSubscriptions();
    } catch (error: any) {
      console.error("Delete Error:", error);
      alert("Silme işlemi başarısız: " + error.message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setCurrentView("create");
    // Scroll to top when opening modal
    const scrollContainer = document.querySelector('.flex-1.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-full pt-6">
      <div className="w-full h-full transition-all duration-500 ease-in-out">
        <div className="w-full min-h-[750px] rounded-3xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-black/20 dark:bg-black/20 light:bg-white/90 backdrop-blur-sm overflow-hidden light:shadow-x1">
          <div className="p-8 space-y-6">
            {/* Header Section - Top Row */}
            <div className="relative flex items-center justify-center gap-4">
              {/* Title - Absolute Left */}
              <h1 className="absolute left-0 text-2xl font-bold text-white dark:text-white light:text-zinc-900">
                Harcama Takibi
              </h1>

              {/* Search Bar - Abonelik veya Kredi Ara */}
              <div className="flex justify-center w-full max-w-md">
                <div className="relative w-full group">

                  {/* İKON (z-10 ile öne alındı) */}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-focus-within:text-emerald-500 transition-colors duration-300"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>

                  {/* INPUT */}
                  <input
                    type="search"
                    placeholder="Abonelik veya kredi ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
        w-full h-12 
        /* Light Mode: Açık gri zemin */
        bg-zinc-100 hover:bg-zinc-200/50
        /* Dark Mode: Şeffaf koyu zemin */
        dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60
        
        backdrop-blur-xl 
        border border-transparent dark:border-white/10 
        
        /* Focus Efektleri */
        focus:bg-white dark:focus:bg-zinc-900/80
        focus:border-emerald-500/30
        focus:ring-4 focus:ring-emerald-500/10 
        
        rounded-2xl 
        pl-11 pr-4 
        
        text-sm text-zinc-800 dark:text-zinc-200 
        placeholder:text-zinc-400 dark:placeholder:text-zinc-500
        
        transition-all duration-300 ease-out
        outline-none 
        shadow-sm hover:shadow-md
      "
                  />
                </div>
              </div>

              {/* Action Button - Absolute Right */}
              {currentView === 'create' ? (
                <button
                  onClick={handleBackToList}
                  className="absolute right-0 bg-white/5 dark:bg-white/5 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200 border border-white/10 dark:border-white/10 light:border-zinc-300 hover:border-white/20 dark:hover:border-white/20 light:hover:border-zinc-400 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Listeye Dön
                </button>
              ) : (
                <button
                  onClick={handleAddNew}
                  className="absolute right-0 bg-white dark:bg-white light:bg-zinc-900 text-black dark:text-black light:text-white hover:bg-zinc-200 dark:hover:bg-zinc-200 light:hover:bg-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {getAddButtonText()}
                </button>
              )}
            </div>

            {/* Tabs Row */}
            <div className="flex justify-center md:justify-start">
              <div className="bg-white/5 dark:bg-white/5 light:bg-zinc-100 border border-white/10 dark:border-white/10 light:border-zinc-200 rounded-full p-1 flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("subscriptions")}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all ${activeTab === "subscriptions"
                    ? "bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-900 text-white"
                    : "text-white/70 dark:text-white/70 light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200"
                    }`}
                >
                  Abonelikler
                </button>
                <button
                  onClick={() => setActiveTab("loans")}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all ${activeTab === "loans"
                    ? "bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-900 text-white"
                    : "text-white/70 dark:text-white/70 light:text-zinc-600 hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-zinc-200"
                    }`}
                >
                  Krediler
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {currentView === "create" ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "subscriptions" ? (
                    <AddFinanceModal
                      onClose={handleBackToList}
                      onSuccess={handleSuccess}
                      editData={editingItem}
                    />
                  ) : (
                    <AddLoanModal
                      onClose={handleBackToList}
                      onSuccess={handleSuccess}
                      editData={editingItem}
                    />
                  )}
                </motion.div>
              ) : isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-16"
                >
                  <div className="text-zinc-400">Yükleniyor...</div>
                </motion.div>
              ) : searchFilteredData.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-16 px-4"
                >
                  {/* Icon */}
                  <div className="bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                    <CreditCard className="w-10 h-10 text-zinc-600 dark:text-zinc-600 light:text-zinc-400" />
                  </div>

                  {/* Text */}
                  <h3 className="text-white dark:text-white light:text-zinc-900 font-semibold text-lg mb-2">
                    {searchQuery.trim()
                      ? "Sonuç bulunamadı"
                      : activeTab === "subscriptions"
                        ? "Henüz abonelik eklenmedi"
                        : "Henüz kredi eklenmedi"}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-500 light:text-zinc-600 text-sm text-center max-w-md mb-6">
                    {searchQuery.trim()
                      ? "Arama kriterlerinize uygun bir sonuç bulunamadı."
                      : activeTab === "subscriptions"
                        ? "Aylık aboneliklerinizi buradan takip edin."
                        : "Kredi ve taksit ödemelerinizi buradan takip edin."}
                  </p>

                  {/* Action Button - Only show if no search query */}
                  {!searchQuery.trim() && (
                    <button
                      onClick={handleAddNew}
                      className="bg-white dark:bg-white light:bg-zinc-900 text-black dark:text-black light:text-white hover:bg-zinc-200 dark:hover:bg-zinc-200 light:hover:bg-black px-6 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      {getAddButtonText()}
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  {searchFilteredData.map((item) => (
                    <SubscriptionCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={() => openDeleteModal(item)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deletingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDeletingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#121212] border border-red-200 dark:border-red-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                {/* İkon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/20 border-2 border-red-200 dark:border-red-500/30 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>

                {/* Başlık */}
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  {deletingItem.type === 'subscription' ? 'Aboneliği Sil' : 'Krediyi Sil'}
                </h2>

                {/* Açıklama */}
                <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                  Bu {deletingItem.type === 'subscription' ? 'aboneliği' : 'krediyi'} silmek istediğinden emin misin?
                </p>

                {/* Item Bilgisi */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-4 mb-6 text-left">
                  <h3 className="text-zinc-900 dark:text-white font-semibold text-sm mb-1">{deletingItem.name}</h3>
                  <p className="text-zinc-500 text-xs">
                    {deletingItem.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺ / {deletingItem.billing_cycle === 'monthly' ? 'Aylık' : 'Yıllık'}
                  </p>
                </div>

                {/* Butonlar */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingItem(null)}
                    className="flex-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-3.5 rounded-xl transition-all active:scale-95"
                  >
                    İptal
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 dark:hover:bg-red-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 active:scale-95"
                  >
                    Evet, Sil
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
