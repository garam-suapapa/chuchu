# 방울핑 수영복 (bangulping_outfit_09)

## Authorized postprocessing update

User subsequently approved local image postprocessing. Final transparent, normalized assets now exist separately at `processed/bangulping_outfit_09-worn.png` (600×700) and `processed/bangulping_outfit_09.png` (512×512). Reproducible Pillow/numpy script, numeric QA and four-background contact sheets are in `processed/process_09.py`, `processed/09-qa.json`, and `processed/09-qa.md`. Original generation files below remain unchanged and opaque; consumers should use the processed files.

## Result and readiness

- Built-in image_gen used for three independent calls: worn, alpha correction retry, garment-only selection sprite. No API/CLI used.
- Two requested images were created and copied without image edits to the requested filenames. They are **not runtime-ready**: all three outputs are 8-bit PNG color type 2 (RGB), with a visibly baked-in checkerboard background rather than genuine transparent alpha.
- Worn: `bangulping_outfit_09-worn.png`, 1162 × 1354, 1,396,903 bytes. Required 600 × 700 normalization is pending because parent instructed that non-image_gen image editing, including resize, must wait for user response.
- Selection sprite: `bangulping_outfit_09.png`, 1254 × 1254, 1,078,578 bytes.
- The separate alpha-only retry also remained RGB with checkerboard (1164 × 1351); it was preserved as evidence but not selected.
- No original assets, manifests, app code, or other agents' outputs changed. Root agent handles catalog and commit.

## References inspected with view_image before generation

1. `assets/runtime/characters/bangulping/base.png`
2. `assets/runtime/reference-wearables/bangulping/bangulping_outfit_01-v12/worn.png`

The latter is the actual location; the initial shorter reference path in the assignment did not exist.

## Visual QA

- Both originals and the alpha retry were opened with view_image.
- Worn: turquoise segmented ponytails, gold hair bands, curled light-aqua bangs, blue eyes, forehead star and small smile retained recognizably. Straight frontal standing pose and hands joined at chest retained. Head, hair tips, hands, outfit, and feet all fully inside image edges; no visible clipping.
- Worn identity limitation: generated face/body is a new render with small proportion differences and relatively longer visible legs; not pixel-identical to source.
- Outfit: modest short-sleeved connected shorts rashguard, turquoise side panels/sleeves, cream front and trim, four-point gold chest star.
- Sprite: garment only, no body, hands, limbs, hair, face, hanger or mannequin. Garment fully within generous margins. Palette, panel shapes, star and hem design match worn.
- Critical failed QA: real transparency. Do not ship these directly as transparent overlays. No programmatic background removal was attempted.
- Canvas QA: worn size is not 600 × 700; pending explicitly authorized resize.

## Exact prompts and generated files

### 1. Worn creation

```text
Use case: identity-preserve. Asset type: transparent PNG worn character sprite for a children's dress-up game. Edit the character in reference image 2: change ONLY the clothing to a cute modest toddler short-sleeved one-piece rashguard swimsuit with attached shorts; turquoise side panels and sleeves, warm cream front panel, yellow small star emblem at the upper chest, turquoise shorts legs with cream hem binding. NO skirt, no bikini, no exposed torso. Image 1 is supporting identity reference; image 2 is the exact full-body pose and framing reference. Preserve the existing character identity: glossy turquoise segmented twin ponytails and gold bead bands, curled pale aqua bangs, pink round face, golden four-point forehead star, huge dark blue irises and white highlights, small smile. Keep the same face proportions, tiny childlike body proportions, straight-on camera, symmetrical standing feet, hands gently joined together at chest in front of outfit. Keep original hair silhouette and full head and feet visible. High quality polished cute 3D toy render consistent with reference, one character only. Full body centered with clear transparent safety margin on all edges, intended portrait 600x700 runtime frame. Genuine transparent background with alpha=0 outside character; no white/colored/checkerboard backdrop, no ground, no shadows outside silhouette. No text, props, logos, watermark, adult anatomy or accessories.
```

Generated: `C:/Users/admin/.codex/generated_images/01a07a94-d46b-7dc2-9cab-3bf7484c3722/exec-84714422-0ab2-466c-a5f4-668cfa22b155.png`

Saved original: `sources/09-worn-original.png`. Selected byte-for-byte copy: `bangulping_outfit_09-worn.png`.

### 2. Alpha-only correction attempt

```text
Use case: background-extraction. Edit this exact image. Remove the baked-in gray and white checkerboard background completely and return the unchanged character as a PNG CUTOUT WITH A REAL TRANSPARENT ALPHA CHANNEL. This is a background removal task only. Do NOT draw another checkerboard, white, black, or colored background. Every pixel outside the character silhouette must have alpha 0; anti-aliased silhouette edges may have fractional alpha. Preserve every visible character detail, face, body proportions, hands together pose, hair, swimsuit design, lighting, and framing. The entire full body is already visible; retain all of it. Do not regenerate or restyle the character. Output only the transparent character sprite.
```

Referenced the first generated worn image. Generated: `C:/Users/admin/.codex/generated_images/01a07a94-d46b-7dc2-9cab-3bf7484c3722/exec-4dde3e83-4ed6-47b8-ac76-5f03aa909f60.png`

Saved evidence: `sources/09-worn-alpha-retry.png`.

### 3. Matching clothing-only sprite

```text
Use case: stylized-concept. Asset type: wardrobe clothing-selection PNG sprite, garment only. Use the attached character's swimsuit as the exact garment design reference: a cute childlike short-sleeved one-piece rashguard with attached shorts, glossy turquoise sleeves and side panels, warm cream central torso panel continuing between shorts legs, small yellow four-point star emblem high on front chest, cream trim around round collar, sleeve openings and both leg openings. Create ONLY this swimsuit as an empty garment, front view, centered with mild 3D volume matching the reference toy render. All hands, arms, legs, feet, head, face, hair, skin and body must be absent; no mannequin, no hanger, no character, no props. The two short sleeves hang naturally a little outward and both shorts legs are clearly distinct, with the empty collar opening visible. The garment has the same miniature childlike proportions as the outfit being worn in the reference. All of the garment fits inside a square canvas with a wide clear margin on every side. Deliver a real transparent-background PNG with genuine alpha channel and fully transparent pixels outside the clothing. Do NOT draw checkerboard or any backdrop. No text, logo, watermark, background or ground shadow.
```

Referenced first generated worn image, already inspected via view_image. Generated: `C:/Users/admin/.codex/generated_images/01a07a94-d46b-7dc2-9cab-3bf7484c3722/exec-a5fff4cd-4a05-4bf0-ac93-cfdbd548fe5a.png`

Saved original: `sources/09-sprite-original.png`. Selected byte-for-byte copy: `bangulping_outfit_09.png`.
