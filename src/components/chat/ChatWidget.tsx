import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, ChevronLeft, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChatMessage, ChatConversation } from '@/types/chat';

// Mock data for conversations
const mockConversations: ChatConversation[] = [
  {
    id: '1',
    patientId: 'patient-001',
    patientName: 'John Smith',
    lastMessage: 'Thank you for the prescription, doctor.',
    lastMessageTime: '2 min ago',
    unreadCount: 2,
    status: 'active',
  },
  {
    id: '2',
    patientId: 'patient-002',
    patientName: 'Mary Johnson',
    lastMessage: 'When should I take the medication?',
    lastMessageTime: '15 min ago',
    unreadCount: 0,
    status: 'active',
  },
  {
    id: '3',
    patientId: 'patient-003',
    patientName: 'Robert Williams',
    lastMessage: 'I have a follow-up question.',
    lastMessageTime: '1 hr ago',
    unreadCount: 1,
    status: 'active',
  },
];

const mockMessages: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1', conversationId: '1', senderId: 'doctor-1', senderName: 'Dr. Chen', senderRole: 'doctor', content: 'Hello John, how are you feeling today?', timestamp: '10:00 AM', read: true },
    { id: 'm2', conversationId: '1', senderId: 'patient-001', senderName: 'John Smith', senderRole: 'patient', content: 'I\'m feeling much better, thank you!', timestamp: '10:05 AM', read: true },
    { id: 'm3', conversationId: '1', senderId: 'doctor-1', senderName: 'Dr. Chen', senderRole: 'doctor', content: 'Great to hear. I\'ve updated your prescription.', timestamp: '10:10 AM', read: true },
    { id: 'm4', conversationId: '1', senderId: 'patient-001', senderName: 'John Smith', senderRole: 'patient', content: 'Thank you for the prescription, doctor.', timestamp: '10:12 AM', read: false },
  ],
  '2': [
    { id: 'm5', conversationId: '2', senderId: 'patient-002', senderName: 'Mary Johnson', senderRole: 'patient', content: 'Hi, I received my test results.', timestamp: '9:00 AM', read: true },
    { id: 'm6', conversationId: '2', senderId: 'nurse-1', senderName: 'Nurse Sarah', senderRole: 'nurse', content: 'Yes, everything looks normal. The doctor will review shortly.', timestamp: '9:15 AM', read: true },
    { id: 'm7', conversationId: '2', senderId: 'patient-002', senderName: 'Mary Johnson', senderRole: 'patient', content: 'When should I take the medication?', timestamp: '9:30 AM', read: true },
  ],
  '3': [
    { id: 'm8', conversationId: '3', senderId: 'patient-003', senderName: 'Robert Williams', senderRole: 'patient', content: 'I have a follow-up question.', timestamp: '8:00 AM', read: false },
  ],
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages[selectedConversation.id] || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'current-user',
      senderName: 'You',
      senderRole: 'doctor',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Update conversation's last message
    setConversations(conversations.map(c =>
      c.id === selectedConversation.id
        ? { ...c, lastMessage: newMessage, lastMessageTime: 'Just now' }
        : c
    ));
  };

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    // Mark as read
    setConversations(conversations.map(c =>
      c.id === conversation.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 transition-all duration-300",
          isOpen && "rotate-90"
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] bg-card rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
            {selectedConversation ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedConversation.patientName}</h3>
                  <p className="text-xs opacity-80">Patient Chat</p>
                </div>
              </>
            ) : (
              <>
                <MessageCircle className="h-6 w-6" />
                <div className="flex-1">
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-xs opacity-80">{conversations.length} conversations</p>
                </div>
              </>
            )}
          </div>

          {/* Content */}
          {selectedConversation ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2 max-w-[85%]",
                        msg.senderId === 'current-user' || msg.senderRole !== 'patient'
                          ? "ml-auto flex-row-reverse"
                          : ""
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          msg.senderRole === 'patient'
                            ? "bg-muted"
                            : "bg-primary/10"
                        )}
                      >
                        <User className="h-4 w-4" />
                      </div>
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          msg.senderId === 'current-user' || msg.senderRole !== 'patient'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          msg.senderId === 'current-user' || msg.senderRole !== 'patient'
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground"
                        )}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Conversation List */
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className="w-full p-4 hover:bg-muted/50 transition-colors text-left flex items-center gap-3"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {conversation.patientName.charAt(0)}
                        </span>
                      </div>
                      <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-success text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.patientName}</p>
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </>
  );
}
