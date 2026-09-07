# 하츄핑 하트 물놀이 수영복 — 제작 기록

## Method and inputs
- Date: 2026-09-07. Built-in image_gen only; no paid API/CLI.
- Inspected character base and reference worn PNG via view_image before generating.
- Base: assets/runtime/characters/hachuping/base.png
- Approved worn reference: assets/runtime/reference-wearables/hachuping/hachuping_outfit_01-v12/worn.png
- Three separate built-in calls: initial worn, alpha correction edit, standalone selection outfit referencing corrected worn.
- Final generated files copied without pixel edits to this directory. Resize/background processing held under parent instruction.

## Initial worn prompt

Use case: identity-preserve.
Asset type: complete wornSprite PNG for a children's dress-up game.
Input images: Image 1 is the character base identity reference. Image 2 is the approved existing worn outfit reference and is the exact composition, face, hairstyle, body proportions, frontal pose and polished 3D toy rendering reference.
Primary request: Create ONE full-body Hachuping character wearing a cute modest toddler-style one-piece swimming rashguard, pastel aqua with pink sleeves and pink leg cuffs, a small pink heart on the front, integrated shorts legs reaching to just above the knees. The one-piece covers the whole torso and shoulders, with a round high neckline and short sleeves. This is a nonsexual cute fantasy cartoon swimming costume.
Keep the face, magenta glossy eyes, pink curled forelock, long pink twin hair, heart hair ornaments, tiny feet, happy open smile and clasped hands of reference image 2 unchanged. Both hands meet in front at the waist exactly as in image 2. Preserve the same extremely large head and tiny body proportions. Change only the dress into the described one-piece rashguard. Pink character feet visible below suit. Do not add hats, goggles, props or background scenery.
Composition/framing: one character only, straight-on standing frontal full body, centered, entire hair silhouette and feet fully visible with generous clear transparent margins on all sides. Intended runtime canvas 600x700; portrait framing approximately 6:7. Match reference 2 subject scale and placement.
Style: same soft polished 3D children's character game render as the references.
Scene/backdrop: genuinely transparent alpha PNG, no solid background, no checkerboard pixels, no floor or shadows.
Avoid: text, watermark, multiple panels, extra characters, detached clothing, realistic human anatomy, bikini, exposed abdomen, altered hairstyle, altered pose, cropped hair or feet.

Source output: C:/Users/admin/.codex/generated_images/01a07a94-d4d2-70d2-a36e-f29544a067a2/exec-275882ee-6d9b-4a38-815d-7c33a5062415.png

## Worn alpha correction prompt

Use case: background-extraction. Edit the attached generated Hachuping swimming outfit image. Remove ONLY the gray-and-white checkerboard background to genuinely transparent alpha (alpha 0), including between hair and body. Output must be an RGBA PNG with actual transparent pixels, not an RGB image depicting a checkerboard. Keep the full character including face, hair, clasped hands, one-piece aqua and pink swim rashguard, feet, proportions, colors and pose exactly as-is. Full silhouette remains unclipped. No added background, shadow, text or objects.

Source output selected as worn.png: C:/Users/admin/.codex/generated_images/01a07a94-d4d2-70d2-a36e-f29544a067a2/exec-78dd9185-cd70-4017-9228-0e8525bd11bb.png

## Selection sprite prompt

Use case: stylized-concept.
Asset type: clothing-only wardrobe selection sprite for a children's dress-up game.
Input image: reference is the newly generated Hachuping worn swimming outfit. Use it ONLY as the exact garment design reference.
Primary request: Render just the SAME one-piece toddler rashguard swimming garment from that reference, without any character or body. One complete standalone outfit: pastel aqua torso and integrated shorts legs, pink short raglan sleeves, round pink high neck binding, narrow pink sleeve cuffs, pink shorts leg cuffs, pink side piping, single large pink heart centered on the lower front torso. Maintain the tiny squat childlike garment proportions. Show full garment front-on, neatly shaped but EMPTY, with visible hollow neck and sleeves. The small partly obscured jewelry at the reference hands is NOT part of the outfit and must not appear.
Style: polished softly lit 3D cartoon game garment matching the reference materials and palette.
Composition: one centered complete garment only, full sleeves and leg cuffs visible, comfortable margins, square canvas, no hanger, no mannequin, no body, no head, no face, no hair, no arms, no hands, no legs, no feet, no tail.
Background: actual transparent alpha PNG with transparent empty pixels. Do not draw a checkerboard, white backdrop, gray backdrop, pattern, ground or shadow. Output a genuine RGBA cutout.
Avoid: people, character body parts, extra objects, text, watermark, frames, panels, multiple views, crop.

Source output selected as sprite.png: C:/Users/admin/.codex/generated_images/01a07a94-d4d2-70d2-a36e-f29544a067a2/exec-f547bf98-4bb2-41bb-817b-f0aa6fed0737.png

## Review
- Both generated results visually inspected. Worn: frontal full body, both hands clasped in front, full head, hair and feet within canvas, happy facial identity recognizably matching reference. One-piece aqua/pink high-neck short-sleeve rashguard with shorts, no exposed torso. Large head/tiny body maintained; generative face/proportion drift remains possible versus exact reference pixels.
- Selection: garment only, no hands/body/feet or mannequin; complete neckline, sleeves and shorts cuffs visible with margins. Aqua/pink palette, heart, raglan sleeves and piping match worn design.
- Actual metadata checked with Sharp: worn.png 1163x1353, 3 channels, hasAlpha=false; sprite.png 1254x1254, 3 channels, hasAlpha=false. Initial worn also 3 channels and hasAlpha=false.
- **FAIL / NOT RUNTIME READY**: All calls generated baked gray-white checkerboard RGB backgrounds despite explicit alpha request. Targeted built-in alpha correction also failed to produce alpha. No background-removal code was applied.
- **FAIL / FRAME PENDING**: Worn is not 600x700. Parent instruction held all local image edits including resizing pending user input.
- PNG files exist, but these are recoverable generation outputs only and must not be described as final transparent assets or wired into production until repaired and revalidated.
