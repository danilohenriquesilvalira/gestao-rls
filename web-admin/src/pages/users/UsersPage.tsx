// web-admin/src/pages/users/UsersPage.tsx
import React from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestão de funcionários e permissões
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button icon={<Plus className="h-4 w-4" />}>
            Novo Funcionário
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 text-center text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Gestão de Funcionários
          </h3>
          <p>Funcionalidade em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;