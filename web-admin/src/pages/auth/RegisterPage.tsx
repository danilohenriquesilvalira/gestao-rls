import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// Schema de registro
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  // Função para preencher dados pré-definidos - ATUALIZADO
  const fillAdminData = (email: string, name: string) => {
    setValue('name', name);
    setValue('email', email);
    setValue('password', 'Senha@123456');  // Senha mais forte
    setValue('confirmPassword', 'Senha@123456');  // Senha mais forte
  };

  const onSubmit = async (data: RegisterFormData) => {
    const success = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password
    });
    
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Criar Nova Conta
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Registre-se para acessar o sistema de gestão de despesas
        </p>
      </div>

      {/* Quick Admin Setup */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-3">
          Setup Rápido - Contas Administrativas:
        </h3>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillAdminData('ramiro@rls.com.pt', 'Ramiro Silva')}
            className="w-full text-left justify-start"
          >
            <User className="h-4 w-4 mr-2" />
            Ramiro Silva (ramiro@rls.com.pt)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillAdminData('carla@rls.com.pt', 'Carla Santos')}
            className="w-full text-left justify-start"
          >
            <User className="h-4 w-4 mr-2" />
            Carla Santos (carla@rls.com.pt)
          </Button>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          * Clique em uma das opções acima para preencher automaticamente com senha Senha@123456
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <Input
            {...register('name')}
            type="text"
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            error={errors.name?.message}
            disabled={isLoading}
            autoComplete="name"
          />
        </div>

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
              placeholder="Digite sua senha (inclua letras, números e símbolos)"
              error={errors.password?.message}
              disabled={isLoading}
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <Input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirmar Senha"
              placeholder="Digite novamente sua senha"
              error={errors.confirmPassword?.message}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          icon={!isLoading ? <UserPlus className="h-4 w-4" /> : undefined}
        >
          {isLoading ? 'Criando conta...' : 'Criar Conta'}
        </Button>
      </form>

      {/* Current Form Values (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Debug Info:</h4>
          <pre className="text-xs text-gray-600">
            {JSON.stringify(watch(), null, 2)}
          </pre>
        </div>
      )}

      {/* Back to Login */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Fazer login
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

export default RegisterPage;