import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const generateId = (prefix: string = '0x') => {
  return `${prefix}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 6)}`;
};
