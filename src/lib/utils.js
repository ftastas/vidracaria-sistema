import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes do Tailwind CSS de forma eficiente
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor para moeda brasileira (R$)
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

/**
 * Gera um ID único
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Trunca um texto para um tamanho máximo
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

