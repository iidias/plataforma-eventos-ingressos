// Tela de cadastro público.
// Consome POST /auth/register, que já devolve token + user, e reaproveita o
// AuthContext existente para iniciar a sessão — sem criar outro mecanismo de
// autenticação. O papel é decidido pelo backend a partir de isOrganizer.
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathForRole } from '../routes/ProtectedRoute.jsx';
import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Logo from '../components/Logo.jsx';
import Toggle from '../components/Toggle.jsx';

export default function Register() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  function validate() {
    const errors = {};

    if (name.trim().length < 2) errors.name = 'Informe seu nome';
    if (!email.trim()) errors.email = 'Informe um e-mail';
    if (password.length < 6) errors.password = 'A senha deve ter no mínimo 6 caracteres';
    if (confirmPassword !== password) errors.confirmPassword = 'As senhas não conferem';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const { token, user: createdUser } = await api.post(
        '/auth/register',
        { name: name.trim(), email: email.trim(), password, isOrganizer },
        { auth: false },
      );

      // Login automático: a sessão começa aqui, sem passar pela tela de login.
      login(token, createdUser);
      navigate(homePathForRole(createdUser.role), { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Logo size={28} />
          <p className="font-[Outfit] text-[14px] text-[#4A4A4A]">Crie sua conta para continuar</p>
        </div>

        <div className="bg-white border border-[#E0E0E0] rounded-[6px] p-8 flex flex-col gap-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Nome"
              autoComplete="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              disabled={loading}
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              disabled={loading}
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              disabled={loading}
            />
            <Input
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              disabled={loading}
            />

            <div className="flex flex-col gap-1">
              <Toggle
                label="Sou organizador"
                checked={isOrganizer}
                onChange={setIsOrganizer}
              />
              <p className="text-[12px] font-[Outfit] text-[#9A9A9A]">
                {isOrganizer
                  ? 'Sua conta poderá criar e publicar eventos.'
                  : 'Sua conta poderá reservar ingressos para eventos.'}
              </p>
            </div>

            {error && <Alert type="error" message={error} />}

            <Button type="submit" size="lg" className="w-full mt-1" loading={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <p className="font-[Outfit] text-[13px] text-[#4A4A4A] text-center">
            Já tem conta?{' '}
            <Link to="/login" className="text-[#E5181B] font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
