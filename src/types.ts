export interface User {
  username: string;
  fullName: string;
  department: string;
}

export type TicketType = 'incident' | 'request';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  type: TicketType;
  subject: string;
  description: string;
  priority: Priority;
  engineer: string;
  location: string;
  category: string;
  deadline?: string;
  status: TicketStatus;
  createdBy: string;
  createdAt: string;
}

export type Location = 'МОФ' | 'РОП' | 'ЗОП' | 'КОП';
