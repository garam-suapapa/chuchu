# Soraping outfit 08 — Raincoat

## Method and sources

Built-in `image_gen` only. References were inspected using `view_image` before generation:
- `assets/runtime/characters/soraping/base.png`
- `assets/runtime/reference-wearables/soraping/soraping_outfit_01-v12/worn.png`

Source image directory: `C:/Users/admin/.codex/generated_images/01a07a94-9431-77b2-a496-da8e8da10f84/`

- Selected worn source: `exec-a5c19b21-bdfb-4b0e-b7dd-59f430dbcad9.png`
- Unselected transparency retry: `exec-4560f021-4632-42de-abe5-e4647df90980.png`
- Selected wardrobe source: `exec-c4507ddd-3860-4bc5-bc50-18438bf0794c.png`

Selected outputs copied unchanged to `soraping_outfit_08-worn.png` and `soraping_outfit_08.png`. No external image manipulation, resizing, API or CLI generation used.

## Worn prompt

Use case: identity-preserve. Asset type: full-body transparent PNG wornSprite for a children's dress-up game. Input image 1 is Soraping identity/base reference; input image 2 is the exact front-facing composition, rendering style and hands-together pose reference. Dress the same character in a cute raincoat outfit: pastel sunshine-yellow glossy waterproof coat with a rounded aqua collar and cuffs, three small aqua buttons, two rounded patch pockets with subtle shell-shaped stitching, gently flared mid-thigh hem, matching yellow rain boots with aqua soles. Hood is folded behind the shoulders so all of the pink hair remains fully visible. Preserve exactly Soraping's huge violet eyes, tiny smiling mouth, golden forehead diamond, pale pink face, voluminous swept pink ponytail curling on image-left, shell clip, turquoise hairband, head/body proportions and friendly front view. Preserve hands clasped together at the center front of the body, visible over the coat; two arms only. Keep her face and hair extremely faithful to both references. Entire character including top of ponytail and both boot soles must be fully inside canvas, generous clear margin, centered, no cast ground shadow. Shiny soft 3D animated character style consistent with reference 2. Composition for eventual 600 by 700 runtime frame. Genuine transparent background with alpha, no checkerboard pixels, no environment, no rain, no umbrella, no text, no watermark. One complete character only.

## Transparency retry prompt

Use case: background-extraction. Edit only the background of the attached Soraping raincoat character. Remove every white and light gray checkerboard background pixel and export a true RGBA PNG with an alpha channel: outside the subject alpha must be 0, NOT an opaque checkerboard, NOT white or gray. Keep the entire character's existing RGB details exactly unchanged, including every hair curl, face, clasped hands, yellow raincoat, aqua collar/cuffs/buttons, shell pockets and yellow boots. Do not redraw or change the pose or proportions. One isolated full-body game sprite with all edges and ample transparent margins. True transparent cutout file required.

## Wardrobe sprite prompt

Use case: stylized-concept. Asset type: clothing-only wardrobe selection sprite for children's dress-up game. Reference image is the exact outfit design to reproduce, not a character to include. Show ONLY the yellow raincoat and pair of matching rain boots seen in the reference. No character, no head, no hair, no face, no neck, no body, no arms, no hands, no legs, no feet, no mannequin or hanger. Keep the same glossy sunshine-yellow waterproof raincoat, rounded aqua collar, aqua sleeve cuffs, three small aqua front buttons, two round yellow patch pockets with raised shell stitching, gently flared mid-thigh hem, folded hood behind collar. Sleeves naturally extend slightly outwards and downward with empty open cuffs, so the garment's full front is visible. Below coat arrange its two yellow rain boots with aqua soles, empty interiors, neatly aligned with a small gap from the coat. Front-facing isolated fashion item set, same cute polished 3D game rendering as reference, complete garment and boots inside frame with ample margin. Background: genuine fully transparent alpha channel, not opaque white, not gray, no checkerboard pattern drawn into image. No environment, no cast ground shadow, no text or watermark. One outfit only.

## QA

- Worn: 1162 × 1354 RGB PNG. Entire ponytail, face, hands, coat and both boots visible with clear margin. Front-facing hands-together pose and identity match reference well. No clipping seen.
- Wardrobe: 1162 × 1353 RGB PNG. Coat and both boots complete, empty neck/cuffs/boots; no character, hands, body or hanger. No clipping seen.
- Colors/materials and shell pockets match between the two outputs. Wardrobe has four visible aqua buttons; worn has three visible plus a partly hand-obscured top closure.
- **Not transparent**: the generator baked white/gray checkerboard pixels into RGB output. Neither selected file has an alpha channel. The explicit background-extraction retry also returned RGB with checkerboard pixels; it was not selected.
- **Not normalized to 600 × 700**: external image editing, including resizing, was paused on the coordinator's instruction pending user authorization. These are preserved original outputs, not runtime-ready transparent assets.
- First wardrobe attempt returned HTTP 429 `usage_limit_reached`, `resets_in_seconds: 308`. Retried successfully after coordinator reported usage reset.
