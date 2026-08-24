// Tela de login (tarefa 69).
// Chama POST /auth/login pelo client HTTP, guarda a sessão no AuthContext e
// redireciona conforme o papel do usuário.
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathForRole } from '../routes/ProtectedRoute.jsx';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../lib/format.js';
import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Logo from '../components/Logo.jsx';
import { IconEye, IconEyeOff } from '../components/icons.jsx';

// Credenciais do seed (backend/prisma/seed.js). Os atalhos existem para
// facilitar a avaliação do projeto.
const SEED_CREDENTIALS = [
  { role: 'CUSTOMER', email: 'cliente1@teste.com', password: 'senha123' },
  { role: 'ORGANIZER', email: 'organizador@teste.com', password: 'senha123' },
  { role: 'GATE', email: 'portaria@teste.com', password: 'senha123' },
];

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Já logado não precisa ver o login de novo.
  if (isAuthenticated) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  async function authenticate(credentials) {
    setLoading(true);
    setError('');

    try {
      const { token, user: loggedUser } = await api.post('/auth/login', credentials, {
        auth: false,
      });

      login(token, loggedUser);

      // Volta para onde o ProtectedRoute interrompeu, se houver; senão vai
      // para a área inicial do papel.
      const from = location.state?.from?.pathname;
      navigate(from ?? homePathForRole(loggedUser.role), { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);

    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }

    authenticate({ email: email.trim(), password });
  }

  // Atalho: preenche os campos e já entra.
  function handleShortcut(credentials) {
    setEmail(credentials.email);
    setPassword(credentials.password);
    setTouched(false);
    authenticate({ email: credentials.email, password: credentials.password });
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Logo size={28} />
          <p className="font-[Outfit] text-[14px] text-[#4A4A4A]">
            Acesse sua conta para continuar
          </p>
        </div>

        <div className="bg-white border border-[#E0E0E0] rounded-[6px] p-8 flex flex-col gap-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={touched && !email.trim() ? 'Campo obrigatório' : undefined}
              disabled={loading}
            />
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={touched && !password ? 'Campo obrigatório' : undefined}
              disabled={loading}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="cursor-pointer hover:text-[#111111]"
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              }
            />

            {error && <Alert type="error" message={error} />}

            <Button type="submit" size="lg" className="w-full mt-1" loading={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="font-[Outfit] text-[13px] text-[#4A4A4A] text-center">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-[#E5181B] font-medium hover:underline">
              Criar conta
            </Link>
          </p>

          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-[#E0E0E0]" />
            <span className="text-[12px] font-[Outfit] text-[#9A9A9A]">atalhos de teste</span>
            <span className="flex-1 h-px bg-[#E0E0E0]" />
          </div>

          <div className="flex flex-col gap-2">
            {SEED_CREDENTIALS.map((credentials) => (
              <button
                key={credentials.role}
                type="button"
                disabled={loading}
                onClick={() => handleShortcut(credentials)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-[4px] border border-[#E0E0E0] hover:bg-[#F7F7F7] transition-colors text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="font-[Outfit] text-[13px] font-medium text-[#111111]">
                    Entrar como {ROLE_LABELS[credentials.role]}
                  </span>
                  <span className="font-mono text-[11px] text-[#9A9A9A]">
                    {credentials.email}
                  </span>
                </span>
                <Badge color={ROLE_BADGE_COLORS[credentials.role]}>
                  {ROLE_LABELS[credentials.role]}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
