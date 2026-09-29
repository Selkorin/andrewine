/// <reference types="astro/client" />

interface Window {
  ym?: (counterId: number, action: string, ...args: unknown[]) => void;
}
