// Página 404 (tarefa 74).
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathForRole } from '../routes/ProtectedRoute.jsx';

export default function NotFound() {
  const { user, isAuthenticated } = useAuth();
  const home = isAuthenticated ? homePathForRole(user.role) : '/';

  return (
    <div className="bg-[#F7F7F7] flex-1 flex items-center justify-center px-6 py-16">
      <div className="bg-white border border-[#E0E0E0] rounded-[6px] px-8 py-12 max-w-md w-full flex flex-col items-center gap-5 text-center">
        <span className="font-[DM_Serif_Display] text-[64px] text-[#E5181B] leading-none">404</span>
        <div>
          <h1 className="font-[Outfit] font-semibold text-[20px] text-[#111111]">
            Página não encontrada
          </h1>
          <p className="font-[Outfit] text-[14px] text-[#4A4A4A] mt-1">
            O endereço que você tentou acessar não existe ou foi movido.
          </p>
        </div>
        <Link to={home}>
          <Button>Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}
