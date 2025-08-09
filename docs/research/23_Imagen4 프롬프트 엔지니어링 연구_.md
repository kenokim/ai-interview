# **시각적 합성 마스터하기: Google Imagen 4를 위한 프롬프트 엔지니어링 종합 가이드**

## **섹션 I: Imagen 4 해부: 아키텍처 및 기능 분석**

Google의 Imagen 4를 효과적으로 활용하기 위한 프롬프트 엔지니어링을
마스터하려면, 먼저 이 모델이 어떻게 작동하는지에 대한 근본적인 이해가
필요합니다. Imagen 4의 아키텍처를 파악하는 것은 단순한 학문적 호기심을
넘어, 특정 프롬프트 전략이 왜 성공하고 다른 전략은 실패하는지를 설명하는
핵심 열쇠입니다. 이 섹션에서는 Imagen 4의 기술적 토대를 분석하여 그
잠재력을 최대한 이끌어낼 수 있는 기반을 마련합니다.

### **1.1 잠재 확산 엔진: 구조화된 노이즈로부터 이미지 생성하기** {#잠재-확산-엔진-구조화된-노이즈로부터-이미지-생성하기}

Imagen 4의 핵심은 잠재 확산 모델(Latent Diffusion Model)이라는 기술에
기반합니다.^1^ 이 프로세스는 무작위 노이즈(noise)로 가득 찬 필드에서
시작하여, 텍스트 프롬프트의 지침에 따라 단계적으로 노이즈를 제거하고
정제하여 일관성 있는 이미지로 변환하는 과정을 거칩니다.^2^ 이는 한 번에
이미지를 생성하는 것이 아니라, 반복적인 정제 단계를 통해 최종 결과물을
만들어내는 방식입니다.

이러한 반복적 정제 과정은 Imagen 4가 극도로 높은 충실도와 세밀한
디테일을 표현할 수 있는 이유를 설명합니다. 또한, 생성에 시간이 소요되는
이유와 \'Fast\', \'Ultra\'와 같은 등급별 모델이 서로 다른 정제 단계 수를
가질 수 있음을 시사합니다. 이 모든 과정의 기술적 중추는 Google의 텐서
처리 장치(Tensor Processing Units, TPU)입니다. TPU는 대규모 행렬 연산에
최적화되어 있어 Imagen 4와 같은 거대 모델의 훈련을 가능하게 하고, 대규모
추론을 신속하게 처리할 수 있도록 지원합니다.^1^

### **1.2 제미나이 효과: 예술적 \'손\' 뒤의 LLM \'두뇌\'** {#제미나이-효과-예술적-손-뒤의-llm-두뇌}

Imagen 4를 다른 모델과 차별화하는 가장 중요한 요소 중 하나는 정교한
프롬프트 인코더(prompt encoder)로서 Google의 제미나이(Gemini) 모델을
사용한다는 점입니다.^1^ 이는 사용자가 입력한 자연어 프롬프트를 강력한
대규모 언어 모델(LLM)이 먼저 해석한 후, 확산 모델이 이미지 생성을
시작한다는 것을 의미합니다.

이 아키텍처는 Imagen 4가 뛰어난 지시 사항 준수 능력, 복잡한 장면에 대한
이해도, 그리고 향상된 텍스트 렌더링 능력을 보이는 주된 이유입니다.^1^
모델은 단순히 키워드를 일치시키는 것을 넘어, 프롬프트 내의 관계, 문맥,
그리고 서사까지 이해합니다.

이러한 통합은 \'프롬프트 향상(Prompt Enhancement)\' 기능을 가능하게
합니다. Vertex AI에서는 기본적으로 활성화되어 있는 이 기능은, 제미나이
백엔드가 사용자의 단순한 프롬프트를 자동으로 재작성하고 풍부하게 만들어
더 상세하고 정렬된 결과물을 생성하도록 돕습니다. 물론 이 기능은 필요에
따라 비활성화할 수 있습니다.^6^

이 아키텍처는 제미나이의 \'의미론적 이해\'와 확산 모델의 \'시각적
실행\'이라는 명확한 역할 분담을 보여줍니다. 이는 Imagen 4를 위한
프롬프트 엔지니어링이 두 가지 기술을 모두 만족시켜야 함을 의미합니다.
즉, LLM에게 의미론적으로 명확한 프롬프트를 작성하는 동시에, 확산 모델에
효과적인 시각적 설명자를 제공해야 합니다. 시적이지만 모호한 프롬프트는
제미나이는 이해할지라도 확산 모델에게는 충분한 정보를 주지 못할 수
있으며, 키워드로 가득 찼지만 비논리적인 프롬프트는 제미나이의 해석을
혼란스럽게 할 수 있습니다. 따라서 가장 효과적인 프롬프트는 명확한 지시
사항처럼 읽히는 잘 구조화된 서술형 문장으로, 단순히 키워드를
나열하기보다 제미나이의 이해력을 활용하는 형태가 될 것입니다.

### **1.3 훈련 데이터 철학: 품질과 안전성의 기반** {#훈련-데이터-철학-품질과-안전성의-기반}

Imagen 4는 방대하고 엄격하게 필터링된 이미지 및 텍스트 데이터셋으로
훈련되었습니다.^1^ Google의 데이터 처리 과정에는 유해하거나 폭력적이거나
품질이 낮은 이미지를 제거하고, 과적합(overfitting)을 방지하기 위해 유사
이미지를 중복 제거하는 작업이 포함되었습니다. 특히 중요한 점은, 다른 AI
생성 이미지에서 발견될 수 있는 인공물(artifact)이나 편향을 학습하지
않도록 AI 생성 이미지를 훈련 데이터에서 배제했다는 것입니다.^1^

여기서 핵심적인 혁신은 훈련 이미지에 대해 제미나이를 사용하여 새롭고
매우 상세한 \'합성 캡션(synthetic captions)\'을 생성했다는 점입니다.^1^
이를 통해 모델은 텍스트 설명과 시각적 디테일 간의 훨씬 더 세분화된
연관성을 학습할 수 있었고, 이는 복잡한 프롬프트를 따르는 능력을
직접적으로 향상시켰습니다.

이러한 훈련 방식은 모델이 매우 서술적이고 이야기 형식의 프롬프트에
특별히 잘 반응하도록 만들었음을 시사합니다. 모델은 \'개, 공원, 태양\'과
같은 단순한 태그가 아니라, \"햇살이 내리쬐는 공원에서 골든 리트리버가
즐겁게 빨간 원반을 잡고 있으며, 오후의 햇살이 푸른 잔디 위에 긴 그림자를
드리우고 있다\"와 같은 문장으로 훈련되었습니다. 이는 모델이 텍스트와
이미지를 연결하는 내부 \'언어\'가 단순 태그 기반 모델보다 훨씬 풍부하고
서술적이라는 것을 의미합니다. 따라서 사용자는 이러한 \'합성 캡션\'
스타일을 모방하여, 완전한 문장과 풍부한 형용사를 사용함으로써 모델의
잠재력을 최대한 활용해야 합니다. 단순한 프롬프트도 작동하겠지만, 이는
모델의 핵심 훈련 방법론을 충분히 활용하지 못하는 것입니다.

안전성과 책임감은 훈련 전 데이터 필터링과 훈련 후 완화 조치를 통해
모델에 내장되었습니다. 모든 출력물에는 추적 가능성을 보장하기 위해
SynthID 워터마크가 포함됩니다.^1^

### **1.4 Imagen 4 모델 제품군: 전략적 툴킷** {#imagen-4-모델-제품군-전략적-툴킷}

Imagen 4는 단일 모델이 아니라, 창의적인 작업 흐름의 특정 지점에 최적화된
여러 변형 모델들로 구성된 제품군입니다.^3^

- **Imagen 4 Fast:** 속도와 비용 효율성에 초점을 맞춰 설계되었습니다.
  > 이전 버전에 비해 최대 10배 빠르다고 알려져 있으며, 신속한 아이디어
  > 구상, 프로토타이핑, 콘셉트 A/B 테스팅에 이상적입니다.^3^

- **Imagen 4 (Standard):** 품질, 속도, 비용 간의 균형을 맞춘 주력
  > 모델입니다. 대부분의 일반적인 사용 사례에 적합한 모델로 자리매김하고
  > 있습니다.^6^

- **Imagen 4 Ultra:** 속도와 비용보다 최고의 품질과 프롬프트 준수도를
  > 우선시하는 프리미엄 등급입니다. 최종적인 \'제품 수준\'의 결과물을
  > 위해 설계되었으며, 요청당 하나의 이미지만 생성할 수 있어 정밀성에
  > 대한 집중을 보여줍니다.^3^

이 모델들은 제미나이, Google AI Studio, Vertex AI, 그리고 Replicate와
같은 타사 API를 포함한 다양한 플랫폼을 통해 사용할 수 있습니다.^4^
가격은 등급별로 이미지당 과금되며, 예를 들어 Standard는 이미지당 \$0.04,
Ultra는 \$0.06입니다.^9^

| 기능                      | Imagen 4 Fast                                       | Imagen 4 (Standard)                               | Imagen 4 Ultra                                |
|---------------------------|-----------------------------------------------------|---------------------------------------------------|-----------------------------------------------|
| **주요 사용 사례**        | 신속한 아이디어 구상, 프로토타이핑, 반복 테스트 ^3^ | 대부분의 일반적인 사용 사례, 균형 잡힌 결과물 ^6^ | 최종 프로덕션 품질, 높은 정밀도 요구 작업 ^3^ |
| **상대적 속도**           | 가장 빠름 (최대 10배 향상) ^3^                      | 중간                                              | 가장 느림                                     |
| **상대적 품질**           | 좋음 (아이디어 구상용)                              | 매우 좋음 (균형 잡힌 품질)                        | 최상 (최고의 디테일 및 프롬프트 준수도)       |
| **이미지당 비용 (예시)**  | 가장 저렴                                           | \$0.04 ^9^                                        | \$0.06 ^9^                                    |
| **요청당 최대 이미지 수** | 4 ^6^                                               | 4 ^6^                                             | 1 ^12^                                        |
| **핵심 강점**             | 속도, 비용 효율성                                   | 품질과 속도의 균형                                | 최고의 프롬프트 준수도, 세부 묘사             |

**표 1: Imagen 4 모델 변형 비교**

## **섹션 II: 효과적인 프롬프팅의 기초: 핵심 원칙과 구조**

이 섹션에서는 \'왜\'에서 \'어떻게\'로 전환하여, 처음부터 프롬프트를
구성하는 구조적인 방법론을 제공합니다.

### **2.1 주체-문맥-스타일 프레임워크: 첫 프롬프트 구성하기** {#주체-문맥-스타일-프레임워크-첫-프롬프트-구성하기}

가장 효과적인 시작 방법은 원하는 이미지를 세 가지 기본 구성 요소로
나누는 것입니다: **주체**(Subject, 이미지의 주요 초점),
**문맥**(Context, 배경/설정), 그리고 **스타일**(Style, 미학적 외관 및
느낌).^12^

**예시 진행 과정:**

- **주체:** 로봇 (A robot)

- **+ 문맥:** 도서관에서 책을 읽고 있는 로봇 (A robot reading a book in
  > a library)

- **+ 스타일:** 도서관에서 책을 읽고 있는 로봇, 유화 스타일 (A robot
  > reading a book in a library, oil painting)

이러한 구조적인 접근 방식은 모든 중요한 요소가 고려되도록 보장하며,
일반적이고 방향성 없는 결과로 이어지는 모호한 프롬프트를 방지합니다.^20^

### **2.2 반복의 힘: 단순한 아이디어에서 복잡한 비전으로** {#반복의-힘-단순한-아이디어에서-복잡한-비전으로}

첫 번째 결과물이 완벽한 경우는 드뭅니다. 효과적인 프롬프트 엔지니어링은
정제의 반복 과정입니다.^12^ 핵심 아이디어로 시작하여 점진적으로 세부
사항을 추가해 나가야 합니다.

예시 작업 흐름 ^12^:

1.  봄날 호숫가에 있는 공원. (A park in the spring next to a lake.)
    > (핵심 아이디어)

2.  봄날 호숫가에 있는 공원, 호수 너머로 해가 지고 있고, 골든 아워. (A
    > park in the spring next to a lake, the sun sets across the lake,
    > golden hour.) (조명과 분위기 추가)

3.  봄날 호숫가에 있는 공원, 호수 너머로 해가 지고 있고, 골든 아워, 붉은
    > 야생화들. (A park in the spring next to a lake, the sun sets
    > across the lake, golden hour, red wildflowers.) (구체적인 디테일
    > 추가)

이러한 체계적인 접근법은 처음부터 완벽하고 복잡한 프롬프트를 작성하려는
시도보다 효과적입니다. 사용자가 AI를 점진적으로 안내할 수 있게 하여,
어떤 추가 사항이 이미지를 개선하고 어떤 것이 그렇지 않은지 진단하기 쉽게
만듭니다.

### **2.3 서술적 언어: 구체성의 역할** {#서술적-언어-구체성의-역할}

정확하고 서술적인 언어를 사용해야 합니다. \'개\' 대신 \'꼬리를 흔드는
골든 리트리버 강아지\'와 같이 구체적으로 표현해야 합니다.^23^ 생생한
형용사와 부사를 사용하여 모델에게 명확한 그림을 그려주어야 합니다.^12^

Imagen 4는 짧은 프롬프트와 긴 프롬프트를 모두 처리할 수 있지만, 더 길고
상세한 프롬프트는 더 큰 제어력과 구체성을 제공합니다.^12^ 최대 프롬프트
길이는 480 토큰입니다.^12^ 또한, \'생성하라\' 또는 \'만들어라\'와 같은
지시 동사는 피해야 합니다. 프롬프트는 이미지에

*무엇이 있는지*를 설명해야 하며, 모델에게 생성 행위를 지시해서는 안
됩니다.^23^

\'프롬프트 향상\' 기능은 내장된 반복 파트너 역할을 할 수 있지만, 이는
양날의 검이 될 수 있습니다. 이 기능은 사용자의 프롬프트를 자동으로 더
상세하게 재작성합니다.^6^ \'고양이\'와 같은 모호한 프롬프트를 가진
초보자에게는 이를 \'햇살 속에서 몸을 녹이고 있는 솜털 같은 생강색
고양이의 사실적인 클로즈업\'으로 바꿔주어 도움이 될 수 있습니다. 하지만
정밀하고 미니멀한 프롬프트를 신중하게 작성한 전문가에게는 이 향상 기능이
원치 않는 세부 사항을 추가하거나 초점을 흐리게 하여 오히려 방해가 될 수
있습니다. 따라서 고급 사용자를 위한 중요한 기술은 이 기능을

*언제* 비활성화할지 아는 것입니다. 사용자는 특정 작업에 대해 이 기능을
켠 상태와 끈 상태를 모두 테스트하여 어느 모드가 더 예측 가능한 제어력을
제공하는지 확인해야 합니다.

## **섹션 III: 디렉터의 툴킷 마스터하기: 스타일, 구성, 조명의 고급 제어**

이 섹션은 사용자를 단순한 요청자가 아닌 \'장면 감독\'으로 격상시켜,
정확한 예술적 제어를 달성하기 위한 키워드와 기술의 상세한 용어집을
제공하는 이 가이드의 핵심입니다.^24^

### **3.1 시각적 스타일 및 매체 제어** {#시각적-스타일-및-매체-제어}

- **사실주의(Photorealism):** 프롬프트를 \"A photo of\...\"로 시작하고
  > photorealistic, hyperrealistic, 4K, 8K, HDR, studio photo, high
  > detail과 같은 기술적 수식어를 추가하여 사진과 같은 사실성을 확보할
  > 수 있습니다.^2^

- **예술적 매체(Artistic Mediums):** oil painting, watercolor painting,
  > charcoal drawing, illustration, digital art, flat illustrative
  > artwork, 3D render와 같은 키워드로 특정 예술 형식을 모방할 수
  > 있습니다.^12^  
  > impressionism, surrealism, cubism, cyberpunk과 같은 특정 예술 사조나
  > 특정 예술가를 참조하는 것도 스타일을 유도하는 데 도움이 됩니다.^12^

- **영화적 미학(Cinematic Aesthetics):** cinematic, movie still,
  > theatrical, film noir와 같은 용어를 사용하고, 35mm film이나
  > polaroid와 같은 특정 필름 유형을 참조하여 영화 같은 비주얼을 만들 수
  > 있습니다.^22^

### **3.2 구성 및 프레이밍 제어** {#구성-및-프레이밍-제어}

- **카메라 및 렌즈 에뮬레이션:** 렌즈 유형을 지정하여 원근감과 디테일을
  > 제어할 수 있습니다. macro lens(극단적 클로즈업), wide angle, fisheye
  > lens(왜곡 효과), 또는 35mm, 50mm, 85mm와 같은 특정 초점 거리를
  > 사용할 수 있습니다.^22^

- **촬영 유형 및 각도:** 가상 카메라를 정밀하게 지시할 수 있습니다.

  - **근접도:** close-up, medium shot, full body shot, wide shot, zoomed
    > out.^19^

  - **각도:** aerial view, from below, low-angle shot, high angle shot,
    > eye-level, top-down shot.^19^

- **피사체 배치 및 레이아웃:** 고전적인 구성 원칙을 활용할 수 있습니다.
  > rule of thirds, symmetrical composition, centered subject와 같은
  > 키워드를 사용하여 프레임 내 요소를 배열할 수 있습니다.^30^ \"앞에는
  > 노트북, 오른쪽에는 커피 머그\"와 같이 레이아웃을 명시적으로 설명하는
  > 것이 좋습니다.^20^

- **종횡비(Aspect Ratios):** Imagen 4는 공식적으로 5가지 종횡비를
  > 지원합니다: 1:1(정사각형), 16:9(와이드스크린/가로), 9:16(세로),
  > 4:3(풀스크린), 3:4(세로 풀스크린).^2^ 소셜 미디어 게시물이나 비디오
  > 썸네일과 같은 의도된 사용 사례에 맞게 이를 지정하는 것이 중요합니다.

### **3.3 조명 및 분위기 제어** {#조명-및-분위기-제어}

- **조명 품질 조작:** 조명은 분위기를 결정하는 핵심 요소입니다. natural
  > lighting, dramatic lighting, soft lighting, warm lighting, cold
  > lighting, rim light, bioluminescent glow와 같은 구체적인 용어를
  > 사용해야 합니다.^2^

- **시간대:** golden hour, dusk, sunrise, noon, night는 분위기를
  > 설정하는 강력한 키워드입니다.^2^

- **분위기 및 환경 설정:** nostalgic, surreal, eerie, vibrant, serene,
  > moody, dreamlike과 같은 감성적인 형용사를 사용하여 전반적인 느낌을
  > 정의할 수 있습니다.^27^

- **색상 팔레트:** muted tones, pastel color palette, warm color
  > palette, blue tones와 같이 색상을 직접 지정할 수 있습니다.^20^

가장 효과적인 프롬프트는 종종 각 카테고리(스타일, 구성, 조명)의 수식어를
\'쌓아서(stacking)\' 매우 제한적이고 구체적인 요청을 만드는 것입니다.
이는 AI가 스스로 추측할 여지를 줄여줍니다. 예를 들어, \"여자의
사진\"이라는 프롬프트는 모호합니다. \"여자의 사진, 클로즈업, 골든
아워\"는 구성과 조명을 쌓아 더 나은 결과를 냅니다. 하지만 \"영화적인
사진, 35mm 렌즈, 클로즈업 인물 사진, 골든 아워 조명, 향수를 불러일으키는
분위기\"와 같은 프롬프트는 스타일, 기술, 구성, 조명, 분위기 등 모든
카테고리의 수식어를 결합하여 훨씬 더 강력한 제어력을 발휘합니다. 따라서
사용자는 최대의 제어력을 얻기 위해 각 주요 카테고리에서 최소 하나 이상의
수식어를 의식적으로 선택하여 프롬프트를 구성하는 \'계층적
프롬프팅(layered prompting)\' 방법론을 배워야 합니다.

| 카테고리   | 하위 카테고리 | 키워드              | 설명                                                   | 예시 프롬프트                                                                  |
|------------|---------------|---------------------|--------------------------------------------------------|--------------------------------------------------------------------------------|
| **구성**   | 촬영 각도     | low-angle shot      | 피사체를 아래에서 위로 올려다보는 시점, 웅장함 강조    | A low-angle shot of a massive skyscraper against a stormy sky.                 |
|            | 프레이밍      | rule of thirds      | 피사체를 프레임의 1/3 지점에 배치하여 시각적 흥미 유발 | A cinematic still of a lone tree on a hill, rule of thirds composition.        |
|            | 근접도        | extreme close-up    | 피사체의 특정 부분을 극도로 확대하여 디테일 강조       | An extreme close-up of a human eye reflecting a galaxy.                        |
| **스타일** | 매체          | watercolor painting | 수채화 물감의 투명하고 부드러운 질감 모방              | A watercolor painting of a quaint European street scene.                       |
|            | 미학          | cyberpunk           | 네온 불빛, 미래적 기술, 어두운 분위기가 특징인 스타일  | A cyberpunk city street at night, drenched in neon light and rain.             |
|            | 사진 기술     | long exposure       | 셔터를 오래 열어 빛의 궤적이나 움직임을 부드럽게 표현  | A long exposure photograph of city traffic at night, creating light trails.    |
| **조명**   | 품질          | dramatic lighting   | 강한 명암 대비를 통해 극적인 분위기 연출               | A studio portrait of a man with dramatic lighting, half of his face in shadow. |
|            | 시간대        | golden hour         | 해질녘의 따뜻하고 부드러운 황금빛 조명                 | A couple walking on a beach during golden hour, long shadows behind them.      |
|            | 색상          | monochrome          | 흑백 톤으로만 구성하여 형태와 질감 강조                | A monochrome photograph of an old, weathered tree.                             |
| **기술**   | 렌즈          | macro lens          | 작은 피사체를 실제 크기보다 크게 촬영                  | A macro lens photo of a dewdrop on a blade of grass.                           |
|            | 필름 유형     | 35mm film           | 35mm 필름 카메라로 촬영한 듯한 질감과 색감             | A portrait of a woman in a cafe, 35mm film, slight grain.                      |
|            | 효과          | bokeh               | 배경을 흐릿하게 처리하여 피사체를 돋보이게 하는 효과   | A portrait with a beautiful bokeh background of city lights.                   |

**표 2: 프롬프트 디렉터의 키워드 사전**

## **섹션 IV: 타이포그래피의 예술: 이미지 내 텍스트 생성 및 제어**

이 섹션은 Imagen 4의 가장 칭송받고 상업적으로 중요한 기능 중 하나인
텍스트 렌더링 능력에 초점을 맞춥니다.

### **4.1 AI 타이포그래피의 세대적 도약** {#ai-타이포그래피의-세대적-도약}

Imagen 4는 이전 모델 및 많은 경쟁 제품에 비해 철자, 타이포그래피, 텍스트
렌더링 능력이 대폭 향상되어, 악명 높았던 \'알아볼 수 없는
텍스트(gibberish text)\' 문제를 해결했습니다.^1^ 이는 아키텍처 내에 전용
타이포그래피 모듈이 탑재되었기 때문에 가능했습니다.^2^

이러한 발전은 포스터, 로고, 책 표지, 인포그래픽, 만화 등을 후처리 없이
직접 생성하는 등 이전에는 불가능했거나 많은 수작업이 필요했던 수많은
실용적인 사용 사례를 열어주었습니다.^2^

### **4.2 텍스트 통합을 위한 모범 사례** {#텍스트-통합을-위한-모범-사례}

- **짧게 유지하기:** 최적의 결과를 위해 텍스트 구문은 25자 이하로
  > 제한하는 것이 좋습니다.^12^

- **따옴표 사용:** 원하는 텍스트를 프롬프트 내에서 따옴표로 묶으면
  > 모델이 이를 렌더링할 문자열로 명확하게 식별하는 데 도움이 될 수
  > 있습니다.^34^ 예:  
  > A poster with the text \"Summerland\"\....^12^

- **여러 구문 사용:** 모델은 두세 개의 개별 구문을 처리할 수 있지만,
  > 이를 초과하면 복잡하거나 덜 정확한 구성이 될 수 있습니다.^12^

- **자신감 있게 반복하기:** 텍스트 생성은 여전히 발전 중인 기능입니다.
  > 완벽한 결과를 얻기 위해 여러 번의 시도가 필요할 수 있습니다.^12^

### **4.3 글꼴 및 배치에 영향 주기** {#글꼴-및-배치에-영향-주기}

- **글꼴 스타일:** \'굵은 글꼴로(in a bold font)\', \'필기체로(in
  > cursive)\'와 같은 서술적인 단어를 사용하여 글꼴 스타일에 *영감*을 줄
  > 수는 있지만, \'Helvetica Neue\'와 같은 정확한 글꼴 파일을 지정할
  > 수는 없습니다. 모델은 창의적인 해석을 제공할 것입니다.^12^

- **배치:** \'제목으로(as a title)\', \'이 텍스트 아래에
  > 슬로건(underneath this text is the slogan)\'과 같은 지시 사항으로
  > 텍스트 배치를 *유도*할 수 있지만, 정밀한 제어는 보장되지 않으며
  > 변형이 발생할 수 있음을 예상해야 합니다.^12^

- **로고 생성 예시:** A minimalist logo for a health care company on a
  > solid color background. Include the text \"Journey\"..^12^

Imagen 4의 텍스트 생성 현재 상태는 \'결정론적으로
배치되는(deterministically-placed)\' 것이 아니라 \'의미론적으로
유도되는(semantically-guided)\' 것으로 가장 잘 설명됩니다. 문서는
사용자가 배치를 \'유도\'할 수는 있지만 \'가끔 변형이 있을 수 있음\'을
명시하고 있습니다.^12^ 이는 픽셀 단위의 정밀한 좌표 제어가 가능한 디자인
도구가 아님을 의미합니다. 모델은 \'제목\'이나 \'슬로건\'과 같은 개념에
대한 제미나이 LLM의 이해를 사용하여 배치를 결정하며, 레이아웃 엔진을
사용하는 것이 아닙니다. 따라서 사용자는 CSS 레이아웃을 코딩하는 것처럼이
아니라, 완성된 디자인을 인간 예술가에게 설명하는 것처럼 텍스트를
프롬프트해야 합니다. \"제목 \'Summerland\'는 상단 중앙에 있어야 한다\"와
같은 프롬프트가 \"\'Summerland\' 텍스트를 좌표 (x, y)에 배치하라\"보다
성공할 가능성이 높습니다. 이는 사용자의 기대치를 설정하는 데 매우 중요한
지점입니다.

## **섹션 V: 비교 분석: 생성 AI 환경에서 Imagen 4의 위치**

이 섹션은 중요한 맥락을 제공하여, 사용자가 특정 작업 요구 사항에 따라
주요 경쟁 모델 대신 Imagen 4를 선택해야 할 때를 이해하는 데 도움을
줍니다.

### **5.1 프롬프트 준수도 및 복잡성: Imagen 4 vs. DALL-E 4o** {#프롬프트-준수도-및-복잡성-imagen-4-vs.-dall-e-4o}

두 모델 모두 프롬프트 이해를 위해 강력한 LLM(Imagen은 제미나이, DALL-E는
GPT)을 활용합니다. 이로 인해 두 모델 모두 복잡하고 상세하며 서사적인
프롬프트를 해석하는 데 탁월합니다.^35^ ChatGPT를 통한 DALL-E는 더
대화적이고 반복적인 편집 워크플로우를 제공합니다.^36^ 반면 Imagen 4
Ultra는 높은 수준의 프롬프트 정렬을 목표로 마케팅되어 정밀성이 요구되는
작업에서 직접적인 경쟁자가 됩니다.^11^ 핵심적인 차별점은 생태계에 있을
수 있습니다. Google Workspace/Vertex AI에 깊이 통합된 사용자는 Imagen을
선호할 수 있고, ChatGPT 사용자는 DALL-E가 더 통합적이라고 느낄
것입니다.^2^

### **5.2 미학 및 스타일 출력: Imagen 4 vs. Midjourney** {#미학-및-스타일-출력-imagen-4-vs.-midjourney}

Midjourney는 단순한 프롬프트에서도 매우 스타일리시하고 \'매끄러우며\'
미학적으로 만족스러운 이미지를 생성하는 것으로 널리 알려져 있으며, 종종
특유의 예술적 감각을 보여줍니다.^35^ 반면, 특히 사실주의에 중점을 둔
Imagen 4는 기본적으로 더 현실에 기반한 결과물을 목표로 합니다.^5^ Imagen
4에서 Midjourney 수준의 스타일화를 달성하려면 더 명시적이고 상세한
스타일 프롬프팅이 필요할 수 있습니다. 핵심적인 차별점은 Midjourney가
\'예술적 해석\'에 뛰어난 반면, Imagen 4는 \'문자 그대로의 사실적인
실행\'에 강점을 보인다는 것입니다. 사용자가 세부 사항에 유연하면서도
아름다운 이미지를 원한다면 Midjourney가 더 빠를 수 있습니다. 만약 설명된
그대로의 특정하고 사실적인 장면을 원한다면 Imagen 4가 더 나은 도구가 될
것입니다.^35^

### **5.3 네거티브 프롬프트의 전략적 지원 중단** {#네거티브-프롬프트의-전략적-지원-중단}

Stable Diffusion이나 이전 모델들이 품질 향상을 위해 네거티브
프롬프트(예: ugly, deformed, blurry 등을 나열)에 크게 의존하는 것과
달리, 최신 Imagen 4 모델들은 이 기능을 공식적으로 지원 중단했습니다.^17^

이는 사용자에게 패러다임 전환을 요구합니다. a forest \--no people과 같이
프롬프트하는 대신, an empty forest trail이나 a desolate, uninhabited
forest와 같이 프롬프트해야 합니다. 이는 더 서술적인 \'긍정적 프롬프팅\'
기술을 요구하지만, 초보자에게는 과정을 단순화합니다. 이는 Google이 자사
모델의 기본 품질과 긍정적 프롬프트 준수도가 네거티브 프롬프트를
불필요하게 만들 만큼 높다는 자신감을 내비치는 신호입니다.

이미지 생성기 선택은 이제 어느 것이 \'최고\'인가의 문제가 아니라, 특정
프로젝트의 요구 사항에 따라 \'어떤 것이 적합한 도구인가\'의 문제가 되고
있습니다. 대화형 편집(DALL-E), 예술적 감각(Midjourney), 또는 사실적인
정밀도와 텍스트 통합(Imagen 4) 중 무엇이 필요한지에 따라 선택이
달라집니다. 각 모델은 뚜렷한 강점을 가지고 있으며 ^2^, 어떤 모델도 모든
범주에서 절대적인 승자로 평가되지는 않습니다. 비교는 종종 \"목표에 따라
다르다\"는 결론에 도달합니다.^37^ 따라서 이 보고서는 이를 \'경쟁\'이
아닌 \'창의적 툴킷\' 구축 가이드로 제시합니다. 전문가는 로고가 포함된
제품 목업에는 Imagen 4를, 영감을 주는 콘셉트 아트에는 Midjourney를,
클라이언트와 채팅을 통한 빠른 브레인스토밍에는 DALL-E를 사용할 수
있습니다.

| 기능/역량           | Imagen 4                             | DALL-E 4o                                  | Midjourney                                          |
|---------------------|--------------------------------------|--------------------------------------------|-----------------------------------------------------|
| **프롬프트 준수도** | 매우 높음 (특히 Ultra 모델) ^11^     | 높음 (대화형 수정 가능) ^36^               | 중간 (예술적 해석 경향) ^35^                        |
| **사실주의**        | 최상 (핵심 강점) ^5^                 | 매우 좋음                                  | 좋음 (스타일화 경향) ^35^                           |
| **텍스트 생성**     | 최상 (전용 모듈 탑재) ^2^            | 좋음                                       | 약함                                                |
| **스타일 다양성**   | 높음 (명시적 프롬프팅 필요) ^12^     | 높음                                       | 매우 높음 (기본적으로 스타일리시함) ^35^            |
| **사용 편의성**     | 중간 (Vertex AI 등 플랫폼) ^15^      | 매우 높음 (ChatGPT 대화형 인터페이스) ^36^ | 중간 (웹 앱/Discord, 학습 곡선 존재) ^36^           |
| **API/통합**        | 강력함 (Google Cloud, Vertex AI) ^2^ | 강력함 (OpenAI API)                        | API 제공                                            |
| **사용자 제어**     | 높음 (네거티브 프롬프트 없음) ^17^   | 높음 (대화형 편집) ^36^                    | 매우 높음 (다양한 파라미터, 네거티브 프롬프트) ^42^ |
| **가격 모델**       | 이미지당 과금 ^9^                    | 구독 기반 (ChatGPT Plus) ^37^              | 구독 기반 (등급별) ^43^                             |

**표 3: 경쟁 모델 기능 매트릭스: Imagen 4 vs. DALL-E 4o vs. Midjourney**

## **섹션 VI: 프롬프트에서 프로덕션까지: 실용적인 워크플로우와 흔한 함정**

이 섹션은 실제 적용을 위한 실행 가능한 조언을 제공하며, 흔한 오류를
피하고 Imagen 4를 더 큰 창작 파이프라인에 통합하는 데 중점을 둡니다.

### **6.1 흔한 실수와 해결책** {#흔한-실수와-해결책}

- **모호하거나 과부하된 프롬프트:** 균형 찾기가 중요합니다. \"자동차\"와
  > 같이 너무 단순한 프롬프트(모호함)와 \"새와 비행기와 보트가 있는
  > 일몰의 다리 위를 달리는 빨간 자동차\...\"와 같이 너무 복잡한
  > 프롬프트(과부하)를 피해야 합니다.^20^ 먼저 3-5개의 핵심 구성 요소에
  > 집중하는 것이 좋습니다.

- **해부학적 문제 완화:** AI는 여전히 손이나 복잡한 인간의 자세를
  > 표현하는 데 어려움을 겪습니다.^20^ 인간 피사체의 수를 적게 유지하고,
  > 자세를 간단하게 묘사하며, 잠재적인 후처리 보정을 계획하는 것이
  > 좋습니다.

- **모순된 지시 피하기:** \"미니멀하면서도 매우 상세한 일러스트\"와 같은
  > 프롬프트는 모델을 혼란스럽게 합니다. 지시 사항은 논리적으로
  > 일관되어야 합니다.^21^

- **조명과 구성 잊지 않기:** 조명과 구성을 지정하지 않는 것은 평면적이고
  > 흥미롭지 않은 이미지로 이어지는 흔한 실수입니다. 항상 이러한 요소를
  > 추가하는 것을 고려해야 합니다.^20^

### **6.2 문제 해결 및 기술적 제약** {#문제-해결-및-기술적-제약}

- **API 제한:** API를 사용할 때는 분당 최대 요청 수(20회), 요청당 최대
  > 이미지 수(Standard는 4개, Ultra는 1개), 최대 프롬프트 토큰
  > 수(480개)와 같은 제약 사항을 인지해야 합니다.^17^

- **안전 필터:** 사용자가 구성할 수 있는 안전 필터가 이미지 생성을
  > 차단할 수 있음을 이해해야 합니다. 이미지 생성이 실패하면 이러한 필터
  > 때문일 수 있습니다.^6^

- **결정론적 결과를 위한 시드 번호:** 재현 가능한 결과(프롬프트 변경
  > 테스트에 중요)를 얻으려면 seed 매개변수를 사용해야 합니다. 동일한
  > 시드 번호를 가진 동일한 프롬프트는 항상 동일한 이미지를
  > 생성합니다.^40^

- **\"이미지가 이상하거나 품질이 낮을 때\":** 결과가 좋지 않을 때 첫
  > 번째 단계는 더 구체적으로 프롬프트를 다듬는 것입니다. 그래도
  > 해결되지 않으면 \'프롬프트 향상\' 기능을 비활성화해 보십시오.^6^
  > 문제가 지속되면 새 채팅이나 세션을 시작하여 모델이 이전의 결함 있는
  > 생성에 대해 가질 수 있는 \'기억\'을 지우는 데 도움이 될 수
  > 있습니다.^46^

### **6.3 워크플로우 통합** {#워크플로우-통합}

- **아이디어 구상에서 프로덕션까지의 파이프라인:** 신속하고 저렴한
  > 브레인스토밍을 위해 Imagen 4 Fast를 사용하고, 최상의 프롬프트를
  > 선택하여 최종 고해상도 자산을 위해 Imagen 4 Ultra와 함께 사용하는
  > 것이 효율적인 파이프라인입니다.^3^

- **참조 이미지 사용:** 핵심 API는 이미지 대 이미지 작업에 대한 지원이
  > 제한적이지만 ^17^, Whisk와 같은 플랫폼은 \'이미지를 프롬프트로\'
  > 사용하는 워크플로우를 허용합니다. 이는 주체, 장면, 스타일에 대해
  > 각각 다른 이미지를 사용하여 브랜드 일관성을 유지하는 데 강력할 수
  > 있습니다.^24^

- **후처리 및 업스케일링:** Imagen 4는 최대 2K 해상도의 이미지를 생성할
  > 수 있지만 ^2^, 매우 큰 형식이나 사소한 AI 인공물을 수정하기 위해
  > 사용자는 최종 연마를 위해 Photoshop, Canva 또는 전용 AI 업스케일러와
  > 같은 외부 도구를 사용할 계획을 세워야 합니다.^2^

Imagen 4의 효과적인 사용은 단순히 프롬프트를 작성하는 것 이상으로,
\'프롬프트 파이프라인 관리\'에 관한 것입니다. 이는 아이디어 구상, 정제,
생성, 후처리 등 여러 단계의 프로세스를 포함하며, 각 단계에서 서로 다른
도구와 모델 등급을 사용합니다. 연구 자료들은 아이디어 구상 대 프로덕션을
위한 계층적 모델 시스템 ^3^, 후처리 도구의 필요성 ^2^, 반복적인 프롬프팅
과정 ^22^, 그리고 특정 플랫폼에서의 참조 이미지 사용 ^24^을 설명합니다.
따라서 전문적인 워크플로우는 단일 행동(\"프롬프트 작성, 이미지 획득\")이
아니라 다단계 파이프라인입니다. 이 가이드는 이를 단편적인 팁의 모음이
아닌 전략적 워크플로우로 제시해야 합니다. 예를 들어, \"1단계: Imagen 4
Fast에서 10개의 프롬프트 변형을 브레인스토밍한다. 2단계: 상위 2개의
프롬프트를 선택한다. 3단계: Imagen 4 Ultra에서 최종 버전을 생성한다.
4단계: 외부 편집기에서 업스케일링하고 텍스트 오버레이를 추가한다.\"와
같은 구체적인 절차를 제안할 수 있습니다.

## **섹션 VII: 전략적 권장 사항 및 미래 전망**

이 마지막 섹션에서는 모든 정보를 종합하여 목표에 맞는 조언을 제공하고
기술의 미래를 조망합니다.

### **7.1 사용자 유형별 종합 권장 사항** {#사용자-유형별-종합-권장-사항}

- **마케터를 위해:** 광고 크리에이티브, 소셜 미디어 게시물, 제품 목업을
  > 위해 Imagen 4의 텍스트 생성 기능에 집중하십시오.^2^ 시각 캠페인의
  > A/B 테스트에는 Fast 등급을, 최종적으로 다듬어진 자산에는 Ultra
  > 등급을 사용하십시오.

- **콘셉트 아티스트/디자이너를 위해:** 정밀한 스타일 제어를 위해 상세한
  > 키워드 사전(표 2)을 활용하십시오. 복잡한 장면을 구성하기 위해
  > 반복적인 프롬프팅 방법을 사용하십시오. 사소한 해부학적 결함을
  > 수정하거나 최종 세부 사항을 추가하기 위해 후처리를 계획하십시오.

- **개발자를 위해:** Vertex AI API를 활용하여 Imagen 4를 애플리케이션에
  > 직접 통합하십시오.^6^ API 제한, 가격 등급, 그리고 예측 가능한
  > 프로그래밍 방식의 출력을 위해 프롬프트 향상 기능을 비활성화할 수
  > 있는 기능에 세심한 주의를 기울이십시오.

### **7.2 이미지 생성의 궤적: 다음은 무엇인가?** {#이미지-생성의-궤적-다음은-무엇인가}

Imagen 3에서 Imagen 4로의 발전은 향상된 사실주의, 더 강력한 LLM을 통한
더 나은 지시 사항 준수, 그리고 텍스트 생성과 같은 더 실용적인 기능을
향한 명확한 추세를 보여줍니다.^5^ 네거티브 프롬프트의 지원 중단은 모델이
긍정적인 지시를 이해하는 데 너무 능숙해져서 \'무엇을 하지 말아야
할지\'를 명시하는 것이 쓸모없어지는 미래를 암시합니다.

미래에는 인간 해부학 처리 능력의 추가적인 개선, 텍스트 배치에 대한 더
세분화된 제어, 그리고 Veo와 같은 비디오 스타일과 일치하는 이미지
생성이나 3D 자산 생성과 같은 다른 양식과의 더 깊은 통합을 기대할 수
있습니다. 현재 제한적인 \'이미지를 프롬프트로\' 사용하는 기능은 앞으로
워크플로우의 중심이 되어 더욱 강력해질 가능성이 높습니다.

#### 참고 자료

1.  Imagen 4 Model Card - Googleapis.com, 8월 8, 2025에 액세스,
    > [[https://storage.googleapis.com/deepmind-media/Model-Cards/Imagen-4-Model-Card.pdf]{.underline}](https://storage.googleapis.com/deepmind-media/Model-Cards/Imagen-4-Model-Card.pdf)

2.  Imagen 4 AI: Generate 2K Images with Perfect Text & Details -
    > OneClick IT Consultancy, 8월 8, 2025에 액세스,
    > [[https://www.oneclickitsolution.com/centerofexcellence/aiml/googles-imagen-4-ai-generate-hyper-realistic-images]{.underline}](https://www.oneclickitsolution.com/centerofexcellence/aiml/googles-imagen-4-ai-generate-hyper-realistic-images)

3.  Imagen 4 Review: Benchmarks, Pricing & SmythOS Integration, 8월 8,
    > 2025에 액세스,
    > [[https://smythos.com/developers/ai-models/imagen-4-review-benchmarks-pricing-smythos-integration/]{.underline}](https://smythos.com/developers/ai-models/imagen-4-review-benchmarks-pricing-smythos-integration/)

4.  ‎Gemini Apps\' release updates & improvements, 8월 8, 2025에 액세스,
    > [[https://gemini.google/release-notes/]{.underline}](https://gemini.google/release-notes/)

5.  Pushing Creative Boundaries: Google Imagen 4 vs Imagen 3 in
    > Real-World Use - Kartaca, 8월 8, 2025에 액세스,
    > [[https://kartaca.com/en/pushing-creative-boundaries-google-imagen-4-vs-imagen-3-in-real-world-use/]{.underline}](https://kartaca.com/en/pushing-creative-boundaries-google-imagen-4-vs-imagen-3-in-real-world-use/)

6.  Imagen 4 for Image Generation -- Vertex AI - Google Cloud Console,
    > 8월 8, 2025에 액세스,
    > [[https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/imagen-4.0-generate-preview-06-06]{.underline}](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/imagen-4.0-generate-preview-06-06)

7.  Generate images using Imagen \| Firebase AI Logic - Google, 8월 8,
    > 2025에 액세스,
    > [[https://firebase.google.com/docs/ai-logic/generate-images-imagen]{.underline}](https://firebase.google.com/docs/ai-logic/generate-images-imagen)

8.  Google Imagen 4: The Future of AI Image Generation - AIVideo.com,
    > 8월 8, 2025에 액세스,
    > [[https://www.aivideo.com/models/google-imagen-4]{.underline}](https://www.aivideo.com/models/google-imagen-4)

9.  Google Launches Imagen 4 for Text-to-Image Generation via Gemini API
    > and AI Studio, 8월 8, 2025에 액세스,
    > [[https://pureai.com/articles/2025/06/25/google-launches-imagen-4.aspx]{.underline}](https://pureai.com/articles/2025/06/25/google-launches-imagen-4.aspx)

10. Google models \| Generative AI on Vertex AI, 8월 8, 2025에 액세스,
    > [[https://cloud.google.com/vertex-ai/generative-ai/docs/models]{.underline}](https://cloud.google.com/vertex-ai/generative-ai/docs/models)

11. Imagen 4 is now available in the Gemini API and Google AI Studio,
    > 8월 8, 2025에 액세스,
    > [[https://developers.googleblog.com/en/imagen-4-now-available-in-the-gemini-api-and-google-ai-studio/]{.underline}](https://developers.googleblog.com/en/imagen-4-now-available-in-the-gemini-api-and-google-ai-studio/)

12. Generate images using Imagen \| Gemini API \| Google AI for
    > Developers, 8월 8, 2025에 액세스,
    > [[https://ai.google.dev/gemini-api/docs/imagen]{.underline}](https://ai.google.dev/gemini-api/docs/imagen)

13. Imagen 3 vs Imagen 4 Ultra : r/Bard - Reddit, 8월 8, 2025에 액세스,
    > [[https://www.reddit.com/r/Bard/comments/1lctqx7/imagen_3_vs_imagen_4_ultra/]{.underline}](https://www.reddit.com/r/Bard/comments/1lctqx7/imagen_3_vs_imagen_4_ultra/)

14. Imagen 4: Create richer, more nuanced images, faster than before \|
    > Product Hunt, 8월 8, 2025에 액세스,
    > [[https://www.producthunt.com/products/imagen-4]{.underline}](https://www.producthunt.com/products/imagen-4)

15. Imagen on Vertex AI \| AI Image Generator - Google Cloud, 8월 8,
    > 2025에 액세스,
    > [[https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview]{.underline}](https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview)

16. Google Imagen 4 \| Text to Image \| API reference - Replicate, 8월
    > 8, 2025에 액세스,
    > [[https://replicate.com/google/imagen-4/api]{.underline}](https://replicate.com/google/imagen-4/api)

17. Imagen 4 Generate Preview 06-06 \| Generative AI on Vertex AI -
    > Google Cloud, 8월 8, 2025에 액세스,
    > [[https://cloud.google.com/vertex-ai/generative-ai/docs/models/imagen/4-0-generate-preview-06-06]{.underline}](https://cloud.google.com/vertex-ai/generative-ai/docs/models/imagen/4-0-generate-preview-06-06)

18. medium.com, 8월 8, 2025에 액세스,
    > [[https://medium.com/google-cloud/the-art-of-the-ask-mastering-prompts-for-imagen-on-vertex-ai-aa2a19be7d1b#:\~:text=There\'s%20no%20single%20way%20to,subject%2C%20context%2C%20and%20style.]{.underline}](https://medium.com/google-cloud/the-art-of-the-ask-mastering-prompts-for-imagen-on-vertex-ai-aa2a19be7d1b#:~:text=There's%20no%20single%20way%20to,subject%2C%20context%2C%20and%20style.)

19. AI Image Generation: How to Write Good AI Image Prompts \| Typeface
    > Academy, 8월 8, 2025에 액세스,
    > [[https://www.typeface.ai/education/typeface-academy/how-to-write-good-ai-image-prompts]{.underline}](https://www.typeface.ai/education/typeface-academy/how-to-write-good-ai-image-prompts)

20. 10 AI Image Generation Mistakes 99% Of People Make And How To Fix
    > Them - AI Tools, 8월 8, 2025에 액세스,
    > [[https://www.godofprompt.ai/blog/10-ai-image-generation-mistakes-99percent-of-people-make-and-how-to-fix-them]{.underline}](https://www.godofprompt.ai/blog/10-ai-image-generation-mistakes-99percent-of-people-make-and-how-to-fix-them)

21. Common Mistakes in Prompt Writing and How to Avoid Them - Stockimg
    > AI, 8월 8, 2025에 액세스,
    > [[https://stockimg.ai/blog/prompts/common-mistakes-in-prompt-writing-and-how-to-avoid-them]{.underline}](https://stockimg.ai/blog/prompts/common-mistakes-in-prompt-writing-and-how-to-avoid-them)

22. Prompt and image attribute guide \| Generative AI on Vertex AI -
    > Google Cloud, 8월 8, 2025에 액세스,
    > [[https://cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide]{.underline}](https://cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)

23. Guide to Writing Text to Image Prompts \| getimg.ai, 8월 8, 2025에
    > 액세스,
    > [[https://getimg.ai/guides/guide-to-writing-text-to-image-prompts]{.underline}](https://getimg.ai/guides/guide-to-writing-text-to-image-prompts)

24. The Guide for Mastering Google\'s Latest AI Image Generation -
    > Imagen 4 - Image Prompting Strategies, Epic Examples, Complete
    > Comparison to GPT-4o and more : r/ThinkingDeeplyAI - Reddit, 8월
    > 8, 2025에 액세스,
    > [[https://www.reddit.com/r/ThinkingDeeplyAI/comments/1lehzx7/the_guide_for_mastering_googles_latest_ai_image/]{.underline}](https://www.reddit.com/r/ThinkingDeeplyAI/comments/1lehzx7/the_guide_for_mastering_googles_latest_ai_image/)

25. How to Use Google\'s Imagen 4 AI Image Generator for FREE - YouTube,
    > 8월 8, 2025에 액세스,
    > [[https://www.youtube.com/watch?v=TlQFsAdGdDM]{.underline}](https://www.youtube.com/watch?v=TlQFsAdGdDM)

26. Imagen (text-to-image model) - Wikipedia, 8월 8, 2025에 액세스,
    > [[https://en.wikipedia.org/wiki/Imagen\_(text-to-image_model)]{.underline}](https://en.wikipedia.org/wiki/Imagen_(text-to-image_model))

27. Google Imagen 4 Review: See My 17 Prompts Test Result - VideoProc,
    > 8월 8, 2025에 액세스,
    > [[https://www.videoproc.com/resource/google-imagen-4-review.htm]{.underline}](https://www.videoproc.com/resource/google-imagen-4-review.htm)

28. Free AI Image Generator: Text to Image Online - Adobe Firefly, 8월
    > 8, 2025에 액세스,
    > [[https://www.adobe.com/products/firefly/features/text-to-image.html]{.underline}](https://www.adobe.com/products/firefly/features/text-to-image.html)

29. See what else Imagen 4 can do - Google DeepMind, 8월 8, 2025에
    > 액세스,
    > [[https://deepmind.google/models/imagen/see-what-else-imagen-4-can-do/]{.underline}](https://deepmind.google/models/imagen/see-what-else-imagen-4-can-do/)

30. Gen-4 Image Prompting Guide - Runway, 8월 8, 2025에 액세스,
    > [[https://help.runwayml.com/hc/en-us/articles/35694045317139-Gen-4-Image-Prompting-Guide]{.underline}](https://help.runwayml.com/hc/en-us/articles/35694045317139-Gen-4-Image-Prompting-Guide)

31. Vertex AI video generation prompt guide - Google Cloud, 8월 8,
    > 2025에 액세스,
    > [[https://cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide]{.underline}](https://cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide)

32. The Photography Terms Glossary For Photography Part ll - Top
    > Photographers Blog Best photography blog - Silvergumtype - Hub for
    > creativity in for photographers, 8월 8, 2025에 액세스,
    > [[https://silvergumtype.com/2025/01/24/the-photography-terms-glossary-for-photography-part-ll/]{.underline}](https://silvergumtype.com/2025/01/24/the-photography-terms-glossary-for-photography-part-ll/)

33. Imagen 4 Image Generation - Colab - Google, 8월 8, 2025에 액세스,
    > [[https://colab.research.google.com/github/GoogleCloudPlatform/generative-ai/blob/main/vision/getting-started/imagen4_image_generation.ipynb]{.underline}](https://colab.research.google.com/github/GoogleCloudPlatform/generative-ai/blob/main/vision/getting-started/imagen4_image_generation.ipynb)

34. How to Use Imagen 4 ULTRA to Create AI Pictures with Text - YouTube,
    > 8월 8, 2025에 액세스,
    > [[https://www.youtube.com/watch?v=93XegTAtKJg]{.underline}](https://www.youtube.com/watch?v=93XegTAtKJg)

35. Google\'s new Imagen 3 model vs. Dalle-3 : r/OpenAI - Reddit, 8월 8,
    > 2025에 액세스,
    > [[https://www.reddit.com/r/OpenAI/comments/1hfp843/googles_new_imagen_3_model_vs_dalle3/]{.underline}](https://www.reddit.com/r/OpenAI/comments/1hfp843/googles_new_imagen_3_model_vs_dalle3/)

36. Midjourney vs. ChatGPT (formerly DALL·E 3): Which image generator is
    > better? \[2025\], 8월 8, 2025에 액세스,
    > [[https://zapier.com/blog/midjourney-vs-dalle/]{.underline}](https://zapier.com/blog/midjourney-vs-dalle/)

37. Dall-E 3 vs Midjourney: A Side-by-Side AI Image Comparison -
    > Writesonic, 8월 8, 2025에 액세스,
    > [[https://writesonic.com/blog/dall-e-3-vs-midjourney]{.underline}](https://writesonic.com/blog/dall-e-3-vs-midjourney)

38. Imagen - Google DeepMind, 8월 8, 2025에 액세스,
    > [[https://deepmind.google/models/imagen/]{.underline}](https://deepmind.google/models/imagen/)

39. Imagen 3 vs DALL-E 3: Which is the Better Model for Images? -
    > Analytics Vidhya, 8월 8, 2025에 액세스,
    > [[https://www.analyticsvidhya.com/blog/2024/12/imagen-3-vs-dalle-3/]{.underline}](https://www.analyticsvidhya.com/blog/2024/12/imagen-3-vs-dalle-3/)

40. Omit content using a negative prompt \| Generative AI on Vertex AI -
    > Google Cloud, 8월 8, 2025에 액세스,
    > [[https://cloud.google.com/vertex-ai/generative-ai/docs/image/omit-content-using-a-negative-prompt]{.underline}](https://cloud.google.com/vertex-ai/generative-ai/docs/image/omit-content-using-a-negative-prompt)

41. Midjourney vs. DALLE 3 - Worlds Apart : r/ChatGPT - Reddit, 8월 8,
    > 2025에 액세스,
    > [[https://www.reddit.com/r/ChatGPT/comments/1hnen76/midjourney_vs_dalle_3_worlds_apart/]{.underline}](https://www.reddit.com/r/ChatGPT/comments/1hnen76/midjourney_vs_dalle_3_worlds_apart/)

42. Multi-Prompts & Weights - Midjourney, 8월 8, 2025에 액세스,
    > [[https://docs.midjourney.com/hc/en-us/articles/32658968492557-Multi-Prompts-Weights]{.underline}](https://docs.midjourney.com/hc/en-us/articles/32658968492557-Multi-Prompts-Weights)

43. Midjourney vs DALL-E: AI Art Tools Face-Off for 2025 - eWEEK, 8월 8,
    > 2025에 액세스,
    > [[https://www.eweek.com/artificial-intelligence/midjourney-vs-dalle/]{.underline}](https://www.eweek.com/artificial-intelligence/midjourney-vs-dalle/)

44. I Tested Imagen 4: Not as Good as Imagen 3, But Here\'s How to Get
    > the Best out of It!, 8월 8, 2025에 액세스,
    > [[https://pollo.ai/hub/imagen-4-review]{.underline}](https://pollo.ai/hub/imagen-4-review)

45. Common Prompt Mistakes And How To Fix Them - YouTube, 8월 8, 2025에
    > 액세스,
    > [[https://m.youtube.com/watch?v=MUsSVTUw9lA]{.underline}](https://m.youtube.com/watch?v=MUsSVTUw9lA)

46. OpenAI 4o Image Generation Guide - Prompt Engineering Guide, 8월 8,
    > 2025에 액세스,
    > [[https://www.promptingguide.ai/guides/4o-image-generation]{.underline}](https://www.promptingguide.ai/guides/4o-image-generation)

47. Google AI: Imagen 4 vs Imagen 3 Showdown on Whisk - YouTube, 8월 8,
    > 2025에 액세스,
    > [[https://www.youtube.com/watch?v=\_nCQs0P_ZwE]{.underline}](https://www.youtube.com/watch?v=_nCQs0P_ZwE)

48. Google Imagen 4 Free Use \| Create 8K Images with Imagen 4
    > Tutorial - YouTube, 8월 8, 2025에 액세스,
    > [[https://www.youtube.com/watch?v=28yLoZA9cJ4&pp=0gcJCfwAo7VqN5tD]{.underline}](https://www.youtube.com/watch?v=28yLoZA9cJ4&pp=0gcJCfwAo7VqN5tD)

49. Google Imagen 4 FREE Tutorial \| Enhance AI Images to 4K Ultra HD
    > Guide - YouTube, 8월 8, 2025에 액세스,
    > [[https://www.youtube.com/watch?v=PgKSPMeLFwQ]{.underline}](https://www.youtube.com/watch?v=PgKSPMeLFwQ)
