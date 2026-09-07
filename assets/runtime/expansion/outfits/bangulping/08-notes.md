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
