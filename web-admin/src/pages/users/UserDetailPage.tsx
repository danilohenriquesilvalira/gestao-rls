// web-admin/src/pages/users/UserDetailPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const UserDetailPage: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Funcionário #{id}
      </h1>
      <p className="mt-2 text-gray-600">
        Detalhes do funcionário em desenvolvimento...
      </p>
    </div>
  );
};

export default UserDetailPage;
