export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor' | 'nurse' | 'admin';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  patientId: string;
  patientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'closed';
}
