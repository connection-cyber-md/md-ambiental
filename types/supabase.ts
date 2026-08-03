/**
 * Hand-written placeholder matching the schema defined in
 * supabase/migrations/. Regenerate this file for real once a project is
 * linked: `npm run supabase:types` (see package.json).
 */

type UserRole = "system_admin" | "tenant_admin" | "tenant_operator" | "tenant_driver" | "client";

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          cnpj: string;
          razao_social: string;
          nome_fantasia: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tenants"]["Row"]> & {
          cnpj: string;
          razao_social: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Row"]>;
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          role: UserRole;
          full_name: string;
          email: string;
          phone: string | null;
          company_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          tenant_id: string;
          role: UserRole;
          full_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      companies: {
        Row: {
          id: string;
          tenant_id: string;
          cnpj: string;
          razao_social: string;
          nome_fantasia: string | null;
          address_logradouro: string | null;
          address_numero: string | null;
          address_bairro: string | null;
          address_cidade: string | null;
          address_uf: string | null;
          address_cep: string | null;
          ibge_code: string | null;
          license_number: string | null;
          license_type: string | null;
          license_issuing_agency: string | null;
          license_issue_date: string | null;
          license_expiry_date: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["companies"]["Row"]> & {
          tenant_id: string;
          cnpj: string;
          razao_social: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Row"]>;
      };
      vehicles: {
        Row: {
          id: string;
          tenant_id: string;
          plate: string;
          model: string | null;
          brand: string | null;
          capacity_litros: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["vehicles"]["Row"]> & {
          tenant_id: string;
          plate: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Row"]>;
      };
      drivers: {
        Row: {
          id: string;
          tenant_id: string;
          profile_id: string;
          cnh_number: string;
          cnh_category: string | null;
          cnh_expiry: string | null;
          vehicle_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["drivers"]["Row"]> & {
          tenant_id: string;
          profile_id: string;
          cnh_number: string;
        };
        Update: Partial<Database["public"]["Tables"]["drivers"]["Row"]>;
      };
      collections: {
        Row: {
          id: string;
          tenant_id: string;
          company_id: string;
          driver_id: string | null;
          vehicle_id: string | null;
          collection_date: string;
          volume_litros: number | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["collections"]["Row"]> & {
          tenant_id: string;
          company_id: string;
          collection_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["collections"]["Row"]>;
      };
      documents: {
        Row: {
          id: string;
          tenant_id: string;
          collection_id: string;
          type: "CCO" | "MTR";
          document_number: string | null;
          file_url: string | null;
          issue_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]> & {
          tenant_id: string;
          collection_id: string;
          type: "CCO" | "MTR";
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
      };
      bpo_tasks: {
        Row: {
          id: string;
          tenant_id: string;
          department: string;
          title: string;
          description: string | null;
          status: string;
          due_date: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bpo_tasks"]["Row"]> & {
          tenant_id: string;
          department: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["bpo_tasks"]["Row"]>;
      };
      dashboards_metrics: {
        Row: {
          id: string;
          tenant_id: string;
          metric_key: string;
          metric_value: number;
          scope: string;
          period_start: string;
          period_end: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["dashboards_metrics"]["Row"]> & {
          tenant_id: string;
          metric_key: string;
          metric_value: number;
          scope: string;
          period_start: string;
          period_end: string;
        };
        Update: Partial<Database["public"]["Tables"]["dashboards_metrics"]["Row"]>;
      };
      regulatory_matrix: {
        Row: {
          id: string;
          ibge_code: string;
          uf: string;
          sphere: "federal" | "estadual" | "municipal";
          rule_title: string;
          rule_description: string | null;
          required_documents: string[] | null;
          blocking_condition: string | null;
          reference_law: string | null;
          effective_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["regulatory_matrix"]["Row"]> & {
          ibge_code: string;
          uf: string;
          sphere: "federal" | "estadual" | "municipal";
          rule_title: string;
        };
        Update: Partial<Database["public"]["Tables"]["regulatory_matrix"]["Row"]>;
      };
    };
  };
};
