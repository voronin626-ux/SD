import { useState } from 'react';
import {
  Plus,
  LogOut,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Search,
  Filter,
  User,
  Tag,
  Zap,
  Calendar,
  ArrowDownCircle,
  MinusCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { User as UserType, Ticket as TicketType, Priority } from '../types';
import NewTicketModal from './NewTicketModal';

interface DashboardProps {
  user: UserType;
  tickets: TicketType[];
  onCreateTicket: (ticket: {
    type: 'incident' | 'request';
    subject: string;
    description: string;
    priority: Priority;
    engineer: string;
    location: string;
    category: string;
    deadline?: string;
  }) => void;
  onLogout: () => void;
}

const statusConfig = {
  new: {
    label: 'Новая',
    icon: AlertCircle,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  in_progress: {
    label: 'В работе',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  resolved: {
    label: 'Решена',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  closed: {
    label: 'Закрыта',
    icon: CheckCircle2,
    color: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

const priorityConfig: Record<Priority, { label: string; icon: typeof Zap; color: string; bgColor: string }> = {
  low: { label: 'Низкий', icon: ArrowDownCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  medium: { label: 'Средний', icon: MinusCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  high: { label: 'Высокий', icon: ArrowUpCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  critical: { label: 'Критический', icon: Zap, color: 'text-red-600', bgColor: 'bg-red-50' },
};

const locationLabels: Record<string, string> = {
  'МОФ': 'МОФ',
  'РОП': 'РОП',
  'ЗОП': 'ЗОП',
  'КОП': 'КОП',
};

export default function Dashboard({ user, tickets, onCreateTicket, onLogout }: DashboardProps) {
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    new: tickets.filter((t) => t.status === 'new').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <TicketIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Service Desk</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user.fullName}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800">
            Добро пожаловать, {user.fullName}! 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Здесь вы можете отслеживать свои обращения и создавать новые заявки
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <TicketIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-xs text-gray-500">Всего заявок</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.new}</p>
                <p className="text-xs text-gray-500">Новых</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.inProgress}</p>
                <p className="text-xs text-gray-500">В работе</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.resolved}</p>
                <p className="text-xs text-gray-500">Решено</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Новая заявка
          </button>

          <div className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по заявкам..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white appearance-none"
              >
                <option value="all">Все</option>
                <option value="new">Новые</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Решённые</option>
                <option value="closed">Закрытые</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TicketIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                {tickets.length === 0 ? 'Заявок пока нет' : 'Ничего не найдено'}
              </h3>
              <p className="text-gray-500 text-sm">
                {tickets.length === 0
                  ? 'Нажмите «Новая заявка», чтобы создать первое обращение'
                  : 'Попробуйте изменить параметры поиска'}
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const status = statusConfig[ticket.status];
              const StatusIcon = status.icon;
              const priority = priorityConfig[ticket.priority];
              const PriorityIcon = priority.icon;
              return (
                <div
                  key={ticket.id || ticket.ticketNumber}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">#{ticket.ticketNumber || ticket.id}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priority.bgColor} ${priority.color}`}>
                          <PriorityIcon className="w-3 h-3" />
                          {priority.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                          {ticket.type === 'incident' ? '🔴 Инцидент' : '🔵 Запрос'}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {locationLabels[ticket.location] || ticket.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Tag className="w-3.5 h-3.5" />
                          {ticket.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3.5 h-3.5" />
                          {ticket.engineer}
                        </span>
                        {ticket.deadline && (
                          <span className="flex items-center gap-1.5 text-xs text-amber-600">
                            <Calendar className="w-3.5 h-3.5" />
                            до {new Date(ticket.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onSubmit={(ticket) => {
          onCreateTicket(ticket);
          setIsNewTicketOpen(false);
        }}
        userName={user.fullName}
      />
    </div>
  );
}
