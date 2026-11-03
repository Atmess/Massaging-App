import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config'
import message from '../assets/picture/2.jpg'


export default function ChatList({onSelectChat}) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainstate, setmainstate] = useState('')


  //form set 
  const [recipientId, setRecipientId] = useState('');
  const [recipientUsername,setRecipientUser] =useState('') 
  const [messageText, setMessageText] = useState('');




  useEffect(() => {
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
  const getChatDisplayName = (chat, currentUserId) => {
  // Group chat: use stored groupName
  if (chat.isGroup && chat.groupName) {
    return chat.groupName;
  }

  // Private chat: find the participant who isn't you
  const otherParticipant = chat.participants.find(
    (p) => p.userId !== currentUserId
  );

  return otherParticipant?.user?.username || "Unknown";
};


  const handleCreateNewMessage = async (e) => {
    e.preventDefault(); // Prevents the browser page from refreshing
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/new`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization headers if your backend uses tokens/cookies (e.g., Passport.js)
        },
        body: JSON.stringify({
          recipientId: recipientId,     // The ID or number you are sending to
          recipientUser: recipientUsername, // The ID or username you are sending to
          content: messageText,     // The body of the message
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      console.log('Message created successfully:', data);
      onSelectChat(data)
      
      // Reset form or redirect back to chat list
    } catch (err) {
      console.error('Error:', err);
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
                  onClick={() => setmainstate('newMessage') } 
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
          <div onClick={()=>onSelectChat(chat.id)} key={chat.id} className="p-3 border-b border-stone-100">
            <h3>{getChatDisplayName(chat, user.id)}</h3>
            <p>{chat.messages[0]?.content}</p>
            
           
          </div>
        ))}
      </div>
      <button onClick={()=>console.log(chats)} >test</button>
      </div>)}
      {mainstate==='newMessage' && (
        <div className=" bg-white  " >
          <div className='border-b border-stone-200 p-4 ' >
         <div className='flex flex-row items-center justify-between mb-3'>
          <div className='flex flex-row gap-2'>
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
        </div>
                <input
          type="text"
          placeholder="Search person "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        </div>
        <div>
            <div onClick={()=>setmainstate('sendtowho')} className='px-5 py-5 border-b border-stone-100 hover:bg-stone-200 flex flex-row items-center gap-3 cursor-pointer transition'>
              {/* New Contact Icon */}
              <button 
                className="p-2 rounded-xl hover:bg-stone-100 text-slate-700 hover:text-blue-600 transition"
                title="New Contact"
              >
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
                  className="w-5 h-5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="16" x2="22" y1="11" y2="11" />
                </svg>
              </button>
              
              <span className="font-semibold text-slate-800 text-sm">New Contact</span>
            </div>
        </div>
      </div>
    )}
      {mainstate ==='sendtowho' &&( 
         <div className=" bg-white  " >
          <div className='border-b border-stone-200 p-4 ' >
         <div className='flex flex-row items-center justify-between mb-3'>
          <div className='flex flex-row gap-2'>
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
        <p>Send Message</p>
        </div>
        </div>
                <input
          type="text"
          placeholder="Search person "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        </div>
        <div>
          <form onSubmit={handleCreateNewMessage} className="p-4 space-y-4 bg-white">
      <h2 className="text-lg font-bold">New Message</h2>

      {/* Recipient ID / Number Input */}
      <div>
        <label className="block text-sm text-stone-600 mb-1">Recipient ID or Number</label>
        <input 
          type="number" 
          inputMode="numeric"
          value={recipientId} 
          onChange={(e) => setRecipientId(e.target.value.replace(/\D/g, ''))} 
          placeholder="e.g. 2" 
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>


              {/* Recipient ID / username Input */}
      <div>
        <label className="block text-sm text-stone-600 mb-1">Recipient ID or username</label>
        <input 
          type="text" 
          value={recipientUsername} 
          onChange={(e) => setRecipientUser(e.target.value)} 
          placeholder="e.g. 2" 
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    {/* Message Content Input */}
     {/*  
      <div>
        <label className="block text-sm text-stone-600 mb-1">Message</label>
        <textarea 
          value={messageText} 
          onChange={(e) => setMessageText(e.target.value)} 
          placeholder="Type your message..." 
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
*/}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition disabled:opacity-50"
      >
        {loading ? 'Finding...' : 'Find Receiver'}
      </button>
    </form>
        </div>
      </div>
      )}
    </div>
  );
}
