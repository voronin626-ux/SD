# 📦 Как получить файлы проекта

## Вариант 1: Локальное развёртывание (рекомендуется)

### Шаг 1: Создайте новую папку для проекта

```bash
mkdir service-desk
cd service-desk
```

### Шаг 2: Инициализируйте проект

```bash
npm create vite@latest . -- --template react-ts
```

### Шаг 3: Установите зависимости

```bash
npm install
npm install lucide-react @supabase/supabase-js framer-motion
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Шаг 4: Скопируйте файлы

Скопируйте все файлы из папки `src/` этого проекта в вашу локальную папку `src/`.

**Основные файлы для копирования:**

#### src/types.ts
```typescript
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
  type: string;
  url: string;
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
```

#### src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### src/App.tsx
Скопируйте содержимое файла `src/App.tsx` из проекта.

#### src/index.css
```css
@import "tailwindcss";

@layer base {
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out both;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}
```

#### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Шаг 5: Создайте компоненты

Создайте папку `src/components/` и скопируйте туда все файлы компонентов:

- `LoginPage.tsx`
- `Dashboard.tsx`
- `NewTicketModal.tsx`
- `TicketDetailModal.tsx`
- `DatabaseStatusBadge.tsx`
- `DatabaseInfoPanel.tsx`

### Шаг 6: Создайте сервисы

Создайте папку `src/services/` и `src/lib/`:

- `src/lib/supabase.ts`
- `src/services/database.ts`

### Шаг 7: Настройте переменные окружения

Создайте файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Шаг 8: Запустите проект

```bash
npm run dev
```

Откройте браузер и перейдите по адресу `http://localhost:5173`

---

## Вариант 2: Получение через Git

Если проект находится в Git-репозитории:

```bash
git clone <repository-url>
cd service-desk
npm install
npm run dev
```

---

## Вариант 3: Экспорт файлов по одному

Если вам нужны конкретные файлы, я могу показать их содержимое. Просто скажите, какие файлы вам нужны:

- `src/App.tsx`
- `src/components/LoginPage.tsx`
- `src/components/Dashboard.tsx`
- `src/components/NewTicketModal.tsx`
- `src/components/TicketDetailModal.tsx`
- `src/services/database.ts`
- `src/lib/supabase.ts`
- `supabase/schema.sql`
- и т.д.

---

## 📋 Список всех файлов проекта

```
service-desk/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .env.example
├── .env (нужно создать вручную)
├── DATABASE_SETUP.md
├── USER_GUIDE.md
├── ENGINEER_ACCOUNTS.md
├── GET_FILES.md (этот файл)
├── supabase/
│   └── schema.sql
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── types.ts
    ├── lib/
    │   └── supabase.ts
    ├── services/
    │   └── database.ts
    └── components/
        ├── LoginPage.tsx
        ├── Dashboard.tsx
        ├── NewTicketModal.tsx
        ├── TicketDetailModal.tsx
        ├── DatabaseStatusBadge.tsx
        └── DatabaseInfoPanel.tsx
```

---

## 🔧 Требования для локального запуска

- **Node.js** версии 18 или выше
- **npm** версии 9 или выше
- **Git** (опционально, для клонирования)

### Проверка версий:

```bash
node --version  # должно быть v18.x.x или выше
npm --version   # должно быть 9.x.x или выше
```

---

## 🚀 Быстрый старт

```bash
# 1. Клонируйте или создайте проект
mkdir service-desk && cd service-desk

# 2. Инициализируйте
npm create vite@latest . -- --template react-ts

# 3. Установите зависимости
npm install
npm install lucide-react @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Скопируйте файлы из этого проекта

# 5. Создайте .env файл с вашими ключами Supabase

# 6. Запустите
npm run dev
```

---

## 📞 Нужна помощь?

Если у вас возникли вопросы при получении файлов или запуске проекта:

1. Проверьте, что все файлы скопированы правильно
2. Убедитесь, что все зависимости установлены
3. Проверьте файл `.env` с правильными ключами Supabase
4. Откройте консоль браузера (F12) для проверки ошибок

---

**Версия:** 2.1  
**Дата:** 2026-01-29
