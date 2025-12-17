import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  variant = "default",
}: ModalProps) {
  if (!isOpen) return null;

  const headerColors = {
    default: "bg-white text-gray-800",
    destructive: "bg-red-50 text-red-700",
    success: "bg-green-50 text-green-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 ${headerColors[variant]}`}
        >
          <h3 className="font-bold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-black/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-gray-600">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
