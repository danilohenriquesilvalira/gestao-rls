import { create } from 'zustand';
import toast from 'react-hot-toast';

// Import shared services - APIS REAIS DO APPWRITE
// Nota: Seu `authService` precisa expor as funcionalidades do Appwrite Client, Account, Databases, ID.
// Vamos assumir que seu 'authService' é a camada de serviço que encapsula isso.
// Se 'authService' é apenas 'account', 'databases', etc., a importação seria direta do appwrite config.
import { account, databases, ID } from '../../../shared/config/appwrite'; // Importe diretamente os clientes do Appwrite
import { COLLECTIONS, DATABASE_ID } from '../../../shared/config/appwrite'; // Importe IDs das coleções

// Import the User type from shared/types/index.ts to ensure consistency
import { User, LoginData, RegisterData as SharedRegisterData } from '../../../shared/types'; // Importe RegisterData do shared/types

// Define RegisterData para o que o formulário de registro envia.
// Ela deve ser consistente com o que o seu componente RegisterPage.tsx está fornecendo.
// Se RegisterPage.tsx não envia phone, nif, employeeId, eles devem ser opcionais aqui.
interface LocalRegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  nif?: string;
  employeeId?: string; // Mantém opcional, será gerado se não fornecido
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: LocalRegisterData) => Promise<boolean>; // Usando LocalRegisterData
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  login: async (data: LoginData) => {
    set({ isLoading: true });
    try {
      console.log('🔐 Attempting login with Appwrite API:', data.email);

      // CORREÇÃO AQUI: Chame diretamente o método do Appwrite Account para login
      // A função createEmailSession do Appwrite SDK retorna um objeto Session
      const session = await account.createEmailSession(data.email, data.password);
      console.log('Appwrite session created:', session);

      // Agora, obtenha os detalhes da conta do usuário logado
      const accountData = await account.get(); // Retorna Models.User<Models.Preferences>
      console.log('Appwrite account data:', accountData);

      // E, finalmente, obtenha o documento do usuário do Database
      const userDocument = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        accountData.$id // O ID do documento é o mesmo que o ID da conta
      );
      console.log('User document from database:', userDocument);

      // Mapear os dados para a sua interface User
      const currentUser: User = {
        $id: userDocument.$id,
        name: userDocument.name,
        email: userDocument.email,
        phone: userDocument.phone || undefined,
        role: userDocument.role as 'admin' | 'gestor' | 'funcionario',
        employeeId: userDocument.employeeId,
        avatarUrl: userDocument.avatarUrl || undefined,
        nif: userDocument.nif || undefined,
        entryDate: userDocument.entryDate,
        isActive: userDocument.isActive,
        $createdAt: userDocument.$createdAt,
        $updatedAt: userDocument.$updatedAt,
      };

      set({ user: currentUser, isLoading: false });
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      toast.success(`Bem-vindo, ${currentUser.name}!`);
      console.log('✅ Login successful with real Appwrite data');
      return true;

    } catch (error: any) {
      console.error('💥 Appwrite login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 401) {
        toast.error('Email ou senha incorretos');
      } else if (error.code === 429) {
        toast.error('Muitas tentativas. Tente novamente em alguns minutos.');
      } else {
        toast.error('Erro ao conectar com servidor. Verifique sua conexão.');
      }

      set({ isLoading: false });
      return false;
    }
  },

  register: async (data: LocalRegisterData) => { // Usando LocalRegisterData para a entrada
    set({ isLoading: true });
    try {
      console.log('📝 Attempting registration for:', data.email);

      // 1. Criar o usuário no Appwrite Auth (Account)
      const createdAccount = await account.create(
        ID.unique(), // Gera um ID único para o usuário de autenticação (Appwrite Account)
        data.email,
        data.password,
        data.name
      );

      console.log('✅ Appwrite Auth user created:', createdAccount);

      // 2. Criar um documento correspondente na coleção 'users' do Database
      // Use o mesmo ID do usuário de autenticação como o ID do documento do banco de dados
      const userDocument = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS, // ID da coleção de usuários
        createdAccount.$id, // Usa o ID do usuário de autenticação como o ID do documento
        {
          name: createdAccount.name,
          email: createdAccount.email,
          phone: data.phone || '', // Usa o telefone fornecido pelo formulário ou vazio
          // !!! DEFINA O ROLE PADRÃO AQUI PARA NOVOS REGISTROS !!!
          // Para registros normais, pode ser 'funcionario'.
          role: 'funcionario', // Valor padrão para novos registros
          employeeId: data.employeeId || ID.unique(), // Usa employeeId fornecido ou gera um único
          nif: data.nif || '', // Usa o NIF fornecido pelo formulário ou vazio
          entryDate: new Date().toISOString().split('T')[0], // Data de hoje no formato YYYY-MM-DD
          isActive: true, // Usuário ativo por padrão
        }
      );

      console.log('✅ User document created in database:', userDocument);

      // Mapear os dados para a sua interface User
      const newUser: User = {
        $id: userDocument.$id,
        name: userDocument.name,
        email: userDocument.email,
        phone: userDocument.phone || undefined,
        role: userDocument.role as 'admin' | 'gestor' | 'funcionario',
        employeeId: userDocument.employeeId,
        avatarUrl: userDocument.avatarUrl || undefined,
        nif: userDocument.nif || undefined,
        entryDate: userDocument.entryDate,
        isActive: userDocument.isActive,
        $createdAt: userDocument.$createdAt,
        $updatedAt: userDocument.$updatedAt,
      };

      // Define o usuário no store e no localStorage
      set({ user: newUser, isLoading: false });
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      toast.success('Conta criada com sucesso!');
      console.log('✅ Registration successful with real Appwrite data');
      return true;

    } catch (error: any) {
      console.error('💥 Appwrite registration error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));

      if (error.code === 409) {
        toast.error('Email já está em uso');
      } else if (error.code === 400) {
        toast.error('Dados inválidos. Verifique email e senha.');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }

      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      console.log('🚪 Attempting logout with Appwrite API');
      await account.deleteSession('current'); // Chama o método do Appwrite SDK para deletar a sessão
      set({ user: null, isLoading: false });
      localStorage.removeItem('currentUser');
      toast.success('Logout realizado com sucesso!');
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('💥 Appwrite logout error:', error);
      set({ user: null, isLoading: false }); // Limpa o estado mesmo em erro
      localStorage.removeItem('currentUser');
      toast.success('Logout realizado!'); // Notifica sucesso mesmo em erro na API (garante limpeza local)
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      console.log('🔍 Checking auth with Appwrite API');
      const accountData = await account.get(); // Obtém a conta autenticada do Appwrite
      console.log('Appwrite account data:', accountData);

      // Se a conta existe, tenta buscar o documento correspondente no banco de dados
      const userDocument = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        accountData.$id // O ID do documento é o mesmo que o ID da conta do Appwrite
      );
      console.log('User document from database:', userDocument);

      const currentUser: User = {
        $id: userDocument.$id,
        name: userDocument.name,
        email: userDocument.email,
        phone: userDocument.phone || undefined,
        role: userDocument.role as 'admin' | 'gestor' | 'funcionario',
        employeeId: userDocument.employeeId,
        avatarUrl: userDocument.avatarUrl || undefined,
        nif: userDocument.nif || undefined,
        entryDate: userDocument.entryDate,
        isActive: userDocument.isActive,
        $createdAt: userDocument.$createdAt,
        $updatedAt: userDocument.$updatedAt,
      };

      set({ user: currentUser, isLoading: false });
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      console.log('✅ Auth check successful - user logged in');
    } catch (error: any) {
      console.error('💥 Appwrite auth check error:', error);
      // Se não há sessão (401) ou o documento não existe (404), tratamos como não autenticado
      if (error.code === 401 || error.code === 404) {
        console.log('📤 User not authenticated or document missing (expected)');
      } else {
        console.error('Unhandled error during auth check:', error);
      }
      set({ user: null, isLoading: false });
      localStorage.removeItem('currentUser');
    }
  },

  updateProfile: async (data: Partial<User>) => {
    const { user } = get();
    if (!user) {
      toast.error('Nenhum usuário logado para atualizar o perfil.');
      return false;
    }

    try {
      console.log('👤 Updating profile with Appwrite API');

      // Atualiza o nome na conta de autenticação do Appwrite, se fornecido
      if (data.name && data.name !== user.name) {
        await account.updateName(data.name);
        console.log('Account name updated in Appwrite Auth.');
      }
      // Se precisar atualizar email:
      // if (data.email && data.email !== user.email) {
      //   await account.updateEmail(data.email); // Isso geralmente requer verificação de email!
      //   console.log('Account email updated in Appwrite Auth.');
      // }


      // Atualiza o documento do usuário no banco de dados
      const updatedDocument = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        user.$id, // ID do documento é o mesmo que o ID da conta
        data // Os dados parciais a serem atualizados
      );

      console.log('📊 Appwrite update profile result:', updatedDocument);

      const updatedUser: User = {
        ...user, // Mantém os campos que não foram atualizados
        ...updatedDocument, // Sobrescreve os campos atualizados pelo documento
        $updatedAt: updatedDocument.$updatedAt // Garante que a data de atualização seja do Appwrite
      };

      set({ user: updatedUser });
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      toast.success('Perfil atualizado com sucesso!');
      console.log('✅ Profile updated successfully');
      return true;

    } catch (error: any) {
      console.error('💥 Appwrite profile update error:', error);
      toast.error('Erro ao atualizar perfil: ' + (error.message || 'Erro desconhecido.'));
      return false;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      console.log('🔒 Changing password with Appwrite API');
      await account.updatePassword(newPassword, currentPassword); // Chama o método do Appwrite SDK
      toast.success('Senha alterada com sucesso!');
      console.log('✅ Password changed successfully');
      return true;
    } catch (error: any) {
      console.error('💥 Appwrite password change error:', error);

      if (error.code === 401) {
        toast.error('Senha atual incorreta');
      } else if (error.code === 400) {
        toast.error('Nova senha é muito fraca ou inválida.');
      } else {
        toast.error('Erro ao alterar senha.');
      }
      return false;
    }
  },
}));