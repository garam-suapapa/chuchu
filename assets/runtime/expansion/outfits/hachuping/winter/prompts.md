# 포근 하트 겨울옷 / hachuping_outfit_10

## Production method

Built-in image_gen only. Read imagegen SKILL.md and inspected authoritative base and existing worn reference via view_image first. Generated worn image, attempted built-in alpha correction, then generated clothing-only sprite referencing first worn image. No paid API/CLI, local drawing, background removal, resizing, padding, or pixel edits. Final files are byte-for-byte copies of selected built-in outputs. Parent requested local conversion be held pending user authorization.

## Exact prompts

### Worn

Use case: identity-preserve
Asset type: transparent full-body character wornSprite for a children's dress-up game.
Input images: Image 1 is the authoritative Hachuping character identity reference. Image 2 is the authoritative existing worn costume reference for the frontal pose and rendering style.
Primary request: produce ONE full-body Hachuping wearing a fluffy lavender and soft-pink winter coat, cream fur collar and cuffs, pink heart-shaped buttons, and small matching winter boots. Keep the hood DOWN behind the neck, no hat. A sweet cozy modest winter outfit named 포근 하트 겨울옷.
Preserve invariants: exactly retain the distinctive light-pink face, glossy magenta eyes, happy open smile, hot-pink curled forelock, two long pale-pink side curls with dark-pink curled ends and heart ornaments, huge head/tiny body proportions. Maintain straight-on centered full-body framing and two hands gently clasped together at the center of the torso as in image 2. Keep all face, hairstyle, head shape and chibi proportions faithful. Rounded polished 3D toy-character rendering, soft studio shading.
Composition: one character only, complete hair silhouette and boots visible with generous transparent margin around all edges. Intended runtime frame 600x700 portrait. Do not crop head, curls, tail or feet. Outfit covers torso and legs appropriately; cream fur hem, lavender coat body, pale pink inset panels and heart buttons visible below hands.
Background: genuine alpha transparency, no background scene, no checkerboard pattern baked into pixels, no floor, no cast shadow, no text, no watermark, no additional objects.

References:
- assets/runtime/characters/hachuping/base.png
- assets/runtime/reference-wearables/hachuping/hachuping_outfit_01-v12/worn.png

Generated source: C:/Users/admin/.codex/generated_images/01a07a94-f97a-7012-a496-a590247cd3ea/exec-4180df71-c34c-45a8-b4e8-4c75ce16fdfe.png

### Alpha correction (unsuccessful; not selected)

Use case: background-extraction
Edit target: the attached complete Hachuping winter costume character render.
Change only the background. Remove the entire gray-and-white checkerboard pattern and replace it with ACTUAL TRANSPARENT PIXELS in the PNG ALPHA CHANNEL. The checkerboard currently consists of opaque painted squares and is NOT transparency. Output a true RGBA cutout PNG. Do not simulate transparency with a checkerboard. Preserve the character exactly: all hair, face, eyes, clasped hands, lavender coat, fur trims, heart decorations, tail, legs, boots, lighting, pose, proportions, rendering, framing and edges unchanged. Full silhouette must remain uncut. No background color, no scene, no shadow, no text. One complete character sprite.

Reference: first worn source above.
Generated source: C:/Users/admin/.codex/generated_images/01a07a94-f97a-7012-a496-a590247cd3ea/exec-28abc8a7-d072-4bd6-afdc-62f2efdcc462.png

### Selection clothing sprite

Use case: stylized-concept
Asset type: wardrobe selection sprite for a children's character dress-up game.
Input image: the winter outfit worn on Hachuping is the exact garment design reference. Create ONLY THE CLOTHES, no character.
Primary request: a matching isolated lavender winter coat and matching pair of tiny winter boots displayed neatly below it, front view. Duplicate the reference garment faithfully: softly quilted lavender body, cream fluffy fur collar, fur cuffs and fur hem; pale-pink central button placket with exactly three glossy pink heart buttons; two pale-pink heart pockets outlined with pink stitching; lavender boots with cream fluffy fur tops, pink heart emblems and pink soles. Hood down behind the collar, no hat. Show sleeves naturally extending down and slightly outward so the empty cuffs are clearly visible. Coat collar opening and sleeve cuffs are empty.
Critical exclusions: NO hands, arms, head, face, hair, skin, legs, feet, body, tail, wings, mannequin, hanger, stand or character fragments. Empty freestanding clothes and boots only. Render the unseen central coat area naturally to complete the garment.
Style: rounded polished cute 3D toy garment rendering, soft studio shading matching the reference.
Composition: centered full garment and complete pair of boots, generous clear margin, every fur edge visible and uncut. Square wardrobe icon canvas.
Background: use genuine PNG alpha transparency outside the garments. Do not paint a checkerboard pattern, do not simulate transparency with squares. No background, no floor, no cast shadow, no text or watermark.

Reference: first worn source above.
Generated source: C:/Users/admin/.codex/generated_images/01a07a94-f97a-7012-a496-a590247cd3ea/exec-900912a4-1eea-407a-b2b1-57f4d7cd7e13.png

## Review

- Saved PNGs exist. Sharp metadata: worn.png = 1163×1353, 3 channels, hasAlpha false; sprite.png = 1254×1254, 3 channels, hasAlpha false.
- Retry = 1164×1351, 3 channels, hasAlpha false. Built-in tool succeeded in generating pixels but failed actual requested transparency even after an explicit background-extraction edit. Checkerboard pixels are baked into all results.
- Visual inspection: worn face, pink curled forelock, heart ornaments, long side curls, magenta eyes, frontal clasped hands and tiny body remain recognizably consistent with supplied references. Full hair silhouette, tail and boots visible with margin; no visible subject clipping.
- Sprite visual inspection: complete coat and two boots; no head, hands, skin, legs, tail or mannequin. Matching lavender coat, cream fur trim, pink heart buttons, heart pockets and boots. Garment edges have margin with no visible clipping.
- Runtime readiness: FAIL. Genuine transparent alpha and 600×700 worn frame remain unresolved. These are generated source deliverables and MUST NOT be described or activated as production-ready transparent sprites.
- Metadata records actual dimensions and readyForRuntime=false, plus required target frame. No manifest/app changes or git commit by subagent.
