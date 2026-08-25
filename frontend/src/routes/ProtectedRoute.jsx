// ProtectedRoute: camada de navegação/UX do frontend.
// A autorização de verdade continua no backend (middlewares auth/requireRole) —
// qualquer pessoa consegue mexer no navegador, então isto NÃO é segurança.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Rota inicial de cada papel, usada quando o usuário está logado mas não tem
// permissão para a rota pedida.
export function homePathForRole(role) {
  switch (role) {
    case 'ORGANIZER':
      return '/organizador';
    case 'GATE':
      return '/portaria';
    default:
      return '/';
  }
}

/**
 * @param {object} props
 * @param {string[]} [props.roles]  papéis permitidos; sem isso basta estar logado
 * @param {React.ReactNode} [props.children]  se ausente, renderiza <Outlet />
 */
export default function ProtectedRoute({ roles, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Guarda de onde veio para a tela de login poder voltar depois.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  return children ?? <Outlet />;
}
