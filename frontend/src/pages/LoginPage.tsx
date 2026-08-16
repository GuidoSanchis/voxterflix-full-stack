import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthTextField } from '../components/auth/AuthTextField';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values.email, values.password);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/browse';
      navigate(from, { replace: true });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        setFormError('E-mail ou senha inválidos.');
      } else {
        setFormError('Não foi possível entrar. Tente novamente.');
      }
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Bem-vindo de volta. Que bom te ver por aqui."
      footer={
        <p className="mt-6 text-sm text-neutral-400">
          Novo por aqui?{' '}
          <Link to="/register" className="font-medium text-white hover:underline">
            Cadastre-se agora
          </Link>
          .
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <AuthTextField
          icon={Mail}
          type="email"
          placeholder="E-mail"
          registration={register('email')}
          error={errors.email?.message}
        />
        <AuthTextField
          icon={Lock}
          revealable
          placeholder="Senha"
          registration={register('password')}
          error={errors.password?.message}
        />

        {formError && (
          <p className="flex items-center gap-1.5 rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
