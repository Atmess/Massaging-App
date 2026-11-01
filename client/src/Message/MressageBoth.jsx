import { useState } from "react"
import home from '../assets/picture/live-twin-home.png'
import image from '../assets/picture/live-twin-image.jpg'
import ChatList from "../component/Chatlist"
import Chat from "./MessagePage"

const bgImages = [home, image]

// MressageBoth.jsx
export default function MessagesPage({}) {

      const pick = () => bgImages[Math.floor(Math.random() * bgImages.length)]
  const [bgimage] = useState(() => pick())
  const [selectedChat, setSelectedChat] = useState(null) // null until chosen

  return (
    <div className="flex h-screen min-w-0 flex-1"  style={{ backgroundImage: `url(${bgimage})` }}>
      <div className="w-80 shrink-0 h-full">
        <ChatList onSelectChat={setSelectedChat} />
              </div>
      <div className="flex-1 min-w-0 h-full">
        <Chat chat={selectedChat} />
                </div>
    </div>
  )
}