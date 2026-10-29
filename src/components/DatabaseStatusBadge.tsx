import { isDatabaseConfigured } from '../lib/supabase';

export function DatabaseStatusBadge() {
  const isConfigured = isDatabaseConfigured();

  if (isConfigured) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>База данных подключена</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
        <span>Демо-режим (localStorage)</span>
      </div>
    </div>
  );
}
