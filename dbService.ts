
import { User, ChatMessage, ChatSession } from './types';

const USERS_KEY = 'wellness_ai_users';
const HISTORY_PREFIX = 'wellness_history_';
const SESSIONS_PREFIX = 'wellness_sessions_';
const DRAFT_PREFIX = 'wellness_draft_';

export interface DBUser extends User {
  password: string;
}

export const db = {
  getUsers: (): DBUser[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: DBUser): boolean => {
    const users = db.getUsers();
    if (users.find(u => u.email === user.email)) {
      return false; // User already exists
    }
    users.push(user);
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error("Failed to save user", e);
      return false;
    }
  },

  authenticate: (email: string, password: string): DBUser | null => {
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
  },

  // Active Session Management
  saveHistory: (userId: string, messages: ChatMessage[]) => {
    try {
      localStorage.setItem(`${HISTORY_PREFIX}${userId}`, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  },

  getHistory: (userId: string): ChatMessage[] => {
    const data = localStorage.getItem(`${HISTORY_PREFIX}${userId}`);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      // Rehydrate dates
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (e) {
      console.error("Failed to parse history", e);
      return [];
    }
  },

  clearHistory: (userId: string) => {
    localStorage.removeItem(`${HISTORY_PREFIX}${userId}`);
  },

  // Draft Management
  saveDraft: (userId: string, text: string) => {
    localStorage.setItem(`${DRAFT_PREFIX}${userId}`, text);
  },

  getDraft: (userId: string): string => {
    return localStorage.getItem(`${DRAFT_PREFIX}${userId}`) || '';
  },

  clearDraft: (userId: string) => {
    localStorage.removeItem(`${DRAFT_PREFIX}${userId}`);
  },

  // Archived Sessions Management
  getSessions: (userId: string): ChatSession[] => {
    const data = localStorage.getItem(`${SESSIONS_PREFIX}${userId}`);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return parsed.map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      })).sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (e) {
      console.error("Failed to parse sessions", e);
      return [];
    }
  },

  saveSession: (userId: string, session: ChatSession): boolean => {
    try {
      const sessions = db.getSessions(userId);
      sessions.unshift(session);
      localStorage.setItem(`${SESSIONS_PREFIX}${userId}`, JSON.stringify(sessions));
      return true;
    } catch (e) {
      console.error("Failed to save session", e);
      return false;
    }
  },

  deleteSession: (userId: string, sessionId: string) => {
    try {
      const sessions = db.getSessions(userId).filter(s => s.id !== sessionId);
      localStorage.setItem(`${SESSIONS_PREFIX}${userId}`, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  }
};
