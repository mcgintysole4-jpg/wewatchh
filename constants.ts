import { User, Video } from './types';

export const MOCK_USER: User = {
  id: 'current-user',
  name: 'You',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  isHost: true,
};

export const INITIAL_QUEUE: Video[] = [
  {
    id: 'v1',
    youtubeId: 'LXb3EKWsInQ',
    title: 'COSTA RICA IN 4K 60fps HDR (Ultra HD)',
    channelTitle: 'Jacob + Katie Schwarz',
    thumbnail: 'https://img.youtube.com/vi/LXb3EKWsInQ/hqdefault.jpg',
    addedBy: { id: 'bot1', name: 'Bot Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', isHost: false },
    votes: 3,
    voters: ['bot1', 'bot2', 'bot3']
  },
  {
    id: 'v2',
    youtubeId: 'M7lc1UVf-VE',
    title: 'YouTube Developers Guide',
    channelTitle: 'Google Developers',
    thumbnail: 'https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg',
    addedBy: { id: 'bot2', name: 'Bot Bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', isHost: false },
    votes: 1,
    voters: ['bot2']
  }
];

export const MOCK_MESSAGES = [
  {
    id: 'm1',
    userId: 'system',
    userName: 'System',
    text: 'Welcome to the room! Invite friends to watch together.',
    timestamp: Date.now() - 100000,
    isSystem: true
  },
  {
    id: 'm2',
    userId: 'bot1',
    userName: 'Bot Alice',
    text: 'Hey everyone! Ready for some music?',
    timestamp: Date.now() - 50000,
  }
];
