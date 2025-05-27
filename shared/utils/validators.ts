import { z } from 'zod';

// Expense validation schema
export const expenseSchema = z.object({
  type: z.enum(['refeicao', 'hotel', 'combustivel', 'transporte', 'material', 'outros'], {
    required_error: 'Tipo de despesa é obrigatório',
    invalid_type_error: 'Tipo de despesa inválido',
  }),
  amount: z
    .number({
      required_error: 'Valor é obrigatório',
      invalid_type_error: 'Valor deve ser um número',
    })
    .min(0.01, 'Valor deve ser maior que 0')
    .max(10000, 'Valor não pode exceder €10.000'),
  description: z
    .string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional(),
  location: z
    .string()
    .max(200, 'Localização não pode exceder 200 caracteres')
    .optional(),
  placeDetails: z
    .string()
    .max(200, 'Detalhes do local não podem exceder 200 caracteres')
    .optional(),
});

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email('Email inválido')
    .max(150, 'Email não pode exceder 150 caracteres'),
  password: z
    .string({
      required_error: 'Password é obrigatória',
    })
    .min(6, 'Password deve ter pelo menos 6 caracteres')
    .max(50, 'Password não pode exceder 50 caracteres'),
});

// Register validation schema
export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Nome é obrigatório',
    })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email('Email inválido')
    .max(150, 'Email não pode exceder 150 caracteres'),
  password: z
    .string({
      required_error: 'Password é obrigatória',
    })
    .min(8, 'Password deve ter pelo menos 8 caracteres')
    .max(50, 'Password não pode exceder 50 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    ),
  confirmPassword: z
    .string({
      required_error: 'Confirmação de password é obrigatória',
    }),
  employeeId: z
    .string({
      required_error: 'ID do funcionário é obrigatório',
    })
    .min(1, 'ID do funcionário é obrigatório')
    .max(20, 'ID do funcionário não pode exceder 20 caracteres'),
  phone: z
    .string()
    .regex(/^(\+351)?[0-9]{9}$/, 'Número de telefone inválido (formato: +351XXXXXXXXX ou XXXXXXXXX)')
    .optional()
    .or(z.literal('')),
  nif: z
    .string()
    .regex(/^[0-9]{9}$/, 'NIF deve ter 9 dígitos')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords não coincidem',
  path: ['confirmPassword'],
});

// User profile update schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .optional(),
  phone: z
    .string()
    .regex(/^(\+351)?[0-9]{9}$/, 'Número de telefone inválido')
    .optional()
    .or(z.literal('')),
  nif: z
    .string()
    .regex(/^[0-9]{9}$/, 'NIF deve ter 9 dígitos')
    .optional()
    .or(z.literal('')),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({
      required_error: 'Password atual é obrigatória',
    })
    .min(1, 'Password atual é obrigatória'),
  newPassword: z
    .string({
      required_error: 'Nova password é obrigatória',
    })
    .min(8, 'Nova password deve ter pelo menos 8 caracteres')
    .max(50, 'Nova password não pode exceder 50 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Nova password deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    ),
  confirmNewPassword: z
    .string({
      required_error: 'Confirmação da nova password é obrigatória',
    }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Novas passwords não coincidem',
  path: ['confirmNewPassword'],
});

// Message validation schema
export const messageSchema = z.object({
  content: z
    .string({
      required_error: 'Conteúdo da mensagem é obrigatório',
    })
    .min(1, 'Mensagem não pode estar vazia')
    .max(2000, 'Mensagem não pode exceder 2000 caracteres'),
  receiverId: z
    .string()
    .optional(),
});

// Notification validation schema
export const notificationSchema = z.object({
  title: z
    .string({
      required_error: 'Título é obrigatório',
    })
    .min(1, 'Título não pode estar vazio')
    .max(200, 'Título não pode exceder 200 caracteres'),
  content: z
    .string({
      required_error: 'Conteúdo é obrigatório',
    })
    .min(1, 'Conteúdo não pode estar vazio')
    .max(1000, 'Conteúdo não pode exceder 1000 caracteres'),
  priority: z
    .enum(['baixa', 'media', 'alta'], {
      required_error: 'Prioridade é obrigatória',
    })
    .default('media'),
});

// Password recovery schema
export const passwordRecoverySchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email('Email inválido'),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  password: z
    .string({
      required_error: 'Nova password é obrigatória',
    })
    .min(8, 'Password deve ter pelo menos 8 caracteres')
    .max(50, 'Password não pode exceder 50 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    ),
  confirmPassword: z
    .string({
      required_error: 'Confirmação de password é obrigatória',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords não coincidem',
  path: ['confirmPassword'],
});

// Expense review schema (for managers)
export const expenseReviewSchema = z.object({
  status: z.enum(['aprovado', 'rejeitado'], {
    required_error: 'Status é obrigatório',
  }),
  rejectionReason: z
    .string()
    .max(500, 'Motivo não pode exceder 500 caracteres')
    .optional(),
}).refine((data) => {
  if (data.status === 'rejeitado' && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: 'Motivo da rejeição é obrigatório quando rejeitando',
  path: ['rejectionReason'],
});

// File validation utilities
export const fileValidators = {
  // Validate image file
  image: (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Imagem muito grande. Máximo 10MB.' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de imagem inválido. Use JPG ou PNG.' };
    }
    
    return { valid: true };
  },

  // Validate receipt file
  receipt: (file: File) => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 20MB.' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo inválido. Use JPG, PNG ou PDF.' };
    }
    
    return { valid: true };
  },

  // Validate document file
  document: (file: File) => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Documento muito grande. Máximo 20MB.' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de documento inválido. Use PDF, DOC, DOCX, XLS ou XLSX.' };
    }
    
    return { valid: true };
  },
};

// Custom validation functions
export const customValidators = {
  // Validate Portuguese NIF
  nif: (nif: string): boolean => {
    if (!/^[0-9]{9}$/.test(nif)) return false;
    
    const digits = nif.split('').map(Number);
    const checkDigit = digits[8];
    
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * (9 - i);
    }
    
    const remainder = sum % 11;
    const expectedCheckDigit = remainder < 2 ? 0 : 11 - remainder;
    
    return checkDigit === expectedCheckDigit;
  },

  // Validate Portuguese phone number
  phone: (phone: string): boolean => {
    return /^(\+351)?[0-9]{9}$/.test(phone);
  },

  // Validate employee ID format
  employeeId: (id: string): boolean => {
    return /^[A-Z0-9-]{1,20}$/.test(id);
  },

  // Validate amount (positive number with max 2 decimal places)
  amount: (amount: number): boolean => {
    return amount > 0 && Number((amount * 100).toFixed(0)) / 100 === amount;
  },

  // Validate date is not in the future
  notFutureDate: (date: string): boolean => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    return inputDate <= today;
  },

  // Validate date is within last 30 days
  withinLastMonth: (date: string): boolean => {
    const inputDate = new Date(date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return inputDate >= thirtyDaysAgo && inputDate <= new Date();
  },
};