import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { AlertCircle, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthTextField } from '../components/auth/AuthTextField';

const registerSchema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerUser(values.name, values.email, values.password);
      navigate('/browse', { replace: true });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setFormError('Este e-mail já está cadastrado.');
      } else {
        setFormError('Não foi possível criar sua conta. Tente novamente.');
      }
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Leva menos de um minuto."
      footer={
        <p className="mt-6 text-sm text-neutral-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-white hover:underline">
            Entrar
          </Link>
          .
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <AuthTextField
          icon={User}
          placeholder="Nome"
          registration={register('name')}
          error={errors.name?.message}
        />
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
          {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
