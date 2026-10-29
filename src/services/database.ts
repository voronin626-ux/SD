import { supabase } from '../lib/supabase';
import { User, Ticket, TicketType, Priority, TicketStatus } from '../types';

// ============================================
// Сотрудники
// ============================================

/**
 * Найти сотрудника по логину (username)
 */
export async function findEmployeeByUsername(username: string): Promise<User | null> {
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
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('role', 'engineer')
    .order('full_name');

  if (error) {
    console.error('Ошибка получения инженеров:', error);
    return [];
  }

  return (data || []).map((d) => ({
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
