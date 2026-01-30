/**
 * Tipos globales para notificaciones en móviles
 */

declare global {
  interface NotificationOptions {
    vibrate?: number[] | number;
  }

  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

export {};
