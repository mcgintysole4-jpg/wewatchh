import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { User, Video, ChatMessage, Tab, SearchResult, RoomState } from './types';
import { MOCK_USER, INITIAL_QUEUE, MOCK_MESSAGES } from './constants';
import { searchYoutubeVideos } from './services/geminiService';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { SearchResultCard } from './components/SearchResultCard';
import { QueueItem } from './components/QueueItem';
import { Chat } from './components/Chat';
import { Search, Users, MessageSquare, ListMusic, LogOut, Play, SkipForward, Copy, Check, Menu, X } from 'lucide-react';

// Room Context Mock
// Since we don't have a backend, we manage state at the App level for the "Room"
// In a real app, this would be synchronized via WebSockets

const Room: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle

  // Room State
  const [currentUser] = useState<User>(MOCK_USER);
  const [queue, setQueue] = useState<Video[]>(INITIAL_QUEUE);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(INITIAL_QUEUE[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Use a ref for the iframe to potentially use the Player API later
  // For now, we rely on standard embed params

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchYoutubeVideos(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAddVideo = (result: SearchResult) => {
    const newVideo: Video = {
      id: Date.now().toString(),
      youtubeId: result.youtubeId,
      title: result.title,
      channelTitle: result.channelTitle,
      thumbnail: result.thumbnail,
      addedBy: currentUser,
      votes: 1,
      voters: [currentUser.id]
    };

    setQueue(prev => {
      // If queue is empty and no video is playing, play immediately (optional logic)
      if (prev.length === 0 && !currentVideo) {
          setCurrentVideo(newVideo);
          return prev;
      }
      const newQueue = [...prev, newVideo];
      return newQueue.sort((a, b) => b.votes - a.votes);
    });

    if (!currentVideo && queue.length === 0) {
        setCurrentVideo(newVideo);
    }
    
    // Add system message
    const sysMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      text: `${currentUser.name} added "${result.title}"`,
      timestamp: Date.now(),
      isSystem: true
    };
    setMessages(prev => [...prev, sysMsg]);
    
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchModal(false);
  };

  const handleVote = (videoId: string) => {
    setQueue(prev => {
      const newQueue = prev.map(v => {
        if (v.id === videoId) {
          const hasVoted = v.voters.includes(currentUser.id);
          if (hasVoted) {
            // Remove vote
            return {
              ...v,
              votes: v.votes - 1,
              voters: v.voters.filter(id => id !== currentUser.id)
            };
          } else {
            // Add vote
            return {
              ...v,
              votes: v.votes + 1,
              voters: [...v.voters, currentUser.id]
            };
          }
        }
        return v;
      });
      // Re-sort
      return newQueue.sort((a, b) => b.votes - a.votes);
    });
  };

  const handleRemoveVideo = (videoId: string) => {
    setQueue(prev => prev.filter(v => v.id !== videoId));
  };

  const handleVideoEnd = () => {
    // If current video is in queue, remove it.
    const nextQueue = queue.filter(v => v.id !== currentVideo?.id);
    
    if (nextQueue.length > 0) {
      const next = nextQueue[0];
      setCurrentVideo(next);
      setQueue(nextQueue);
      
      const sysMsg: ChatMessage = {
        id: Date.now().toString(),
        userId: 'system',
        userName: 'System',
        text: `Now playing: ${next.title}`,
        timestamp: Date.now(),
        isSystem: true
      };
      setMessages(prev => [...prev, sysMsg]);
    } else {
      // End of queue
    }
  };
  
  const handleSkip = () => {
      handleVideoEnd();
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Simplified iframe src to avoid playback restrictions
  const getIframeSrc = (videoId: string) => {
    const params = new URLSearchParams({
      autoplay: '1',
      controls: '1',
      rel: '0', 
      modestbranding: '1',
      playsinline: '1',
      iv_load_policy: '3', // Do not show video annotations
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Play fill="white" size={16} />
          </div>
          <h1 className="font-bold text-lg hidden md:block tracking-tight">We Watch <span className="opacity-50 font-normal text-sm ml-2">#{roomId || 'DEMO'}</span></h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors text-sm border border-gray-700"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Add Video</span>
          </button>
          
          <div className="h-6 w-px bg-gray-800 mx-2 hidden sm:block"></div>

          <Button variant="ghost" size="sm" onClick={copyRoomLink} className="hidden sm:flex gap-2">
            {copySuccess ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
            {copySuccess ? 'Copied' : 'Invite'}
          </Button>

          <Button variant="secondary" size="sm" onClick={() => navigate('/')} className="hidden sm:flex">
            <LogOut size={16} className="mr-2"/>
            Leave
          </Button>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 relative">
        
        {/* Left: Video Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-black relative group">
          {currentVideo ? (
             <div className="flex-1 flex items-center justify-center bg-black w-full h-full relative">
                <iframe
                  className="w-full h-full absolute inset-0"
                  src={getIframeSrc(currentVideo.youtubeId)}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
                
                {/* Overlay Controls */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Button 
                      variant="secondary" 
                      onClick={handleSkip} 
                      className="bg-black/70 backdrop-blur-md border border-white/10 pointer-events-auto"
                    >
                        <SkipForward size={16} className="mr-2"/>
                        Skip
                    </Button>
                </div>
             </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
               <ListMusic size={64} className="mb-4 opacity-50"/>
               <p>Queue is empty. Add a video to start watching!</p>
               <Button variant="primary" className="mt-4" onClick={() => setShowSearchModal(true)}>
                 Search Videos
               </Button>
            </div>
          )}
          
          {/* Mobile Info Bar (Visible under video on mobile) */}
          <div className="p-4 bg-gray-900 border-t border-gray-800 lg:hidden flex-shrink-0">
              <h3 className="font-semibold text-white truncate">{currentVideo?.title || "No video playing"}</h3>
              <p className="text-xs text-gray-400">{currentVideo?.channelTitle}</p>
          </div>
        </main>

        {/* Right: Sidebar (Chat/Queue) */}
        <aside className={`
            absolute inset-y-0 right-0 w-full sm:w-80 lg:w-96 bg-gray-900 border-l border-gray-800 flex flex-col z-30 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab(Tab.CHAT)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === Tab.CHAT ? 'text-brand-400 border-b-2 border-brand-500' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <MessageSquare size={18} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab(Tab.QUEUE)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === Tab.QUEUE ? 'text-brand-400 border-b-2 border-brand-500' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <ListMusic size={18} />
              Queue <span className="bg-gray-800 text-xs py-0.5 px-1.5 rounded-full ml-1">{queue.length}</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.USERS)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === Tab.USERS ? 'text-brand-400 border-b-2 border-brand-500' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <Users size={18} />
              Users
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 p-4 overflow-hidden relative">
            {activeTab === Tab.CHAT && (
              <Chat 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                currentUser={currentUser}
              />
            )}

            {activeTab === Tab.QUEUE && (
              <div className="h-full flex flex-col gap-3 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Up Next</h3>
                   <button 
                     onClick={() => setShowSearchModal(true)}
                     className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                   >
                     + Add Video
                   </button>
                </div>
                {queue.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm">
                    Queue is empty
                  </div>
                ) : (
                  queue.map((video, idx) => (
                    <QueueItem
                      key={video.id}
                      video={video}
                      rank={idx + 1}
                      currentUser={currentUser}
                      onVote={handleVote}
                      onRemove={handleRemoveVideo}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === Tab.USERS && (
              <div className="space-y-4 overflow-y-auto h-full">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                  <img src={currentUser.avatar} alt="You" className="w-8 h-8 rounded-full bg-gray-700"/>
                  <div>
                    <p className="text-sm font-medium text-white">{currentUser.name} (You)</p>
                    <p className="text-xs text-brand-400">Host</p>
                  </div>
                </div>
                {/* Mock Users */}
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" alt="Alice" className="w-8 h-8 rounded-full bg-gray-700"/>
                   <div>
                     <p className="text-sm font-medium text-gray-300">Bot Alice</p>
                     <p className="text-xs text-gray-500">Ready to watch</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
              <Search className="text-gray-400" size={20}/>
              <form onSubmit={handleSearch} className="flex-1">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for videos..."
                  className="w-full bg-transparent border-none text-white focus:ring-0 text-lg placeholder-gray-500"
                />
              </form>
              <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {isSearching ? (
                <div className="flex justify-center items-center py-20 text-gray-500">
                  <div className="animate-spin mr-3 h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full"></div>
                  Searching Gemini...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid gap-2">
                  {searchResults.map((result) => (
                    <SearchResultCard 
                      key={result.youtubeId} 
                      video={result} 
                      onAdd={handleAddVideo}
                    />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-20 text-gray-500">
                   Press Enter to search
                </div>
              ) : (
                <div className="text-center py-20 text-gray-600">
                  <Search size={48} className="mx-auto mb-4 opacity-20"/>
                  <p>Type to search for YouTube videos.</p>
                  <p className="text-sm mt-2">Powered by Gemini AI</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    // Generate random room ID
    const id = Math.random().toString(36).substring(7);
    navigate(`/room/${id}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode) {
      navigate(`/room/${roomCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <nav className="flex justify-between items-center p-6 lg:px-12 relative z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-600/20">
              <Play fill="white" size={14} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">We Watch</span>
        </div>
        <Button variant="ghost" onClick={() => window.open('https://github.com', '_blank')}>GitHub</Button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="max-w-3xl text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Sync videos with friends in real-time
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              Watch YouTube <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500">Together.</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Create a room, invite your friends, and enjoy a synchronized viewing experience with real-time chat and voting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto pt-4">
            <Button size="lg" onClick={handleCreateRoom} className="w-full sm:w-auto shadow-lg shadow-brand-600/25">
              Create Room
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-gray-600 text-sm">or</span>
              <form onSubmit={handleJoin} className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none w-full"
                />
                <Button type="submit" variant="secondary" disabled={!roomCode}>Join</Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-600 text-sm relative z-10">
        <p>&copy; {new Date().getFullYear()} We Watch. Built with React & Gemini.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
};

export default App;
