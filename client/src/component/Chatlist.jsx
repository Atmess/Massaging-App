import { useState } from 'react';

export default function ChatList() {
  const [search, setSearch] = useState('');

  // Sample conversation data
  const conversations = [
    { id: 1, name: 'Alice Smith', lastMessage: 'Hey! Are we still on for today?', time: '10:42 AM', unread: 2 },
    { id: 2, name: 'Bob Johnson', lastMessage: 'Check out this new blog post!', time: 'Yesterday', unread: 0 },
    { id: 3, name: 'Yu-Gi-Oh! Group', lastMessage: 'Who wants to duel tonight?', time: 'Oct 25', unread: 5 },
  ];

  return (
    <div className="flex flex-col h-screen bg-white border-r border-stone-200">
      {/* Search Header */}
      <div className="p-4 border-b border-stone-200 bg-white">
        <h1 className="text-xl font-bold text-slate-800 mb-3">Messages</h1>
        <input
          type="text"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center gap-3 p-3.5 border-b border-stone-100 hover:bg-stone-50 cursor-pointer transition select-none"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {chat.name[0]}
            </div>

            {/* Chat Details */}
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h2 className="text-sm font-semibold text-slate-800 truncate">{chat.name}</h2>
                <span className="text-xs text-stone-400 shrink-0">{chat.time}</span>
              </div>
              <p className="text-xs text-stone-500 truncate">{chat.lastMessage}</p>
            </div>

            {/* Unread Badge */}
            {chat.unread > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                {chat.unread}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}