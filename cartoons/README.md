# Cartoons @ 420360

Pen and ink cartoon gallery at [420360.xyz/cartoons](https://420360.xyz/cartoons)

## Adding New Cartoons

1. Upload your pen/ink drawing to Google Photos
2. Get the shareable link (right-click image → Copy image address)
3. Edit `cartoons.json` directly on GitHub or locally
4. Add new entry at the **top** of the array:
   ```json
   {
     "url": "https://lh3.googleusercontent.com/...",
     "title": "Optional Title"
   }
   ```
5. Commit and push - site auto-updates!

## Google Photos URL Tips

- Full size: URL should end with `=w2400` or `=s0`
- Thumbnail: Change to `=w800` for faster loading
- Direct image URL format: `https://lh3.googleusercontent.com/[ID]=w2400`

## Tech Stack

- Pure HTML/CSS/JS (no build tools)
- CSS Masonry layout (3 cols desktop, 2 tablet, 1 mobile)
- Retro 90s aesthetic matching main 420360.xyz site
- Lightbox with keyboard navigation (← → arrows, ESC)
- Progressive image loading

## Local Development

```bash
cd cartoons
python -m http.server 8000
# Open http://localhost:8000
```

---

Part of the [420360](https://420360.xyz) universe 🧀
