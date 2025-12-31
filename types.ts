
export enum TonePreference {
  CalmGentle = 'Calm & Gentle',
  DirectPractical = 'Direct & Practical',
  Motivational = 'Motivational'
}

export enum WellnessCondition {
  DepressionLow = 'Depression-like low mood',
  UnhappySad = 'Unhappy / sadness',
  AngerFrustrated = 'Anger / frustration',
  StressPressure = 'Stress / pressure',
  AnxietyRestless = 'Anxiety-like restlessness',
  None = 'Balanced / Stable'
}

export interface WellnessResponse {
  condition: WellnessCondition;
  confidence: 'High' | 'Medium' | 'Low';
  explanation: string;
  
  // Primary Action Section
  immediateActionsTitle?: string;
  immediateActions: string[];
  
  // Secondary Comfort/Maintenance Section
  smallComfortsTitle?: string;
  smallComforts?: string[];
  
  stepByStep?: string[];
  
  youtubeResource?: {
    title: string;
    url: string;
    reason: string;
  };
  safetyMessage?: string;
  aiCommentary: string;
  gentleReminder?: string;
  
  // AI Generated Visualization
  visualizationImage?: string;
  visualizationPrompt?: string;
  visualizationTitle?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  data?: WellnessResponse;
  timestamp: Date;
  isRoleSelection?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  timestamp: Date;
  preview: string;
  messages: ChatMessage[];
}

export type AppView = 'login' | 'landing' | 'main';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserState {
  view: AppView;
  tone: TonePreference;
  isStepByStepMode: boolean;
  currentUser: User | null;
}
