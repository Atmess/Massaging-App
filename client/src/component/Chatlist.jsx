import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config'


export default function ChatList() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('ChatList mounted, user:', user);
    if (!user) return;
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchChats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to load conversations: ${response.status} ${response.statusText}`);
      const data = await response.json();
      const others = Array.isArray(data)
        ? data.filter((c) => !user || c.id !== user.id)
        : data;
      setChats(others);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white border-r border-stone-200">
      
      <div className="p-4 border-b border-stone-200 bg-white">
        <h1 className="text-xl font-bold text-slate-800 mb-3">Messages</h1>
        <button onClick={() => { console.log('TEST CLICKED, chats:', chats); alert('test clicked'); }} className="mb-2 px-3 py-1 bg-blue-600 text-white rounded">test</button>
        <input
          type="text"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="p-4 text-slate-400">Loading...</p>}
        {error && <p className="p-4 text-red-400">{error}</p>}
        {!loading && !error && chats.length === 0 && (
         <div> <p className="p-4 text-slate-400">No chats yet.</p>
           <button onClick={() => {console.log('TEST CLICKED, chats:', chats); alert('test clicked');}}>test</button>
           </div>
        )}
        {chats.map((chat) => (
          <div key={chat.id} className="p-3 border-b border-stone-100">
            {chat.name || 'Chat'} {chat.id}
           
          </div>
        ))}
      </div>
    </div>
  );
}
