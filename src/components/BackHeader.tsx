import { ChevronLeft } from "lucide-react";
import { useStore } from "@/store";
import type { CustomerView } from "@/types";

interface BackHeaderProps {
  title: string;
  backTo: CustomerView;
}

export function BackHeader({ title, backTo }: BackHeaderProps) {
  const setView = useStore((s) => s.setView);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => setView(backTo)}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors -ml-1 cursor-pointer"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>
        <h1 className="font-display text-[17px] font-extrabold">{title}</h1>
      </div>
    </header>
  );
}
