import { useState, useRef, useEffect } from 'react'
import home from '../assets/picture/live-twin-home.png'
import image from '../assets/picture/live-twin-image.jpg'
import API_BASE_URL from '../config'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import logo from '../assets/picture/image1.png'

const bgImages = [home, image]

// Must match the server's limits (FilterFile in the router)
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip'

const isImageUrl = (url) => /\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(url || '')

// storage path looks like "<chatId>/<timestamp>-<name>", so strip the timestamp prefix
const fileNameFromUrl = (url) =>
  decodeURIComponent((url || '').split('/').pop().split('?')[0]).replace(/^\d+-/, '')

export default function Chat({ chat }) {
  const { user } = useAuth()
  const { socket, connected, joinChat, leaveChat, sendMessage } = useSocket()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')
  const [sending, setSending] = useState(false)

  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  const [bgimage] = useState(() => bgImages[Math.floor(Math.random() * bgImages.length)])

  const other = chat?.participants?.find((p) => p.user.id !== user?.id)?.user

  // ---------- socket: join the room and listen for new messages ----------
  useEffect(() => {
    if (!socket || !connected || !chat?.id) return

    joinChat(chat.id)

    const onNew = (msg) => {
      if (msg.chatId !== chat.id) return
      setMessages((m) => (m.some((x) => x.id === msg.id) ? m : [...m, msg]))
    }

    socket.on('newMessage', onNew)
    return () => {
      socket.off('newMessage', onNew)
      leaveChat(chat.id)
    }
  }, [socket, connected, chat?.id])

  // ---------- load history when the chat changes ----------
  useEffect(() => {
    if (!chat?.id) {
      setMessages([])
      return
    }
    setLoading(true)
    let ignore = false
    setMessages([])

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/${chat.id}`, {
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        if (!ignore) setMessages(data)
      } catch (err) {
        if (!ignore) console.error('Error fetching messages:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchMessages()
    return () => {
      ignore = true
    }
  }, [chat?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ---------- attachment handling ----------
  // free the preview URL whenever it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview)
    }
  }, [filePreview])

  // drop a half-picked file when switching chats
  useEffect(() => {
    setFile(null)
    setFilePreview('')
  }, [chat?.id])

  const clearFile = () => {
    setFile(null)
    setFilePreview('')
  }

  const handleFilePick = (e) => {
    const picked = e.target.files?.[0]
    e.target.value = '' // lets the user pick the same file again later
    if (!picked) return
    if (picked.size > MAX_FILE_SIZE) {
      alert('File is too large (max 10 MB)')
      return
    }
    setFile(picked)
    setFilePreview(picked.type.startsWith('image/') ? URL.createObjectURL(picked) : '')
  }

  // ---------- send ----------
  const send = async () => {
    const messageText = text.trim()
    if ((!messageText && !file) || sending) return
    if (!socket || !connected) {
      console.error('Socket not connected')
      return
    }

    setSending(true)

    // 1. upload the attachment first (if there is one)
    let mediaUrl
    if (file) {
      try {
        const form = new FormData()
        form.append('chatId', chat.id) // text fields must come BEFORE the file
        form.append('file', file)
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          credentials: 'include',
          body: form, // don't set Content-Type yourself
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.message || 'Upload failed')
        mediaUrl = body.url
      } catch (err) {
        console.error('Upload error:', err)
        alert(err.message)
        setSending(false)
        return // text and file stay, so the user can retry
      }
    }

    setText('')
    clearFile()

    // 2. show it right away (optimistic), then send through the socket
    const tempId = 'opt_' + Date.now()
    setMessages((m) => [
      ...m,
      {
        id: tempId,
        content: messageText,
        mediaUrl,
        senderId: user.id,
        sender: user,
        createdAt: new Date().toISOString(),
        chatId: chat.id,
      },
    ])

    try {
      const saved = await new Promise((resolve, reject) => {
        sendMessage(chat.id, messageText, mediaUrl, (res) => {
          if (!res || !res.ok) return reject(new Error(res?.error || 'Failed to send message'))
          resolve(res.message)
        })
      })
      setMessages((m) =>
        m.some((x) => x.id === saved.id)
          ? m.filter((x) => x.id !== tempId) // the socket listener already added it
          : m.map((x) => (x.id === tempId ? saved : x))
      )
    } catch (err) {
      console.error('Error sending message:', err)
      setMessages((m) => m.filter((x) => x.id !== tempId))
      setText(messageText)
    } finally {
      setSending(false)
    }
  }

  // ---------- render ----------
  if (!chat) {
    return (
      <div className="flex items-center justify-center bg-blue-50 h-full text-slate-500">
        Select a conversation to start chatting
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-full min-w-0 flex-1 bg-[#efeae2]"
      style={{ backgroundImage: `url(${bgimage})` }}
    >
      {other && (
        <header className="h-16 shrink-0 bg-[#f0f2f5] px-4 flex items-center">
          <img
            src={other.avatarUrl || logo}
            alt={other.username}
            className="h-8 w-8 rounded-full object-cover border border-slate-600 shrink-0"
          />
          <span className="ml-3">{other.username}</span>
        </header>
      )}

      <main className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
        {loading ? (
          <p>Loading...</p>
        ) : messages.length === 0 ? (
          <div className="flex justify-center">
            <span className="max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm bg-red-400">
              <p>No messages yet</p>
            </span>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <span
                  className={`max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm wrap:anywhere ${
                    mine ? 'bg-[#d9fdd3]' : 'bg-white'
                  }`}
                >
                  {m.mediaUrl &&
                    (m.mediaType?.startsWith('image/') || isImageUrl(m.mediaUrl) ? (
                      <a href={m.mediaUrl} target="_blank" rel="noreferrer">
                        <img
                          src={m.mediaUrl}
                          alt={m.mediaName || ''}
                          className="mb-1 max-h-64 max-w-full rounded"
                        />
                      </a>
                    ) : (
                      <a
                        href={m.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mb-1 block text-blue-600 underline"
                      >
                        📎 {m.mediaName || fileNameFromUrl(m.mediaUrl)}
                      </a>
                    ))}
                  {m.content}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </main>

      <div className="shrink-0 px-4 md:px-16 pb-3">
        {file && (
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-white px-3 py-2 shadow-sm">
            {filePreview ? (
              <img src={filePreview} alt="" className="h-12 w-12 rounded object-cover" />
            ) : (
              <span className="text-2xl">📎</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{file.name}</p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB{sending ? ' · uploading…' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              disabled={sending}
              aria-label="Remove attachment"
              className="px-2 text-slate-500 hover:text-red-500 disabled:opacity-40"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex h-12 items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFilePick}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            title="Attach file"
            aria-label="Attach file"
            className="shrink-0 rounded-lg bg-white px-3 py-2 hover:bg-slate-100 disabled:opacity-50"
          >
            📎
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={file ? 'Add a caption (optional)' : 'Type a message'}
            className="w-full rounded-lg bg-white px-4 py-2 outline-none"
          />
         <button
  type="button"
  onClick={() => send()}
  disabled={sending || (!text.trim() && !file)}
  className="shrink-0 rounded-lg bg-white px-3 py-2 hover:bg-slate-100 disabled:opacity-50"
>
  Send
</button> 
        </div>
      </div>
    </div>
  )
}
