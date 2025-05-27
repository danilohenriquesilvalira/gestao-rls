// web-admin/src/pages/expenses/ExpenseDetailPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const ExpenseDetailPage: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Despesa #{id}
      </h1>
      <p className="mt-2 text-gray-600">
        Detalhes da despesa em desenvolvimento...
      </p>
    </div>
  );
};

export default ExpenseDetailPage;