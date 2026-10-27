import { useState, useEffect } from 'react';
import MessageCreateForm from './Messagecreateform';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config.js'

export default function MessagesPage() {
  const user = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Add these states inside MessagesPage component:
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newMsgForm, setNewMsgForm] = useState({ recipient: '', content: '' });
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState('');
  const token = localStorage.getItem('token');


  // 1. Fetch conversations/contacts list on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Fetch messages whenever an active contact is selected
  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id);
    }
  }, [activeContact]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/messages/convertion`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to load conversations');
      const data = await response.json();
      const others = data.filter((c) => c.id !== user.id);
      setConversations(others);
      if (others.length > 0) setActiveContact(others[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/messages/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: activeContact.id,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send message');
      }
      const sentMessage = await response.json();

      // Append locally for instant UI update
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateMessage = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: newMsgForm.recipient,
          content: newMsgForm.content,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send message');
      }

      const sent = await response.json();
      const user = sent.receiver; // the backend now returns who it matched

      if (!conversations.some((c) => c.id === user.id)) {
        setConversations([user, ...conversations]);
      }
      setActiveContact(user);

      setNewMsgForm({ recipient: '', content: '' });
      setIsNewModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.username?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.lastMessage?.content?.toLowerCase().includes(q)
    );
  });
  return (
    <div>
      <div className="text-slate-100 p-4 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Direct Messages</h1>
          <p className="text-sm text-slate-400 mt-1">
            Chat securely with other users here.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Loading inbox...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/30 border border-red-500 rounded-xl text-red-300 text-center">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl h-[600px]">
            {/* LEFT SIDEBAR: Conversations List */}
            {/* LEFT SIDEBAR: Conversations List */}
            <div className="border-r border-slate-700/60 overflow-y-auto flex flex-col bg-slate-900/30">
              <div className="p-4 border-b border-slate-700/60 font-semibold text-sm text-slate-300">
                Conversations
              </div>

              {/* 👈 Centered Create New Button / Div */}
              <div className="p-3 border-b border-slate-700/60 space-y-2">
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  + Create New Message
                </button>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email or message..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  {search ? 'No results.' : 'No messages yet.'}
                </div>
              ) : (
                filteredConversations.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full text-left p-4 flex items-center gap-3 transition border-b border-slate-700/30 cursor-pointer ${
                      activeContact?.id === contact.id
                        ? 'bg-slate-700/40 border-l-4 border-l-blue-500'
                        : 'hover:bg-slate-700/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0 font-bold text-slate-200">
                      {contact.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="font-medium text-white truncate">
                        {contact.username}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {contact.lastMessage?.content || contact.email}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            {/* RIGHT SIDE: Active Chat Thread */}
            <div className="col-span-2 flex flex-col h-full min-h-0 bg-slate-800/40">
              {activeContact ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-700/60 flex items-center gap-3 bg-slate-900/20">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {activeContact.username[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-white">
                      @{activeContact.username}
                    </span>
                  </div>

                  {/* Messages Body */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 text-sm">
                        No messages with @{activeContact.username}. Start the
                        conversation below!
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId !== activeContact.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                                isMe
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <span
                                className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input Form */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-slate-700/60 bg-slate-900/30 flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder={`Message @${activeContact.username}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  Select a conversation from the sidebar to start chatting.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isNewModalOpen && (
        <MessageCreateForm
          formData={newMsgForm}
          setFormData={setNewMsgForm}
          handleSubmit={handleCreateMessage}
          closeModal={() => setIsNewModalOpen(false)}
          isSubmitting={isSending}
        />
      )}
    </div>
  );
}
