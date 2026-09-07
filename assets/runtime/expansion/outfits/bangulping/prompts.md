# 현재 상태: 후처리 완료

사용자가 로컬 Python 처리를 명시 승인한 뒤 4벌/8개를 실제 투명 RGBA PNG로 보정했다. 최종 경로는 `processed/`, 착용본 600×700, 선택용 512×512이며 catalog.json은 이 최종 파일을 참조한다. 원본 8개 해시는 불변이다. 대비색 접촉판 직접 검수와 alpha/규격 검수를 통과했다. 재현 방법과 최신 검수는 `processed/README.md` 및 `processed/qa-report.json`을 참조한다.

아래는 보존한 **후처리 이전 생성 기록**이다. 아래의 RGB 실패·보류 상태는 당시 원본에 대한 기록이며 현재 processed 결과에는 해당하지 않는다.

---
# 방울핑 의상 확장 — 실제 프롬프트와 검수

4벌의 착용본과 신체 없는 선택용 의상, 총 8개 PNG를 built-in image_gen으로 제작했다. 각 의상마다 착용본, 알파 수정 재시도, 선택용 이미지를 별도 호출했다(총 12회). 유료 API/CLI를 사용하지 않았다.

**현재 8개 모두 원본 RGB PNG이며 런타임 준비 완료가 아니다.** 도구의 실제 알파 출력이 실패했고 체크무늬/흰 배경이 픽셀에 포함돼 있다. 추가 재시도 중단 및 로컬 이미지 편집 보류는 상위 작업의 최신 지시다. 원본 복사 외 이미지 후처리를 하지 않았다. 상위 작업이 사용자 답변 후 투명화와 600×700 규격 변환을 처리한다.

- `catalog.json`: 4개 항목 배열. sprite width/height와 wornWidth/wornHeight는 실제 현재 파일 크기이다. targetCanvas는 향후 목표 규격이며 현재 규격으로 오인하면 안 된다.
- `qa-report.json`: 파일 존재, PNG 형식/채널, 실제 크기, alpha 없음, SHA-256 읽기 전용 검사.
- `inspect-assets.cjs`: 읽기 전용 검수 재실행. `node assets/runtime/expansion/outfits/bangulping/inspect-assets.cjs`.
- `sources/`: 초기 원본 및 투명화 재시도 증거 보존.
- 모든 결과를 view_image로 확인했다. 전체 머리/몸/발/의상 잘림 없음, 선택용에 신체/손 없음, 의상 색/구조/장식 일치. 수영복의 다리는 기준보다 다소 길고, 생성형 얼굴/비율은 픽셀 단위 일치하지 않는다.
- 원래 manifest와 app 코드, 기존 의상 파일 변경 없음.

아래는 의상별 실제 프롬프트 및 제작 기록 전문이다.

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



---

# 방울핑 우비 (bangulping_outfit_08)

- 담당 범위: 우비 착용본 + 동일 디자인 옷장 선택용 이미지.
- 제작: built-in `image_gen`만 사용, 총 3회(착용본 1회, 배경 추출 재시도 1회, 선택용 1회).
- 참고 이미지는 생성 전에 `view_image`로 확인함:
  - `assets/runtime/characters/bangulping/base.png`
  - `assets/runtime/reference-wearables/bangulping/bangulping_outfit_01-v12/worn.png`
- 의상명 제안: 별방울 우비. category: raincoat.
- 기존 에셋, manifest, app 코드 변경 없음. 원본 복사 외 이미지 후처리 없음. 유료 API/CLI 미사용.
- 상위 최신 지시에 따라 리사이즈/배경제거 등 image_gen 이외 이미지 편집은 보류.

## 파일과 검수

| 파일 | 크기 | 형식 | 실제 알파 | 상태 |
|---|---:|---|---|---|
| `sources/08-worn-original.png` | 1162×1354 | PNG RGB 24bpp | 없음 | 첫 착용 생성 원본 보존 |
| `bangulping_outfit_08-worn.png` | 1163×1353 | PNG RGB 24bpp | 없음 | 배경 추출 재시도 결과. 런타임 미준비 |
| `bangulping_outfit_08.png` | 1164×1351 | PNG RGB 24bpp | 없음 | 옷장 선택용. 런타임 미준비 |

- 실제 파일 존재 및 바이트 크기를 확인함(각각 1,395,181 / 1,463,705 / 1,229,472 bytes).
- System.Drawing 읽기 전용 메타데이터 검사는 세 파일 모두 `Format24bppRgb`; 모서리 alpha=255. 체크무늬는 실제 배경 픽셀로 들어가 있으며 투명 알파가 아니다.
- 세 번의 프롬프트 모두 실제 투명 배경을 요청했으나 생성 도구가 RGB 불투명 결과를 반환했다. 따라서 **투명 PNG 조건 미충족**.
- 착용본은 **600×700 미충족**, 임의 리사이즈하지 않음.
- 시각 검수: 머리 양쪽 끝, 머리 윗부분, 우비 소매/밑단, 양쪽 장화 모두 캔버스 안에 여유 있게 있고 잘림 없음.
- 착용본은 터키석 양갈래, 노랑 머리장식, 파란 큰 눈, 분홍 피부와 이마 노랑 표식, 정면 손을 모은 자세를 유지. 생성형 재해석이므로 기존 얼굴/비율과 픽셀 단위 동일하지 않음.
- 선택용은 피부/손/신체/머리 없이 빈 우비와 장화만 포함. 노랑 우비, 청록 깃/소매/단/중앙 여밈, 노랑 버튼 3개, 별 주머니 2개가 착용본과 일치.
- 상위 통합 시 이 RGB 파일을 최종 투명 런타임 에셋으로 간주하면 안 됨. 투명 배경과 600×700 완료 전 검수 미통과 상태를 유지해야 함.

## 실제 프롬프트

### 1. 착용본
```text
Use case: identity-preserve. Asset type: full body transparent PNG wornSprite for a children's dress-up game. Edit target: image 2 existing Bangulping worn character. Image 1 base is supporting identity reference. Change ONLY the outfit to a cute raincoat; keep the exact same character face, huge blue eyes, tiny smile, pink skin, yellow diamond forehead mark, turquoise symmetrical bubble pigtails and buns with yellow bead bands, head/body proportions, centered straight front view, hands gently clasped together in front of chest, and feet together. Preserve full hairstyle with hood DOWN behind shoulders. Outfit: sunny yellow A-line knee-length raincoat, turquoise rounded collar and sleeve cuffs, turquoise edging along hem, three small yellow buttons on turquoise placket, two small turquoise patch pockets with tiny yellow star appliques, glossy soft toy-like material. Matching small yellow rain boots with turquoise soles. No umbrella, hat, scenery, rain or new props. Render as polished cute 3D toy illustration matching image 2. Single complete character, all hair and boots fully visible with comfortable transparent margins, portrait 6:7 framing intended for 600x700. Actual transparent alpha background, no white background, no checkerboard painted into pixels, no shadow/floor, no text, no watermark. Most important: keep face, turquoise hair and original clasped-hands pose unchanged.
```
Output: `C:/Users/admin/.codex/generated_images/01a07a94-ad23-7521-8004-b32f0c4edc50/exec-1e7549a6-2b05-4c60-a0cc-c67b389a4683.png`

### 2. 실제 알파 요청 재시도
1번 결과를 `view_image`로 확인한 뒤 해당 파일을 편집 대상으로 사용.
```text
Use case: background-extraction. Edit this image only to REMOVE THE ENTIRE CHECKERBOARD BACKGROUND and return a genuinely transparent PNG cutout with real alpha=0 outside the character. This must have a real RGBA transparent channel, not an RGB checkerboard or white background. Keep the complete character pixel appearance and design unchanged: same face, turquoise pigtails, clasped hands, yellow turquoise raincoat and boots. All subject visible with margins. The only change is making background actually transparent. No checkerboard drawn into image, no white/gray pixels outside subject, no floor, no shadow.
```
Output: `C:/Users/admin/.codex/generated_images/01a07a94-ad23-7521-8004-b32f0c4edc50/exec-9f172d17-43d8-467f-a2e8-1b9270b55664.png`

### 3. 같은 디자인 옷장 선택용
2번 착용 결과를 `view_image`로 확인한 뒤 참조로 사용.
```text
Use case: precise-object-edit. Asset type: clothing-only wardrobe selection PNG sprite for a children's dress-up game. Reference image shows the approved exact raincoat design. Create ONLY this matching outfit, isolated and empty of all anatomy. Sunny yellow glossy A-line raincoat, hood folded down, rounded turquoise collar, turquoise sleeve cuffs, turquoise center placket with three small round yellow buttons, turquoise hem edging, two turquoise patch pockets each with yellow star applique. Matching pair of short yellow rain boots with turquoise soles below coat. Front view garment, empty sleeves angled gently down, fully visible complete neckline, sleeves and hem. Match the reference's cute polished 3D toy rendering and exact colors/materials. Absolutely no character, head, face, hair, skin, neck, hands, arms or legs, no mannequin, no hanger. The coat itself must be complete, filling in fabric previously occluded by clasped hands. Center all clothing in one portrait canvas with ample empty margins. Deliver actual transparent PNG alpha, background pixels alpha=0. No painted checkerboard, no white background, no floor, no ground shadow, no scenery, no text or watermark.
```
Output: `C:/Users/admin/.codex/generated_images/01a07a94-ad23-7521-8004-b32f0c4edc50/exec-e310ba01-303b-45ca-ba3c-be6fedbcfebd.png`



---

# 방울핑 수영복 (bangulping_outfit_09)

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



---

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
