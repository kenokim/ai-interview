# LangGraph 스트리밍 TypeScript 구현 가이드

## 목적
LangGraph 스트리밍 기능을 프론트엔드·백엔드에 TypeScript로 통합하는 방법을 단계별로 설명한다. 실시간 상태 업데이트와 토큰 스트림을 React UI에 표시하고, Node.js 서버에서 LangGraph StateGraph를 실행·중계하는 것이 목표다.

## 시스템 아키텍처
```
[React] ──▶ HTTP(S)/WebSocket ──▶ [Node.js + LangGraph] ──▶ LLM, DB 등
                      ▲                               │
                      └────── 실시간 스트림(JSON) ─────┘
```
1. React는 fetch(Stream) 또는 WebSocket으로 스트림을 구독한다.
2. Node.js 서버는 LangGraph 그래프를 `graph.stream()`으로 실행하고 청크를 클라이언트에 전달한다.
3. 프런트는 스트림을 파싱해 UI(채팅·로딩바 등)를 즉시 갱신한다.

## 백엔드 구현
### 1. LangGraph 그래프 정의
```ts
import { StateGraph } from "@langchain/langgraph"; // 가상의 esm 패키지명 예시

interface MyState {
  messages: string[];
}

const graph = new StateGraph<MyState>();
// 1) LLM 호출 노드 예시 (messages 스트림 방출)
import { ChatGoogleGenerativeAI } from "langchain/chat_models/google";
import { HumanMessage } from "langchain/schema";

const llm = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.0-flash", // 사내 기본 모델
  temperature: 0.7,
  streaming: true, // 필수: 토큰 스트림 활성화
});

/**
 * LangGraph 노드는 (state) => state 업데이트를 반환하는 순수 함수다.
 * LLM 토큰 스트림까지 자동으로 messages 모드로 전파된다.
 */
const askLLM = async (state: MyState) => {
  const userInput = state.messages[state.messages.length - 1];
  let aiReply = "";

  // 토큰 스트림 소비 → aiReply 누적 후 반환
  for await (const chunk of llm.stream([new HumanMessage(userInput)])) {
    aiReply += chunk.content;
  }

  return { messages: [...state.messages, aiReply] } as Partial<MyState>;
};

// 그래프 구성
const start = graph.addNode("ask", askLLM);
// 단순 선형 그래프 예시
graph.addEdge("ask", "ask");

const app = graph.compile(); // Runnable 생성
```

### 2. 스트림 엔드포인트 (Express 예시)
```ts
import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

router.post('/api/graph/stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const input = req.body; // 초기 상태 등

  for await (const chunk of app.stream(input, {
    stream_mode: ['updates', 'messages']
  })) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`); // SSE 형식 전송
  }
  res.end();
});

export default router;
```

설명
- `stream_mode`는 분석 문서에서 권장한 updates+messages 조합을 사용한다.
- SSE(Server-Sent Events)는 HTTP/2에 적합하며 구현이 단순하다. WebSocket이 필요하면 동일한 for-await 루프 안에서 `ws.send()`만 호출하면 된다.

## 프론트엔드 구현 (React)
### 1. 스트림 소비 훅
```ts
import { useEffect, useRef, useState } from 'react';

export function useLangGraphStream(url: string) {
  const [updates, setUpdates] = useState<any[]>([]);
  const eventSrc = useRef<EventSource>();

  useEffect(() => {
    eventSrc.current = new EventSource(url);

    eventSrc.current.onmessage = (e) => {
      try {
        const chunk = JSON.parse(e.data);
        setUpdates((prev) => [...prev, chunk]);
      } catch (_) {}
    };
    return () => eventSrc.current?.close();
  }, [url]);

  return updates; // 컴포넌트에서 렌더링
}
```

### 2. UI 갱신 예시
```tsx
const updates = useLangGraphStream('/api/graph/stream');
return (
  <div>
    {updates.map((c, i) => (
      <pre key={i}>{JSON.stringify(c, null, 2)}</pre>
    ))}
  </div>
);
```

`chunk` 구조
```
[mode, payload]
// 예) [
//   "updates", { "agent": { "step": "evaluate" }}
// ]
```
모드가 `messages`이면 `payload` 안에 토큰이나 메시지 조각이 들어오므로 채팅 말풍선에 이어 붙이면 된다.

## 모드별 처리 전략
| 모드 | 클라이언트 처리 | 권장 UI |
|------|----------------|---------|
| updates | 상태 델타를 누적하여 그래프 진행 상황 바, 로그 | 진행률 표시, 디버깅 패널 |
| messages | 토큰·문장 단위 문자열을 이어 붙임 | 채팅창 실시간 출력 |
| values | 그대로 렌더링(전체 상태 덮어쓰기) | 간단한 데모용 |

## 오류·재연결
- SSE는 네트워크 단절 시 자동 재접속을 시도한다.
- 백엔드는 try-catch 안에서 `res.write("event: error\n")`로 오류 정보를 스트림할 수 있다.
- 클라이언트는 `eventSrc.onerror`에서 토스트를 띄우고 일정 시간 후 재시도한다.

## 전송 방식 비교: WebSocket 스트림 vs REST API 단일 응답
프로젝트의 요구사항에 따라 `graph.stream()`을 사용하여 실시간으로 클라이언트에 전달할지, `graph.invoke()`를 사용하여 모든 처리가 끝난 후 최종 결과만 한 번에 전달할지 결정할 수 있습니다.

| 구분 | WebSocket + `graph.stream()` | REST API + `graph.invoke()` |
|---|---|---|
| 데이터 흐름 | 실시간, 양방향<br/>클라이언트가 보낸 메시지에 대한 AI의 응답 토큰, 상태 변화를 즉시 스트리밍. | 요청/응답, 단방향<br/>클라이언트가 요청을 보내면, 서버에서 모든 처리가 완료될 때까지 기다린 후 최종 결과만 받음. |
| 사용자 경험 (UX) | 매우 우수<br/>- AI가 생각하는 과정을 실시간으로 볼 수 있음 (타이핑 효과).<br/>- 중간 상태(예: "답변 평가 중...")를 표시하여 지루함을 줄임. | 나쁨<br/>- LLM의 응답 생성 시간(수 초) 동안 UI가 멈춘 것처럼 보임.<br/>- 사용자는 서버에서 무슨 일이 일어나는지 알 수 없음. |
| 백엔드 로직 | - 클라이언트 연결 유지를 위한 WebSocket 서버 필요.<br/>- `for await...of` 루프를 사용하여 각 청크를 클라이언트로 전달. | - 일반적인 REST API 엔드포인트로 구현.<br/>- `await graph.invoke()`로 결과를 기다린 후 `res.json()`으로 응답. |
| 프론트엔드 로직 | - WebSocket 연결 및 `onmessage` 이벤트 핸들러 구현.<br/>- 수신된 청크의 `mode`에 따라 UI를 다르게 업데이트 (토큰 이어붙이기, 상태 업데이트 등). | - `fetch` 또는 `axios`로 API를 호출하고, 반환된 데이터를 한 번에 UI에 표시. |
| 적합한 사례 | - 대화형 AI 챗봇<br/>- 실시간 작업 모니터링 대시보드<br/>- 코드 생성, 긴 글 요약 등 처리 시간이 긴 작업 | - 간단한 데이터 조회<br/>- 즉각적인 응답이 가능한 비동기 작업(예: 이메일 전송 요청) |
| 현재 프로젝트 | 채택<br/>본 프로젝트는 실시간 면접 경험을 제공해야 하므로, WebSocket과 `graph.stream()` 조합이 필수적입니다. | 부적합<br/>사용자가 답변 후 AI 면접관이 한참 동안 응답이 없으면 치명적인 UX 문제를 야기합니다. |


## 참고
세부 이론·스트림 모드 설명은 `docs/research/21_LangGraph 스트리밍 기능 분석_.md`를 참조. 이 문서는 그 내용을 실용 코드 레벨 가이드로 요약한다.
