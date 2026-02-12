import React from 'react';
import { SearchResult } from '../types';
import { Plus } from 'lucide-react';

interface SearchResultCardProps {
  video: SearchResult;
  onAdd: (video: SearchResult) => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ video, onAdd }) => {
  return (
    <div className="flex gap-3 p-3 hover:bg-gray-800 rounded-lg group transition-colors">
      <div className="relative flex-shrink-0 w-32 h-20 bg-gray-900 rounded overflow-hidden">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white line-clamp-2" title={video.title}>
          {video.title}
        </h4>
        <p className="text-xs text-gray-400 mt-1 truncate">{video.channelTitle}</p>
      </div>
      <button 
        onClick={() => onAdd(video)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-300 hover:bg-brand-600 hover:text-white transition-colors self-center flex-shrink-0"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
