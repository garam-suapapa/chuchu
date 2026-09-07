# 방울핑 잠옷 — 제작 기록

- Tool: built-in `image_gen.imagegen` only; no API/CLI.
- Base reference: `assets/runtime/characters/bangulping/base.png`.
- Pose/style reference: `assets/runtime/reference-wearables/bangulping/bangulping_outfit_01-v12/worn.png`.
- Both references inspected with `view_image` before generation.
- Generated on 2026-09-07. Original images preserved without editing.

## Worn initial

```text
Use case: identity-preserve. Asset type: complete full-body transparent PNG wornSprite for a children's dress-up game. Input image 1 is the identity/base reference, image 2 is the existing dressed pose and render-style reference. Create Bangulping wearing cozy pajamas; change ONLY the clothing of image 2. Preserve exactly her large face, glossy aqua twin segmented pigtails and round buns, gold bead hair ties, gold forehead diamond-star, pink skin, huge dark blue eyes, tiny smile, head-to-body proportions and FRONT VIEW standing pose with precisely one pair of bare pink hands clasped together at the center of her chest. Keep hair fully visible. Pajamas: soft pale cream and pastel aqua long-sleeved button-front pajama top, rounded aqua collar and cuffs, small gold star pattern, matching loose long pajama trousers ending at the ankles; both bare pink feet visible. No hat, no slippers, no props. Polished glossy 3D cartoon render matching the references. Complete character centered with all hair, hands, legs and feet fully inside frame, generous transparent margins, intended runtime frame 600x700. Background must be genuinely transparent with an alpha channel, not white and not a checkerboard illustration. No text, logos or watermark. Keep face, proportions and clasped hands faithful to reference.
```

Saved source: `sources/07-worn-initial.png` (1163×1353, RGB, no alpha).

## Built-in transparency correction attempt

```text
Use case: background-extraction. Edit this exact image. Remove the entire gray-and-white checkerboard background; those squares must be deleted. Output a cut-out PNG with REAL transparency encoded in the alpha channel. Transparent pixels must have alpha 0; do NOT draw or simulate a checkerboard, and do NOT replace it with a white background. Keep the character, face, hair, hands, pajamas and feet completely unchanged. Keep the complete figure with margins. This is a game sprite which must overlay other scenes cleanly. Preserve all subject colors and edges. No shadow, text or new objects.
```

Saved source: `sources/07-worn-alpha-retry.png` (1163×1353, RGB, no alpha). Retry still rendered checkerboard pixels; transparency failed. Initial selected for visual design consistency.

## Clothing-only selection

```text
Use case: precise-object-edit. Asset type: clothing-only wardrobe selection PNG sprite. Use the supplied Bangulping pajamas worn image as the exact GARMENT DESIGN reference. Isolate and show only the same two-piece pajamas: pale cream button-front long-sleeved top with soft aqua rounded collar, aqua cuffs and piping, tiny gold outlined and filled stars, matching pale cream long trousers with aqua cuffs and matching scattered gold stars. Complete the garment behind the hands, keeping exactly the same design and colors. Display the top above the trousers as one neat front-facing coordinated outfit, arms relaxed outward slightly so the top is readable. NO person, head, hair, skin, hands, arms inside sleeves, feet, mannequin, hanger or props. Garments only. Glossy soft 3D cartoon rendering matching the reference. Centered full garment with ample clear margins, square canvas. Transparent PNG cutout with actual alpha transparency around the garments and inside neck/sleeve openings. DO NOT paint a checkerboard pattern. No floor, shadow, backdrop, text, watermark or logo.
```

Input is generated worn initial above, inspected with `view_image`. Saved source: `sources/07-selection-initial.png` (1254×1254, RGB, no alpha).

## Visual inspection

- Character identity, turquoise pigtails/buns, forehead star and large blue eyes retained.
- Front standing pose with exactly one pair of clasped pink hands; both feet and all hair tips visible; no cropping.
- Pajamas top/trousers use cream fabric, aqua piping/collar/cuffs and gold stars in both images. Pattern placement differs under garment reconstruction.
- Selection image contains clothing only; no body, hands, skin or mannequin.
- Transparency FAIL: both intended outputs have 3 channels and no alpha. Worn contains baked checkerboard; selection has near-white backdrop.
- Runtime 600×700 conversion pending permission for local image editing; no image editing outside built-in image_gen performed.
