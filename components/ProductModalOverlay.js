"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function ProductModalOverlay({ children }) {
  const router = useRouter();
  const overlayRef = useRef(null);

  const onDismiss = () => {
    router.back();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onDismiss();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // Prevent scrolling of background when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 lg:p-8"
    >
      {/* Background Overlay with Blur & Fade */}
      <div 
        ref={overlayRef}
        onClick={onDismiss}
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fadeIn transition-opacity duration-300"
      />
      
      {/* Modal Container with Slide Up Animation */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-950 rounded-[32px] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-slideUp transition-all duration-500 max-h-[95vh] flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onDismiss}
          className="absolute top-5 right-5 z-[160] w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-rose-500 transition-all active:scale-90 group"
        >
          <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
        </button>

        <div className="overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
