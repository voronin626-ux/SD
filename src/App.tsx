import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Ticket } from './types';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Загрузка из localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('sd_user');
    const savedTickets = localStorage.getItem('sd_tickets');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedTickets) setTickets(JSON.parse(savedTickets));
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('sd_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sd_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sd_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleCreateTicket = (ticketData: {
    type: 'incident' | 'request';
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    engineer: string;
    location: string;
    category: string;
    deadline?: string;
  }) => {
    const newTicket: Ticket = {
      id: uuidv4().split('-')[0].toUpperCase(),
      type: ticketData.type,
      subject: ticketData.subject,
      description: ticketData.description,
      priority: ticketData.priority,
      engineer: ticketData.engineer,
      location: ticketData.location,
      category: ticketData.category,
      deadline: ticketData.deadline,
      status: 'new',
      createdBy: user?.fullName || '',
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

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
