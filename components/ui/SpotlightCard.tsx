"use client";
import React from "react";

// Bu bileşen, mouse'u takip eden o "parlayan çerçeveyi" oluşturur
export const SpotlightCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`
        relative h-full w-full rounded-3xl p-[1px]
        light:bg-zinc-200 dark:bg-zinc-800
        overflow-hidden

        /* IŞIK EFEKTİ:
          Arka planda (before) mouse'u takip eden bir ışık topu (radial-gradient) oluştur.
          Bu top, 'group-hover' ile (yani mouse SpotlightWrapper'ın üzerindeyken) görünür olur.
        */
        before:absolute before:inset-0 before:-z-10
        before:content-['']
        before:opacity-0 group-hover/wrapper:before:opacity-100
        light:before:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(0,0,0,0.15),transparent_40%)]
        dark:before:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.2),transparent_40%)]
        before:transition-opacity before:duration-300
        ${className}
      `}
    >
      {/* İÇERİK KUTUSU:
        Bu, 1px'lik çerçeveden daha içeride duran, asıl içeriği taşıyan kutudur.
        Işık, sadece o 1px'lik aralıktan sızar.
      */}
      <div className="relative rounded-[calc(1.5rem-1px)] light:bg-white dark:bg-[#0F0F12] h-full w-full">
        {children}
      </div>
    </div>
  );
};