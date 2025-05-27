// web-admin/src/pages/notifications/NotificationsPage.tsx
import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
        <p className="mt-2 text-sm text-gray-700">
          Central de notificações do sistema
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 text-center text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Notificações
          </h3>
          <p>Funcionalidade em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;