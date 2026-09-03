export type AppModule = "fashion" | "appliances";

export type ApplianceHoldingStyle = "hand_hold" | "table_placed";

export interface ApplianceContextOption {
  id: string;
  name: string;
  desc: string;
  promptText: string;
  icon?: string;
}

export interface TimelineItem {
  time: string;
  action: string;
  dialogue: string;
}

export interface PromptSegment {
  segment: string;
  prompt_text: string;
  prompt_text_en?: string;
}

export interface HookSuggestion {
  title: string;
  hashtags: string[];
}

export interface GeneratedResult {
  timeline: TimelineItem[];
  prompts: PromptSegment[];
  hooks?: HookSuggestion[];
}

export interface ToneOption {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface StyleOption {
  id: string;
  name: string;
  desc: string;
  promptText: string;
}

export interface HistoryItem {
  id: number;
  snippet: string;
  tone: string;
  duration: number;
  rawFullHighlights: string;
  cta?: string;
  module?: AppModule;
  applianceHoldingStyle?: ApplianceHoldingStyle;
  applianceContextId?: string;
  resultData?: GeneratedResult;
}

