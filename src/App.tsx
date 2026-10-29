import { useState, useEffect } from 'react';
import { User, Ticket, Priority } from './types';
import { getOrCreateEmployee, getTickets, createTicket } from './services/database';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка пользователя из localStorage и заявок из БД
  useEffect(() => {
    const initApp = async () => {
      const savedUser = localStorage.getItem('sd_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Загружаем заявки из БД
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

    // Получаем или создаём сотрудника в БД
    const employee = await getOrCreateEmployee(
      username,
      username.charAt(0).toUpperCase() + username.slice(1),
      'Отдел ИТ'
    );

    if (employee) {
      setUser(employee);
      localStorage.setItem('sd_user', JSON.stringify(employee));
      
      // Загружаем заявки из БД
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
    if (!user?.id) return;

    const newTicket = await createTicket({
      ...ticketData,
      createdById: user.id,
    });

    if (newTicket) {
      // Добавляем заявку в начало списка
      setTickets((prev) => [newTicket, ...prev]);
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
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={user}
      tickets={tickets}
      onCreateTicket={handleCreateTicket}
      onLogout={handleLogout}
    />
  );
}

export default App;
