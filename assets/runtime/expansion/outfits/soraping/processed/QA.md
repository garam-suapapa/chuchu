# Processed Soraping outfit QA

## Result

PASS for 8 processed PNGs: four worn sprites at 600×700 and four clothing-only sprites at 600×600, all RGBA with actual transparent pixels and transparent canvas edges. The 8 RGB generation originals remain byte-for-byte unchanged (SHA256 compared with the original inspection.json). Catalog entries now point into processed/ with runtimeReady=true and productionTemplate.status=processed-review.

## Authorized processing

The user explicitly authorized Python/local background removal and resizing after the original built-in transparency failures. No further generation, paid API, model download or package installation was used. Runtime: C:/Users/admin/AppData/Local/Python/pythoncore-3.14-64/python.exe, using existing Pillow, numpy and scipy 1.17.1.

The reproducible script ../process-assets.py classifies light neutral pixels (channel range <7, minimum channel >215), seals small discontinuities in pale outline contours with 7 morphology iterations at source resolution, then propagates only the exterior background. This avoids deleting enclosed eye highlights, pearly details and white fabric. The broad threshold initial attempt damaged winter white fur and was rejected on the dark contact sheet; the conservative threshold and contour closure resolve that damage. A one-source-pixel inner feather followed by Lanczos resizing softens edges. RGB artwork is not repainted.

Worn assets are cropped to their true extracted subject bounds and uniformly scaled to match the current reference worn image's visible alpha height. Reference alpha threshold ≥8 excludes extremely faint disconnected noise: reference bounds are (86,14,457,676). All four final worn silhouettes have top y=14, bottom-exclusive y=676 and horizontal center 271.5, matching the reference. The target is 600×700 with no aspect distortion. Individual silhouette widths differ because the generated poses/proportions differ slightly.

Selection sprites are cropped to their own subject bounds and proportionally contained in a 560×560 area of a 600×600 transparent canvas, giving at least 20 pixels of padding. Boots/slippers remain part of their clothing set. Background between separated shoes, pant legs, sleeves and torso is removed where it is empty; visible inside-cuff fabric stays opaque.

## Direct visual review

Both contact-dark.jpg (slate) and contact-orange.jpg (orange) were inspected after the final processing. Full hair/feet and all garment pieces are visible; checkerboard fields and gray-white gaps are absent; winter collar, cuffs and hem remain intact; white eyes and glossy highlights remain opaque. No visible canvas clipping or substantial checkerboard fringe at runtime size. Six specifically located white-fur samples pass opacity ≥240 while a nearby external background sample is alpha 0. The annotated source crop white-fur-sample-review.png documents these locations; its checkerboard intentionally shows the unedited source for sample context.

## Automated checks

Run from repository root:

```powershell
& 'C:/Users/admin/AppData/Local/Python/pythoncore-3.14-64/python.exe' assets/runtime/expansion/outfits/soraping/process-assets.py
& 'C:/Users/admin/AppData/Local/Python/pythoncore-3.14-64/python.exe' assets/runtime/expansion/outfits/soraping/verify-processing.py
```

The second command checks eight unchanged source hashes, all eight catalog paths, RGBA mode, exact target dimensions, substantial transparent and opaque pixel counts, fully transparent image borders, reference vertical alignment, and the winter-fur/background sample values. Result: PASS. qa.json contains original source hashes, crop/placement/scale, alpha bounds and alpha pixel counts for each output.

## Remaining limits

Generation remains a visual identity match rather than a pixel-identical base edit. Relative head/body proportions and clasped-hand height vary modestly among outfits, and small motif/button placement differences between clothing-only and worn images remain. This processing preserves those generated designs. Existing app/manifest files were not modified or integrated here; the parent task handles runtime integration.
