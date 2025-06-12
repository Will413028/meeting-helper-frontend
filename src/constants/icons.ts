/**
 * Centralized icon paths for consistent usage across the application
 */

export const ICONS = {
  // UI Icons
  ui: {
    dashboard: "/icons/ui/dashboard.svg",
    down: "/icons/ui/down.svg",
    eyeOff: "/icons/ui/eye-off.svg",
    eyeOn: "/icons/ui/eye-on.svg",
    file: "/icons/ui/file.svg",
    globe: "/icons/ui/globe.svg",
    window: "/icons/ui/window.svg",
  },
  
  // Brand Icons
  brands: {
    next: "/icons/brands/next.svg",
    noto: "/icons/brands/noto.svg",
    vercel: "/icons/brands/vercel.svg",
  },
} as const;

// Type-safe icon paths
export type UIIconPath = typeof ICONS.ui[keyof typeof ICONS.ui];
export type BrandIconPath = typeof ICONS.brands[keyof typeof ICONS.brands];
export type IconPath = UIIconPath | BrandIconPath;
