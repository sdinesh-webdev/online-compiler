export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

export interface Model {
  id: string;
  label: string;
  icon: string;
  provider: string;
  apiKey: string;
}

export interface PlanStep {
  status: 'done' | 'active' | 'pending';
  label: string;
}

export interface StructuredPlan {
  html: string;
  blocks: string;
}
