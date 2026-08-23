// Placeholder temporário (tarefa 66): as telas reais são as tarefas 69–74.
// Serve apenas para o esqueleto de navegação existir e as rotas serem testáveis.
export default function Placeholder({ title, taskHint }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6">
      <div className="bg-white border border-[#E0E0E0] rounded-[6px] px-8 py-10 text-center max-w-md w-full">
        <p className="font-[Outfit] text-[11px] uppercase tracking-widest text-[#9A9A9A]">
          Em construção
        </p>
        <h1 className="font-[DM_Serif_Display] text-[32px] text-[#111111] leading-tight mt-1">
          {title}
        </h1>
        {taskHint && (
          <p className="font-[Outfit] text-[14px] text-[#4A4A4A] mt-2">{taskHint}</p>
        )}
      </div>
    </div>
  );
}
