// Card: container base para conteúdo agrupado.
// Os cards específicos (evento, filme, dashboard) serão montados sobre este.
export default function Card({
  as: Tag = 'div',
  padded = true,
  hoverable = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={[
        'bg-white border border-[#E0E0E0] rounded-[6px] overflow-hidden',
        padded ? 'p-4' : '',
        hoverable
          ? 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow duration-200'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
