import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import useAuthStore from '../../store/useAuthStore';
import {
  fetchChatRooms,
  fetchRoomMessages,
  sendChatMessage,
  uploadChatMedia,
  createChatRoom
} from '../../services/chat.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const ChatDashboardPage = () => {
  const { user } = useAuthStore();
  const { socket, onlineUsers } = useSocket();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const loadRooms = async () => {
    try {
      const res = await fetchChatRooms();
      setRooms(res.data);
      if (res.data.length > 0 && !activeRoom) {
        setActiveRoom(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Handle active room messages & socket subscriptions
  useEffect(() => {
    if (!activeRoom) return;

    fetchRoomMessages(activeRoom._id)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));

    if (socket) {
      socket.emit('join_room', activeRoom._id);
      socket.emit('mark_seen', { room_id: activeRoom._id });

      const handleNewMessage = (msg) => {
        if (msg.room_id === activeRoom._id) {
          setMessages((prev) => [...prev, msg]);
          socket.emit('mark_seen', { room_id: activeRoom._id });
        }
      };

      const handleTypingStart = ({ room_id, user_name }) => {
        if (room_id === activeRoom._id) {
          setTypingUsers((prev) => new Set(prev).add(user_name));
        }
      };

      const handleTypingStop = ({ room_id, user_name }) => {
        if (room_id === activeRoom._id) {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(user_name);
            return next;
          });
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('typing_start', handleTypingStart);
      socket.on('typing_stop', handleTypingStop);

      return () => {
        socket.emit('leave_room', activeRoom._id);
        socket.off('new_message', handleNewMessage);
        socket.off('typing_start', handleTypingStart);
        socket.off('typing_stop', handleTypingStop);
      };
    }
  }, [activeRoom, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket || !activeRoom) return;

    socket.emit('typing_start', {
      room_id: activeRoom._id,
      user_name: `${user.first_name}`
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        room_id: activeRoom._id,
        user_name: `${user.first_name}`
      });
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom) return;

    const content = inputText;
    setInputText('');

    if (socket) {
      socket.emit('send_message', {
        room_id: activeRoom._id,
        content,
        message_type: 'TEXT'
      });
    } else {
      const res = await sendChatMessage(activeRoom._id, { content, message_type: 'TEXT' });
      setMessages((prev) => [...prev, res.data]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeRoom) return;

    setUploading(true);
    try {
      const mediaRes = await uploadChatMedia(file);
      const payload = {
        room_id: activeRoom._id,
        content: file.name,
        message_type: mediaRes.data.message_type,
        file_url: mediaRes.data.file_url,
        file_name: mediaRes.data.file_name,
        file_size: mediaRes.data.file_size
      };

      if (socket) {
        socket.emit('send_message', payload);
      } else {
        const res = await sendChatMessage(activeRoom._id, payload);
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Attachment upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
            💬
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg">Organization Real-Time Chat</h1>
            <p className="text-xs text-slate-400">Private, Group & Committee Channels via Socket.io</p>
          </div>
        </div>
        <Link to="/dashboard">
          <Button variant="secondary" size="sm">Dashboard</Button>
        </Link>
      </header>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Rooms Sidebar */}
        <Card className="w-full md:w-80 flex flex-col p-4 shrink-0">
          <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-4">
            Channels & Direct Messages
          </h2>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {rooms.map((room) => {
              const isActive = activeRoom?._id === room._id;
              const isPrivate = room.type === 'PRIVATE';
              const otherParticipant = isPrivate
                ? room.participants.find((p) => p._id !== user?._id)
                : null;
              const isOnline = isPrivate && otherParticipant && onlineUsers.includes(otherParticipant._id);

              return (
                <button
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-indigo-950/60 border-indigo-500/50 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold text-sm truncate">
                      {isPrivate && otherParticipant
                        ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                        : room.name}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {room.type}
                    </span>
                  </div>

                  {isPrivate && (
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-emerald-500/50 shadow-md' : 'bg-slate-600'}`}></span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Active Room Chat Window */}
        <Card className="flex-1 flex flex-col p-0 overflow-hidden border-slate-800">
          {activeRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{activeRoom.name}</h3>
                  <span className="text-xs text-indigo-400 font-mono">{activeRoom.type} Channel</span>
                </div>
                {typingUsers.size > 0 && (
                  <span className="text-xs text-amber-400 animate-pulse italic">
                    {Array.from(typingUsers).join(', ')} is typing...
                  </span>
                )}
              </div>

              {/* Message History List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
                {messages.map((msg) => {
                  const isMe = msg.sender_id?._id === user?._id || msg.sender_id === user?._id;
                  const senderName = msg.sender_id?.first_name ? `${msg.sender_id.first_name} ${msg.sender_id.last_name}` : 'Member';

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-500 mb-1 px-1">{senderName}</span>
                      <div
                        className={`max-w-md p-3 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                        }`}
                      >
                        {/* Media Attachment Rendering */}
                        {msg.message_type === 'IMAGE' && msg.file_url && (
                          <img src={msg.file_url} alt="Attachment" className="rounded-lg mb-2 max-h-60 object-cover" />
                        )}

                        {msg.message_type === 'VOICE' && msg.file_url && (
                          <audio controls src={msg.file_url} className="mb-2 w-full h-8" />
                        )}

                        {msg.message_type === 'FILE' && msg.file_url && (
                          <a href={msg.file_url} download={msg.file_name} className="flex items-center gap-2 underline text-indigo-300 mb-1 text-xs">
                            📁 {msg.file_name || 'Download File'}
                          </a>
                        )}

                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                        <div className="flex justify-end items-center gap-1 mt-1 text-[10px] opacity-75">
                          <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <span>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Controls */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-3">
                <label className="text-slate-400 hover:text-white cursor-pointer text-xl p-2 rounded-lg hover:bg-slate-800 transition-colors">
                  📎
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>

                <input
                  type="text"
                  placeholder={uploading ? 'Uploading attachment...' : 'Type message...'}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={inputText}
                  onChange={handleInputChange}
                  disabled={uploading}
                />

                <Button type="submit" isLoading={uploading}>
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-slate-500 text-sm">
              Select a channel or direct message to start chatting.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
