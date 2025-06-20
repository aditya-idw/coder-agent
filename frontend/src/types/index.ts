export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  gitRepoUrl?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface PRD {
  id: string;
  version: string;
  content: string;
  changelog?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export interface CodeGeneration {
  id: string;
  prompt: string;
  code: string;
  language: string;
  filePath?: string;
  createdAt: string;
  projectId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
