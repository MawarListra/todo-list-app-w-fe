import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function focusRing() {
  return 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
}

export function transitionBase() {
  return 'transition-colors duration-200'
}
