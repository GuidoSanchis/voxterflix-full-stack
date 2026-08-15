import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Heart, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/cn';
import { SearchBar } from './SearchBar';

const NAV_LINKS = [
  { to: '/browse', label: 'Início' },
  { to: '/my-list', label: 'Favoritos', icon: Heart },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const initial = user?.name.trim().charAt(0).toUpperCase();

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 bg-black/90 backdrop-blur-md'
          : 'border-b border-transparent bg-gradient-to-b from-black/85 via-black/40 to-transparent',
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="text-3xl font-black tracking-tight text-red-600 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
          >
            VOXTERFLIX
          </Link>
          <nav className="hidden gap-2 sm:flex">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold transition-colors',
                    isActive ? 'bg-white text-black' : 'text-neutral-200 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {Icon && <Icon className={cn('h-4 w-4', isActive && 'fill-current')} />}
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <SearchBar className="hidden w-64 sm:block" />

          {user && (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-base font-black text-white ring-2 ring-white/20">
                  {initial}
                </span>
                <span className="hidden text-sm font-semibold text-white md:inline">
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-600 hover:bg-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white sm:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="flex flex-col gap-4 border-t border-white/10 bg-black px-4 py-4 sm:hidden">
          <SearchBar onNavigate={() => setMobileMenuOpen(false)} />

          <nav className="flex flex-col gap-1.5">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2.5 text-base font-semibold transition-colors',
                    isActive ? 'bg-white text-black' : 'text-neutral-200',
                  )}
                >
                  {Icon && <Icon className={cn('h-4 w-4', isActive && 'fill-current')} />}
                  {label}
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-base font-black text-white ring-2 ring-white/20">
                  {initial}
                </span>
                <span className="text-sm font-semibold text-white">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-600 hover:bg-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
