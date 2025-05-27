// Export all formatters
export * from './formatters';

// Export all validators
export * from './validators';

// Additional utility functions
export const utils = {
  // Generate unique ID (simple version)
  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  },

  // Sleep/delay function
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Deep clone object
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  },

  // Check if object is empty
  isEmpty(obj: any): boolean {
    if (obj == null) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    if (typeof obj === 'string') return obj.trim().length === 0;
    return false;
  },

  // Get current month in YYYY-MM format
  getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7);
  },

  // Get current year
  getCurrentYear(): number {
    return new Date().getFullYear();
  },

  // Generate month options for dropdowns
  getMonthOptions(yearRange: number = 2): Array<{ value: string; label: string }> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const options: Array<{ value: string; label: string }> = [];

    for (let year = currentYear; year >= currentYear - yearRange; year--) {
      const maxMonth = year === currentYear ? currentMonth : 11;
      
      for (let month = maxMonth; month >= 0; month--) {
        const monthStr = (month + 1).toString().padStart(2, '0');
        const value = `${year}-${monthStr}`;
        const date = new Date(year, month);
        const label = new Intl.DateTimeFormat('pt-PT', {
          month: 'long',
          year: 'numeric'
        }).format(date);
        
        options.push({ value, label });
      }
    }

    return options;
  },

  // Convert file to base64
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  },

  // Download file from URL
  downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Copy text to clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  },

  // Debounce function
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Calculate pagination
  getPaginationInfo(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    
    return {
      page,
      limit,
      total,
      totalPages,
      startIndex,
      endIndex,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },

  // Group array by key
  groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Sort array by multiple criteria
  sortBy<T>(array: T[], ...criteria: Array<keyof T | ((item: T) => any)>): T[] {
    return [...array].sort((a, b) => {
      for (const criterion of criteria) {
        const aVal = typeof criterion === 'function' ? criterion(a) : a[criterion];
        const bVal = typeof criterion === 'function' ? criterion(b) : b[criterion];
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      }
      return 0;
    });
  },

  // Remove duplicates from array
  unique<T>(array: T[], key?: keyof T): T[] {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return false;
      }
      seen.add(keyValue);
      return true;
    });
  },

  // Calculate percentage
  percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  // Format error message
  formatError(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'Ocorreu um erro inesperado';
  },

  // Validate URL
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Get file extension
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  // Check if running on mobile
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  // Get platform info
  getPlatform(): 'web' | 'mobile' {
    return typeof window !== 'undefined' && window.navigator 
      ? (this.isMobile() ? 'mobile' : 'web')
      : 'web';
  },

  // Local storage helpers (with error handling)
  storage: {
    get(key: string, defaultValue: any = null): any {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },

    set(key: string, value: any): boolean {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove(key: string): boolean {
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },

    clear(): boolean {
      try {
        localStorage.clear();
        return true;
      } catch {
        return false;
      }
    },
  },
};