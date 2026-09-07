# Accessory expansion prompts

Generation mode: built-in image_gen only. All six images were generated separately and visually inspected. Requested alpha was not produced: original outputs have white backgrounds. Tiara background-extraction retry produced RGB checkerboard and was rejected.

Final preparation: the user explicitly authorized local background removal and resizing. `prepare-transparent.py` preserves the six original RGB PNGs and writes cropped, antialiased RGBA PNGs into `processed/` using Pillow, NumPy and SciPy. Background removal selects connected neutral-white background regions and manually inspected enclosed holes, preserving internal pearl, fabric and cloud highlights. `catalog.json` now points to those processed sprites and contains corrected proportional placement frames.

QA: all six processed sprites have alpha extrema 0 and 255 and partially transparent antialiased edge pixels. `processed/contact-sheet.jpg` was visually inspected on dark blue and pink backgrounds. `processed/doll-placement-review.jpg` was visually inspected for all 24 character/accessory combinations. `qa.json` records dimensions, alpha pixel counts and source bounding boxes. No additional model or package download was needed.

## pearl-tiara (진주 티아라)

Original generated file: C:\Users\admin\.codex\generated_images\01a07a93-9546-7c62-8436-431ad38b7294\exec-f7a03351-f6d5-4367-827f-5a6d4d51d7aa.png

Use case: stylized-concept. Asset type: transparent PNG sprite for a cute children's fantasy dress-up game. Create exactly ONE pearl tiara, front view, isolated with genuine transparent alpha background. A low elegant rose-gold tiara with five rounded pearl-tipped arches and a pale lavender teardrop central gem, ivory pearls, soft pink tiny gems. Polished rounded toy-like 3D illustration, soft pastel coloring, glossy friendly highlights, delicate warm gold trim, clean silhouette. Symmetrical horizontal wearable shape, full object visible, centered with narrow transparent margins, no detached sparkles. No head, face, body, mannequin, text, logos, watermark, scenery, floor, drop shadow or checkerboard pattern. Actual transparency outside item; high-quality game asset.

## strawberry-beret (딸기 베레모)

Original generated file: C:\Users\admin\.codex\generated_images\01a07a93-9546-7c62-8436-431ad38b7294\exec-2975509b-053c-4805-a859-c57f759ed63f.png

Use case: stylized-concept. Asset type: isolated PNG game sprite. Exactly ONE adorable strawberry beret, front view for wearing on top of a cartoon character's head. Soft rounded strawberry-pink plush beret tilted gently, tiny pale mint-green felt leaf and short stem on top, a small strawberry charm at side, warm gold rim stitch. Glossy soft toy 3D illustration, pastel color palette, smooth dimensional shading and friendly highlights matching a polished fantasy doll dress-up game. Full hat visible centered, close crop with small margin, no head/face/body/mannequin. No extra objects, sparkles, text, logos, watermark, floor or cast shadow. Prefer genuinely transparent alpha background, if unavailable use perfectly solid plain pure white background, NEVER draw checkerboard.

## flower-wreath (꽃 화관)

Original generated file: C:\Users\admin\.codex\generated_images\01a07a93-9546-7c62-8436-431ad38b7294\exec-079614cc-230d-45ee-88b0-a5b5bd249522.png

Use case: stylized-concept. Asset type: PNG head accessory sprite for children's fantasy doll dress-up. Exactly ONE small flower wreath crown seen from front, as a wide gently curved horizontal garland to place across forehead. Five rounded blossoms: pink central rose, two buttery yellow daisies and two lavender blossoms, tiny pale mint leaves, short curved thin warm gold underlying band. Cute polished toy-like 3D illustration, pastel colors, soft glossy petal surfaces, generous simple shapes readable at small size, dimensional friendly highlights, matching magical doll game accessories. Entire object visible centered with narrow margin, no person/head/face/body/mannequin, no loose particles/sparkles, no text/logo/watermark, no scenery/floor/shadow. Prefer actual transparent alpha background; if unavailable plain completely solid pure white, absolutely NEVER draw a checkerboard pattern.

## moon-pin (달빛 머리핀)

Original generated file: C:\Users\admin\.codex\generated_images\01a07a93-9546-7c62-8436-431ad38b7294\exec-51f32090-8d66-4f0a-99d9-1d6a391817af.png

Use case: stylized-concept. Asset type: PNG accessory sprite for a children's fantasy doll dress-up game. Exactly ONE moonlight hair clip, front view, compact oblique ornament: a soft golden crescent moon holding a rounded pale lavender star gem, two tiny pearly beads attached along its outer curve, a short pale blue ribbon behind, all physically one connected clip. Cute polished glossy toy-like 3D illustration, gentle pastel coloring, warm metallic trim, clean rounded silhouette, dimensional soft highlights. Entire clip visible centered with small margins. No person/head/face/body/mannequin, no loose sparkles or extra stars, no text/logo/watermark, no floor/shadow. Actual transparent alpha background if supported; otherwise solid flat pure white background, absolutely NEVER depict checkerboard.

## bunny-bag (토끼 가방)

Original generated file: C:\Users\admin\.codex\generated_images\01a07a93-9546-7c62-8436-431ad38b7294\exec-7cdd0643-b224-466e-a239-09ac70ebba74.png

Use case: stylized-concept. Asset type: PNG handbag accessory sprite for cute children's fantasy doll dress-up game. Exactly ONE small bunny handbag seen straight from the front. Rounded soft peach-pink purse body with two upright bunny ears extending from its top, a simple embroidered sleeping bunny face on front, lavender bow at one ear, tiny golden heart clasp, one short arched pearl-bead handle immediately above the body. No long shoulder strap or crossbody chain. Cute polished toy-like 3D illustration, soft pastel shades, glossy friendly highlights and delicate warm gold trim, readable coherent silhouette. Entire bag and handle visible centered with small margins, no character/body/hands, no extra loose objects, no text/logo/watermark, no floor/shadow. Actual transparent alpha background if supported, otherwise completely solid pure white backdrop, NEVER a checkerboard pattern.

## rainbow-bag (무지개 가방)

Original generated file: C:\Users\admin\.codex\generated_images\01a07a93-9546-7c62-8436-431ad38b7294\exec-0e0fd36a-3c8b-4675-8192-08a756c0137e.png

Use case: stylized-concept. Asset type: PNG handbag accessory sprite for cute children's fantasy doll dress-up game. Exactly ONE tiny rainbow handbag, straight front view. Compact half-circle purse with pastel pink, peach, buttery yellow, mint, sky blue and lavender rainbow stripes across the rounded face, two creamy puffy cloud appliques at lower corners, a gold star clasp at center. One small short warm-gold arched handle directly above bag; NO long shoulder strap, no crossbody chain. Cute polished glossy toy-like 3D illustration, gentle highlights, smooth rounded forms, fine warm gold trim, cheerful pastel style, readable silhouette. Entire bag and short handle visible centered with small margins. No people/body/hands, no loose particles or detached props, no text/logo/watermark, no floor/shadow. Prefer actual transparent alpha background; otherwise flat completely solid pure white backdrop, NEVER draw checkerboard.

## Rejected tiara extraction attempt

Use case: background-extraction. Edit only the background of this pearl tiara sprite. Remove ALL white background, including every hole between the gold arches, leaving actual transparency (RGBA PNG alpha=0 outside tiara). Preserve the exact tiara colors, ivory pearls, lavender gem, front view, outline, shape and glossy finish. Crop to full tiara with a small transparent border. No checkboard pixels, no opaque background color, no text, no floor shadow. Output a real transparent PNG cutout suitable for compositing on a character.

Result: RGB PNG with baked-in checkerboard; rejected, generated source retained under Codex generated_images.
