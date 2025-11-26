"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, QrCode, Check } from "lucide-react";
import QRCode from "qrcode";
import { copyToClipboard } from "@/lib/clipboard";

interface IBANQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  iban: string;
  label: string;
}

export default function IBANQRModal({ isOpen, onClose, iban, label }: IBANQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && iban) {
      generateQRCode();
    }
  }, [isOpen, iban]);

  const generateQRCode = async () => {
    try {
      // Remove spaces from IBAN
      const cleanIban = iban.replace(/\s/g, "");

      // Generate high quality QR code
      const dataUrl = await QRCode.toDataURL(cleanIban, {
        width: 512,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });

      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("QR kod oluşturma hatası:", error);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `${label || "IBAN"}-QR-${new Date().getTime()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyIBAN = () => {
    const cleanIban = iban.replace(/\s/g, "");
    copyToClipboard(cleanIban, "IBAN kopyalandı!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <QrCode className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  IBAN QR Kodu
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* QR Code */}
              <div className="flex-shrink-0">
                {qrDataUrl ? (
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-zinc-200">
                    <img
                      src={qrDataUrl}
                      alt="IBAN QR Kod"
                      className="w-80 h-80"
                    />
                  </div>
                ) : (
                  <div className="w-80 h-80 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="text-center">
                      <QrCode className="w-12 h-12 mx-auto mb-3 text-zinc-400 animate-pulse" />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">QR kod oluşturuluyor...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info & Actions */}
              <div className="flex-1 w-full space-y-6">
                {/* IBAN Display */}
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
                    IBAN Numarası
                  </label>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                    <p className="text-base font-mono font-medium text-zinc-900 dark:text-white break-all">
                      {iban}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyIBAN}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl transition-colors font-medium text-sm border border-zinc-200 dark:border-zinc-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        IBAN'ı Kopyala
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadQR}
                    disabled={!qrDataUrl}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-xl transition-colors font-medium text-sm disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    QR Kod İndir
                  </button>
                </div>

                {/* Info */}
                <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl p-4">
                  <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
                    💡 Bu QR kodu ile IBAN numaranızı kolayca paylaşabilirsiniz. Mobil cihazlardan taratarak IBAN'ı otomatik kopyalayabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
