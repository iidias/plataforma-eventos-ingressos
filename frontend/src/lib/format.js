// Formatação compartilhada entre as telas (datas, preços e disponibilidade).
// O backend devolve preço em centavos (priceCents) e data ISO (eventDate).

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatPrice(cents) {
  return brl.format((Number(cents) || 0) / 100);
}

export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString('pt-BR')} · ${formatTime(iso)}`;
}

// O backend já manda "available" (capacity - soldCount); isto só traduz o
// número em rótulo/cor de selo.
export function availabilityOf(event) {
  const available = Number(event?.available ?? 0);
  const capacity = Number(event?.capacity ?? 0);

  if (available <= 0) return { key: 'sold-out', label: 'Esgotado', color: 'gray' };
  if (capacity > 0 && available <= capacity * 0.1) {
    return { key: 'few', label: 'Últimas vagas', color: 'amber' };
  }
  return { key: 'available', label: 'Disponível', color: 'green' };
}

export const ROLE_LABELS = {
  CUSTOMER: 'Cliente',
  ORGANIZER: 'Organizador',
  GATE: 'Portaria',
};

export const ROLE_BADGE_COLORS = {
  CUSTOMER: 'blue',
  ORGANIZER: 'black',
  GATE: 'amber',
};
