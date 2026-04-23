import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { ArrowLeft } from 'lucide-react';
import client from '../../api/client';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PatientChat() {
  const { userId } = useParams();
  const me = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const onMessage = useCallback((msg) => {
    setMessages((m) => [...m, msg]);
  }, []);

  useEffect(() => {
    if (!userId || !token) return undefined;
    const socket = io(apiBase, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socket.on('chat:message', onMessage);
    return () => {
      socket.off('chat:message', onMessage);
      socket.disconnect();
    };
  }, [userId, token, onMessage]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const { data } = await client.get(`/messages/with/${userId}`);
        setMessages(data);
      } catch {
        setMessages([]);
      }
    })();
  }, [userId]);

  function send() {
    if (!text.trim() || !userId || !token) return;
    const socket = io(apiBase, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socket.emit('chat:send', { toUserId: userId, body: text.trim() }, () => {
      socket.disconnect();
    });
    setText('');
  }

  const myId = me?.id ? String(me.id) : '';

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-140px)]">
      <Link
        to="/patient"
        className="inline-flex items-center gap-1 text-sm text-sky-600 mb-3"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex-1 overflow-y-auto space-y-2 bg-white rounded-2xl border border-slate-100 p-4 mb-3">
        {messages.map((m) => {
          const mine = String(m.fromUserId) === myId;
          return (
            <div
              key={m._id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                mine ? 'ml-auto bg-cyan-brand text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.body}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          type="button"
          onClick={send}
          className="rounded-xl bg-navy text-white px-4 py-2 text-sm font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
