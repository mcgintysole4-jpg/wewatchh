import React from 'react';
import { Video, User } from '../types';
import { ThumbsUp, Trash2 } from 'lucide-react';

interface QueueItemProps {
  video: Video;
  currentUser: User;
  onVote: (videoId: string) => void;
  onRemove: (videoId: string) => void;
  rank: number;
}

export const QueueItem: React.FC<QueueItemProps> = ({ video, currentUser, onVote, onRemove, rank }) => {
  const hasVoted = video.voters.includes(currentUser.id);
  const canRemove = currentUser.isHost || video.addedBy.id === currentUser.id;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors border border-gray-700/50">
      <div className="flex-shrink-0 w-6 text-center font-bold text-gray-500 text-sm">
        {rank}
      </div>
      <div className="relative flex-shrink-0 w-24 h-14 bg-gray-900 rounded overflow-hidden">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate" title={video.title}>
          {video.title}
        </h4>
        <p className="text-xs text-gray-400 truncate">
          Added by {video.addedBy.name}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onVote(video.id)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            hasVoted 
              ? 'bg-brand-500/20 text-brand-400' 
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          <ThumbsUp size={12} />
          {video.votes}
        </button>
        {canRemove && (
          <button
            onClick={() => onRemove(video.id)}
            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
