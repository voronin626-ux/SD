-- ============================================
-- Service Desk — SQL для Supabase
-- Выполните этот скрипт в SQL Editor Supabase
-- ============================================

-- Таблица сотрудников (пользователей)
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT DEFAULT 'Отдел ИТ',
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user', -- user, engineer, admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица заявок
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('incident', 'request')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  engineer TEXT,
  deadline TIMESTAMPTZ,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица истории изменений заявки
CREATE TABLE IF NOT EXISTS ticket_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  changed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_engineer ON tickets(engineer);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);

-- RLS (Row Level Security) — политики доступа
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;

-- Все авторизованные пользователи могут читать сотрудников
CREATE POLICY "employees_select_all" ON employees
  FOR SELECT USING (true);

-- Пользователь может обновлять только свою запись
CREATE POLICY "employees_update_own" ON employees
  FOR UPDATE USING (true);

-- Все авторизованные пользователи могут вставлять сотрудников (при первом входе)
CREATE POLICY "employees_insert_all" ON employees
  FOR INSERT WITH CHECK (true);

-- Все могут читать заявки
CREATE POLICY "tickets_select_all" ON tickets
  FOR SELECT USING (true);

-- Все могут создавать заявки
CREATE POLICY "tickets_insert_all" ON tickets
  FOR INSERT WITH CHECK (true);

-- Все могут обновлять заявки
CREATE POLICY "tickets_update_all" ON tickets
  FOR UPDATE USING (true);

-- Все могут читать историю
CREATE POLICY "ticket_history_select_all" ON ticket_history
  FOR SELECT USING (true);

-- Все могут вставлять записи истории
CREATE POLICY "ticket_history_insert_all" ON ticket_history
  FOR INSERT WITH CHECK (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Функция для генерации номера заявки
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(ticket_number FROM 2) AS INTEGER)
  ), 0) + 1 INTO next_num FROM tickets;
  RETURN 'SD-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
