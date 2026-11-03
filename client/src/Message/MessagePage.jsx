import { useState, useRef, useEffect } from 'react'
import home from '../assets/picture/live-twin-home.png'
import image from '../assets/picture/live-twin-image.jpg'
import API_BASE_URL from '../config'
import { ApiLevel } from '@testing-library/user-event/dist/cjs/utils/index.js'

const bgImages = [home, image]
export default function Chat({chat}) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
const pick = () => bgImages[Math.floor(Math.random() * bgImages.length)]
const [bgimage, setbgimage] = useState(() => pick())

useEffect(() => {
    if (!chat?.id) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/${chat.id}`, {
          method: 'GET',
          credentials: 'include', // Sends your session cookie
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to fetch messages');

        const data = await response.json();
        setMessages(data); // Populate messages from your database
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [chat?.id]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

const send = async () => {
    if (!text.trim()) return;

    const messageText = text;
    setText(''); // Clear the input right away for smooth typing

    // 1. Instantly show it on screen (Optimistic UI update)
    const tempId = Date.now();
    setMessages((m) => [...m, { id: tempId, text: messageText, mine: true }]);

    try {
      // 2. Send it to your Express backend
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        credentials: 'include', // Crucial for sending your session cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: chat.id, // The target user's ID
          content: messageText, // The message content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save message to database');
      }

      const savedMessage = await response.json();
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
      <header className="h-16 shrink-0 bg-[#f0f2f5] px-4 flex items-center">
       <img src={chat.avatarUrl} alt='' /> {chat.username}
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
            <span className={`max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm wrap-break-word ${m.mine ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
              {m.text}
            </span>
          </div>
        ))}
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