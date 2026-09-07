# Soraping winter outfit 10

## Status

Built-in imagegen generated both requested designs. NOT runtime-ready: both delivered PNGs are RGB with a painted checkerboard background, not transparent. Background-only imagegen correction was attempted once and still returned RGB. No Python or other pixel editing or resizing was performed, following the parent's later instruction to hold image edits pending explicit approval. Runtime worn frame remains to be converted to 600 x 700.

## Files and sources

- `soraping_outfit_10-worn.png`: copied without pixel changes from `C:/Users/admin/.codex/generated_images/01a07a94-d370-7bd2-9bb1-496ffc22e6c6/exec-b995ffed-b6f1-4a32-9598-2ee4c3ed30bd.png`; RGB 1163 x 1353.
- `soraping_outfit_10.png`: copied without pixel changes from `C:/Users/admin/.codex/generated_images/01a07a94-d370-7bd2-9bb1-496ffc22e6c6/exec-3f8b748b-6e09-4a2f-8d39-c8092426f0eb.png`; RGB 1254 x 1254.
- Initial worn generation retained in tool output folder: `C:/Users/admin/.codex/generated_images/01a07a94-d370-7bd2-9bb1-496ffc22e6c6/exec-2dc18f18-06ce-42c8-aa9d-34c059bd336d.png`; RGB 1162 x 1354, painted checkerboard.

## QA

Visual inspection: preserved Soraping's violet eyes, gold forehead diamond, pink spiral bangs, high ponytail, shell ornament, long left curl and frontal pose with hands together. Winter outfit is lavender padded coat with white fluffy collar/cuffs/hem, aqua knitted scarf, shell pockets, pearl snowflake buttons, lavender leggings and boots. Full hair and boot soles fit within image boundaries. Selected garment has no head, hair, skin, hands or mannequin; complete sleeves, coat and boots fit within frame and match the worn design. Worn's top button is occluded by hands; selection shows all three buttons. Generative identity match is visual, not pixel-exact.

Alpha QA: FAIL for both worn and selection; worn retry still RGB. Both checked with Pillow read-only inspection. Both are design source assets pending alpha correction and frame normalization. No paid API/CLI used. No manifest, catalog or app code changes.

SHA256 worn: `5e0c2fbc786bb78a643671a39d5504f548fa15d9a84e8547aeae0ade09547791`

SHA256 selection: `7b75c88b12acb8442b0e02d27b372c249ee14264e9cf53005bf27250a6df8cd9`

## Worn generation prompt

```
Use case: identity-preserve
Asset type: transparent full-body wornSprite PNG for a children's dress-up game, soraping_outfit_10 winter.
Input images: Image 1 is the character identity/base reference; image 2 is the current approved wornSprite and is the primary framing, facial identity, proportions and pose reference.
Primary request: Create ONE complete full-body image of exactly this same pink-haired fantasy chibi Soraping character wearing a cute winter outfit. Change only the outfit from image 2: a soft icy-lavender padded knee-length winter coat with white fluffy faux-fur collar, cuffs and hem, three tiny pearl snowflake buttons, subtle shell-shaped pocket embroidery, pale aqua knitted scarf tucked neatly into collar, lavender leggings and matching small white-trimmed winter boots. No hat or hood over hair. Both pink bare hands stay visible, gently held together at center waist exactly as image 2, same arms and neutral frontal standing pose.
Constraints: Precisely preserve image 2's huge violet sparkling eyes, tiny gentle smile, golden forehead diamond, pink skin, large glossy pink spiral bangs, high ponytail and long curled hair to the viewer's left, turquoise hair band and pastel shell hair ornament, exact large-head small-body ratio and same silhouette of hair. Same polished luminous 3D toy illustration rendering and clean edges. Full character including hair top, left curl and boot soles wholly inside canvas. Single character, centered, target 600x700 portrait framing, ample transparent margin, no cropping. True RGBA transparent background with empty transparent pixels, no painted checkerboard, no scenery, no platform, no drop shadow, no text or watermark. Render only this one winter wornSprite.
```

## Alpha correction prompt (unsuccessful)

```
Use case: background-extraction. Edit the supplied winter Soraping image. Remove the entire gray-white checkerboard background and output genuinely TRANSPARENT RGBA PNG with an alpha channel. The checkerboard is NOT part of the subject and must not be painted in the final image. Keep the complete pink-haired character, face, hair, hands, lavender fluffy winter coat, aqua scarf, leggings and boots exactly unchanged, with all boundaries intact. No new background, no white fill, no floor or cast shadow. Preserve every character pixel as closely as possible. Full body entirely visible.
```

## Selection sprite prompt

```
Use case: precise-object-edit
Asset type: winter outfit selection sprite for a children's dress-up wardrobe.
Input image: reference for the EXACT winter outfit design only.
Primary request: Show ONLY the complete matching winter clothing set from this reference, without its wearer: icy-lavender padded winter coat with white fluffy faux-fur lapel collar, cuffs and hem, pale aqua knitted scarf tucked into the collar, pearl snowflake buttons down the front, two lavender shell-shaped pocket appliques, lavender padded leggings, matching lavender boots with white fluffy trim and pearl snowflake decorations. Front view, compact neat outfit arrangement as if on an invisible form. Coat sleeves angled slightly downward with visibly empty cuff openings; no hands, no arms, no body, no face, no head, no hair, no skin, no mannequin, no hanger. Preserve the actual coat details from the reference, reconstructing front fabric behind removed hands cleanly. Entire outfit including both sleeves and boots visible with generous clear margin, centered on a square transparent canvas. Same polished glossy 3D toy illustration style. Background must be genuinely transparent PNG alpha, NOT a rendered checkerboard pattern and NOT solid white. No background pixels, no cast shadow, no floor, no text or watermark. Only one outfit set.
```
