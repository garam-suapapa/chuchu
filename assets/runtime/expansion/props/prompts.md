# 소품 확장 제작 프롬프트

Built-in image_gen 사용. 각 에셋 개별 생성. 기준 그림체: assets/runtime/props/gift-box.png와 bubble-toy.png를 시각 검사한 뒤 동일 계열의 파스텔·금색·하트 장식을 적용.

## 최종 로컬 보정 및 검수

사용자가 Python 등 로컬 이미지 보정을 명시 허용한 후 `process_props.py`로 원본을 보존하면서 `processed/`에 6종 RGBA PNG를 제작했습니다. 가장자리에서 이어지는 밝은 중립색만 제거하여 공의 하이라이트와 곰의 눈·털을 보존합니다. 바구니·찻잔은 손잡이 내부를 별도 지정했습니다. 케이크는 크림 가장자리를 보존하도록 별도의 좁은 중립색 범위를 사용했습니다. 각 결과는 640 × 640, 최소 30px 여백, alpha 0–255이며 네 변이 완전히 투명한 것을 `validation.json`에서 확인했습니다.

`processed/contact-sheet.jpg`의 진한 남색·민트 대비색 2종에서 모든 오브젝트를 시각 검수했습니다. 체크무늬 잔상이나 흰색 사각 배경은 없고 손잡이 내부도 투명합니다. `processed/detail-check.jpg`에서 곰 눈·크림색 털·케이크 크림 외곽을 추가 검수했습니다. 카탈로그는 보정본 경로와 `runtimeReady: true`로 갱신했습니다. 재현: `python assets/runtime/expansion/props/process_props.py` (Pillow, NumPy, SciPy 필요; 현재 시스템 Python에 설치되어 있습니다).

## 최초 생성 검수 이력 (보정 전 원본)

6종 모두 실제 파일은 1254 × 1254 RGB PNG이며 alpha 채널이 없습니다. 곰 인형·공은 체크무늬 배경, 나머지 4종은 흰색 배경입니다. 곰 인형에 built-in background-extraction 1회 시도했으나 RGB 체크무늬가 유지되어 해당 편집본은 채택하지 않았습니다. 로컬 배경 제거는 사용자 허용 대기 중이며 게임에서 투명 스프라이트로 배포하기 전에 처리가 필요합니다. 생성 결과 자체는 단일 오브젝트, 문구 없음, 자르지 않은 형태와 기존 그림체 계열을 확인했습니다.

## 곰 인형 (teddy-bear)

Use case: stylized-concept. Asset type: single transparent PNG toy sprite for a pastel fantasy dress-up game. Primary request: one cute seated teddy bear plush toy, cream and soft peach fluffy body, small glossy bead eyes, gentle stitched smile, pink satin neck bow with a tiny golden heart medallion. Style: polished Korean magical-girl toy illustration, soft rounded forms, luminous candy pastel colors, pink and warm gold accents, delicate bright highlights, smooth painterly shading, clean high quality edges. Composition: square canvas, one complete centered object occupying 82% of canvas, front three-quarter view, entire ears and feet visible with safe margin. Backdrop: genuinely transparent alpha background, no floor or environment, no cast shadow on background. Avoid: humans, game characters, hands, text, letters, watermark, extra objects, panels, collages. Create exactly one bear sprite.

## 놀이 공 (play-ball)

Use case: stylized-concept. Asset type: single transparent PNG toy sprite for a pastel fantasy dress-up game. Primary request: one glossy pastel play ball with alternating curved panels of blush pink, baby blue, lavender and pale yellow, small embossed heart motif on its front pink panel and very fine warm-gold seams. Style: polished Korean magical-girl toy illustration, soft rounded form, luminous candy pastel colors, delicate bright highlights, smooth painterly shading, clean high quality edges. Composition: square canvas, one complete centered sphere occupying 78% of canvas, front three-quarter view, safe transparent margin on all sides. Backdrop: genuinely transparent alpha background, no floor or environment, no cast shadow on background. Avoid: people, characters, face on ball, hands, text, letters, watermark, extra objects, stars outside object, panels, collages. Create exactly one ball sprite.

## 딸기 케이크 (strawberry-cake)

Use case: stylized-concept. Asset type: single game item sprite. Primary request: a small round strawberry celebration cake, soft ivory whipped cream, blush pink cake body, three red strawberries on top with tiny mint leaves, gold heart emblem on the front, on a thin pale pink scalloped cake board. Style: polished Korean magical-girl toy illustration, rounded simple silhouette, luminous pastel colors, delicate bright highlights, smooth painterly shading, clean edges. Composition: one complete centered cake with its board occupying 78% of square canvas, three-quarter view from slightly above, safe margins. Backdrop: actual transparent PNG alpha channel. Do not depict a checkerboard. If transparency is unsupported use pure solid white. Avoid: people, characters, hands, text, candles, cutlery, extra objects, watermark, scenery. Exactly one cake sprite.

## 피크닉 바구니 (picnic-basket)

Use case: stylized-concept. Asset type: single game item sprite. Primary request: a small cute picnic basket, warm honey-colored woven wicker body and tall curved handle, blush pink gingham cloth folded over its rim, glossy pink satin bow and tiny gold heart clasp on the front, lid closed. Style: polished Korean magical-girl toy illustration, rounded forms, luminous pastel colors, bright highlights, smooth painterly shading, clean edges. Composition: one complete centered basket occupying 78% of square canvas, front three-quarter view, entire handle visible, generous safe margin. Backdrop: actual transparent PNG alpha channel. Do not depict a checkerboard. If transparency is unsupported use pure solid white. Avoid: people, characters, hands, text, letters, watermark, extra food or flowers outside basket, scene, cast shadow outside object. Exactly one picnic basket sprite.

## 꽃 찻잔 (flower-teacup)

Use case: stylized-concept. Asset type: single game item sprite. Primary request: a single delicate flower teacup resting on its matching saucer, blush pink porcelain cup with soft petal shaped lip, curved handle, tiny pink blossom painted on the front, fine gold trim, pale amber tea visible inside, no steam. Treat the cup-and-saucer as one connected item. Style: polished Korean magical-girl toy illustration, rounded forms, luminous pastel colors, delicate bright highlights, smooth painterly shading, clean edges. Composition: one complete centered item occupying 76% of square canvas, front three-quarter view from slightly above, entire saucer and handle visible, safe margins. Backdrop: actual transparent PNG alpha channel. Do not depict a checkerboard. If transparency is unsupported use pure solid white. Avoid: people, characters, hands, text, spoons, extra flowers outside cup, extra cups, watermark, scenery, cast shadow outside object. Exactly one teacup sprite.

## 별 탬버린 (star-tambourine)

Use case: stylized-concept. Asset type: single game item sprite. Primary request: one cute toy tambourine shaped like a rounded five-point star, pastel lavender solid rim around a pale pink translucent drumhead, shiny small gold jingle discs set into its sides, a little pink satin bow attached at the lower point, tiny heart emblem centered on drumhead. Style: polished Korean magical-girl toy illustration, rounded forms, luminous pastel colors, delicate bright highlights, smooth painterly shading, clean edges. Composition: one complete centered tambourine occupying 78% of square canvas, almost front-facing slight three-quarter angle, all star tips visible, safe margins. Backdrop: actual transparent PNG alpha channel. Do not depict a checkerboard. If transparency is unsupported use pure solid white. Avoid: people, characters, hands, text, drumsticks, detached extra objects, watermark, scenery, cast shadow outside object. Exactly one star tambourine sprite.
