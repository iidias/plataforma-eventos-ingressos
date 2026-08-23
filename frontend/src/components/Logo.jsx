// Marca do produto: "ingresso" em preto + "Film" em vermelho, sem espaço.
export default function Logo({ size = 20 }) {
  return (
    <span style={{ fontSize: size }} className="font-[DM_Serif_Display] leading-none">
      <span className="text-[#111111]">ingresso</span>
      <span className="text-[#E5181B]">Film</span>
    </span>
  );
}
