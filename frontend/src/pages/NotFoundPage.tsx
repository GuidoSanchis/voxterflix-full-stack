import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-neutral-400">O conteúdo que você procura não existe ou foi removido.</p>
      <Link to="/browse" className="text-red-500 hover:underline">
        Voltar para o catálogo
      </Link>
    </div>
  );
}
