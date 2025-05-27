// web-admin/src/store/expensesStore.ts - INTEGRAÇÃO REAL APPWRITE
import { create } from 'zustand';
import toast from 'react-hot-toast';

// Import shared services - APIS REAIS DO APPWRITE
import { expensesService } from '../../../shared/services/expenses.service';

// Local types matching shared
interface Expense {
  $id: string;
  userId: string;
  type: 'refeicao' | 'hotel' | 'combustivel' | 'transporte' | 'material' | 'outros';
  description?: string;
  amount: number;
  currency: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  date: string;
  month: string;
  location?: string;
  placeDetails?: string;
  imageId?: string;
  reviewedBy?: string;
  reviewDate?: string;
  rejectionReason?: string;
  $createdAt: string;
  $updatedAt: string;
}

interface DashboardStats {
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  monthlyGrowth: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

interface ExpenseFormData {
  type: Expense['type'];
  description?: string;
  amount: number;
  currency?: string;
  date: string;
  location?: string;
  placeDetails?: string;
}

interface ExpensesState {
  expenses: Expense[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchExpenses: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  approveExpense: (expenseId: string, reviewedBy: string) => Promise<boolean>;
  rejectExpense: (expenseId: string, reviewedBy: string, reason: string) => Promise<boolean>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  createExpense: (data: ExpenseFormData, userId: string) => Promise<boolean>;
  updateExpense: (expenseId: string, data: Partial<ExpenseFormData>) => Promise<boolean>;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('📊 Fetching expenses from Appwrite...');
      
      // USAR API REAL DO APPWRITE
      const result = await expensesService.getAllExpenses();
      
      console.log('📊 Appwrite expenses result:', result);
      
      if (result && Array.isArray(result)) {
        console.log(`✅ Loaded ${result.length} expenses from Appwrite`);
        
        // Mapear para nosso formato se necessário
        const expenses: Expense[] = result.map(expense => ({
          $id: expense.$id,
          userId: expense.userId,
          type: expense.type,
          description: expense.description,
          amount: expense.amount,
          currency: expense.currency || 'EUR',
          status: expense.status,
          date: expense.date,
          month: expense.month,
          location: expense.location,
          placeDetails: expense.placeDetails,
          imageId: expense.imageId,
          reviewedBy: expense.reviewedBy,
          reviewDate: expense.reviewDate,
          rejectionReason: expense.rejectionReason,
          $createdAt: expense.$createdAt,
          $updatedAt: expense.$updatedAt
        }));
        
        set({ expenses, isLoading: false });
      } else {
        console.log('📋 No expenses found in database');
        set({ expenses: [], isLoading: false });
      }
    } catch (error: any) {
      console.error('💥 Appwrite expenses fetch error:', error);
      set({ error: error.message, isLoading: false });
      
      if (error.code === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else {
        toast.error('Erro ao carregar despesas. Verifique sua conexão.');
      }
    }
  },

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('📈 Fetching dashboard stats from Appwrite...');
      
      // USAR API REAL DO APPWRITE
      const result = await expensesService.getDashboardStats();
      
      console.log('📈 Appwrite stats result:', result);
      
      if (result && typeof result === 'object') {
        console.log('✅ Dashboard stats loaded from Appwrite');
        
        const stats: DashboardStats = {
          totalExpenses: result.totalExpenses || 0,
          pendingExpenses: result.pendingExpenses || 0,
          approvedExpenses: result.approvedExpenses || 0,
          rejectedExpenses: result.rejectedExpenses || 0,
          monthlyGrowth: result.monthlyGrowth || 0,
          pendingCount: result.pendingCount || 0,
          approvedCount: result.approvedCount || 0,
          rejectedCount: result.rejectedCount || 0
        };
        
        set({ stats, isLoading: false });
      } else {
        console.log('📊 Computing stats from expenses...');
        
        // Calcular stats a partir das despesas se API não retornar
        const { expenses } = get();
        const stats: DashboardStats = {
          totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
          pendingExpenses: expenses.filter(exp => exp.status === 'pendente').reduce((sum, exp) => sum + exp.amount, 0),
          approvedExpenses: expenses.filter(exp => exp.status === 'aprovado').reduce((sum, exp) => sum + exp.amount, 0),
          rejectedExpenses: expenses.filter(exp => exp.status === 'rejeitado').reduce((sum, exp) => sum + exp.amount, 0),
          monthlyGrowth: 0, // Requires historical data
          pendingCount: expenses.filter(exp => exp.status === 'pendente').length,
          approvedCount: expenses.filter(exp => exp.status === 'aprovado').length,
          rejectedCount: expenses.filter(exp => exp.status === 'rejeitado').length
        };
        
        set({ stats, isLoading: false });
      }
    } catch (error: any) {
      console.error('💥 Appwrite stats fetch error:', error);
      set({ error: error.message, isLoading: false });
      
      // Calcular stats localmente como fallback
      const { expenses } = get();
      const stats: DashboardStats = {
        totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        pendingExpenses: expenses.filter(exp => exp.status === 'pendente').reduce((sum, exp) => sum + exp.amount, 0),
        approvedExpenses: expenses.filter(exp => exp.status === 'aprovado').reduce((sum, exp) => sum + exp.amount, 0),
        rejectedExpenses: expenses.filter(exp => exp.status === 'rejeitado').reduce((sum, exp) => sum + exp.amount, 0),
        monthlyGrowth: 0,
        pendingCount: expenses.filter(exp => exp.status === 'pendente').length,
        approvedCount: expenses.filter(exp => exp.status === 'aprovado').length,
        rejectedCount: expenses.filter(exp => exp.status === 'rejeitado').length
      };
      
      set({ stats, isLoading: false });
      console.log('📊 Using computed stats from local expenses');
    }
  },

  approveExpense: async (expenseId: string, reviewedBy: string) => {
    try {
      console.log(`✅ Approving expense ${expenseId} with Appwrite API...`);
      
      // USAR API REAL DO APPWRITE
      const result = await expensesService.approveExpense(expenseId, reviewedBy);
      
      console.log('✅ Appwrite approve result:', result);
      
      if (result) {
        // Atualizar estado local
        const { expenses } = get();
        const updatedExpenses = expenses.map(expense => 
          expense.$id === expenseId 
            ? { 
                ...expense, 
                status: 'aprovado' as const,
                reviewedBy,
                reviewDate: new Date().toISOString(),
                $updatedAt: new Date().toISOString()
              }
            : expense
        );
        
        set({ expenses: updatedExpenses });
        toast.success('Despesa aprovada com sucesso!');
        
        // Recarregar stats
        get().fetchDashboardStats();
        
        console.log('✅ Expense approved successfully');
        return true;
      } else {
        console.error('❌ Appwrite approve failed');
        toast.error('Erro ao aprovar despesa');
        return false;
      }
    } catch (error: any) {
      console.error('💥 Appwrite approve error:', error);
      
      if (error.code === 401) {
        toast.error('Não autorizado a aprovar despesas');
      } else if (error.code === 404) {
        toast.error('Despesa não encontrada');
      } else {
        toast.error('Erro ao aprovar despesa');
      }
      
      return false;
    }
  },

  rejectExpense: async (expenseId: string, reviewedBy: string, reason: string) => {
    try {
      console.log(`❌ Rejecting expense ${expenseId} with Appwrite API...`);
      
      // USAR API REAL DO APPWRITE
      const result = await expensesService.rejectExpense(expenseId, reviewedBy, reason);
      
      console.log('❌ Appwrite reject result:', result);
      
      if (result) {
        // Atualizar estado local
        const { expenses } = get();
        const updatedExpenses = expenses.map(expense => 
          expense.$id === expenseId 
            ? { 
                ...expense, 
                status: 'rejeitado' as const,
                reviewedBy,
                reviewDate: new Date().toISOString(),
                rejectionReason: reason,
                $updatedAt: new Date().toISOString()
              }
            : expense
        );
        
        set({ expenses: updatedExpenses });
        toast.success('Despesa rejeitada');
        
        // Recarregar stats
        get().fetchDashboardStats();
        
        console.log('✅ Expense rejected successfully');
        return true;
      } else {
        console.error('❌ Appwrite reject failed');
        toast.error('Erro ao rejeitar despesa');
        return false;
      }
    } catch (error: any) {
      console.error('💥 Appwrite reject error:', error);
      
      if (error.code === 401) {
        toast.error('Não autorizado a rejeitar despesas');
      } else if (error.code === 404) {
        toast.error('Despesa não encontrada');
      } else {
        toast.error('Erro ao rejeitar despesa');
      }
      
      return false;
    }
  },

  deleteExpense: async (expenseId: string) => {
    try {
      console.log(`🗑️ Deleting expense ${expenseId} with Appwrite API...`);
      
      // USAR API REAL DO APPWRITE
      const result = await expensesService.deleteExpense(expenseId);
      
      console.log('🗑️ Appwrite delete result:', result);
      
      if (result) {
        // Remover do estado local
        const { expenses } = get();
        const updatedExpenses = expenses.filter(expense => expense.$id !== expenseId);
        
        set({ expenses: updatedExpenses });
        toast.success('Despesa removida com sucesso!');
        
        // Recarregar stats
        get().fetchDashboardStats();
        
        console.log('✅ Expense deleted successfully');
        return true;
      } else {
        console.error('❌ Appwrite delete failed');
        toast.error('Erro ao remover despesa');
        return false;
      }
    } catch (error: any) {
      console.error('💥 Appwrite delete error:', error);
      
      if (error.code === 401) {
        toast.error('Não autorizado a remover despesas');
      } else if (error.code === 404) {
        toast.error('Despesa não encontrada');
      } else {
        toast.error('Erro ao remover despesa');
      }
      
      return false;
    }
  },

  createExpense: async (data: ExpenseFormData, userId: string) => {
    try {
      console.log('📝 Creating expense with Appwrite API...');
      
      const expenseData = {
        ...data,
        userId,
        currency: data.currency || 'EUR',
        month: data.date.substring(0, 7), // YYYY-MM
        status: 'pendente' as const
      };
      
      console.log('📝 Expense data:', expenseData);
      
      // USAR API REAL DO APPWRITE
      const result = await expensesService.createExpense(expenseData);
      
      console.log('📝 Appwrite create result:', result);
      
      if (result && result.$id) {
        // Adicionar ao estado local
        const { expenses } = get();
        const newExpense: Expense = {
          ...result,
          $createdAt: result.$createdAt || new Date().toISOString(),
          $updatedAt: result.$updatedAt || new Date().toISOString()
        };
        
        set({ expenses: [newExpense, ...expenses] });
        toast.success('Despesa criada com sucesso!');
        
        // Recarregar stats
        get().fetchDashboardStats();
        
        console.log('✅ Expense created successfully');
        return true;
      } else {
        console.error('❌ Appwrite create failed - no ID returned');
        toast.error('Erro ao criar despesa');
        return false;
      }
    } catch (error: any) {
      console.error('💥 Appwrite create error:', error);
      
      if (error.code === 401) {
        toast.error('Não autorizado a criar despesas');
      } else if (error.code === 400) {
        toast.error('Dados da despesa são inválidos');
      } else {
        toast.error('Erro ao criar despesa');
      }
      
      return false;
    }
  },

  updateExpense: async (expenseId: string, data: Partial<ExpenseFormData>) => {
    try {
      console.log(`📝 Updating expense ${expenseId} with Appwrite API...`);
      
      // USAR API REAL DO APPWRITE
      const result = await expensesService.updateExpense(expenseId, data);
      
      console.log('📝 Appwrite update result:', result);
      
      if (result) {
        // Atualizar estado local
        const { expenses } = get();
        const updatedExpenses = expenses.map(expense => 
          expense.$id === expenseId 
            ? { 
                ...expense, 
                ...data,
                $updatedAt: new Date().toISOString()
              } 
            : expense
        );
        
        set({ expenses: updatedExpenses });
        toast.success('Despesa atualizada com sucesso!');
        
        console.log('✅ Expense updated successfully');
        return true;
      } else {
        console.error('❌ Appwrite update failed');
        toast.error('Erro ao atualizar despesa');
        return false;
      }
    } catch (error: any) {
      console.error('💥 Appwrite update error:', error);
      
      if (error.code === 401) {
        toast.error('Não autorizado a atualizar despesas');
      } else if (error.code === 404) {
        toast.error('Despesa não encontrada');
      } else {
        toast.error('Erro ao atualizar despesa');
      }
      
      return false;
    }
  },
}));