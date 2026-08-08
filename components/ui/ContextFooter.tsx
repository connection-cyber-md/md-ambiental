// Barra fixa no rodape das paginas do backoffice: mantem contexto visivel
// (total de itens, saldo do periodo, filtro ativo etc.) mesmo quando o
// usuario rola a lista pra baixo e o cabecalho sai da tela.
// Cada pagina decide o proprio conteudo via children -- este componente so
// cuida do posicionamento/estilo.
export function ContextFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink">
      <div className="max-w-[1440px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap text-[12.5px] text-white">
        {children}
      </div>
    </div>
  );
}
