/**
 * Centralized icon paths for consistent usage across the application
 */

export const ICONS = {
  // UI Icons
  ui: {
    alertTriangle: "/icons/ui/alert-triangle.svg",
    arrowLeftLinear: "/icons/ui/arrow-left-linear.svg",
    arrowRightLinear: "/icons/ui/arrow-right-linear.svg",
    arrowSpin: "/icons/ui/arrow-spin.svg",
    check: "/icons/ui/check.svg",
    checkboxesDefault: "/icons/ui/Checkboxes-default.svg",
    checkboxesSelected: "/icons/ui/Checkboxes-selected.svg",
    clone: "/icons/ui/clone.svg",
    close: "/icons/ui/close.svg",
    dashboard: "/icons/ui/dashboard.svg",
    del: "/icons/ui/del.svg",
    down: "/icons/ui/down.svg",
    download: "/icons/ui/download.svg",
    editLine: "/icons/ui/edit-line.svg",
    eyeOff: "/icons/ui/eye-off.svg",
    eyeOn: "/icons/ui/eye-on.svg",
    file: "/icons/ui/file.svg",
    fileInvoice: "/icons/ui/file-invoice.svg",
    globe: "/icons/ui/globe.svg",
    left: "/icons/ui/left.svg",
    loading: "/icons/ui/loading.svg",
    more: "/icons/ui/more.svg",
    noto: "/icons/ui/noto.svg",
    playFilled: "/icons/ui/play-filled.svg",
    right: "/icons/ui/right.svg",
    rounded: "/icons/ui/rounded.svg",
    search: "/icons/ui/search.svg",
    settings: "/icons/ui/settings.svg",
    signOutBold: "/icons/ui/sign-out-bold.svg",
    stop: "/icons/ui/stop.svg",
    up: "/icons/ui/up.svg",
    voiceLine: "/icons/ui/voice-line.svg",
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
