// Skeleton de carregamento do design system.
export default function Skeleton({ className = '', style }) {
  return (
    <div
      className={`bg-[#EFEFEF] animate-pulse rounded-[4px] ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
