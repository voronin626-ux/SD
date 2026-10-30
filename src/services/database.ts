import { supabase, isDatabaseConfigured } from '../lib/supabase';
import { User, Ticket, TicketType, Priority, TicketStatus, Comment, Attachment } from '../types';

// ============================================
// Fallback: Работа с localStorage
// ============================================

const STORAGE_KEYS = {
  EMPLOYEES: 'sd_employees',
  TICKETS: 'sd_tickets',
  TICKET_COUNTER: 'sd_ticket_counter',
};

// Сотрудники (localStorage)
function getEmployeesFromStorage(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  return data ? JSON.parse(data) : [];
}

function saveEmployeesToStorage(employees: User[]): void {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
}

// Заявки (localStorage)
function getTicketsFromStorage(): Ticket[] {
  const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
  return data ? JSON.parse(data) : [];
}

function saveTicketsToStorage(tickets: Ticket[]): void {
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
}

// Генерация номера заявки (localStorage)
function generateTicketNumberFromStorage(): string {
  const counter = parseInt(localStorage.getItem(STORAGE_KEYS.TICKET_COUNTER) || '0', 10);
  const newCounter = counter + 1;
  localStorage.setItem(STORAGE_KEYS.TICKET_COUNTER, newCounter.toString());
  return `SD-${String(newCounter).padStart(5, '0')}`;
}

// ============================================
// Сотрудники
// ============================================

export async function findEmployeeByUsername(username: string): Promise<User | null> {
  if (!isDatabaseConfigured() || !supabase) {
    const employees = getEmployeesFromStorage();
    const employee = employees.find(e => e.username === username.toLowerCase());
    
    if (employee && !employee.id) {
      employee.id = crypto.randomUUID();
      saveEmployeesToStorage(employees);
    }
    
    return employee || null;
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('username', username.toLowerCase())
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    department: data.department,
    email: data.email,
    phone: data.phone,
    role: data.role,
  };
}

export async function createEmployee(
  username: string,
  fullName: string,
  department: string = 'Отдел ИТ'
): Promise<User | null> {
  if (!isDatabaseConfigured() || !supabase) {
    const employees = getEmployeesFromStorage();
    const newEmployee: User = {
      id: crypto.randomUUID(),
      username: username.toLowerCase(),
      fullName,
      department,
      role: 'user',
    };
    employees.push(newEmployee);
    saveEmployeesToStorage(employees);
    return newEmployee;
  }

  const { data, error } = await supabase
    .from('employees')
    .insert({
      username: username.toLowerCase(),
      full_name: fullName,
      department: department,
      last_login_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Ошибка создания сотрудника:', error);
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    department: data.department,
    email: data.email,
    phone: data.phone,
    role: data.role,
  };
}

export async function updateLastLogin(employeeId: string): Promise<void> {
  if (!isDatabaseConfigured() || !supabase) return;

  await supabase
    .from('employees')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', employeeId);
}

export async function getOrCreateEmployee(
  username: string,
  fullName: string,
  department: string = 'Отдел ИТ'
): Promise<User | null> {
  const existing = await findEmployeeByUsername(username);
  if (existing) {
    await updateLastLogin(existing.id!);
    return existing;
  }
  return await createEmployee(username, fullName, department);
}

export async function getEngineers(): Promise<User[]> {
  if (!isDatabaseConfigured() || !supabase) {
    return [
      { id: '1', username: 'voronin.d', fullName: 'Воронин Денис', department: 'ИТ', role: 'engineer' },
      { id: '2', username: 'ivanov.i', fullName: 'Иванов Иван', department: 'ИТ', role: 'engineer' },
      { id: '3', username: 'petrov.s', fullName: 'Петров Сергей', department: 'ИТ', role: 'engineer' },
      { id: '4', username: 'sidorova.a', fullName: 'Сидорова Анна', department: 'ИТ', role: 'engineer' },
      { id: '5', username: 'kozlov.m', fullName: 'Козлов Михаил', department: 'ИТ', role: 'engineer' },
    ];
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('role', 'engineer')
    .order('full_name');

  if (error) return [];

  return (data || []).map((d: any) => ({
    id: d.id,
    username: d.username,
    fullName: d.full_name,
    department: d.department,
    email: d.email,
    phone: d.phone,
    role: d.role,
  }));
}

// ============================================
// Заявки
// ============================================

interface CreateTicketData {
  type: TicketType;
  subject: string;
  description: string;
  priority: Priority;
  engineer: string;
  location: string;
  category: string;
  deadline?: string;
  createdById: string;
  createdByName?: string;
}

export async function createTicket(ticketData: CreateTicketData): Promise<Ticket | null> {
  if (!isDatabaseConfigured() || !supabase) {
    const tickets = getTicketsFromStorage();
    const ticketNumber = generateTicketNumberFromStorage();
    
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      ticketNumber,
      type: ticketData.type,
      subject: ticketData.subject,
      description: ticketData.description,
      priority: ticketData.priority,
      status: 'new',
      location: ticketData.location,
      category: ticketData.category,
      engineer: ticketData.engineer,
      deadline: ticketData.deadline,
      createdBy: ticketData.createdById,
      createdByName: ticketData.createdByName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: [],
    };
    
    tickets.unshift(newTicket);
    saveTicketsToStorage(tickets);
    return newTicket;
  }

  const ticketNumber = await generateTicketNumber();

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      ticket_number: ticketNumber,
      type: ticketData.type,
      subject: ticketData.subject,
      description: ticketData.description,
      priority: ticketData.priority,
      status: 'new',
      location: ticketData.location,
      category: ticketData.category,
      engineer: ticketData.engineer,
      deadline: ticketData.deadline || null,
      created_by: ticketData.createdById,
      created_by_name: ticketData.createdByName,
    })
    .select()
    .single();

  if (error) {
    console.error('Ошибка создания заявки:', error);
    return null;
  }

  await addTicketHistory(data.id, 'Создана заявка', ticketData.createdById);

  return mapTicketFromDb(data);
}

export async function getTickets(): Promise<Ticket[]> {
  if (!isDatabaseConfigured() || !supabase) {
    const tickets = getTicketsFromStorage();
    
    // Миграция: добавляем createdByName для старых заявок
    const employees = getEmployeesFromStorage();
    let needsUpdate = false;
    
    const updatedTickets = tickets.map(ticket => {
      if (!ticket.createdByName && ticket.createdBy) {
        const employee = employees.find(e => e.id === ticket.createdBy);
        if (employee) {
          needsUpdate = true;
          return {
            ...ticket,
            createdByName: employee.fullName,
          };
        }
      }
      return ticket;
    });
    
    if (needsUpdate) {
      saveTicketsToStorage(updatedTickets);
    }
    
    return updatedTickets;
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];

  return (data || []).map(mapTicketFromDb);
}

export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  if (!isDatabaseConfigured() || !supabase) {
    const tickets = getTicketsFromStorage();
    const ticket = tickets.find(t => t.id === ticketId);
    
    // Миграция: добавляем createdByName для старых заявок
    if (ticket && !ticket.createdByName && ticket.createdBy) {
      const employees = getEmployeesFromStorage();
      const employee = employees.find(e => e.id === ticket.createdBy);
      if (employee) {
        ticket.createdByName = employee.fullName;
        saveTicketsToStorage(tickets);
      }
    }
    
    return ticket || null;
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (error) return null;

  return mapTicketFromDb(data);
}

export async function getTicketsByUser(userId: string): Promise<Ticket[]> {
  if (!isDatabaseConfigured() || !supabase) {
    const tickets = getTicketsFromStorage();
    return tickets.filter(t => t.createdBy === userId);
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) return [];

  return (data || []).map(mapTicketFromDb);
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  changedBy: string
): Promise<boolean> {
  if (!isDatabaseConfigured() || !supabase) {
    const tickets = getTicketsFromStorage();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return false;
    
    tickets[ticketIndex].status = status;
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    saveTicketsToStorage(tickets);
    return true;
  }

  const { error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId);

  if (error) return false;

  await addTicketHistory(ticketId, `Статус изменён на: ${status}`, changedBy);
  return true;
}

// ============================================
// Комментарии
// ============================================

export async function addComment(
  ticketId: string,
  text: string,
  authorId: string,
  authorName: string,
  attachments: Attachment[] = []
): Promise<Comment | null> {
  const newComment: Comment = {
    id: crypto.randomUUID(),
    text,
    authorId,
    authorName,
    createdAt: new Date().toISOString(),
    attachments,
  };

  if (!isDatabaseConfigured() || !supabase) {
    const tickets = getTicketsFromStorage();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return null;
    
    if (!tickets[ticketIndex].comments) {
      tickets[ticketIndex].comments = [];
    }
    tickets[ticketIndex].comments!.push(newComment);
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    saveTicketsToStorage(tickets);
    return newComment;
  }

  // Для Supabase — сохраняем в JSONB поле или отдельную таблицу
  const { data: ticket, error: fetchError } = await supabase
    .from('tickets')
    .select('comments')
    .eq('id', ticketId)
    .single();

  if (fetchError) return null;

  const existingComments = (ticket?.comments as Comment[]) || [];
  const updatedComments = [...existingComments, newComment];

  const { error } = await supabase
    .from('tickets')
    .update({ comments: updatedComments, updated_at: new Date().toISOString() })
    .eq('id', ticketId);

  if (error) return null;

  return newComment;
}

// ============================================
// Вложения
// ============================================

export async function addAttachment(
  ticketId: string,
  attachment: Attachment
): Promise<boolean> {
  if (!isDatabaseConfigured() || !supabase) {
    const tickets = getTicketsFromStorage();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return false;
    
    if (!tickets[ticketIndex].attachments) {
      tickets[ticketIndex].attachments = [];
    }
    tickets[ticketIndex].attachments!.push(attachment);
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    saveTicketsToStorage(tickets);
    return true;
  }

  // Загрузка в Supabase Storage
  const fileName = `${ticketId}/${attachment.id}_${attachment.name}`;
  const { error: uploadError } = await supabase.storage
    .from('ticket-attachments')
    .upload(fileName, dataURLtoBlob(attachment.url));

  if (uploadError) {
    console.error('Ошибка загрузки файла:', uploadError);
    return false;
  }

  const { data: urlData } = supabase.storage
    .from('ticket-attachments')
    .getPublicUrl(fileName);

  attachment.url = urlData.publicUrl;

  const { data: ticket, error: fetchError } = await supabase
    .from('tickets')
    .select('attachments')
    .eq('id', ticketId)
    .single();

  if (fetchError) return false;

  const existingAttachments = (ticket?.attachments as Attachment[]) || [];
  const updatedAttachments = [...existingAttachments, attachment];

  const { error } = await supabase
    .from('tickets')
    .update({ attachments: updatedAttachments })
    .eq('id', ticketId);

  return !error;
}

// Вспомогательная функция для конвертации base64 в Blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

// ============================================
// Вспомогательные функции
// ============================================

async function generateTicketNumber(): Promise<string> {
  if (!supabase) return generateTicketNumberFromStorage();

  const { data, error } = await supabase
    .from('tickets')
    .select('ticket_number')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return 'SD-00001';

  const lastNumber = data[0].ticket_number;
  const num = parseInt(lastNumber.replace('SD-', ''), 10);
  return `SD-${String(num + 1).padStart(5, '0')}`;
}

async function addTicketHistory(
  ticketId: string,
  action: string,
  changedBy: string
): Promise<void> {
  if (!isDatabaseConfigured() || !supabase) return;

  await supabase.from('ticket_history').insert({
    ticket_id: ticketId,
    action,
    changed_by: changedBy,
  });
}

function mapTicketFromDb(data: any): Ticket {
  return {
    id: data.id,
    ticketNumber: data.ticket_number,
    type: data.type,
    subject: data.subject,
    description: data.description,
    priority: data.priority,
    status: data.status,
    location: data.location,
    category: data.category,
    engineer: data.engineer,
    deadline: data.deadline,
    createdBy: data.created_by,
    createdByName: data.created_by_name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    comments: data.comments || [],
    attachments: data.attachments || [],
  };
}
