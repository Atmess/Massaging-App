import { useState, useRef, useEffect } from 'react'
import home from '../assets/picture/live-twin-home.png'
import image from '../assets/picture/live-twin-image.jpg'

const bgImages = [home, image]
export default function Chat({chat}) {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey!', mine: false },
    { id: 2, text: 'Hi, what’s up?', mine: true },
  ])
 
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
const pick = () => bgImages[Math.floor(Math.random() * bgImages.length)]
const [bgimage, setbgimage] = useState(() => pick())




  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!text.trim()) return
    setMessages(m => [...m, { id: Date.now(), text, mine: true }])
    setText('')
  }

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
        Contact name
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