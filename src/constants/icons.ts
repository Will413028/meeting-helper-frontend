/**
 * Centralized icon paths for consistent usage across the application
 */

export const ICONS = {
  // UI Icons
  ui: {
    alertTriangle: "/icons/ui/alert-triangle.svg",
    arrowLeftLinear: "/icons/ui/arrow-left-linear.svg",
    arrowRightLinear: "/icons/ui/arrow-right-linear.svg",
    check: "/icons/ui/check.svg",
    close: "/icons/ui/close.svg",
    dashboard: "/icons/ui/dashboard.svg",
    down: "/icons/ui/down.svg",
    eyeOff: "/icons/ui/eye-off.svg",
    eyeOn: "/icons/ui/eye-on.svg",
    file: "/icons/ui/file.svg",
    globe: "/icons/ui/globe.svg",
    left: "/icons/ui/left.svg",
    right: "/icons/ui/right.svg",
    rounded: "/icons/ui/rounded.svg",
    up: "/icons/ui/up.svg",
    voiceLine: "/icons/ui/voice-line.svg",
    noto: "/icons/ui/noto.svg",
    window: "/icons/ui/window.svg",
  },

  // Brand Icons
  brands: {
    next: "/icons/brands/next.svg",
    vercel: "/icons/brands/vercel.svg",
  },
} as const;

// Type-safe icon paths
export type UIIconPath = (typeof ICONS.ui)[keyof typeof ICONS.ui];
export type BrandIconPath = (typeof ICONS.brands)[keyof typeof ICONS.brands];
export type IconPath = UIIconPath | BrandIconPath;
