# 방울핑 겨울옷 (bangulping_outfit_10)

## Status and inspection
- Built-in image_gen used exclusively; 3 separate calls (worn generation, alpha-only retry, wardrobe sprite).
- Two requested visual assets generated and saved. **NOT runtime-ready: genuine transparency requirement failed.** All outputs are RGB24 PNGs with checkerboard painted into the pixels, not RGBA.
- Requested 600×700 worn runtime frame is not fulfilled: image edits outside image_gen, including resizing, are currently on hold by coordinating task instruction.
- No API/CLI fallback, programmatic background removal or resize performed.
- Original worn selected for fidelity: full hair, face, hands, legs, feet and coat are visible with no edge clipping; centered frontal clasped hands are preserved. Generated likeness is close but not pixel-identical to the provided base/reference.
- Clothing-only sprite shows only coat, fur trim and star hardware. No skin, hands, head, hair or other body parts. All garment edges fully visible with margins. Same teal padded coat, ivory trim, center star pull and two hem stars as worn.
- Alpha retry also failed and is retained as evidence, not selected over the first worn.

## Files and actual metadata
| File | Actual size | Format | Inspection |
|---|---|---|---|
| bangulping_outfit_10-worn.png | 1163×1353 | RGB24 PNG, no alpha | Complete character; opaque baked checkerboard; resize pending |
| bangulping_outfit_10.png | 1254×1254 | RGB24 PNG, no alpha | Complete clothes-only design; opaque baked checkerboard |
| sources/10-worn-initial-opaque.png | 1163×1353 | RGB24 PNG, no alpha | Original selected worn |
| sources/10-worn-alpha-retry-opaque.png | 1164×1351 | RGB24 PNG, no alpha | Failed targeted transparency retry |
| sources/10-sprite-opaque.png | 1254×1254 | RGB24 PNG, no alpha | Original selected clothing-only sprite |

Metadata inspected via System.Drawing Bitmap PixelFormat and pixel (0,0). RGB24 necessarily has no alpha channel, all decoded pixels have alpha 255. Worn initial corner RGB 253,253,254; retry corner RGB 252,253,253.

## Inputs inspected with view_image before use
- assets/runtime/characters/bangulping/base.png — base identity reference.
- assets/runtime/reference-wearables/bangulping/bangulping_outfit_01-v12/worn.png — pose/proportions and clothing edit target.
- Initial generated worn was inspected with view_image before the wardrobe sprite generation.

## Exact prompt 1: worn
Use case: identity-preserve. Asset type: transparent PNG full-body worn outfit sprite for a children's dress-up game.
Input image 1 is the original Bangulping base identity reference. Input image 2 is the exact pose/proportion/rendering reference and clothing edit target.
Replace only the sailor dress in image 2 with a cute winter coat. Preserve the exact original character: huge pink round face, large glossy blue eyes, small gentle smile, forehead yellow four-point star, turquoise thick segmented twin braids, pearl-yellow hair ties, tiny pink body, short legs. Preserve the second image's front-facing symmetrical standing pose with both small bare pink hands clasped together at the chest. Same head size relative to body, face shape, hair silhouette and polished soft 3D toy rendering.
Winter clothing design: teal/turquoise A-line padded parka coat ending above the knees, soft ivory cream fluffy fur trim at collar, sleeve cuffs and curved hem; hood rests down behind shoulders and does not obscure or change any hair. Two small golden star appliques symmetrically near lower skirt corners, tiny golden star zipper pull. Cozy modest child-appropriate design. Bare hands remain visible at chest, pink legs and feet below the coat remain visible. No gloves, no hat, no scarf, no footwear.
Composition: single complete character, centered, full hair and full feet visible, front view, ample transparent margin on all four sides, portrait canvas intended to fit a 600x700 runtime frame.
Backdrop: genuine transparent alpha background, no opaque backdrop, no baked checkerboard. No shadow outside silhouette, no ground, no props, no text, no watermark. Keep all anatomy and pose unchanged; edit clothing only.

Generated source: C:/Users/admin/.codex/generated_images/01a07a95-01f1-7ce3-a090-0586a4a0ec2a/exec-2516b48c-f60e-4563-bd92-ea2a42dd247d.png

## Exact prompt 2: alpha-only retry
Use case: background-extraction. Edit the supplied full character image. The input has a false checkerboard pattern painted behind the character: remove that entire checkerboard background and deliver the identical character as a genuinely transparent RGBA PNG, with alpha zero outside the character. Do not draw any representation of transparency. Do not substitute white, gray, black, or colored background. The output MUST encode actual transparent pixels. Keep every part of the character unchanged, including turquoise twin braids, pink face, exact eyes and smile, folded pink hands, teal winter coat, cream fluffy trim, golden star zipper and two hem stars, legs and feet. Single whole-body cutout, no cast shadow, enough transparent padding, no text.

Input: first generated worn.
Generated source: C:/Users/admin/.codex/generated_images/01a07a95-01f1-7ce3-a090-0586a4a0ec2a/exec-918c04fc-5465-4d74-8fb4-5743b1b59810.png

## Exact prompt 3: clothing-only selection sprite
Use case: precise-object-edit. Asset type: wardrobe-selection clothing sprite.
The supplied image is the approved clothing design reference. Create only its exact teal winter parka coat, displayed by itself with NO character or body inside it. The garment is a cute miniature A-line padded coat: turquoise/teal lightly quilted outer fabric, soft ivory fluffy fur collar with hood resting behind it, matching fluffy sleeve cuffs and curved hem, central zipper with a golden star pull, and exactly two small gold star appliques on the lower left and lower right. Preserve this design, color, materials and polished soft 3D toy style precisely.
Use a front-facing symmetrical ghost-mannequin garment presentation, short sleeves bend gently inward as in the reference, hollow sleeve openings and empty neckline. The ENTIRE garment must be visible, centered on a square canvas with generous clear margin.
Remove all head, face, turquoise hair, hair accessories, neck, chest, pink skin, hands, fingers, arms, legs and feet. Only cloth, fur and gold star hardware. No person, mannequin, hanger, stand, label, separate accessories or text.
Background must be ACTUAL TRANSPARENT PNG alpha, empty pixels around and inside garment openings. Do not paint a checkerboard pattern, white background, gray background, shadow or any backdrop.

Input: first generated worn.
Generated source: C:/Users/admin/.codex/generated_images/01a07a95-01f1-7ce3-a090-0586a4a0ec2a/exec-4503dc82-0f57-450e-b00c-ab547289c962.png
