export const APP_CONFIG = {
  name: 'RLS Automação',
  version: '1.0.0',
  company: 'RLS Automação Industrial',
  country: 'Portugal',
  currency: 'EUR',
  locale: 'pt-PT',
};

export const EXPENSE_TYPES = {
  refeicao: 'Refeição',
  hotel: 'Hotel',
  combustivel: 'Combustível',
  transporte: 'Transporte',
  material: 'Material',
  outros: 'Outros',
} as const;

export const EXPENSE_STATUS = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
} as const;

export const USER_ROLES = {
  admin: 'Administrador',
  gestor: 'Gestor',
  funcionario: 'Funcionário',
} as const;

export const PRIORITY_LEVELS = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
} as const;

export const FILE_UPLOAD = {
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
} as const;

export const ROUTES = {
  // Mobile routes
  MOBILE: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    HOME: 'Home',
    EXPENSES: 'Expenses',
    ADD_EXPENSE: 'AddExpense',
    EXPENSE_DETAIL: 'ExpenseDetail',
    PROFILE: 'Profile',
    MESSAGES: 'Messages',
    NOTIFICATIONS: 'Notifications',
  },
  // Web routes
  WEB: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    EXPENSES: '/expenses',
    USERS: '/users',
    MESSAGES: '/messages',
    REPORTS: '/reports',
    SETTINGS: '/settings',
  },
} as const;