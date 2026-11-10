
import { useState } from "react"
import home from '../assets/picture/live-twin-home.png'
import image from '../assets/picture/live-twin-image.jpg'
import ChatList from "../component/Chatlist"
import Chat from "./MessagePage"
import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom"

const bgImages = [home, image]

export default function MessagesPage({}) {
  const {user} = useAuth()
  const pick = () => bgImages[Math.floor(Math.random() * bgImages.length)]
  const [bgimage] = useState(() => pick())
  const [selectedChat, setSelectedChat] = useState(null) // null until chosen

  if (!user) return <Navigate to="/login"  />

  return (
    <div className="flex h-screen w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${bgimage})` }}>
      {/* ChatList: Hidden on mobile if a chat is selected, full width on mobile, 80px fixed on desktop */}
      {user && (<div className={`${selectedChat ? 'hidden md:block' : 'w-full'} md:w-80 shrink-0 h-full`}>
        <ChatList onSelectChat={setSelectedChat} />
      </div>)}

      {/* Chat Window: Full width on mobile if selected, hidden on mobile if none selected */}
      <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} flex-1 min-w-0 h-full flex-col`}>
        {/* Optional: Add a back button inside your Chat component for mobile users */}
        <Chat chat={selectedChat} onBack={() => setSelectedChat(null)} />
      </div>
    </div>
  )
}