export type UserRole = 'user' | 'engineer' | 'admin';

export interface User {
  id?: string;
  username: string;
  fullName: string;
  department: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}

export type TicketType = 'incident' | 'request';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // mime type
  url: string; // base64 data URL для localStorage, или URL для Supabase
  size: number;
  createdAt: string;
}

export interface Ticket {
  id?: string;
  ticketNumber?: string;
  type: TicketType;
  subject: string;
  description: string;
  priority: Priority;
  engineer: string;
  location: string;
  category: string;
  deadline?: string;
  status: TicketStatus;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
  comments?: Comment[];
  attachments?: Attachment[];
}

export type Location = 'МОФ' | 'РОП' | 'ЗОП' | 'КОП';
