import { createClient } from "@/lib/supabase/server";
import { CompliancePageClient } from "@/components/admin/CompliancePageClient";

export default async function AdminCompliancePage() {
  const supabase = await createClient();

  const [companiesRes, matrixRes] = await Promise.all([
    supabase
      .from("companies")
      .select(
        "id, cnpj, razao_social, nome_fantasia, license_number, license_type, license_issuing_agency, license_issue_date, license_expiry_date, contact_name, contact_email, contact_phone, status, is_synthetic"
      )
      .order("license_expiry_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("regulatory_matrix")
      .select("id, ibge_code, uf, sphere, rule_title, rule_description, required_documents, blocking_condition, reference_law")
      .order("sphere", { ascending: true }),
  ]);

  const companies = companiesRes.data ?? [];
  const matrix = matrixRes.data ?? [];

  if (companiesRes.error || matrixRes.error) {
    return (
      <div>
        <h1 className="font-display text-[28px] text-ink mb-6">Conformidade</h1>
        <div className="bg-white border border-ink/10 p-8 text-[15px] text-steel">
          <p className="mb-2">Não foi possível carregar os dados agora. Tente recarregar a página.</p>
          <p className="font-mono text-[12px] text-brand-amber-deep whitespace-pre-wrap">
            {companiesRes.error?.message}
            {matrixRes.error?.message}
          </p>
        </div>
      </div>
    );
  }

  return <CompliancePageClient companies={companies} rules={matrix} />;
}
