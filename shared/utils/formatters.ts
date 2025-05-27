export const formatters = {
  // Format currency in EUR
  currency(amount: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Format date in Portuguese format
  date(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  },

  // Format datetime in Portuguese format
  datetime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  },

  // Format time only
  time(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  },

  // Format month (YYYY-MM to readable format)
  month(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return new Intl.DateTimeFormat('pt-PT', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  },

  // Format month short (YYYY-MM to short format)
  monthShort(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return new Intl.DateTimeFormat('pt-PT', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  },

  // Format relative time (e.g., "há 2 horas", "ontem")
  relativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Há ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      if (days === 1) return 'Ontem';
      return `Há ${days} dias`;
    } else {
      return this.date(dateObj);
    }
  },

  // Format file size
  fileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format phone number (Portuguese format)
  phone(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as +351 XXX XXX XXX
    if (cleaned.length === 9) {
      return `+351 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('351')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    
    return phone; // Return original if can't format
  },

  // Format NIF (Portuguese tax number)
  nif(nif: string): string {
    if (!nif) return '';
    
    const cleaned = nif.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    return nif;
  },

  // Format employee ID
  employeeId(id: string): string {
    if (!id) return '';
    
    // Format as RLS-XXXX
    if (id.length <= 4 && /^\d+$/.test(id)) {
      return `RLS-${id.padStart(4, '0')}`;
    }
    
    return id;
  },

  // Format percentage
  percentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  },

  // Format number with thousands separator
  number(num: number): string {
    return new Intl.NumberFormat('pt-PT').format(num);
  },

  // Capitalize first letter
  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Format full name (capitalize each word)
  fullName(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  },

  // Truncate text with ellipsis
  truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },

  // Format status badge text
  statusBadge(status: string): string {
    const statusMap: Record<string, string> = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      rejeitado: 'Rejeitado',
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      admin: 'Administrador',
      gestor: 'Gestor',
      funcionario: 'Funcionário',
    };

    return statusMap[status] || this.capitalize(status);
  },

  // Format address (if needed in the future)
  address(address: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }): string {
    const parts = [
      address.street,
      address.city,
      address.postalCode,
      address.country
    ].filter(Boolean);

    return parts.join(', ');
  },

  // Format expense type for display
  expenseType(type: string): string {
    const typeMap: Record<string, string> = {
      refeicao: 'Refeição',
      hotel: 'Hotel',
      combustivel: 'Combustível',
      transporte: 'Transporte',
      material: 'Material',
      outros: 'Outros',
    };

    return typeMap[type] || this.capitalize(type);
  },

  // Format boolean to Portuguese
  boolean(value: boolean): string {
    return value ? 'Sim' : 'Não';
  },

  // Format array to readable list
  list(items: string[], conjunction: string = 'e'): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(` ${conjunction} `);
    
    const lastItem = items.pop();
    return `${items.join(', ')} ${conjunction} ${lastItem}`;
  },
};