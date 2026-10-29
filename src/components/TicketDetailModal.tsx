import { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  FileText,
  MessageSquare,
  User,
  Tag,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import { Ticket, Comment, Attachment, Priority, TicketStatus } from '../types';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (ticketId: string, text: string, attachments: Attachment[]) => Promise<void>;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  currentUser: { id: string; fullName: string };
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Низкий', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  medium: { label: 'Средний', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  high: { label: 'Высокий', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  critical: { label: 'Критический', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
};

const statusConfig: Record<TicketStatus, { label: string; color: string; bgColor: string; icon: typeof AlertCircle }> = {
  new: { label: 'Новая', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: AlertCircle },
  in_progress: { label: 'В работе', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', icon: Clock },
  resolved: { label: 'Решена', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle2 },
  closed: { label: 'Закрыта', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200', icon: CheckCircle2 },
};

const locationLabels: Record<string, string> = {
  'МОФ': 'Московский офис',
  'РОП': 'Ростовский офис',
  'ЗОП': 'Зональный офис',
  'КОП': 'Корпоративный офис',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function TicketDetailModal({
  ticket,
  isOpen,
  onClose,
  onAddComment,
  onUpdateStatus,
  currentUser,
}: TicketDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Сброс формы при открытии новой заявки
    setCommentText('');
    setAttachments([]);
  }, [ticket?.id]);

  if (!isOpen || !ticket) return null;

  const priority = priorityConfig[ticket.priority];
  const status = statusConfig[ticket.status];
  const StatusIcon = status.icon;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > MAX_FILE_SIZE) {
        alert(`Файл "${file.name}" слишком большой. Максимум 5 МБ.`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        alert(`Файл "${file.name}" не является изображением.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          url: event.target?.result as string,
          size: file.size,
          createdAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    }

    // Сброс input для возможности повторной загрузки того же файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() && attachments.length === 0) {
      alert('Введите текст комментария или прикрепите изображение');
      return;
    }

    if (!ticket.id) return;

    setIsSubmitting(true);
    try {
      await onAddComment(ticket.id, commentText, attachments);
      setCommentText('');
      setAttachments([]);
    } catch (error) {
      console.error('Ошибка отправки комментария:', error);
      alert('Ошибка при отправке комментария');
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

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
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl pointer-events-auto max-h-[92vh] overflow-hidden flex flex-col transition-all duration-200 ${
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-500">#{ticket.ticketNumber || ticket.id}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.bgColor} ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priority.bgColor} ${priority.color}`}>
                    {priority.label}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-800 truncate mt-1">{ticket.subject}</h2>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/60 rounded-xl transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Main Info */}
              <div className="lg:col-span-2 p-6 space-y-5 border-r border-gray-100">
                {/* Описание */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    Описание проблемы
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>

                {/* Вложения заявки */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-purple-500" />
                      Вложения ({ticket.attachments.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ticket.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="relative group bg-gray-50 rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                          onClick={() => setPreviewImage(att)}
                        >
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Комментарии */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    Комментарии ({ticket.comments?.length || 0})
                  </h3>
                  
                  <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                    {(!ticket.comments || ticket.comments.length === 0) && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        Комментариев пока нет. Будьте первым!
                      </div>
                    )}
                    {ticket.comments?.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">
                              {comment.authorName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-800">
                                {comment.authorName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {comment.text}
                            </p>
                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {comment.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    className="relative group bg-white rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                                    onClick={() => setPreviewImage(att)}
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      className="w-full h-20 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                      <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Форма добавления комментария */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={3}
                      placeholder="Напишите комментарий... (Enter — отправить, Shift+Enter — новая строка)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-white text-sm"
                    />
                    
                    {/* Прикреплённые файлы */}
                    {attachments.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {attachments.map((att) => (
                          <div key={att.id} className="relative group">
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-16 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => removeAttachment(att.id)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {att.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="comment-file-input"
                      />
                      <label
                        htmlFor="comment-file-input"
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                        title="Прикрепить изображение"
                      >
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        <span>Фото</span>
                      </label>
                      <div className="flex-1"></div>
                      <button
                        onClick={handleSubmitComment}
                        disabled={isSubmitting || (!commentText.trim() && attachments.length === 0)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        Отправить
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="p-6 space-y-4 bg-gray-50/50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Информация</h3>

                {/* Статус */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Статус</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => {
                      if (ticket.id) {
                        onUpdateStatus(ticket.id, e.target.value as TicketStatus);
                      }
                    }}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="new">Новая</option>
                    <option value="in_progress">В работе</option>
                    <option value="resolved">Решена</option>
                    <option value="closed">Закрыта</option>
                  </select>
                </div>

                {/* Тип */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Тип</label>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {ticket.type === 'incident' ? '🔴 Инцидент' : '🔵 Запрос услуги'}
                  </p>
                </div>

                {/* Категория */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Категория
                  </label>
                  <p className="mt-1 text-sm font-medium text-gray-800">{ticket.category}</p>
                </div>

                {/* Локация */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Локация
                  </label>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {locationLabels[ticket.location] || ticket.location}
                  </p>
                </div>

                {/* Инженер */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Инженер
                  </label>
                  <p className="mt-1 text-sm font-medium text-gray-800">{ticket.engineer}</p>
                </div>

                {/* Заявитель */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Заявитель
                  </label>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {ticket.createdByName || 'Пользователь'}
                  </p>
                </div>

                {/* Крайний срок */}
                {ticket.deadline && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Крайний срок
                    </label>
                    <p className="mt-1 text-sm font-medium text-amber-700">
                      {formatDate(ticket.deadline)}
                    </p>
                  </div>
                )}

                {/* Даты */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Создана
                  </label>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(ticket.createdAt)}</p>
                </div>

                {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Обновлена
                    </label>
                    <p className="mt-1 text-sm text-gray-700">{formatDate(ticket.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Image Modal */}
      {previewImage && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <div className="relative pointer-events-auto max-w-5xl max-h-[90vh]">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
                <p className="text-white text-sm font-medium">{previewImage.name}</p>
                <p className="text-white/70 text-xs">{formatFileSize(previewImage.size)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
