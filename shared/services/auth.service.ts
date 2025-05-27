import { ID } from 'appwrite';
import { account, databases, DATABASE_ID, COLLECTIONS } from '../config/appwrite';
import type { User, LoginData, RegisterData } from '../types';

export const authService = {
  // Login with email and password
  async login(email: string, password: string) {
    try {
      // 1. Fazer login na autenticação
      const session = await account.createEmailSession(email, password);
      
      try {
        // 2. Tentar obter o usuário atual
        const user = await this.getCurrentUser();
        return { session, user };
      } catch (error) {
        // 3. Se falhar em obter o usuário, pode ser porque o documento não existe
        // Vamos criar o documento do usuário
        console.log('⚠️ Documento do usuário não encontrado, criando agora...');
        
        // Obter dados da conta de autenticação
        const accountData = await account.get();
        
        // Gerar valores para campos obrigatórios
        const now = new Date().toISOString();
        const employeeId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
        
        // Criar documento com campos obrigatórios
        const userDoc = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          accountData.$id, // Usar o ID da conta como ID do documento
          {
            name: accountData.name,
            email: accountData.email,
            role: 'funcionario',
            employeeId: employeeId,
            entryDate: now,
            createdAt: now,
            updatedAt: now,
            isActive: true,
            phone: "",
            nif: "",
            avatarUrl: ""
          }
        );
        
        console.log('✅ Documento do usuário criado com sucesso');
        return { session, user: userDoc as unknown as User };
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  async register(userData: RegisterData) {
    try {
      // Create account
      const { email, password, name } = userData;
      const userAccount = await account.create(ID.unique(), email, password, name);
      
      // Gerar valores para TODOS os campos obrigatórios
      const now = new Date().toISOString();
      const employeeId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create user document with ALL required fields
      const userDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userAccount.$id,
        {
          name: name,
          email: email,
          role: 'funcionario',        // Campo obrigatório
          employeeId: employeeId,     // Campo obrigatório
          entryDate: now,             // Campo obrigatório
          createdAt: now,             // Campo obrigatório
          updatedAt: now,             // Campo obrigatório
          isActive: true,             // Campo obrigatório
          // Campos opcionais se existirem
          phone: "",
          nif: "",
          avatarUrl: ""
        }
      );

      // Login user after registration
      const session = await account.createEmailSession(email, password);
      
      return { account: userAccount, user: userDoc as unknown as User, session };
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  // Get current authenticated user
  async getCurrentUser(): Promise<User | null> {
    try {
      const accountData = await account.get();
      
      try {
        // Tentar obter documento do usuário
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          accountData.$id
        );
        return userDoc as unknown as User;
      } catch (docError) {
        // Se o documento não existir, criar um novo
        console.log('⚠️ Documento do usuário não encontrado no getCurrentUser, criando agora...');
        
        // Gerar valores para campos obrigatórios
        const now = new Date().toISOString();
        const employeeId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
        
        // Criar documento com campos obrigatórios
        const newUserDoc = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          accountData.$id, // Usar o ID da conta como ID do documento
          {
            name: accountData.name,
            email: accountData.email,
            role: 'funcionario',
            employeeId: employeeId,
            entryDate: now,
            createdAt: now,
            updatedAt: now,
            isActive: true,
            phone: "",
            nif: "",
            avatarUrl: ""
          }
        );
        
        console.log('✅ Documento do usuário criado com sucesso no getCurrentUser');
        return newUserDoc as unknown as User;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Get current session
  async getCurrentSession() {
    try {
      return await account.getSession('current');
    } catch (error) {
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, data: Partial<User>) {
    try {
      // Garante que updatedAt seja atualizado
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        updatedData
      );
      return updatedUser as unknown as User;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(newPassword: string, currentPassword?: string) {
    try {
      await account.updatePassword(newPassword, currentPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Send password recovery email
  async recoverPassword(email: string) {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
    } catch (error) {
      console.error('Password recovery error:', error);
      throw error;
    }
  },

  // Complete password recovery
  async completePasswordRecovery(userId: string, secret: string, password: string) {
    try {
      await account.updateRecovery(userId, secret, password, password);
    } catch (error) {
      console.error('Complete password recovery error:', error);
      throw error;
    }
  },

  // Logout current session
  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Logout from all sessions
  async logoutFromAllSessions() {
    try {
      await account.deleteSessions();
    } catch (error) {
      console.error('Logout all sessions error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      await account.get();
      return true;
    } catch {
      return false;
    }
  },
};