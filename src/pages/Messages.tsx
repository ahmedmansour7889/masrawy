import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Send, Search, Phone, Video, MoreHorizontal, Smile } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EmojiPicker from '../components/EmojiPicker';

interface Conversation {
  id: string;
  participant: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    is_online?: boolean;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: 'text' | 'image' | 'video';
  media_url?: string;
}

export default function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      // In a real app, you would have a conversations table
      // For now, we'll simulate with recent message partners
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .limit(10);

      const mockConversations: Conversation[] = (profiles || []).map(profile => ({
        id: profile.id,
        participant: {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          is_online: Math.random() > 0.5,
        },
        last_message: {
          content: 'مرحباً! كيف حالك؟',
          created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          sender_id: Math.random() > 0.5 ? profile.id : user?.id || '',
        },
        unread_count: Math.floor(Math.random() * 5),
      }));

      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      // In a real app, fetch messages from messages table
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'مرحباً! كيف حالك؟',
          sender_id: convId,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          message_type: 'text',
        },
        {
          id: '2',
          content: 'أهلاً وسهلاً! بخير والحمد لله',
          sender_id: user?.id || '',
          created_at: new Date(Date.now() - 3000000).toISOString(),
          message_type: 'text',
        },
        {
          id: '3',
          content: 'ما أخبارك؟',
          sender_id: convId,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          message_type: 'text',
        },
      ];

      setMessages(mockMessages);
      
      const conversation = conversations.find(c => c.id === convId);
      setSelectedConversation(conversation || null);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender_id: user?.id || '',
        created_at: new Date().toISOString(),
        message_type: 'text',
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // In a real app, save to database
      // await supabase.from('messages').insert(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSending(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'الآن';
    } else if (diffHours < 24) {
      return `${diffHours} ساعة`;
    } else if (diffDays < 7) {
      return `${diffDays} يوم`;
    } else {
      return date.toLocaleDateString('ar-EG');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversations List */}
      <div className={`w-full lg:w-1/3 bg-white border-r border-gray-200 ${conversationId ? 'hidden lg:block' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">الرسائل</h1>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="البحث في الرسائل..."
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className={`block p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                conversationId === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {conversation.participant.avatar_url ? (
                      <img
                        src={conversation.participant.avatar_url}
                        alt={conversation.participant.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      conversation.participant.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {conversation.participant.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.participant.full_name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(conversation.last_message.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.last_message.sender_id === user?.id ? 'أنت: ' : ''}
                      {conversation.last_message.content}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد محادثات
              </h3>
              <p className="text-gray-600">
                ابدأ محادثة جديدة مع أصدقائك
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!conversationId ? 'hidden lg:flex' : ''}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Link
                    to="/messages"
                    className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 text-gray-600" />
                  </Link>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {selectedConversation.participant.avatar_url ? (
                        <img
                          src={selectedConversation.participant.avatar_url}
                          alt={selectedConversation.participant.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        selectedConversation.participant.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {selectedConversation.participant.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.participant.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.participant.is_online ? 'متصل الآن' : 'غير متصل'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="اكتب رسالة..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <EmojiPicker
                      onEmojiSelect={(emoji) => setNewMessage(prev => prev + emoji)}
                      className="p-1"
                    />
                  </div>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                اختر محادثة
              </h3>
              <p className="text-gray-600">
                اختر محادثة من القائمة لبدء المراسلة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}