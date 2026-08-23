// Layout global (tarefa 74): header fixo + conteúdo da rota.
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
