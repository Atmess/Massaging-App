import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config'
import message from '../assets/picture/2.jpg'


export default function ChatList() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainstate, setmainstate] = useState('')

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
      setmainstate('list')
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="flex flex-col h-screen bg-white border-r border-stone-200">
      {mainstate==='list'&& (<div>
      <div className="p-4 border-b border-stone-200 bg-white">
        <div className='flex flex-row items-center justify-between mb-3'>
              <h1 className="text-xl font-bold text-slate-800 m-0">Messages</h1>
              <button 
                  onClick={() => { console.log('TEST CLICKED, mainstate:', chats); setmainstate('create') }} 
                  className="px-1.5 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 transition"
              >
                  <img src={message} alt="New Message" height={25} width={30}  />
              </button>
          </div>
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
        {!loading && !error && chats.length === 0 &&  (
         <div> <p className="p-4 text-slate-400">No chats yet.</p>
           </div>
        )}

        {chats.map((chat) => (
          <div key={chat.id} className="p-3 border-b border-stone-100">
            {chat.name || 'Chat'} {chat.id}
           
          </div>
        ))}
      </div>
      </div>)}
      {mainstate==='create' && (<div className="p-4 border-b border-stone-200 bg-white  " >
         <div className='flex flex-row items-center justify-between mb-3'>
        
        <button className='hover:bg-stone-100' onClick={()=>setmainstate('list')} >
          {/* Left Arrow / Back Button SVG */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-6 h-6 text-slate-700 hover:text-blue-600 transition"
              >
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg> 
        </button>
        <p>New Message</p>
        </div>
      </div>)}
    </div>
  );
}
