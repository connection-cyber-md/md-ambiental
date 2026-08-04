import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buttonUnifiedColorClasses } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/config/site";

// Botão flutuante de WhatsApp, fixo no rodapé de todas as páginas
// (renderizado no layout do site). Mesmo padrão visual dos outros botões:
// fundo preto, borda âmbar 1.5px, ícone verde.
export function FloatingWhatsAppButton() {
  return (
    <a
      href={buildWhatsAppLink("Olá! Quero falar com a MD Ambiental.")}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${buttonUnifiedColorClasses}`}
    >
      <WhatsAppIcon className="w-[24px] h-[24px]" />
    </a>
  );
}
