# Challangping expansion outfit production prompts

Built-in image_gen only. Each outfit used a separate worn call, one background extraction retry, and a separate garment-only call referencing the generated worn image. Base and current reference-wearables were inspected with view_image first.

The original images are RGB PNGs with baked checkerboard backgrounds. Actual alpha and 600x700 conversion are pending authorized local processing. No paid API or CLI was used. No existing outfit or application manifest was changed.

## 07 복숭아 꽃 잠옷

### 0

```text
Use case: identity-preserve.
Asset type: complete character wornSprite for a children's dress-up game.
Input images: image 1 is the existing challangping base identity reference; image 2 is the existing approved complete dressed character and the primary proportions/rendering/pose reference.
Change only the outfit in image 2 to cute comfortable pajamas: a pastel peach long-sleeve pajama top with rounded ivory collar, tiny floral print, small central bow and buttons; matching loose pajama trousers and soft matching slippers. Do not add a sleep cap or extra props.
Keep exactly the same coral-pink long curled hair, golden bead hair chain, side flower ornament, heart forehead jewel, giant green eyes, small smiling face, winglike ears, chibi head/body proportions and front-facing clasped-hands pose as image 2. Exactly one pair of hands gently together over the chest, continuous wrists and sleeves. Fully covered, wholesome, childlike.
Maintain polished colorful 3D toy-like illustration from image 2. Single complete full body from hair top to soles, centered and fully visible with generous transparent margins on all sides, no crop.
Scene/backdrop: actual transparent background PNG with alpha; no solid backdrop, checkerboard pixels, shadow floor, text, label or watermark. Only one character. Output portrait aspect ratio suitable for a 600x700 runtime frame.
```

### 1

```text
Use case: background-extraction. Edit target: the attached pajama character image. Remove the entire visible white and gray checkerboard backdrop and make it genuinely transparent with alpha=0, including spaces between feet. Preserve the entire character exactly: face, head, hair, outfit, hands, pose and pixels inside the subject unchanged. Output an RGBA PNG with real transparent alpha background, not a rendered transparency checkerboard. No backdrop, shadow, or floor. Keep full body and margins.
```

### 2

```text
Use case: precise-object-edit.
Asset type: clothing-only wardrobe selection sprite in a children's dress-up game.
Input image: the reference shows the exact pajama outfit to reproduce. Show only this same complete matching peach floral pajama set: long sleeved button-front top with ivory rounded scalloped collar and peach bow, tiny white daisy print, matching loose pants with scalloped cuffs, and matching bow slippers. Match colors, materials and every garment design detail. Arrange front-facing as a compact outfit display with the top above the trousers and slippers below, sleeves gently out to each side so all garment details are visible.
Remove the character completely: no face, hair, head, ears, skin, arms, hands, legs or feet. Clothing only, empty cuffs and empty neck opening. No hanger, mannequin or stand.
Polished colorful toy-like illustration matching the reference. Whole garment set centered with safe empty margins; do not crop any edge. Scene/backdrop: genuinely transparent RGBA PNG with alpha=0 outside clothing, not a white/gray checkerboard drawing. No background, floor, shadow, label, watermark, text or accessories.
```

Source paths and original QA: 07-notes.json

## 08 노란 우비

### worn

```text
Use case: identity-preserve.
Asset type: transparent PNG full-body wornSprite for a children's dress-up game.
Input images: Image 1 is the character identity and original body proportions reference. Image 2 is the EDIT TARGET and the authoritative front-facing hand-clasped pose, polished render style, face, hair and accessory reference.
Primary request: change ONLY the clothing of this exact Challangping character to a cute complete rainy-day outfit: a glossy sunny-yellow A-line raincoat with rounded coral-pink collar, coral trim at cuffs and hem, a neat center row of three small coral snap buttons and two rounded patch pockets. Hood is DOWN behind the neck, never covering or changing any hair. Matching small yellow rain boots with coral soles. Keep the hands visibly clasped at the chest exactly as in image 2; sleeves stop naturally at wrists. No umbrella or props.
Preserve EXACT facial identity, enormous green eyes and their highlights, tiny smile, ivory skin, pink glossy hair, curled hair tips, gold bead hair chain, gold forehead heart, green-and-yellow flower ornament, white ear wings. Preserve the big-head/small-body chibi proportions, head silhouette and front camera angle from image 2. Friendly child character, age-appropriate clothing.
Style: same high-quality polished 3D toy character illustration and clean edges as edit target. Single centered complete character from hair top to both boot soles; every hair curl and body part fully visible with a safe transparent margin. Output tall portrait canvas ideally 600x700 proportion.
Scene/backdrop: genuine transparent alpha background, no ground, no shadow backdrop, no checkerboard drawing, no colored background.
Avoid: extra characters, extra limbs, changed pose, spread hands, body redesign, hats, text, labels, watermark, cropping.
```

### alphaRetry

```text
Use case: background-extraction.
Input image is the EDIT TARGET: exact finished yellow raincoat character.
Remove the entire white and light gray CHECKERBOARD BACKGROUND from this image. It is currently painted opaque pixels, not transparency. Return an actual RGBA PNG with alpha=0 outside the character. Do not paint checkerboard or white as a substitute for transparency. Preserve the complete character foreground exactly: identical face, hair, ornament, hands clasped, yellow and coral raincoat, boots, pose, rendering, proportions and layout. Keep hair top, curls and boot soles fully inside canvas with transparent margin. Only remove the background; no shadows or extra objects. Actual alpha transparency is the required deliverable.
```

### sprite

```text
Use case: precise-object-edit.
Asset type: wardrobe selection clothing-only PNG sprite for a children's dress-up game.
Input reference is the completed Challangping raincoat wornSprite; reproduce ONLY its identical clothing design as a clothing product cutout.
Primary request: one front-facing empty sunny-yellow glossy A-line raincoat, coral-pink rounded collar, coral trim at sleeve cuffs and lower hem, centered coral round snap buttons, two yellow rounded patch pockets. Hood down behind collar. Sleeves arranged naturally outward/downward so empty cuff openings are visible. Include its matching pair of little glossy yellow rain boots with coral soles, neatly arranged just below coat. Exact matching materials/colors and polished 3D toy render of the reference.
CRITICAL: clothes and shoes ONLY. Remove the character completely: NO face, NO head, NO hair, NO ears, NO hands, NO arms, NO skin, NO legs, NO body, NO mannequin, NO hanger. Show the continuous coat front without hand-shaped areas or hand imagery. Fill previously occluded coat front naturally with the same yellow coat and center snaps.
Composition: single centered coordinated clothing set, coat above boots, entire coat sleeves hem and both boots fully visible with generous margin, straight-on orthographic front view.
Background: actual alpha transparency in RGBA PNG, no white background, no checkered pixels. Completely empty transparent space around and between clothes. No background scene, no text, no labels, no watermark, no drop shadow.
```

Source paths and original QA: 08-notes.json

## 09 조개별 민트 수영복

### worn

```text
Use case: identity-preserve. Asset type: children's dress-up game full-body transparent wornSprite.
Input images: image 1 is the character identity reference; image 2 is the edit target and strict pose/proportion/rendering reference. Edit image 2, replacing only its pink party dress with a cute modest toddler one-piece full-coverage swim romper. This is a nonsexual toy fantasy character in children's beach clothing.
Preserve the exact existing Challangping identity: huge glossy emerald-green eyes, small smile, cream toy skin, heart forehead jewel, vivid coral pink hair with symmetrical curled ends, three bangs, gold pearl hair chain, green/yellow flower ornament, white ear wings. Preserve image 2's head scale, body proportions, straight-on standing pose with both hands joined in front at chest height, feet and arms positions, glossy polished 3D toy rendering. Do not redesign the face or hair.
Outfit design: mint-aqua short-sleeved UV swim romper, high rounded collar with narrow cream trim, fully covered torso, opaque thigh-length shorts legs, subtle scalloped peplum at waist, a small pink seashell motif at upper chest and tiny gold starfish accent, pink piping at sleeve cuffs and leg hems. Short cream legs and feet visible beneath the romper. No accessories or beach props.
Single complete character centered on a genuinely transparent alpha background, vertical 600:700 aspect ratio, full hair ornament, hair curls, feet and entire outfit all inside frame with margin. No cast floor shadow, no background, no checkerboard baked into image, no typography, no watermark.
```

### alphaRepair

```text
Use case: background-extraction. Edit target: the provided Challangping mint swim-romper full-body image. Remove the entire gray-and-white checkerboard background and output a genuinely transparent RGBA PNG with zero-alpha pixels outside the character. The checkerboard in the input is an unwanted opaque background, not part of the art. Preserve every character pixel, the exact facial features, coral hair, joined hands, mint romper, peplum, seams, shell/starfish and feet. Full body entirely visible with margins. Do not paint any backdrop, white field, checker pattern or shadow. Actual transparent alpha output is required.
```

### sprite

```text
Use case: precise-object-edit. Asset type: children's dress-up wardrobe selection garment sprite.
Input image is a reference of the character wearing the outfit. Create ONLY the exact mint-aqua one-piece short-sleeved toddler swim romper seen in it, as a front-facing isolated empty garment.
Keep the exact matching design: aqua mint opaque fabric, high rounded cream-trimmed neck opening, short sleeves with cream and pink cuff piping, pink raglan shoulder seam piping, pink seashell emblem on upper chest, small gold starfish beneath it, scalloped peplum with cream trim, thigh-length shorts with separate leg openings and pink/cream hems. Reconstruct portions hidden by the hands. Shape the sleeves naturally without arms, show empty dark-mint fabric interiors at openings.
Remove ALL character body parts: absolutely no head, hair, hands, arms, neck, legs, feet, skin, mannequin, hanger or accessories. One single complete garment centered, entire garment inside frame with generous margin. Match polished glossy 3D toy rendering and design precisely, without text, props or watermark.
Output a genuinely transparent RGBA PNG. Background pixels outside garment must have alpha=0. Do not render a checkerboard, gray squares, white backdrop or floor shadow.
```

Source paths and original QA: 09-notes.json

## 10 포근한 꽃단추 겨울옷

### worn

```text
Use case: identity-preserve. Asset type: transparent full-body wornSprite for the chuchu children's dress-up game. Input image 1 (base.png): exact character identity reference. Input image 2 (existing worn.png): primary edit target and exact front-facing pose, framing, proportions, polished toy-like 3D rendering reference. Create exactly ONE character wearing a new warm winter outfit. Preserve Challangping's exact enormous green eyes, tiny smile, cream face, pink-red hair silhouette and curled ends, gold bead hair chain, forehead heart gem, side flower hair ornament, white wing-like ears, big head/small body proportions, and front-facing hands gently clasped together at chest. Change ONLY the outfit. Outfit design: cozy soft peach-pink quilted winter coat, creamy fluffy collar and cuff trim, tiny floral gold buttons, pale mint knitted scarf with short ends, matching warm cream leggings and peach-pink winter boots with fluffy cream tops. Keep existing hair accessories fully visible; no hat, no hood on head. Arms remain bent inward, two bare hands clasped at center, not hidden by scarf. Coat fits the original short chibi torso and reaches above knees. Render whole character including hair tips and both boots, centered with comfortable transparent margins, intended for a 600x700 portrait runtime frame. High-quality smooth glossy toy character shading with soft textile texture. GENUINE TRANSPARENT RGBA BACKGROUND, no white background, no checkerboard drawn in image, no scene, no floor, no cast shadow, no text, no watermark, no extra figures. Keep face/hair/pose near-identical to existing worn reference. This is one finished wearing image only, no clothing-only view or collage.
```

### alphaRetry

```text
Use case: background-extraction. Edit target: the attached completed winter character image. Remove ONLY the entire gray/white checkerboard background, including between feet and around every hair edge. Export actual transparent RGBA PNG with alpha=0 outside subject. The checkerboard is baked into this input and MUST be removed, not painted again. Do not add ANY checkerboard, white, gray, black, colored background or floor. Preserve EVERY character pixel design: identical pink hair, green eyes, face, ornaments, peach quilted winter coat, cream fur trim, mint scarf, hands clasped together, leggings, boots. No redesign, no reframing, no clipping. Single full-body transparent cutout.
```

### sprite

```text
Use case: precise-object-edit. Asset type: wardrobe selection icon for children's dress-up game. The provided image is the EXACT outfit design reference. Create a SINGLE CLOTHES-ONLY product sprite of that same complete winter outfit: peach-pink diamond quilted short winter coat with fluffy ivory collar/cuffs/hem, small white flower buttons with golden centers, pale mint rib-knit scarf with short fringed ends, cream ribbed leggings and matching peach boots with cream fluffy cuffs and side flower details. Coat facing directly forward, sleeves relaxed slightly outward with EMPTY dark sleeve openings, natural clothing product arrangement. The scarf is neatly arranged at collar; leggings and two boots directly below coat as coherent complete outfit. Show ALL clothing pieces and entire coat/boots inside generous transparent margins. CRITICAL: remove character entirely: NO face, NO head, NO hair, NO ears, NO hands, NO fingers, NO skin, NO arms, NO legs or body, NO mannequin, NO hanger. Clothing only, with hollow openings. Preserve the same color, proportions, materials and details of clothing from reference. High quality polished toy-like 3D asset. Transparent PNG with real alpha channel outside the clothing. No checkerboard drawn in pixels, no background, no floor, no shadows outside clothing, no text, no collage. One complete outfit only.
```

Source paths and original QA: 10-notes.json

## Authorized local processing

After the original built-in transparency failures, user explicitly approved local Python background removal and resizing. Final runtime images are under processed/; catalog.json now points to them. process.py reproduces connectivity-based background segmentation, reviewed pale-ear threshold and enclosed leg-gap seeds, measured-alpha framing and contact sheet. processed/QA.md and processed/qa.json document final validation. Original generation prompts and RGB source files above are preserved.
