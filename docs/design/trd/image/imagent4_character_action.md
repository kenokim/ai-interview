## 개요

Imagen 4에서 동일한 캐릭터를 유지하면서 다양한 동작을 표현하기 위한 실무형 프롬프팅 기법을 정리합니다. 핵심은 캐릭터 정체성의 고정과 행동 요소의 분리, 그리고 시네마틱 제어 변수의 일관된 사용입니다. 내용은 15_캐릭터_동작_이미지_생성_연구.md를 요약·적용했습니다.

## 핵심 원칙

- 캐릭터 DNA 템플릿: 외형, 의상, 액세서리, 스타일, 장면 매개변수를 일관된 용어로 정의해 재사용합니다.
- 구조적 문장: 주어-행동-맥락 구조로 기술하고, 캐릭터·행동·배경을 섹션으로 분리합니다.
- 토큰 일관성: 동일 용어를 반복 사용합니다. 동의어 사용은 피하고 핵심 속성은 매 생성마다 재명시합니다.
- 명시적 제어: 앵글, 샷 타입, 렌즈, 조명, 종횡비 등을 고정하거나 제한된 범위에서만 변화시킵니다.
- 네거티브 프롬프트: Imagen 4에서는 공식 비권장입니다. 원치 않는 요소는 긍정적 서술로 배제합니다.

## 워크플로우

1) DNA 템플릿 작성 → 2) 앵커 이미지 생성 → 3) 시드 고정 및 메타 파라미터 고정 → 4) 동작별 장면 프롬프트 생성 → 5) 결과 비교 및 세부 수정

- 앵커 이미지: 정면 또는 핵심 포즈로 캐릭터 정체성이 잘 드러나는 이미지를 먼저 생성합니다.
- 시드 고정: 재현성을 위해 seed를 고정하고, 한 번에 1~2개 요소만 변경해 A/B 비교합니다.
- 메타 고정: 종횡비, 렌즈, 색 팔레트는 고정하고, 행동·카메라 앵글만 조절합니다.

## 프롬프트 템플릿

단일 캐릭터 템플릿

```
A photorealistic portrait of [고유 캐릭터 서술: 얼굴형, 눈/머리, 피부톤, 대표 의상, 구별 액세서리],
in [아트 스타일/품질], [구도/샷], [카메라 앵글], [렌즈], [조명], [색상 팔레트], [종횡비].
Now depict the same character [동작/행동] in [장소/상황], keep all identity details exactly as described.
```

다중 섹션 구분 템플릿

```
{global: style, background, color palette, aspect ratio} | {character: identity spec list} | {action: pose/motion + scene}
```

주의: 구분자(|)는 가독성을 높이기 위한 관습적 표기입니다. 모델의 해석을 돕기 위해 섹션마다 완전한 문장으로 서술하세요.

## 예시

DNA 템플릿 스니펫

```
character: a young woman with a round face, large almond-shaped hazel eyes, short brown bob hair,
wearing a pastel pink dress and a small pink hair ribbon, soft watercolor-inspired style.
scene: cinematic horizontal composition, medium shot, eye-level, 50mm lens,
soft diffused lighting, muted warm palette, 16:9.
```

동작 예시 1

```
global: cinematic medium shot, eye-level, 50mm lens, soft diffused lighting, muted warm palette, 16:9 | 
character: the same young woman with round face, hazel eyes, short brown bob, pastel pink dress, pink hair ribbon | 
action: running through a misty forest path, light motion blur on background, determined expression
```

동작 예시 2

```
global: cinematic medium shot, eye-level, 50mm lens, soft diffused lighting, muted warm palette, 16:9 | 
character: the same young woman with round face, hazel eyes, short brown bob, pastel pink dress, pink hair ribbon | 
action: sitting at a cafe table, reading an old map, gentle smile, hands visible holding the paper naturally
```

## 시네마틱 제어 변수

- 샷 타입: extreme wide, wide, medium, medium close-up, close-up
- 카메라 앵글: eye-level, low-angle, high-angle, dutch angle
- 렌즈: 35mm, 50mm, 85mm, macro, long exposure 등 상황에 맞게
- 조명: golden hour, dramatic, volumetric, soft diffused, rim light
- 구성: rule of thirds, centered subject, symmetrical composition
- 종횡비: 16:9, 9:16, 1:1 등 목적에 맞게 고정

## 품질 유지 요령

- 정체성 반복: 캐릭터 핵심 속성 문구를 장면마다 반복 기재합니다.
- 행동 분리: 행동/포즈는 별도 섹션에 기술해 속성 혼합을 줄입니다.
- 손/포즈 안정화: 손이 프레임에 들어오면 포즈를 구체적으로 서술하고, 배경에 약한 모션 블러를 적용해 주 피사체 선명도를 확보합니다.
- 변수 최소 변경: 한 번에 변경하는 요소를 1~2개로 제한하고 seed를 고정합니다.
- 부정 배제의 긍정 서술: cluttered, messy를 쓰지 말고 clean table, minimal background처럼 원하는 상태를 기술합니다.

## 체크리스트

- 캐릭터 DNA가 완전하고 일관된가
- 샷/앵글/렌즈/조명이 명시되었는가
- 행동이 별도 섹션으로 분리되어 있는가
- 종횡비·팔레트·시드가 고정되었는가
- 한 번에 1~2개 요소만 변경하며 비교했는가


