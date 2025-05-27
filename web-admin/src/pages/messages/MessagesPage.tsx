// web-admin/src/pages/messages/MessagesPage.tsx
import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const MessagesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comunicação com a equipe
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button icon={<Send className="h-4 w-4" />}>
            Nova Mensagem
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 text-center text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sistema de Mensagens
          </h3>
          <p>Funcionalidade em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;