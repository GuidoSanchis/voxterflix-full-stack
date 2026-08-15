import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';

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
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/40 via-black to-black" />

      <Link to="/" className="absolute left-6 top-6 text-2xl font-black text-red-600 sm:left-10 sm:top-8">
        VOXTER
      </Link>

      <div className="relative w-full max-w-sm rounded-md bg-black/75 p-8 shadow-2xl sm:p-10">
        <h1 className="mb-6 text-2xl font-bold text-white">Entrar</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="E-mail"
              className="w-full rounded-md border border-white/10 bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus:border-white focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('password')}
              type="password"
              placeholder="Senha"
              className="w-full rounded-md border border-white/10 bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus:border-white focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-400">
          Novo por aqui?{' '}
          <Link to="/register" className="text-white hover:underline">
            Cadastre-se agora
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
