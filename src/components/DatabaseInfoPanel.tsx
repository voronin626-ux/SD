import { Database, ExternalLink } from 'lucide-react';
import { isDatabaseConfigured } from '../lib/supabase';
import { useState } from 'react';

export function DatabaseInfoPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const isConfigured = isDatabaseConfigured();

  if (isConfigured) {
    return null; // Не показываем в режиме с БД
  }

  return (
    <>
      {/* Кнопка */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 transition-colors"
      >
        <Database className="w-4 h-4" />
        <span>Настроить БД</span>
      </button>

      {/* Модальное окно */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Настройка базы данных</h2>
                      <p className="text-sm text-gray-500">Подключите Supabase для хранения данных</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/60 rounded-xl transition-colors text-gray-500"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Внимание:</strong> Сейчас приложение работает в демо-режиме. 
                    Данные хранятся в браузере и будут потеряны при очистке кэша.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Инструкция по настройке:</h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Создайте проект в Supabase</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Перейдите на{' '}
                          <a
                            href="https://supabase.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            supabase.com <ExternalLink className="w-3 h-3" />
                          </a>
                          {' '}и создайте новый проект
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Создайте таблицы</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Откройте SQL Editor и выполните скрипт из файла{' '}
                          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">supabase/schema.sql</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Получите ключи API</p>
                        <p className="text-sm text-gray-600 mt-1">
                          В Settings → API скопируйте Project URL и anon public key
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Настройте переменные окружения</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Создайте файл <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">.env</code> и добавьте:
                        </p>
                        <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://ваш-проект.supabase.co
VITE_SUPABASE_ANON_KEY=ваш-anon-ключ`}
                        </pre>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        5
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Перезапустите приложение</p>
                        <p className="text-sm text-gray-600 mt-1">
                          После настройки перезапустите dev-сервер
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Совет:</strong> Подробная инструкция доступна в файле{' '}
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-xs">DATABASE_SETUP.md</code>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-100">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
