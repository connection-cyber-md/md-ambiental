"use client";

import { useState } from "react";
import { ContextFooter } from "@/components/ui/ContextFooter";
import { CompanyBoard } from "@/components/admin/CompanyBoard";
import { RegulatoryMatrixBoard } from "@/components/admin/RegulatoryMatrixBoard";
import { generateMatrixPdf } from "@/app/admin/compliance/actions";
import { licenseStatus } from "@/lib/compliance/licenseStatus";

type Company = {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  license_number: string | null;
  license_type: string | null;
  license_issuing_agency: string | null;
  license_issue_date: string | null;
  license_expiry_date: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  is_synthetic?: boolean;
};

type Rule = {
  id: string;
  ibge_code: string | null;
  uf: string | null;
  sphere: string;
  rule_title: string;
  rule_description: string | null;
  required_documents: string[] | null;
  blocking_condition: string | null;
  reference_law: string | null;
};

const buttonClasses =
  "font-mono text-[11.5px] uppercase tracking-[0.05em] border-[1.5px] rounded-full px-4 py-2 whitespace-nowrap disabled:opacity-50";

export function CompliancePageClient({ companies, rules }: { companies: Company[]; rules: Rule[] }) {
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const vencidas = companies.filter((c) => licenseStatus(c.license_expiry_date) === "vencida").length;
  const venceEmBreve = companies.filter((c) => licenseStatus(c.license_expiry_date) === "vence_em_breve").length;

  async function handleExportPdf() {
    setExporting(true);
    const result = await generateMatrixPdf();
    setExporting(false);
    if ("error" in result) {
      alert(result.error);
    } else {
      window.open(result.url, "_blank", "noopener");
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-[28px] text-ink">Conformidade</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowCreateRule((v) => !v);
              if (!showCreateRule) setMatrixOpen(true);
            }}
            className={`${buttonClasses} bg-white text-ink border-ink/15`}
          >
            {showCreateRule ? "Fechar" : "+ Nova regra"}
          </button>
          <button
            onClick={() => setShowCreateCompany((v) => !v)}
            className={`${buttonClasses} bg-ink text-white border-brand-amber`}
          >
            {showCreateCompany ? "Fechar" : "+ Novo cliente"}
          </button>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel">
            Licenças dos clientes
          </h2>
          {(vencidas > 0 || venceEmBreve > 0) && (
            <span className="text-[11.5px] text-red-700">
              {vencidas > 0 && `${vencidas} vencida${vencidas > 1 ? "s" : ""}`}
              {vencidas > 0 && venceEmBreve > 0 && " · "}
              {venceEmBreve > 0 && `${venceEmBreve} vencendo em breve`}
            </span>
          )}
        </div>
        <CompanyBoard companies={companies} showCreate={showCreateCompany} onCloseCreate={() => setShowCreateCompany(false)} />
      </section>

      <section>
        <button
          onClick={() => setMatrixOpen((v) => !v)}
          className="w-full text-left bg-white border-[1.5px] border-ink/10 hover:border-ink/30 p-5 flex items-center justify-between transition-colors"
        >
          <div>
            <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mb-1">
              Matriz regulatória
            </h2>
            <p className="text-[13px] text-steel">{rules.length} regras cadastradas — clique para ver todas</p>
          </div>
          <span className="text-[20px] text-steel">{matrixOpen ? "−" : "+"}</span>
        </button>

        {matrixOpen && (
          <div className="mt-4">
            <div className="flex justify-end mb-3">
              <button
                onClick={handleExportPdf}
                disabled={exporting}
                className={`${buttonClasses} bg-white text-ink border-ink/15`}
              >
                {exporting ? "Gerando…" : "Exportar PDF"}
              </button>
            </div>
            <RegulatoryMatrixBoard rules={rules} showCreate={showCreateRule} onCloseCreate={() => setShowCreateRule(false)} />
          </div>
        )}
      </section>

      <ContextFooter>
        <span>{companies.length} clientes</span>
        <span>{vencidas} licenças vencidas</span>
        <span>{venceEmBreve} vencendo em breve</span>
        <span>{rules.length} regras na matriz</span>
      </ContextFooter>
    </div>
  );
}
