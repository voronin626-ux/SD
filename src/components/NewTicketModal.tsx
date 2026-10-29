import { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  FileText,
  MessageSquare,
  Send,
  AlertTriangle,
  User,
  Tag,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Zap,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
} from 'lucide-react';
import { Location, Priority, TicketType } from '../types';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: {
    type: TicketType;
    subject: string;
    description: string;
    priority: Priority;
    engineer: string;
    location: string;
    category: string;
    deadline?: string;
  }) => void;
  userName: string;
}

const locations: { value: Location; label: string; description: string }[] = [
  { value: 'МОФ', label: 'МОФ', description: 'Московский офис' },
  { value: 'РОП', label: 'РОП', description: 'Ростовский офис' },
  { value: 'ЗОП', label: 'ЗОП', description: 'Зональный офис' },
  { value: 'КОП', label: 'КОП', description: 'Корпоративный офис' },
];

const categories = [
  'Пользовательские ПК',
  'Оргтехника и принтеры',
  'Сеть и интернет',
  'Программное обеспечение',
  'Доступы и учётные записи',
  'Телефония',
  '1С и корпоративные системы',
  'Другое',
];

const engineers = [
  'Воронин Денис',
  'Иванов Иван',
  'Петров Сергей',
  'Сидорова Анна',
  'Козлов Михаил',
];

const priorities: { value: Priority; label: string; icon: typeof Zap; color: string; bgColor: string; borderColor: string }[] = [
  { value: 'low', label: 'Низкий', icon: ArrowDownCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { value: 'medium', label: 'Средний', icon: MinusCircle, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { value: 'high', label: 'Высокий', icon: ArrowUpCircle, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { value: 'critical', label: 'Критический', icon: Zap, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
];

const ticketTypes: { value: TicketType; label: string; description: string; icon: typeof AlertTriangle; color: string }[] = [
  { value: 'incident', label: 'Инцидент', description: 'у меня что-то не работает', icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
  { value: 'request', label: 'Запрос услуги', description: 'нужна помощь или консультация', icon: MessageSquare, color: 'from-blue-500 to-indigo-500' },
];

export default function NewTicketModal({ isOpen, onClose, onSubmit, userName }: NewTicketModalProps) {
  const [type, setType] = useState<TicketType>('incident');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [engineer, setEngineer] = useState<string>('Воронин Денис');
  const [location, setLocation] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = 'Опишите, что случилось';
    if (!description.trim()) newErrors.description = 'Добавьте текст заявки';
    if (!location) newErrors.location = 'Укажите, где вы находитесь';
    if (!category) newErrors.category = 'Выберите категорию';
    if (hasDeadline && !deadline) newErrors.deadline = 'Укажите срок';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        type,
        subject,
        description,
        priority,
        engineer,
        location,
        category,
        deadline: hasDeadline ? deadline : undefined,
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setType('incident');
    setSubject('');
    setDescription('');
    setPriority('medium');
    setEngineer('Воронин Денис');
    setLocation('');
    setCategory('');
    setHasDeadline(false);
    setDeadline('');
    setErrors({});
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto max-h-[92vh] overflow-hidden flex flex-col transition-all duration-200 ${
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Новая заявка</h2>
                <p className="text-sm text-gray-500">Заполните форму, чтобы мы могли помочь</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Тип обращения */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Что у Вас случилось: <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ticketTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                            {t.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Опишите проблему */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                Опишите проблему: <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
                placeholder="Например: Не работает принтер в кабинете 305"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
              )}
            </div>

            {/* Приоритет */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Приоритет: <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {priorities.map((p) => {
                  const Icon = p.icon;
                  const isSelected = priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? `${p.bgColor} ${p.borderColor} ${p.color} shadow-sm`
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Инженер + Локация */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Инженер */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <User className="w-4 h-4 text-purple-500" />
                  Инженер:
                </label>
                <select
                  value={engineer}
                  onChange={(e) => setEngineer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white appearance-none"
                >
                  {engineers.map((eng) => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>
              </div>

              {/* Локация */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Где вы находитесь: <span className="text-red-400">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none ${
                    errors.location ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white focus:bg-white'
                  }`}
                >
                  <option value="">Выберите офис</option>
                  {locations.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label} — {loc.description}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-xs text-red-500">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Категория */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <Tag className="w-4 h-4 text-teal-500" />
                Категория: <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Крайний срок */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    Указать крайний срок исполнения?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasDeadline(!hasDeadline)}
                  className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
                >
                  {hasDeadline ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-amber-600" />
                      <span>Да</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                      <span>Нет</span>
                    </>
                  )}
                </button>
              </div>
              {hasDeadline && (
                <div className="mt-3 animate-fade-in">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-white ${
                      errors.deadline ? 'border-red-300' : 'border-amber-200'
                    }`}
                  />
                  {errors.deadline && (
                    <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>
                  )}
                </div>
              )}
            </div>

            {/* Текст заявки */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <MessageSquare className="w-4 h-4 text-green-500" />
                Текст заявки: <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
                placeholder="Опишите подробно: что произошло, когда, какие шаги предпринимали, что ожидали..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Информация о пользователе */}
            <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{userName}</p>
                <p className="text-xs text-gray-500">Заявка будет создана от вашего имени</p>
              </div>
            </div>
          </form>

          {/* Footer with buttons */}
          <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Отправить заявку
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
