// Header global (tarefa 74): marca, navegação por papel, identificação do
// usuário logado (nome + papel) e botão de sair.
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathForRole } from '../routes/ProtectedRoute.jsx';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../lib/format.js';
import Badge from './Badge.jsx';
import Button from './Button.jsx';
import Logo from './Logo.jsx';
import { IconUser, IconLogout } from './icons.jsx';

const NAV_BY_ROLE = {
  CUSTOMER: [
    { to: '/', label: 'Filmes em Cartaz', end: true },
    { to: '/meus-ingressos', label: 'Meus Ingressos' },
  ],
  ORGANIZER: [
    { to: '/organizador', label: 'Meus Eventos', end: true },
    { to: '/organizador/novo', label: 'Novo Evento' },
  ],
  GATE: [{ to: '/portaria', label: 'Validar Ingresso', end: true }],
};

const linkClass = ({ isActive }) =>
  `font-[Outfit] text-[14px] transition-colors ${
    isActive ? 'text-[#E5181B]' : 'text-[#4A4A4A] hover:text-[#111111]'
  }`;

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = (user && NAV_BY_ROLE[user.role]) ?? [];

  return (
    <header className="w-full bg-white border-b border-[#E0E0E0] sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link to={isAuthenticated ? homePathForRole(user.role) : '/'} className="shrink-0 leading-none">
          <Logo size={20} />
        </Link>

        {isAuthenticated ? (
          <>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#EFEFEF] flex items-center justify-center text-[#4A4A4A]">
                  <IconUser />
                </span>
                <span className="hidden md:flex flex-col items-start leading-none gap-0.5">
                  <span className="font-[Outfit] text-[13px] font-medium text-[#111111]">
                    {user.name}
                  </span>
                  <Badge color={ROLE_BADGE_COLORS[user.role] ?? 'gray'}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </Badge>
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <IconLogout />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </>
        ) : (
          <Button size="sm" onClick={() => navigate('/login')}>
            <IconUser />
            <span className="hidden sm:inline">Entrar</span>
          </Button>
        )}
      </div>
    </header>
  );
}
