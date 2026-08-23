// Toggle (switch) do design system.
export default function Toggle({ label, checked, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-fit cursor-pointer"
    >
      <span
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#E5181B]' : 'bg-[#E0E0E0]'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </span>
      <span className="font-[Outfit] text-[14px] text-[#111111]">{label}</span>
    </button>
  );
}
