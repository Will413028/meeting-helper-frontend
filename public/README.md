# Public Assets Organization

This directory contains all public assets for the application, organized as follows:

## Directory Structure

```
public/
├── favicon.ico          # Browser tab icon
├── icons/              # All icon assets
│   ├── ui/            # User interface icons
│   │   ├── dashboard.svg
│   │   ├── down.svg
│   │   ├── eye-off.svg
│   │   ├── eye-on.svg
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   └── window.svg
│   └── brands/        # Brand/logo icons
│       ├── next.svg
│       ├── noto.svg
│       └── vercel.svg
└── images/            # Other image assets
    └── tauri-nextjs-template-2_screenshot.png
```

## Usage Guidelines

### UI Icons (`/icons/ui/`)
- Used for interface elements like buttons, navigation, and interactive components
- Should be monochromatic or designed to work with CSS color properties
- Naming convention: descriptive-action.svg (e.g., `eye-on.svg`, `eye-off.svg`)

### Brand Icons (`/icons/brands/`)
- Third-party logos and brand assets
- Should maintain original brand colors and guidelines
- Do not modify these without checking brand guidelines

### Images (`/images/`)
- Screenshots, photos, and other non-icon image assets
- Use appropriate formats: PNG for screenshots, JPG for photos, WebP for optimized web images

## Adding New Icons

1. **UI Icons**: Place in `/icons/ui/` if it's for interface functionality
2. **Brand Icons**: Place in `/icons/brands/` if it's a third-party logo
3. **App Icons**: Tauri app icons should remain in `src-tauri/icons/`

## Icon Format Recommendations

- **Format**: SVG preferred for scalability
- **Optimization**: Run through SVGO or similar optimizer before adding
- **Size**: Keep file sizes minimal while maintaining quality
- **Accessibility**: Include proper alt text when using in components
