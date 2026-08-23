// Alert inline do design system: mensagens de sucesso/erro dentro de formulários.
import { IconCheck, IconWarning, IconAlert, IconInfo } from './icons.jsx';

const styles = {
  success: { box: 'bg-[#F0FDF4] border border-[#BBF7D0]', text: 'text-[#16A34A]', Icon: IconCheck },
  warning: { box: 'bg-[#FFFBEB] border border-[#FDE68A]', text: 'text-[#D97706]', Icon: IconWarning },
  error: { box: 'bg-[#FFF1F2] border border-[#FECDD3]', text: 'text-[#E5181B]', Icon: IconAlert },
  info: { box: 'bg-[#EFF6FF] border border-[#BFDBFE]', text: 'text-[#2563EB]', Icon: IconInfo },
};

export default function Alert({ type = 'info', message }) {
  const { box, text, Icon } = styles[type] ?? styles.info;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-[4px] ${box}`} role="alert">
      <span className={`${text} shrink-0`}>
        <Icon />
      </span>
      <span className={`font-[Outfit] text-[14px] ${text}`}>{message}</span>
    </div>
  );
}
