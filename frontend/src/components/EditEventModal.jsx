// Edição de evento a partir do painel do organizador.
// Só capacidade e preço: data, local e filme mudariam o que o cliente já viu
// quando comprou, então ficam fora.
import { useState } from 'react';
import { api } from '../api/client.js';
import Alert from './Alert.jsx';
import Button from './Button.jsx';
import Input from './Input.jsx';
import { IconX } from './icons.jsx';

export default function EditEventModal({ event, onClose, onSaved }) {
  const [capacity, setCapacity] = useState(String(event.capacity));
  const [price, setPrice] = useState((event.priceCents / 100).toFixed(2));
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    const capacityNumber = Number(capacity);
    const priceNumber = Number(String(price).replace(',', '.'));
    const errors = {};

    if (!capacity || !Number.isInteger(capacityNumber) || capacityNumber < 1) {
      errors.capacity = 'Capacidade deve ser um número inteiro a partir de 1';
    } else if (capacityNumber < event.soldCount) {
      errors.capacity = `Não pode ser menor que os ${event.soldCount} ingressos já vendidos`;
    }

    if (price === '' || Number.isNaN(priceNumber) || priceNumber < 0) {
      errors.price = 'Informe um preço válido';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError('');

    try {
      const updated = await api.patch(`/events/${event.id}`, {
        capacity: capacityNumber,
        priceCents: Math.round(priceNumber * 100),
      });

      onSaved(updated);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(17,17,17,0.45)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Editar evento"
    >
      <div className="bg-white border border-[#E0E0E0] rounded-[6px] w-full max-w-[400px] flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#E0E0E0]">
          <div>
            <h2 className="font-[DM_Serif_Display] text-[20px] text-[#111111] leading-tight">
              Editar evento
            </h2>
            <p className="font-[Outfit] text-[12px] text-[#9A9A9A] mt-0.5 leading-snug">
              {event.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#9A9A9A] hover:text-[#111111] transition-colors mt-0.5 cursor-pointer"
          >
            <IconX />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <Input
            label="Capacidade"
            type="number"
            min="1"
            step="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            error={fieldErrors.capacity}
            disabled={saving}
          />
          <Input
            label="Preço por ingresso (R$)"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={fieldErrors.price}
            disabled={saving}
          />

          <p className="font-[Outfit] text-[11px] text-[#9A9A9A] leading-relaxed">
            {event.soldCount} de {event.capacity} ingressos vendidos. Data, local e filme não
            podem ser alterados depois que o evento existe.
          </p>

          {error && <Alert type="error" message={error} />}
        </div>

        <div className="px-6 pb-6 flex flex-col gap-2">
          <Button className="w-full" loading={saving} onClick={handleSave}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
          <Button variant="outline" className="w-full" disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
