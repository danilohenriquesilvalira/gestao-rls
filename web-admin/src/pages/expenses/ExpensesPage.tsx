// web-admin/src/pages/expenses/ExpensesPage.tsx
import React from 'react';
import { Receipt, Filter, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const ExpensesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as despesas submetidas pelos funcionários
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
            Filtros
          </Button>
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Exportar
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 text-center text-gray-500">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Gestão de Despesas
          </h3>
          <p>Funcionalidade em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;