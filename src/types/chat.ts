export interface Profile {
  id: string;
  name: string;
  username?: string;
  avatar_url: string;
  is_admin: boolean;
  is_online: boolean;
  last_seen?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  admin_id: string | null;
  last_message: string;
  last_message_at: string;
  last_message_sender_id?: string | null;
  unread_count_admin: number;
  unread_count_customer: number;
  is_pinned: boolean;
  is_ephemeral?: boolean;
  has_messages?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: 'text' | 'image';
  content: string;
  image_url: string;
  status: 'sent' | 'delivered' | 'seen';
  created_at: string;
  reply_to_id: string | null;
  reply_to_sender_name: string;
  reply_to_content: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface ReplyTo {
  id: string;
  senderName: string;
  content: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  category: 'bug' | 'suggestion' | 'feature' | 'other';
  content: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

