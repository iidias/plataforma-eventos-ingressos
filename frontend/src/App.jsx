// Rotas da aplicação (tarefa 66), agora sob o layout global da tarefa 74.
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import MyTickets from './pages/MyTickets.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import SharedTicket from './pages/SharedTicket.jsx';
import OrganizerDashboard from './pages/OrganizerDashboard.jsx';
import NewEvent from './pages/NewEvent.jsx';
import Gate from './pages/Gate.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      {/* O login tem tela cheia própria, sem o header global. */}
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        {/* Públicas — acompanham o backend, onde GET /events e GET /events/:id
            não exigem autenticação, e o link compartilhado é público por natureza. */}
        <Route path="/" element={<Events />} />
        <Route path="/eventos/:id" element={<EventDetail />} />
        <Route path="/i/:shareToken" element={<SharedTicket />} />

        {/* Cliente */}
        <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
          <Route path="/checkout/:reservationId" element={<Checkout />} />
          <Route path="/meus-ingressos" element={<MyTickets />} />
          <Route path="/ingressos/:id" element={<TicketDetail />} />
        </Route>

        {/* Organizador */}
        <Route element={<ProtectedRoute roles={['ORGANIZER']} />}>
          <Route path="/organizador" element={<OrganizerDashboard />} />
          <Route path="/organizador/novo" element={<NewEvent />} />
        </Route>

        {/* Portaria */}
        <Route element={<ProtectedRoute roles={['GATE']} />}>
          <Route path="/portaria" element={<Gate />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
