import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// Local login schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  // REMOVIDO: const [loginAttempts, setLoginAttempts] = React.useState(0);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  // Função para preencher dados de teste
  const fillTestAccount = (email: string) => {
    setValue('email', email);
    setValue('password', 'Senha@123456');   // Senha segura
  };

  const onSubmit = async (data: LoginFormData) => {
    console.log('🔐 Tentativa de login:', { email: data.email, timestamp: new Date().toISOString() });
    // REMOVIDO: setLoginAttempts(prev => prev + 1);

    const success = await login(data);
    if (success) {
      console.log('✅ Login bem-sucedido, redirecionando para:', from);
      navigate(from, { replace: true });
    } else {
      console.log('❌ Login falhou.'); // Mensagem mais genérica
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Entrar na sua conta
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sistema de Gestão de Despesas - RLS Automação
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Status: Conectado ao Appwrite Real ✅
            </p>
            <p className="text-xs text-blue-700">
              Se ainda não criou uma conta, use o botão de registro primeiro
            </p>
          </div>
        </div>
      </div>

      {/* Quick Login Options */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-900 mb-3">
          Contas de Teste (se já criadas):
        </h3>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillTestAccount('ramiro@rls.com.pt')}
            className="w-full text-left justify-start"
          >
            <User className="h-4 w-4 mr-2" />
            Ramiro Silva (ramiro@rls.com.pt)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillTestAccount('carla@rls.com.pt')}
            className="w-full text-left justify-start"
          >
            <User className="h-4 w-4 mr-2" />
            Carla Santos (carla@rls.com.pt)
          </Button>
        </div>
        <p className="text-xs text-green-700 mt-2">
          * Senha padrão: Senha@123456 | Clique para preencher automaticamente
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div>
          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              placeholder="Digite sua senha"
              error={errors.password?.message}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Remember & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
              Lembrar de mim
            </label>
          </div>

          <div className="text-sm">
            {/* O link para criar conta já existe aqui */}
            <Link
              to="/auth/register"
              className="font-medium text-green-600 hover:text-green-500 transition-colors"
            >
              Criar conta →
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          icon={!isLoading ? <Mail className="h-4 w-4" /> : undefined}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      {/* REMOVIDO: Debug Info de tentativas de login */}
      {/* {loginAttempts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Tentativas de login: {loginAttempts}
              </p>
              <p className="text-xs text-yellow-700">
                Se continua dando erro, verifique se criou a conta primeiro usando o link "Criar conta"
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Como começar:
        </h3>
        <ol className="text-xs text-gray-600 space-y-1">
          <li>1. Clique em "Criar conta" para registrar um usuário</li>
          <li>2. Use ramiro@rls.com.pt ou carla@rls.com.pt como email</li>
          <li>3. Use a senha Senha@123456 para ambos</li>
          <li>4. Após criar a conta, volte aqui para fazer login</li>
        </ol>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link
            to="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Criar conta agora
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          © 2025 RLS Automação Industrial. 
          <br />
          Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;