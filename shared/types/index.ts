// rls-app/shared/types/index.ts

export interface User {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'gestor' | 'funcionario';
  employeeId: string;
  avatarUrl?: string;
  nif?: string;
  entryDate: string;
  isActive: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export interface Expense {
  $id: string;
  userId: string;
  type: 'refeicao' | 'hotel' | 'combustivel' | 'transporte' | 'material' | 'outros';
  amount: number;
  description?: string;
  location?: string;
  placeDetails?: string;
  imageId?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  date: string;
  month: string; // formato: "2025-05"
  currency: string;
  reviewedBy?: string;
  reviewDate?: string;
  rejectionReason?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Message {
  $id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  attachments?: string; // JSON string
  read: boolean;
  timestamp: string;
}

export interface Notification {
  $id: string;
  title: string;
  content: string;
  priority: 'baixa' | 'media' | 'alta';
  targetUsers?: string; // JSON string
  readBy?: string; // JSON string
  date: string;
  expiresAt?: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  employeeId?: string; // Tornando 'employeeId' opcional para o formulário de registro
  phone?: string;
  nif?: string;
}

// Form Types
export interface ExpenseFormData {
  type: Expense['type'];
  amount: number;
  description?: string;
  location?: string;
  placeDetails?: string;
  receiptImage?: File | string;
}

export interface MessageFormData {
  receiverId?: string;
  content: string;
  attachments?: File[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  documents: T[];
  total: number;
}

// File Types
export interface UploadedFile {
  $id: string;
  name: string;
  mimeType: string;
  sizeOriginal: number;
  $createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  totalAmount: number;
  monthlyExpenses: Array<{
    month: string;
    total: number;
    count: number;
  }>;
  expensesByType: Array<{
    type: string;
    total: number;
    count: number;
  }>;
}

// Navigation Types
export interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export interface StackScreenProps {
  route: {
    params?: Record<string, any>;
  };
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    replace: (screen: string, params?: any) => void;
  };
}