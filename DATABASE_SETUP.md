# Service Desk — Инструкции по настройке базы данных

## 🚀 Быстрый старт

### 1. Создайте проект в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Зарегистрируйтесь или войдите
3. Нажмите **"New Project"**
4. Заполните:
   - **Project name**: `service-desk` (или любое другое)
   - **Database Password**: придумайте надёжный пароль
   - **Region**: выберите ближайший к вам (например, Frankfurt)
5. Нажмите **"Create new project"** и подождите 1-2 минуты

### 2. Получите ключи API

1. В вашем проекте перейдите в **Settings** (шестерёнка слева)
2. Выберите раздел **API**
3. Скопируйте:
   - **Project URL** (например, `https://abcdefg.supabase.co`)
   - **Project API keys** → **anon public** ключ

### 3. Создайте таблицы в базе данных

1. В Supabase перейдите в **SQL Editor** (иконка терминала слева)
2. Нажмите **"New query"**
3. Скопируйте содержимое файла `supabase/schema.sql`
4. Вставьте в редактор и нажмите **"Run"** (или Ctrl+Enter)
5. Дождитесь успешного выполнения

### 4. Настройте переменные окружения

1. Скопируйте файл `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Откройте `.env` и заполните:
   ```env
   VITE_SUPABASE_URL=https://ваш-проект.supabase.co
   VITE_SUPABASE_ANON_KEY=ваш-anon-ключ
   ```

3. Сохраните файл

### 5. Запустите приложение

```bash
npm run dev
```

## 📋 Структура базы данных

### Таблица `employees` (Сотрудники)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Уникальный идентификатор |
| username | TEXT | Логин (из Active Directory) |
| full_name | TEXT | Полное имя |
| department | TEXT | Отдел |
| email | TEXT | Email |
| phone | TEXT | Телефон |
| role | TEXT | Роль: user, engineer, admin |
| created_at | TIMESTAMP | Дата создания |
| last_login_at | TIMESTAMP | Последний вход |

### Таблица `tickets` (Заявки)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Уникальный идентификатор |
| ticket_number | TEXT | Номер заявки (SD-00001) |
| type | TEXT | Тип: incident, request |
| subject | TEXT | Тема |
| description | TEXT | Описание |
| priority | TEXT | Приоритет: low, medium, high, critical |
| status | TEXT | Статус: new, in_progress, resolved, closed |
| location | TEXT | Локация: МОФ, РОП, ЗОП, КОП |
| category | TEXT | Категория |
| engineer | TEXT | Назначенный инженер |
| deadline | TIMESTAMP | Крайний срок |
| created_by | UUID | Кто создал (ссылка на employees) |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата обновления |

### Таблица `ticket_history` (История изменений)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Уникальный идентификатор |
| ticket_id | UUID | Ссылка на заявку |
| action | TEXT | Описание действия |
| changed_by | UUID | Кто изменил |
| created_at | TIMESTAMP | Дата изменения |

## 🔐 Интеграция с Active Directory

Для реальной интеграции с AD нужно:

1. **Создать бэкенд-сервер** (Node.js + Express)
2. **Использовать библиотеку** `ldapjs` для подключения к AD
3. **Создать API endpoint** `/api/auth/login`
4. **Настроить CORS** в Supabase для вашего домена

### Пример бэкенда (Node.js):

```javascript
// server.js
const express = require('express');
const ldap = require('ldapjs');

const app = express();
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const client = ldap.createClient({
    url: 'ldap://your-ad-server.com'
  });
  
  client.bind(`CN=${username},OU=Users,DC=company,DC=com`, password, (err) => {
    if (err) {
      res.status(401).json({ error: 'Неверный логин или пароль' });
    } else {
      res.json({ success: true, username });
    }
    client.unbind();
  });
});

app.listen(3001);
```

## 🛠 Полезные SQL-запросы

### Добавить инженеров вручную:

```sql
INSERT INTO employees (username, full_name, department, role) VALUES
('voronin.d', 'Воронин Денис', 'ИТ', 'engineer'),
('ivanov.i', 'Иванов Иван', 'ИТ', 'engineer'),
('petrov.s', 'Петров Сергей', 'ИТ', 'engineer');
```

### Посмотреть все заявки:

```sql
SELECT 
  ticket_number,
  subject,
  priority,
  status,
  created_at
FROM tickets
ORDER BY created_at DESC;
```

### Статистика по заявкам:

```sql
SELECT 
  status,
  COUNT(*) as count
FROM tickets
GROUP BY status;
```

## 📞 Поддержка

Если возникли вопросы:
- Документация Supabase: https://supabase.com/docs
- SQL Editor: https://supabase.com/dashboard/latest/sql
