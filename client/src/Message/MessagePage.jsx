import { useState, useRef, useEffect } from 'react'
import home from '../assets/picture/live-twin-home.png'
import image from '../assets/picture/live-twin-image.jpg'
import API_BASE_URL from '../config'
import { SOCKET_BASE_URL } from '../config'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import logo from '../assets/picture/image1.png';

const bgImages = [home, image]
export default function Chat({chat}) {
  const {user} = useAuth()
  const { socket, connected, joinChat, leaveChat, sendMessage } = useSocket()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
const pick = () => bgImages[Math.floor(Math.random() * bgImages.length)]
const [bgimage, setbgimage] = useState(() => pick())

const other = chat?.participants?.find(p => p.user.id !== user?.id)?.user

useEffect(() => {
  if (!socket || !connected || !chat?.id) return

  joinChat(chat.id)

  const onNew = (msg) => {
    if (msg.chatId !== chat.id) return
    setMessages(m => m.some(x => x.id === msg.id) ? m : [...m, msg])
  }

  socket.on('newMessage', onNew)   // must match the event name your server emits
  return () => {
    socket.off('newMessage', onNew)
    leaveChat(chat.id)
  }
}, [socket, connected, chat?.id])

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
    if (!socket || !connected) {   // was: if (!socket)
  console.error('Socket not connected')
  return
}

    const messageText = text;
    setText(''); // Clear the input right away for smooth typing

    // 1. Optimistic UI update (shown instantly)
    const tempId = 'opt_' + Date.now();
    const optimistic = {
      id: tempId,
      content: messageText,
      senderId: user.id,
      sender: user,
      createdAt: new Date().toISOString(),
      chatId: chat.id,
    };
    setMessages(m => [...m, optimistic]);

    try {
      // 2. Send via WebSocket: the server persists it and broadcasts to the room
      const savedMessage = await new Promise((resolve, reject) => {
        sendMessage(chat.id, messageText, undefined, (res) => {
          if (!res || !res.ok) {
            return reject(new Error(res?.error || 'Failed to send message'));
          }
          resolve(res.message);
         
        });
      });
      // Replace the optimistic message with the persisted message from the server
      setMessages(m =>
  m.some(x => x.id === savedMessage.id)
    ? m.filter(x => x.id !== tempId)                       // listener already added it
    : m.map(x => (x.id === tempId ? savedMessage : x))
)
      console.log('Message sent via WebSocket:', savedMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      // Roll back the optimistic message on failure
      setMessages(m => m.filter(msg => msg.id !== tempId));
      setText(messageText)
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
    <button onClick={()=>{console.log(user)} }>test</button>

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