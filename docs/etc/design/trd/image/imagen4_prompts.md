## 개요

Imagen 4로 고품질 이미지를 생성하기 위한 핵심 프롬프팅 기법을 간결하게 정리합니다. 아키텍처 특성, 프롬프트 구조, 고급 제어, 텍스트 렌더링, 반복 전략, 워크플로우, 흔한 함정을 다룹니다.

## 핵심 원리

- Latent Diffusion + Gemini 프롬프트 인코더 구조: LLM이 의미를 해석하고 확산 모델이 시각적으로 실행합니다.
- 프롬프트 향상 기능: 기본 활성화됨. 미세 제어가 필요할 때는 끄고 비교 테스트를 권장합니다.

## 기본 구조: 주체-문맥-스타일

- 주체(무엇) → 문맥(어디/상황) → 스타일(미학/매체/질감) 순서로 서술합니다.
- 짧게 시작해 필요한 정보만 점진적으로 추가합니다.
- 예시

```
주체: a robot
문맥: a robot reading a book in a library
스타일: oil painting, cinematic
```

## 고급 제어 사전

- 스타일/매체: oil painting, watercolor, illustration, 3D render, photorealistic, hyperrealistic
- 구성/프레이밍: rule of thirds, centered subject, symmetrical composition, full body shot, wide shot
- 각도/시점: aerial view, low-angle shot, eye-level, top-down
- 렌즈/기술: 35mm film, macro lens, long exposure, bokeh
- 조명/분위기: golden hour, dramatic lighting, soft lighting, moody, vibrant, serene
- 색상 팔레트: muted tones, pastel color palette, warm color palette, monochrome
- 종횡비: 1:1, 16:9, 9:16, 4:3, 3:4 등 사용 목적에 맞춰 지정

## 텍스트(타이포그래피) 생성 가이드

- 텍스트 길이: 가급적 25자 이하, 따옴표로 묶어 지정합니다.
- 구문 수: 2~3개 이내 권장.
- 글꼴/배치: 정확한 글꼴 지정은 불가. 제목처럼, 상단 중앙 등 의미론적 배치를 유도합니다.
- 예시

```
A minimalist poster, photorealistic, golden hour lighting, include the text "Summerland" as a title at the top center.
```

## 반복과 실험 전략

- 단계적 정제: 핵심 아이디어 → 조명/분위기 → 세부 디테일 순으로 추가합니다.
- A/B 변형: 핵심 키워드 1~2개씩만 바꿔 비교합니다.
- 결정론 제어: seed를 고정해 재현성을 확보합니다.
- 향상 기능 on/off 모두 테스트하여 예측 가능성과 품질을 비교합니다.

## 실무 워크플로우

- 아이디어/프로토타입: Imagen 4 Fast로 다수 변형을 빠르게 생성
- 최종 자산: Imagen 4 Ultra로 고해상도 정밀 결과물 생성
- 후처리: 필요 시 외부 편집기로 리터칭/업스케일

## 흔한 실수와 해결책

- 모호하거나 과부하된 프롬프트: 핵심 3~5 요소로 시작 후 확장
- 모순 지시: 상충되는 수식어 혼용 지양
- 조명/구성 누락: 반드시 포함해 평면적 결과 방지
- 인물 해부학 문제: 인물 수/포즈 단순화, 반복 시도 전제
- 네거티브 프롬프트: 공식 비권장. 포함하지 않을 것을 긍정적으로 기술합니다.
- API 제약/안전 필터: 요청 수, 토큰 길이, 필터 차단 가능성 고려

## 체크리스트

- 주체-문맥-스타일이 모두 서술되었는가
- 조명/구성/각도/렌즈가 명시되었는가
- 색상 팔레트와 분위기가 일관적인가
- 필요 시 종횡비와 텍스트 배치를 지정했는가
- 프롬프트 향상 on/off, seed 고정으로 비교했는가



## 프롬프트 예시

제품 사진 (포토리얼)

```
A photorealistic product shot of a matte black wireless earbud on a marble table,
centered composition, 50mm lens, soft diffused lighting, cool color palette, 16:9.
```

캐릭터 일러스트 (일관된 정체성 예시)

```
A watercolor illustration of a young woman with a round face, large almond-shaped hazel eyes,
short brown bob hair, wearing a pastel pink dress and a small pink hair ribbon,
cinematic horizontal composition, medium shot, eye-level, soft diffused lighting,
muted warm palette, 16:9.
```

시네마틱 풍경

```
A cinematic wide shot of a misty forest at dawn, low-lying fog, sun rays through tall pines,
rule of thirds composition, wide angle lens, golden hour lighting, cool green-blue palette, 16:9.
```

텍스트 포함 포스터

```
A minimalist poster, photorealistic paper texture, high contrast layout,
include the text "Summerland" as a title at the top center,
clean typography look, centered composition, soft studio lighting, 3:4.
```

캐릭터 동작 변형(같은 캐릭터 유지, 동작만 변경)

```
global: cinematic medium shot, eye-level, 50mm lens, soft diffused lighting, muted warm palette, 16:9 |
character: the same young woman with round face, hazel eyes, short brown bob, pastel pink dress, pink hair ribbon |
action: running through a misty forest path, light motion blur on background, determined expression
```
