import { useState, useEffect } from 'react';
import { User, Ticket, Priority, TicketStatus, Attachment } from './types';
import { getOrCreateEmployee, getTickets, createTicket, addComment, updateTicketStatus } from './services/database';
import { isDatabaseConfigured } from './lib/supabase';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { DatabaseStatusBadge } from './components/DatabaseStatusBadge';
import { DatabaseInfoPanel } from './components/DatabaseInfoPanel';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка пользователя из localStorage и заявок из БД/localStorage
  useEffect(() => {
    const initApp = async () => {
      const savedUser = localStorage.getItem('sd_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Загружаем заявки из БД или localStorage
        const dbTickets = await getTickets();
        setTickets(dbTickets);
      }
      setLoading(false);
    };

    initApp();
  }, []);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    // Здесь должна быть реальная проверка через Active Directory
    // Для демонстрации принимаем любые учётные данные
    if (!username || !password) {
      return false;
    }

    // Получаем или создаём сотрудника в БД/localStorage
    const employee = await getOrCreateEmployee(
      username,
      username.charAt(0).toUpperCase() + username.slice(1),
      'Отдел ИТ'
    );

    console.log('Сотрудник после входа:', employee);

    if (employee) {
      // Проверяем, что у сотрудника есть ID
      if (!employee.id) {
        console.error('Ошибка: у сотрудника нет ID, пересоздаём...');
        // Удаляем старого сотрудника и создаём нового
        const employees = JSON.parse(localStorage.getItem('sd_employees') || '[]');
        const filtered = employees.filter((e: any) => e.username !== username.toLowerCase());
        localStorage.setItem('sd_employees', JSON.stringify(filtered));
        
        // Создаём заново
        const newEmployee = await getOrCreateEmployee(
          username,
          username.charAt(0).toUpperCase() + username.slice(1),
          'Отдел ИТ'
        );
        
        if (newEmployee && newEmployee.id) {
          setUser(newEmployee);
          localStorage.setItem('sd_user', JSON.stringify(newEmployee));
        } else {
          console.error('Не удалось создать сотрудника с ID');
          return false;
        }
      } else {
        setUser(employee);
        localStorage.setItem('sd_user', JSON.stringify(employee));
      }
      
      // Загружаем заявки из БД или localStorage
      const dbTickets = await getTickets();
      setTickets(dbTickets);
      
      return true;
    }

    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setTickets([]);
    localStorage.removeItem('sd_user');
  };

  const handleAddComment = async (ticketId: string, text: string, attachments: Attachment[]) => {
    if (!user?.id) return;

    const comment = await addComment(ticketId, text, user.id, user.fullName, attachments);
    
    if (comment) {
      // Обновляем заявку в списке
      setTickets((prev) => 
        prev.map((t) => {
          if (t.id === ticketId) {
            return {
              ...t,
              comments: [...(t.comments || []), comment],
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: TicketStatus) => {
    if (!user?.id) return;

    const success = await updateTicketStatus(ticketId, status, user.id);
    
    if (success) {
      setTickets((prev) => 
        prev.map((t) => {
          if (t.id === ticketId) {
            return {
              ...t,
              status,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );
    }
  };

  const handleCreateTicket = async (ticketData: {
    type: 'incident' | 'request';
    subject: string;
    description: string;
    priority: Priority;
    engineer: string;
    location: string;
    category: string;
    deadline?: string;
  }) => {
    console.log('Создание заявки, пользователь:', user);
    
    if (!user?.id) {
      console.error('Ошибка: у пользователя нет ID', user);
      alert('Ошибка: не удалось определить пользователя. Попробуйте выйти и войти снова.');
      return;
    }

    const newTicket = await createTicket({
      ...ticketData,
      createdById: user.id,
      createdByName: user.fullName,
    });

    console.log('Созданная заявка:', newTicket);

    if (newTicket) {
      // Добавляем заявку в начало списка
      setTickets((prev) => {
        const updated = [newTicket, ...prev];
        console.log('Обновлённый список заявок:', updated);
        return updated;
      });
      
      // Показываем уведомление
      alert(`✅ Заявка ${newTicket.ticketNumber} успешно создана!`);
    } else {
      console.error('Ошибка: заявка не была создана');
      alert('❌ Ошибка при создании заявки. Проверьте консоль для подробностей.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <DatabaseStatusBadge />
        <DatabaseInfoPanel />
      </>
    );
  }

  return (
    <>
      <Dashboard
        user={user}
        tickets={tickets}
        onCreateTicket={handleCreateTicket}
        onAddComment={handleAddComment}
        onUpdateStatus={handleUpdateStatus}
        onLogout={handleLogout}
      />
      <DatabaseStatusBadge />
      <DatabaseInfoPanel />
    </>
  );
}

export default App;
