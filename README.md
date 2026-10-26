# Мост · 다리

러시아어를 쓰는 아이들(카자흐스탄·우즈베키스탄 출신, 고려인 가정 포함)이 한국어를 처음부터 배우는 웹앱입니다.
러시아어를 할 줄 아는 선생님이 없는 시골 지역아동센터에서 아이 혼자서도 쓸 수 있게 만들었습니다.

## 무엇이 들어 있나
- 단원 12개: 한글 A1~A6, 생활 한국어 B1~B5, 수업 한국어 C1 (나머지 9개는 지도에 "скоро"로 표시)
- 듣기, 말하기(녹음 후 발음 비교), 읽기, 쓰기(손가락 획순 따라 쓰기), 문장 만들기
- 러시아어 도움말 3단계(많이 · 조금 · 없음)와 지시문 읽어 주기
- 미시카(AI 선생님): 자주 묻는 질문은 미리 만든 답, 나머지는 브라우저 안에서 도는 오픈소스 모델(Gemma 3 1B 또는 Qwen2.5 0.5B)
- 발음 인식: Whisper base를 브라우저에서 실행. 음성은 기기 밖으로 나가지 않음
- 선생님·부모님 화면: 단원 진도, 활동별 첫 시도 정답률, 자주 틀린 것, 러시아어 가정 안내문 인쇄

커리큘럼 근거와 단원 계획은 [CURRICULUM.md](CURRICULUM.md)에 있습니다.

## 사용한 오픈소스
| 무엇 | 어디에 | 라이선스 |
|---|---|---|
| [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (Microsoft) | 단어 그림, 지도, 아바타, 미시카 | MIT |
| [es-hangul](https://github.com/toss/es-hangul) (Toss) | 말하기 단계의 "읽는 소리" 표시 (표준 발음 변환) | MIT |
| [Transformers.js](https://github.com/huggingface/transformers.js) + Whisper base | 브라우저 안 발음 인식 | Apache-2.0 / MIT |
| Gemma 3 1B, Qwen2.5 0.5B | 미시카 AI 선생님 | Gemma 약관 / Apache-2.0 |
| [lucide](https://lucide.dev) | 버튼 아이콘 | ISC |
| Jua, Noto Sans KR, Nunito (Google Fonts) | 글꼴 | OFL |

검토했지만 아직 넣지 않은 것: Supertonic 3(한국어·러시아어 음성 합성, 기기 음성이 없는 태블릿 대비),
Tatoeba 한국어·러시아어 예문(CC BY 2.0 FR, 예문 늘릴 때), 국립국어원 한국어기초사전(러시아어 뜻 검토용).

`npm run assets`는 코드에 쓴 아이콘과 그림만 골라 `src/components/icons.js`와 `public/pics/`를 다시 만듭니다.

## 실행
```
npm install
npm run dev       # 개발 서버
npm run build     # dist/ 에 정적 사이트 생성
npm run preview   # 빌드 결과 확인
```
`dist/`는 어떤 정적 호스팅(GitHub Pages, Vercel, Netlify)에 올려도 동작합니다.
ONNX 런타임 wasm은 jsDelivr CDN에서, 모델은 Hugging Face에서 처음 한 번 내려받아 브라우저에 저장합니다.

주소 뒤에 `?debug`를 붙이면 정답 없이 "다음"으로 넘어갈 수 있습니다(테스트용).

## 아직 남은 일
- 러시아어 문장 원어민 검토
- 실제 태블릿·PC에서 Whisper와 AI 모델 동작 확인
- 나머지 9개 단원
- 경주 지역아동센터 시범 사용

## 기관 로그인과 학습 기록 (Supabase)

1. Supabase 프로젝트의 SQL Editor에서 [`supabase/schema.sql`](supabase/schema.sql)을 한 번 실행해요. 마지막 줄에 선생님 가입 코드가 나와요.
2. Authentication → Sign In / Providers에서 **Allow anonymous sign-ins**를 켜요. 기기마다 익명 세션을 하나 두고, 기관 + 아이디로 로그인하면 그 세션이 계정에 연결돼요. 그래서 이메일이 필요 없어요.
3. 주소와 publishable 키는 `src/lib/cloud.js`에 있어요 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`로 바꿀 수 있음).

표에는 직접 접근할 수 없고(RLS, 정책 없음), 앱은 `schema.sql`의 함수만 불러요. 함수가 호출한 사람의 역할과 기관을 확인해요.
