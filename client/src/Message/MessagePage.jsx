import { useState, useRef, useEffect } from 'react'
import home from '../assets/picture/live-twin-home.png'
import image from '../assets/picture/live-twin-image.jpg'
import API_BASE_URL from '../config'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/picture/image1.png';

const bgImages = [home, image]
export default function Chat({chat}) {
  const {user} = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
const pick = () => bgImages[Math.floor(Math.random() * bgImages.length)]
const [bgimage, setbgimage] = useState(() => pick())

const other = chat?.participants?.find(p => p.user.id !== user?.id)?.user

useEffect(() => {
  if (!chat?.id){ 
    setMessages([])
   return;}
  setLoading(true)
  let ignore = false;
  setMessages([]); // clear the old chat's messages right away


  
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${chat.id}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      console.log(data)
      if (!ignore) setMessages(data);
    } catch (err) {
      if (!ignore) console.error('Error fetching messages:', err);
    } finally{
      if(!ignore)setLoading(false)
    }
  };

  fetchMessages();
  return () => {
    ignore = true; // runs when chat.id changes or the component unmounts
  };
}, [chat?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

const send = async () => {
    if (!text.trim()) return;

    const messageText = text;
    setText(''); // Clear the input right away for smooth typing

    // 1. Instantly show it on screen (Optimistic UI update)

    try {
      // 2. Send it to your Express backend
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        credentials: 'include', // Crucial for sending your session cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chat.id, // The target user's ID
          content: messageText, // The message content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save message to database');
      }

      const savedMessage = await response.json();
      setMessages(m => [...m, savedMessage])
      console.log('Message saved successfully:', savedMessage);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };



  
    if (!chat) {
    return (
      <div className="flex items-center justify-center bg-blue-50 h-full text-slate-500">
        Select a conversation to start chatting
      </div>
    )
  }


  return (
    
      <div
  className="flex flex-col h-screen min-w-0 flex-1 bg-[#efeae2]"
  style={{ backgroundImage: `url(${bgimage})` }}
>
      
       {other && (
  <header className="h-16 shrink-0 bg-[#f0f2f5] px-4 flex items-center">
    <img src={other.avatarUrl || logo} alt={other.username} className="h-8 w-8 rounded-full object-cover border border-slate-600 shrink-0" />
    <span>{other.username}</span>
  </header>
)}
      

<button onClick={()=>console.log(chat)}>test</button>
      <main className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
        { loading? (<p>Loading...</p>):
         messages.length === 0 ? 
         ( <div className={`flex justify-center}`}>
              <span className={`max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm wrap-break-word bg-red-400 `}>
                <p>No messages yet</p>
              </span>
            </div>  ):
         (messages.map(m => {
  const mine = m.senderId === user?.id
  return (
    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <span className={`max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm wrap-break-words ${mine ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
        {m.content}
      </span>
    </div>
  )
}))
          
        }
        <div ref={bottomRef} />
      </main>
      <div className='bg-white'>
        </div>
      <div className="h-16 shrink-0  px-16 flex items-center">
        <button onClick={()=>{console.log(messages)}} >test</button>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message"
          className="w-full rounded-lg bg-white px-4 py-2 outline-none"
        />
      </div>
    </div>
  )
}