# 소라핑 수영복 — soraping_outfit_09

## 제작 방식 및 상태
- Built-in image_gen only; no paid API/CLI fallback.
- Read imagegen SKILL.md; inspected base and current reference worn through view_image first.
- Selected source images copied byte-for-byte to this directory. No image editing, resizing or alpha modification performed.
- **NOT runtime-ready: both selected PNGs are RGB and have painted checkerboard backgrounds, not transparent alpha.** Worn is 1159×1357 rather than 600×700. Non-imagegen editing/resizing is on hold per parent instruction pending user approval.
- Design: fully covering aqua long-sleeved ankle-length rashguard suit, pink seams/cuffs, shell badge, lavender scalloped hip skirt.
- Visual QA: entire hair and feet visible in worn; front-facing clasped hands preserved; outfit-only sprite contains no hands, skin, face or mannequin, all garment extremities visible. Face/hair identity recognizable; generated proportions are slightly taller than reference, so exact pixel identity is not guaranteed.
- Background-extraction retry also returned RGB with a painted checkerboard. It was rejected as a fix and is not selected.
- Worn source: C:/Users/admin/.codex/generated_images/01a07a94-b3d8-72d1-8fdb-b82d7da46960/exec-6c14d922-9465-4f4b-8bc5-eff727ada2f6.png
- Selected worn: assets/runtime/expansion/outfits/soraping/soraping_outfit_09-worn.png
- Sprite source: C:/Users/admin/.codex/generated_images/01a07a94-b3d8-72d1-8fdb-b82d7da46960/exec-19ae0752-fe66-4718-9a97-88e66a58aa83.png
- Selected sprite: assets/runtime/expansion/outfits/soraping/soraping_outfit_09.png
- Failed alpha retry source: C:/Users/admin/.codex/generated_images/01a07a94-b3d8-72d1-8fdb-b82d7da46960/exec-baf9bf39-0e8b-42fa-ad5e-d628e2c789fc.png

## Initial worn request (blocked)
Image inputs: assets/runtime/characters/soraping/base.png and assets/runtime/reference-wearables/soraping/soraping_outfit_01-v12/worn.png
Error: HTTP 400 moderation_blocked, input safety category sexual. Request ID 533d8d05-a5e4-4c02-a701-b6ea2ffecaed.
```text
Use case: identity-preserve.
Asset type: transparent full-body wornSprite for Soraping children's dress-up game.
Input image 1 is the character identity/proportions reference; input image 2 is the current finished worn outfit, the primary edit target and framing/style reference.
Change only the outfit to a cute, modest children's one-piece swim outfit: pastel aqua long-sleeved rashguard one-piece with a small attached lilac scalloped swim skirt and integrated short legs, pearly pink piping, a small shell emblem at upper chest. No separate accessories. This is a nonsexual fantasy chibi mascot in practical child-friendly swimwear, covered torso and shoulders.
CRITICAL: preserve the exact character identity, pink curled high ponytail and curled bangs, teal hair band, pastel shell hair ornament, gold diamond forehead mark, enormous purple eyes, facial features, smile, head-to-body proportions, and straight-on full body pose from image 2. Both little hands held together in front at the waist exactly as in image 2. Pink feet visible. Do not change her hair volume, widen her face or add human anatomy.
Style: polished soft glossy pastel 3D kawaii character exactly matching image 2. Front view, centered, entire hair and both feet visible with clear empty margin on every side. Intended final frame 600x700 portrait, preserve subject proportions; full-height composition matching input 2.
Background MUST be genuinely transparent alpha PNG, no checkerboard rendered, no background color, no floor, no shadow plane, no scene, no text, no watermark. One single complete character only.
```

## Selected worn prompt
Image input: assets/runtime/reference-wearables/soraping/soraping_outfit_01-v12/worn.png
```text
Use case: identity-preserve.
Asset type: transparent full-body game character sprite.
Edit this supplied fully clothed pink fantasy mascot. Replace her dress with a FULL-COVERAGE long-sleeved, ankle-length one-piece aqua swimming wetsuit. The wetsuit covers her entire body from the base of the neck to wrists and ankles. Add lilac scalloped overskirt attached over the wetsuit hips, soft pink piping, and a small seashell badge at the collar. Retain her pink feet and little hands; both hands remain touching together at the waist in the EXACT existing pose.
Preserve everything else precisely: huge purple sparkling eyes, face and smile, gold diamond forehead symbol, pink high curled ponytail, curled bangs, teal hair band, multicolor shell hair ornament, proportions, head size and straight-on posture. Match the same glossy pastel toy-like 3D game illustration.
One single complete character centered in portrait frame suitable for 600x700 final canvas, entire hair and feet visible, generous transparent margins so nothing is clipped.
TRUE transparent PNG alpha background. No rendered checkerboard, no floor or scene, no shadow plane, no text or watermark.
```

## Alpha retry prompt (did not resolve transparency)
Image input: selected worn source above.
```text
Use case: background-extraction. Edit the provided game mascot image by removing ONLY the gray and white checkerboard background. Return a PNG with a real alpha channel, every background pixel alpha=0, not a picture of a checkerboard. Keep the character, outfit, pose, proportions, colors, and all details exactly unchanged. Complete full-body character, hair and feet included, no crop. No shadows or background. This is an actual transparent production sprite. Output intended portrait frame 600x700.
```

## Selected clothing-only prompt
Image input: selected worn source above.
```text
Use case: precise-object-edit.
Asset type: wardrobe selection clothing-only PNG sprite.
Reference input is a fully clothed fantasy mascot showing the exact outfit design to reproduce. Output ONLY the clothing from this reference: an aqua full-coverage long-sleeved ankle-length one-piece swimming wetsuit, pink seam piping and pink ankle cuffs, tiny pastel shell collar badge, with attached lavender layered scalloped hip overskirt with pink trim. Same glossy pastel 3D toy/game rendering, colors, materials and details.
Remove the mascot completely: absolutely NO face, head, hair, eyes, hands, fingers, feet, skin, body, mannequin, hanger or stand. Clothing displayed alone front-facing, sleeves gently bent inward but separated with open empty wrist cuffs; hollow empty neck opening. Both pant legs fully visible. Garment is one integrated outfit, centered with generous empty margin all around. No extra objects, no text, no watermark.
Output a real transparent-background PNG with an actual alpha channel. All empty background and sleeve/neck openings must be genuinely transparent, not white and not a painted checkerboard.
```
