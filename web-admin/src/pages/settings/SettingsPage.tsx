// web-admin/src/pages/settings/SettingsPage.tsx
import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-sm text-gray-700">
          Configurações gerais do sistema
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 text-center text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Configurações do Sistema
          </h3>
          <p>Funcionalidade em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;