import { ID, Query } from 'appwrite';
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKET_ID } from '../config/appwrite';
import type { Expense, ExpenseFormData, DashboardStats } from '../types';

export const expensesService = {
  // Create new expense
  async createExpense(data: ExpenseFormData & { userId: string }) {
    try {
      const expenseData = {
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        description: data.description || '',
        location: data.location || '',
        placeDetails: data.placeDetails || '',
        status: 'pendente' as const,
        date: new Date().toISOString(),
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        currency: 'EUR',
      };

      const expense = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        ID.unique(),
        expenseData
      );

      return expense as unknown as Expense;
    } catch (error) {
      console.error('Create expense error:', error);
      throw error;
    }
  },

  // Upload receipt image and attach to expense
  async uploadReceipt(expenseId: string, file: File) {
    try {
      // Upload file to storage
      const uploadResponse = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file
      );

      // Update expense with image ID
      const updatedExpense = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        expenseId,
        { imageId: uploadResponse.$id }
      );

      return updatedExpense as unknown as Expense;
    } catch (error) {
      console.error('Upload receipt error:', error);
      throw error;
    }
  },

  // Get user expenses
  async getUserExpenses(userId: string, limit?: number) {
    try {
      const queries = [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ];

      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        queries
      );

      return response.documents as unknown as Expense[];
    } catch (error) {
      console.error('Get user expenses error:', error);
      throw error;
    }
  },

  // Get all expenses (for admins)
  async getAllExpenses(limit?: number, status?: string) {
    try {
      const queries = [Query.orderDesc('$createdAt')];

      if (status) {
        queries.push(Query.equal('status', status));
      }

      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        queries
      );

      return response.documents as unknown as Expense[];
    } catch (error) {
      console.error('Get all expenses error:', error);
      throw error;
    }
  },

  // Get expenses by month
  async getExpensesByMonth(userId: string, month: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        [
          Query.equal('userId', userId),
          Query.equal('month', month),
          Query.orderDesc('$createdAt')
        ]
      );

      return response.documents as unknown as Expense[];
    } catch (error) {
      console.error('Get expenses by month error:', error);
      throw error;
    }
  },

  // Get single expense
  async getExpense(expenseId: string) {
    try {
      const expense = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        expenseId
      );

      return expense as unknown as Expense;
    } catch (error) {
      console.error('Get expense error:', error);
      throw error;
    }
  },

  // Update expense
  async updateExpense(expenseId: string, data: Partial<Expense>) {
    try {
      const updatedExpense = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        expenseId,
        data
      );

      return updatedExpense as unknown as Expense;
    } catch (error) {
      console.error('Update expense error:', error);
      throw error;
    }
  },

  // Approve expense (for managers)
  async approveExpense(expenseId: string, reviewedBy: string) {
    try {
      const updatedExpense = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        expenseId,
        {
          status: 'aprovado',
          reviewedBy,
          reviewDate: new Date().toISOString(),
          rejectionReason: null,
        }
      );

      return updatedExpense as unknown as Expense;
    } catch (error) {
      console.error('Approve expense error:', error);
      throw error;
    }
  },

  // Reject expense (for managers)
  async rejectExpense(expenseId: string, reviewedBy: string, reason: string) {
    try {
      const updatedExpense = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        expenseId,
        {
          status: 'rejeitado',
          reviewedBy,
          reviewDate: new Date().toISOString(),
          rejectionReason: reason,
        }
      );

      return updatedExpense as unknown as Expense;
    } catch (error) {
      console.error('Reject expense error:', error);
      throw error;
    }
  },

  // Delete expense
  async deleteExpense(expenseId: string) {
    try {
      // Get expense to check if it has an image
      const expense = await this.getExpense(expenseId);

      // Delete image if exists
      if (expense.imageId) {
        try {
          await storage.deleteFile(BUCKET_ID, expense.imageId);
        } catch (error) {
          console.warn('Could not delete image:', error);
        }
      }

      // Delete expense document
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        expenseId
      );

      return true;
    } catch (error) {
      console.error('Delete expense error:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  async getDashboardStats(userId?: string): Promise<DashboardStats> {
    try {
      const queries = userId ? [Query.equal('userId', userId)] : [];

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        queries
      );

      const expenses = response.documents as unknown as Expense[];

      // Calculate statistics
      const stats: DashboardStats = {
        totalExpenses: expenses.length,
        pendingExpenses: expenses.filter(e => e.status === 'pendente').length,
        approvedExpenses: expenses.filter(e => e.status === 'aprovado').length,
        rejectedExpenses: expenses.filter(e => e.status === 'rejeitado').length,
        totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
        monthlyExpenses: [],
        expensesByType: [],
      };

      // Group by month
      const monthlyMap = new Map();
      expenses.forEach(expense => {
        const month = expense.month;
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { total: 0, count: 0 });
        }
        const monthData = monthlyMap.get(month);
        monthData.total += expense.amount;
        monthData.count += 1;
      });

      stats.monthlyExpenses = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        total: data.total,
        count: data.count,
      }));

      // Group by type
      const typeMap = new Map();
      expenses.forEach(expense => {
        const type = expense.type;
        if (!typeMap.has(type)) {
          typeMap.set(type, { total: 0, count: 0 });
        }
        const typeData = typeMap.get(type);
        typeData.total += expense.amount;
        typeData.count += 1;
      });

      stats.expensesByType = Array.from(typeMap.entries()).map(([type, data]) => ({
        type,
        total: data.total,
        count: data.count,
      }));

      return stats;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },
};