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
  createdAt?: string;
  updatedAt?: string;
}

export type Location = 'МОФ' | 'РОП' | 'ЗОП' | 'КОП';
