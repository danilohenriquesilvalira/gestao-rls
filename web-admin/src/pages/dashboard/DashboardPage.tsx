// web-admin/src/pages/dashboard/DashboardPage.tsx - CORRIGIDO SEM ERROS
import React, { useEffect } from 'react';
import { 
  Receipt, 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Euro,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useExpensesStore } from '../../store/expensesStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';

// Simple formatters (to avoid import issues)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDateTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

const formatRelativeTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Há alguns minutos';
  if (diffHours < 24) return `Há ${diffHours} horas`;
  if (diffDays === 1) return 'Ontem';
  return `Há ${diffDays} dias`;
};

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    stats, 
    expenses, 
    isLoading, 
    fetchDashboardStats, 
    fetchExpenses 
  } = useExpensesStore();

  useEffect(() => {
    // Load dashboard data on mount
    const loadDashboardData = async () => {
      console.log('🏠 Loading dashboard data...');
      await Promise.all([
        fetchDashboardStats(),
        fetchExpenses()
      ]);
    };

    loadDashboardData();
  }, [fetchDashboardStats, fetchExpenses]);

  const handleRefresh = async () => {
    console.log('🔄 Refreshing dashboard...');
    await Promise.all([
      fetchDashboardStats(),
      fetchExpenses()
    ]);
  };

  const isAdmin = user?.role === 'admin';
  const isGestor = user?.role === 'gestor' || user?.role === 'admin';

  // Calculate recent expenses data
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
    .slice(0, 5);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Bem-vindo de volta, {user?.name}! Aqui está o resumo de hoje.
          </p>
        </div>
        <div className="mt-4 flex items-center space-x-3 md:mt-0 md:ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={isLoading}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Atualizar
          </Button>
          <span className="text-sm text-gray-500">
            {formatDateTime(new Date())}
          </span>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Expenses */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Euro className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Despesas
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats ? formatCurrency(stats.totalExpenses) : '€0,00'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{stats?.monthlyGrowth || 0}%
              </span>
              <span className="text-gray-500 ml-2">este mês</span>
            </div>
          </div>
        </div>

        {/* Pending Expenses */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pendentes
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats ? formatCurrency(stats.pendingExpenses) : '€0,00'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-yellow-600 font-medium">
                {stats?.pendingCount || 0} despesas
              </span>
              <span className="text-gray-500 ml-2">aguardando aprovação</span>
            </div>
          </div>
        </div>

        {/* Approved Expenses */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Aprovadas
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats ? formatCurrency(stats.approvedExpenses) : '€0,00'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">
                {stats?.approvedCount || 0} despesas
              </span>
              <span className="text-gray-500 ml-2">aprovadas</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sistema
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {expenses.length > 0 && expenses[0].$id.includes('mock') ? 'Demo' : 'Prod'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-blue-600 font-medium">
                {expenses.length} registros
              </span>
              <span className="text-gray-500 ml-2">carregados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Despesas Recentes
            </h3>
            {isLoading && (
              <LoadingSpinner size="sm" />
            )}
          </div>
          <div className="p-6">
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.$id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        expense.status === 'pendente' ? 'bg-yellow-400' :
                        expense.status === 'aprovado' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {expense.type.charAt(0).toUpperCase() + expense.type.slice(1)} - {expense.description || 'Sem descrição'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(expense.$createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Receipt className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma despesa encontrada</p>
              </div>
            )}
            
            <div className="mt-6">
              <a
                href="/expenses"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Ver todas as despesas →
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Ações Rápidas
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <a
                href="/expenses"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Receipt className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Gerir Despesas
                  </p>
                  <p className="text-xs text-gray-500">
                    Aprovar ou rejeitar despesas pendentes
                  </p>
                </div>
              </a>

              {isGestor && (
                <a
                  href="/users"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Gerir Funcionários
                    </p>
                    <p className="text-xs text-gray-500">
                      Adicionar ou editar funcionários
                    </p>
                  </div>
                </a>
              )}

              <a
                href="/messages"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Enviar Comunicado
                  </p>
                  <p className="text-xs text-gray-500">
                    Comunicar com a equipe
                  </p>
                </div>
              </a>

              <a
                href="/reports"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Relatório Mensal
                  </p>
                  <p className="text-xs text-gray-500">
                    Gerar relatório do mês atual
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`border rounded-lg p-4 ${
        expenses.length > 0 && expenses[0].$id.includes('mock') 
          ? 'bg-orange-50 border-orange-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertCircle className={`h-5 w-5 ${
              expenses.length > 0 && expenses[0].$id.includes('mock') 
                ? 'text-orange-600' 
                : 'text-green-600'
            }`} />
          </div>
          <div className="ml-3">
            <p className={`text-sm ${
              expenses.length > 0 && expenses[0].$id.includes('mock') 
                ? 'text-orange-800' 
                : 'text-green-800'
            }`}>
              <span className="font-medium">Status do Sistema:</span> 
              {expenses.length > 0 && expenses[0].$id.includes('mock') 
                ? ' Modo Demonstração 🔧' 
                : ' Conectado ao Appwrite ✅'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;