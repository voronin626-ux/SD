import { useState, useEffect } from 'react';
import { X, MapPin, FileText, MessageSquare, Send } from 'lucide-react';
import { Location } from '../types';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: { subject: string; description: string; location: string }) => void;
  username: string;
}

const locations: { value: Location; label: string; description: string }[] = [
  { value: 'МОФ', label: 'МОФ', description: 'Московский офис' },
  { value: 'РОП', label: 'РОП', description: 'Ростовский офис' },
  { value: 'ЗОП', label: 'ЗОП', description: 'Зональный офис' },
  { value: 'КОП', label: 'КОП', description: 'Корпоративный офис' },
];

export default function NewTicketModal({ isOpen, onClose, onSubmit, username }: NewTicketModalProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Небольшая задержка для CSS-анимации появления
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = 'Укажите тему обращения';
    if (!description.trim()) newErrors.description = 'Опишите проблему подробнее';
    if (!location) newErrors.location = 'Выберите локацию';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ subject, description, location });
      setSubject('');
      setDescription('');
      setLocation('');
      setErrors({});
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setSubject('');
      setDescription('');
      setLocation('');
      setErrors({});
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
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto transition-all duration-200 ${
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Новая заявка</h2>
              <p className="text-sm text-gray-500 mt-0.5">Опишите вашу проблему или запрос</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Тема */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                Тема обращения <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
                placeholder="Кратко опишите суть обращения"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
              )}
            </div>

            {/* Описание */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <MessageSquare className="w-4 h-4 text-green-500" />
                Подробное описание <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white focus:bg-white'
                }`}
                placeholder="Опишите проблему максимально подробно: что произошло, когда, какие шаги предпринимали..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Локация */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 text-orange-500" />
                Локация <span className="text-red-400">*</span>
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

            {/* Информация о пользователе */}
            <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{username}</p>
                <p className="text-xs text-gray-500">Заявка будет создана от вашего имени</p>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Отправить
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
