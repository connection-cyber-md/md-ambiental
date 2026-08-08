"use client";

import { useState } from "react";
import { ContextFooter } from "@/components/ui/ContextFooter";
import { DocumentsBoard } from "@/components/admin/DocumentsBoard";

type CollectionOption = {
  id: string;
  collection_date: string;
  volume_litros: number | null;
  companies: { razao_social: string } | { razao_social: string }[] | null;
};

type Document = {
  id: string;
  collection_id: string;
  type: "CCO" | "MTR";
  document_number: string | null;
  file_url: string | null;
  issue_date: string | null;
  status: string;
  collections:
    | { collection_date: string; companies: { razao_social: string } | { razao_social: string }[] | null }
    | { collection_date: string; companies: { razao_social: string } | { razao_social: string }[] | null }[]
    | null;
};

const TYPE_LABEL: Record<"CCO" | "MTR", string> = {
  CCO: "Certificados de Coleta",
  MTR: "Manifestos de Transporte",
};

export function DocumentsPageClient({
  documents,
  collections,
}: {
  documents: Document[];
  collections: CollectionOption[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedType, setSelectedType] = useState<"CCO" | "MTR" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const ccoCount = documents.filter((d) => d.type === "CCO").length;
  const mtrCount = documents.filter((d) => d.type === "MTR").length;
  const issuedCount = documents.filter((d) => d.status === "issued").length;

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <h1 className="font-display text-[28px] text-black">Documentos</h1>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="font-mono text-[11.5px] uppercase tracking-[0.05em] bg-ink text-white border-[1.5px] border-brand-amber rounded-full px-4 py-2 whitespace-nowrap"
        >
          {showCreate ? "Fechar" : "+ Novo documento"}
        </button>
      </div>

      <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
        <p className="text-[14px] text-[#000000] max-w-[640px]">
          Certificados de Coleta (CCO) e Manifestos de Transporte (MTR) emitidos por coleta. Para CCO, o
          PDF é gerado automaticamente a partir dos dados reais da coleta — clique em &quot;Gerar PDF&quot;.
          MTR ainda usa link colado manualmente. O cliente vê tudo isso no Portal.
        </p>
        <div className="w-full max-w-[280px]">
          <label className="block text-[10.5px] text-steel mb-1 text-right">Buscar por número do documento</label>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ex.: MTR-2026-0043"
            className="w-full border border-ink/15 rounded-sm px-2.5 py-1.5 text-[13px] bg-white focus:outline-none focus:border-brand-amber"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 print:hidden max-w-[520px]">
        {(["CCO", "MTR"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(selectedType === type ? null : type)}
            className={`text-left bg-white border-[1.5px] rounded-lg p-4 transition-colors ${
              selectedType === type ? "border-ink" : "border-ink/10 hover:border-ink/30"
            }`}
          >
            <div className="text-[11px] text-black mb-1">{TYPE_LABEL[type]}</div>
            <div className="font-display text-[22px] text-black">{type === "CCO" ? ccoCount : mtrCount}</div>
          </button>
        ))}
      </div>

      <DocumentsBoard
        documents={documents}
        collections={collections}
        showCreate={showCreate}
        onCloseCreate={() => setShowCreate(false)}
        selectedType={selectedType}
        searchQuery={searchQuery}
      />

      <ContextFooter>
        <span>{documents.length} documentos</span>
        <span>CCO: {ccoCount}</span>
        <span>MTR: {mtrCount}</span>
        <span>{issuedCount} emitidos</span>
      </ContextFooter>
    </div>
  );
}
