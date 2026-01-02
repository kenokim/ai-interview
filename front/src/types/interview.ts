export type InterviewStateType = {
  readonly resume: string;
  readonly jobDescription: string;
  readonly jobRole: string;
  readonly language: string;
  readonly interviewType: string;
  readonly experience: number;
  readonly speakerEnabled?: boolean;
  readonly microphoneEnabled?: boolean;
};

export type ChatMessageType = {
  readonly id: number;
  readonly type: "ai" | "user";
  readonly message: string;
  readonly isThinking?: boolean;
};

export type ExperienceLevelType = "junior" | "mid-level" | "senior";

export type StartInterviewPayloadType = {
  readonly jobRole: string;
  readonly language: string;
  readonly experience: ExperienceLevelType;
  readonly interviewType: string;
  readonly resume: string;
  readonly jobDescription: string;
  readonly userName: string;
};

export type StartInterviewResponseType = {
  readonly sessionId: string;
  readonly message: string;
  readonly stage?: string;
};

export type SendMessagePayloadType = {
  readonly sessionId: string;
  readonly message: string;
};

export type SendMessageResponseType = {
  readonly message: string;
  readonly stage?: string;
};

export type EndInterviewPayloadType = {
  readonly sessionId: string;
};


