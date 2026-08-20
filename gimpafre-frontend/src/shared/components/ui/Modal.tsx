import type { ReactNode } from "react";

interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: "md" | "lg"; // "md" = comportamiento original; "lg" = formularios con más campos
}

const ANCHOS: Record<NonNullable<ModalProps["ancho"]>, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Modal({ titulo, onCerrar, children, ancho = "md" }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full p-6 ${ANCHOS[ancho]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-[18px] font-semibold text-text-main">{titulo}</h3>
          <button onClick={onCerrar} className="text-text-muted hover:text-text-main">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}