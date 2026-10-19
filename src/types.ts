export interface User {
  username: string;
  fullName: string;
  department: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  location: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  createdBy: string;
  createdAt: string;
}

export type Location = 'МОФ' | 'РОП' | 'ЗОП' | 'КОП';
