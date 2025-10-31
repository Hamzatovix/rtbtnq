# Placeholder Assets

This directory contains placeholder images for the About section skeleton mode.

## Files

- `about_main_placeholder.webp` - Main 4:3 hero image (1600×1200)
- `about_square_macro_placeholder.webp` - Linen texture macro (1000×1000)  
- `about_square_tools_placeholder.webp` - Hand stitching tools (1000×1000)
- `about_stitch_poster.webp` - Video poster frame (1000×1000)

## Usage

These placeholders are used when `NEXT_PUBLIC_ASSETS_READY=false` in environment variables.

When final assets are ready, set `NEXT_PUBLIC_ASSETS_READY=true` and replace the paths in `src/lib/placeholders.ts` with actual asset URLs.

## Design

All placeholders use the brand palette:
- Background: `#F9F9F9` to `#F4EFE8` gradient
- Accent: `#AEB6AF` (sage tint)
- Subtle texture pattern for visual interest
- Neutral typography labels
