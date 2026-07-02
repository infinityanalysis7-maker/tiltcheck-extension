"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="flex items-center gap-3 rounded-2xl bg-[#13131f] border border-[#22c55e]/30 p-4 shadow-2xl min-w-[280px] max-w-sm">
        <div className="w-8 h-8 rounded-full bg-[#22c55e]/15 flex items-center justify-center shrink-0">
          <CheckCircle2 size={16} className="text-[#22c55e]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#f0f0f5]">
            Nice work!
          </p>
          <p className="text-xs text-[#8b8ba0] leading-relaxed">
            You completed your first disciplined trading session.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}