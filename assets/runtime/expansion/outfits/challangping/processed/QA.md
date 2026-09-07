# Processed outfit QA

All 8 runtime deliverables are RGBA PNGs with actual zero-alpha background. User authorized local image processing after built-in transparency attempts failed. Original artwork, failed attempts, prompts and earlier QA remain untouched.

- Worn images: 600 x 700. Foreground is cropped from measured alpha bounds, scaled uniformly, then aligned to current reference-wearables' major alpha component: x=92..507, y=24..677. All four new worn sprites have hair top y=24 and sole bottom y=677. Width varies with original generated silhouette; proportions are not stretched.
- Wardrobe sprites: 512 x 512, measured garment foreground contained within 464 x 464 with 24-pixel minimum margin.
- All eight files have transparent pixels and antialiased partial-alpha edges, and no visible foreground touching canvas boundaries. Quantitative bounds/counts are in qa.json.
- Reviewed all eight outputs on dark navy and saturated pink in contact-sheet.png. No visible checkerboard fields remain, including between legs and separate garment pieces. Face, eye highlights, ears, floral prints, cream trim and fluffy winter fabric remain intact. Selection images contain no body parts.
- First processing pass incorrectly removed the low-chroma winter left ear; the script now protects its contour with a source-reviewed tighter threshold. An enlarged leg-gap review revealed enclosed checkerboard between rain boots; explicit source-reviewed background seeds now clear enclosed leg gaps in all worn outputs.
- Original generation differences remain: swimwear legs are somewhat longer than the existing reference; winter selection scarf arrangement and legwear presentation differ naturally from worn. Processing does not redraw these designs.

Reproduce from any working directory:

```powershell
py C:/Users/admin/.codex/worktrees/82c9/chuchu/assets/runtime/expansion/outfits/challangping/process.py
```

Dependencies: Pillow, numpy, scipy. No model download, rembg, cv2, image regeneration or paid API was used. The script writes processed images, contact-sheet.png, qa.json and updates catalog.json. App and main manifest are unchanged. runtimeReady means image-format/framing readiness; product integration remains the parent task's responsibility.
