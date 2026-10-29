import { supabase, isDatabaseConfigured } from '../lib/supabase';
import { User, Ticket, TicketType, Priority, TicketStatus } from '../types';

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

/**
 * Найти сотрудника по логину (username)
 */
export async function findEmployeeByUsername(username: string): Promise<User | null> {
  if (!isDatabaseConfigured() || !supabase) {
    // Fallback: localStorage
    const employees = getEmployeesFromStorage();
    const employee = employees.find(e => e.username === username.toLowerCase());
    
    // Миграция: если у сотрудника нет ID, добавляем его
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

/**
 * Создать нового сотрудника (при первой авторизации)
 */
export async function createEmployee(
  username: string,
  fullName: string,
  department: string = 'Отдел ИТ'
): Promise<User | null> {
  if (!isDatabaseConfigured() || !supabase) {
    // Fallback: localStorage
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

/**
 * Обновить время последнего входа
 */
export async function updateLastLogin(employeeId: string): Promise<void> {
  if (!isDatabaseConfigured() || !supabase) {
    // Fallback: localStorage (не отслеживаем последний вход)
    return;
  }

  await supabase
    .from('employees')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', employeeId);
}

/**
 * Получить или создать сотрудника (логика первой авторизации)
 */
export async function getOrCreateEmployee(
  username: string,
  fullName: string,
  department: string = 'Отдел ИТ'
): Promise<User | null> {
  // Сначала ищем существующего
  const existing = await findEmployeeByUsername(username);
  if (existing) {
    // Обновляем время последнего входа
    await updateLastLogin(existing.id!);
    return existing;
  }

  // Если не нашли — создаём нового
  return await createEmployee(username, fullName, department);
}

/**
 * Получить всех инженеров
 */
export async function getEngineers(): Promise<User[]> {
  if (!isDatabaseConfigured() || !supabase) {
    // Fallback: возвращаем захардкоженных инженеров
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

  if (error) {
    console.error('Ошибка получения инженеров:', error);
    return [];
  }

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
}

/**
 * Создать новую заявку
 */
export async function createTicket(ticketData: CreateTicketData): Promise<Ticket | null> {
  if (!isDatabaseConfigured() || !supabase) {
    // Fallback: localStorage
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tickets.unshift(newTicket);
    saveTicketsToStorage(tickets);
    return newTicket;
  }

  // Генерируем номер заявки
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
    })
    .select()
    .single();

  if (error) {
    console.error('Ошибка создания заявки:', error);
    return null;
  }

  // Записываем в историю
  await addTicketHistory(data.id, 'Создана заявка', ticketData.createdById);

  return mapTicketFromDb(data);
}

/**
 * Получить все заявки (отсортированные по дате)
 */
export async function getTickets(): Promise<Ticket[]> {
  if (!isDatabaseConfigured() || !supabase) {
    // Fallback: localStorage
    return getTicketsFromStorage();
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка получения заявок:', error);
    return [];
  }

  return (data || []).map(mapTicketFromDb);
}

/**
 * Получить заявки конкретного пользователя
 */
export async function getTicketsByUser(userId: string): Promise<Ticket[]> {
  if (!isDatabaseConfigured() || !supabase) {
    // Fallback: localStorage
    const tickets = getTicketsFromStorage();
    return tickets.filter(t => t.createdBy === userId);
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка получения заявок пользователя:', error);
    return [];
  }

  return (data || []).map(mapTicketFromDb);
}

/**
 * Обновить статус заявки
 */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  changedBy: string
): Promise<boolean> {
  if (!isDatabaseConfigured() || !supabase) {
    // Fallback: localStorage
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

  if (error) {
    console.error('Ошибка обновления статуса:', error);
    return false;
  }

  await addTicketHistory(ticketId, `Статус изменён на: ${status}`, changedBy);
  return true;
}

// ============================================
// Вспомогательные функции
// ============================================

/**
 * Генерация номера заявки (SD-00001)
 */
async function generateTicketNumber(): Promise<string> {
  if (!supabase) {
    return generateTicketNumberFromStorage();
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('ticket_number')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 'SD-00001';
  }

  const lastNumber = data[0].ticket_number;
  const num = parseInt(lastNumber.replace('SD-', ''), 10);
  return `SD-${String(num + 1).padStart(5, '0')}`;
}

/**
 * Добавить запись в историю заявки
 */
async function addTicketHistory(
  ticketId: string,
  action: string,
  changedBy: string
): Promise<void> {
  if (!isDatabaseConfigured() || !supabase) {
    // Fallback: не ведем историю в localStorage
    return;
  }

  await supabase.from('ticket_history').insert({
    ticket_id: ticketId,
    action,
    changed_by: changedBy,
  });
}

/**
 * Маппинг данных из БД в тип Ticket
 */
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
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
