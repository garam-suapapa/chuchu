# 하츄핑 잠옷 제작 기록

제작 도구: built-in image_gen. 유료 API/CLI 미사용. 참조 base와 기존 reference-wearables 착용본을 view_image로 먼저 확인했습니다.

## 착용본 프롬프트

```text
Use case: identity-preserve
Asset type: transparent full-body PNG wornSprite for the chuchu dress-up game.
Input image 1 is the original Hachuping base: preserve exact facial identity, huge head, pink curled forelock, paired long pink hair with darker curled tips, heart ear decorations, pink body and very short legs. Input image 2 is the current dressed runtime character: preserve this polished toy-like 3D rendering and straight-on frontal pose with exactly two hands joined at the center just below the chest.
Primary request: Change only her clothing to an adorable fully covering two-piece bedtime pajama set: pale lilac long-sleeve button-front pajama shirt with soft cream piping, tiny pink heart print, small heart-shaped pink buttons, matching long pajama pants and soft pink bedtime slippers. No hat or sleep mask. Keep both original hands visibly clasped together in front, seamlessly connected to the sleeves. Keep her original expression, face, hair, ear hearts, head/body ratio and tail.
Composition: one complete character centered, full hair through both feet wholly visible with generous 5% transparent margins, same proportions as reference 2, intended portrait 600x700 runtime frame. Large head and short torso and legs, no human-like elongated proportions.
Scene/backdrop: genuine transparent alpha background, no checkerboard pixels, no floor, no drop shadow, no text, no labels, no extra objects. Render a single polished PNG character cutout.
```

생성 원본: `C:/Users/admin/.codex/generated_images/01a07a94-0f25-7b03-bc6e-f600a0a0189d/exec-d9f3ad55-2599-4c1e-825f-a2caffb85844.png`

## 투명화 재시도 프롬프트

```text
Use case: background-extraction. Edit this exact supplied pajama character PNG. Remove the entire white and gray checkerboard background including between hair and body and around legs. Output an actual transparent RGBA PNG with alpha=0 background pixels. Do NOT paint a checkerboard to represent transparency. Preserve every character pixel, clothing design, face, hair, full body, hands and framing unchanged. Background removal only. Transparent image cutout required.
```

첫 호출 429 usage_limit_reached 발생 후 사용자가 재개를 요청하여 동일 작업 재시도. 재시도 결과는 `exec-057ee0c9-6c77-4e50-9e79-86780a12977f.png`이며 체크무늬가 남고 얼굴이 조금 변해 채택하지 않았습니다.

## 선택옷 프롬프트

```text
Use case: precise-object-edit
Asset type: wardrobe selection garment-only PNG sprite.
Reference image: the approved pajama design on Hachuping, used only to match the clothing exactly.
Primary request: Show only this same pajama clothing set, front view, as a neat wardrobe selection product cutout. Pale lilac button-front long-sleeve pajama shirt, cream piping, pink heart print and three pink heart buttons, matching full-length trousers with cream cuff piping, and matching pink slippers with raised heart toes. Arrange shirt above matching pants, two slippers side by side below, with small clear gaps; short chibi proportions. Sleeves relaxed downward so garment details remain visible.
Remove the character completely. No face, no hair, no ears, no head, no neck, no torso or arms, no hands or fingers, no legs or feet, no tail, no mannequin, no hanger. Empty sleeve cuffs and empty collar opening. Only clothing and slippers.
Style: same polished cute soft 3D game asset materials and pink/lilac palette as reference. Full complete set centered with generous clear margins.
Background: actual transparent RGBA PNG, alpha=0 outside clothing, no checkerboard image, no white background, no floor or shadow, no text or watermark.
```

생성 원본: `C:/Users/admin/.codex/generated_images/01a07a94-0f25-7b03-bc6e-f600a0a0189d/exec-705d5815-403d-4b7c-b34d-eb3c0cdf548b.png`

## 검수

- 착용본: 핑크 앞머리·하트 귀 장식·보라빛 눈·큰 머리/짧은 몸 비율·정면 모은 손 유지. 전신/머리/슬리퍼 잘림 없음.
- 선택본: 동일 라일락 하트 패턴·크림 파이핑·분홍 하트 단추·슬리퍼. 손/몸/머리/발 없이 옷만 표시. 잘림 없음.
- 투명 알파: 실패. built-in 요청에도 RGB 배경 반환. 착용본 체크무늬 및 선택본 밝은 흰 배경이 포함되어 실제 런타임 사용 불가.
- 600×700 변환: 최신 상위 지시로 사용자 로컬 편집 허용 응답 전 보류. 원본 복사만 시행.
- 원본 파일은 유지, 기존 의상/manifest/app 변경 없음.
