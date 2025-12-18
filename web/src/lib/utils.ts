import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPhone(phone: string) {
  if (!phone) return "";
  
  const value = phone.replace(/\D/g, "");

  if (value.length === 11) {
    return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (value.length === 10) {
    return value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

export function generateWhatsAppLink(phone: string, message: string) {
  const cleanPhone = "55" + phone.replace(/\D/g, ""); 
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}