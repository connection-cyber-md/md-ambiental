import { createClient } from "@/lib/supabase/server";
import { CompanyBoard } from "@/components/admin/CompanyBoard";
import { RegulatoryMatrixBoard } from "@/components/admin/RegulatoryMatrixBoard";

export default async function AdminCompliancePage() {
  const supabase = await createClient();

  const [companiesRes, matrixRes] = await Promise.all([
    supabase
      .from("companies")
      .select(
        "id, cnpj, razao_social, nome_fantasia, license_number, license_type, license_issuing_agency, license_issue_date, license_expiry_date, contact_name, contact_email, contact_phone, status"
      )
      .order("license_expiry_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("regulatory_matrix")
      .select("id, ibge_code, uf, sphere, rule_title, rule_description, required_documents, blocking_condition, reference_law")
      .order("sphere", { ascending: true }),
  ]);

  const companies = companiesRes.data ?? [];
  const matrix = matrixRes.data ?? [];

  return (
    <div>
      <p className="eyebrow">Backoffice</p>
      <h1 className="font-display text-[28px] text-ink mb-6">Conformidade</h1>

      <section className="mb-10">
        <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mb-3">
          Licenças dos clientes
        </h2>
        {companiesRes.error ? (
          <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
            <p className="mb-2">Não foi possível carregar as licenças agora.</p>
            <p className="font-mono text-[12px] text-brand-amber-deep">
              {companiesRes.error.code}: {companiesRes.error.message}
            </p>
          </div>
        ) : (
          <CompanyBoard companies={companies} />
        )}
      </section>

      <section>
        <h2 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-steel mb-3">
          Matriz regulatória
        </h2>
        {matrixRes.error ? (
          <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
            <p className="mb-2">Não foi possível carregar a matriz regulatória agora.</p>
            <p className="font-mono text-[12px] text-brand-amber-deep">
              {matrixRes.error.code}: {matrixRes.error.message}
            </p>
          </div>
        ) : (
          <RegulatoryMatrixBoard rules={matrix} />
        )}
      </section>
    </div>
  );
}
