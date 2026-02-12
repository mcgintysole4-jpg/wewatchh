export interface User {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
}

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration?: string;
  addedBy: User;
  votes: number;
  voters: string[]; // User IDs
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface RoomState {
  roomId: string;
  currentVideo: Video | null;
  queue: Video[];
  users: User[];
  messages: ChatMessage[];
  isPlaying: boolean;
  playedSeconds: number; // For sync simulation
}

export enum Tab {
  CHAT = 'CHAT',
  QUEUE = 'QUEUE',
  USERS = 'USERS'
}

// Gemini Search Result Type
export interface SearchResult {
  youtubeId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  description: string;
}
