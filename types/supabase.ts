export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bases: {
        Row: {
          address_bairro: string | null
          address_cep: string | null
          address_cidade: string | null
          address_logradouro: string | null
          address_numero: string | null
          address_uf: string | null
          capacity_total_litros: number | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address_bairro?: string | null
          address_cep?: string | null
          address_cidade?: string | null
          address_logradouro?: string | null
          address_numero?: string | null
          address_uf?: string | null
          capacity_total_litros?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address_bairro?: string | null
          address_cep?: string | null
          address_cidade?: string | null
          address_logradouro?: string | null
          address_numero?: string | null
          address_uf?: string | null
          capacity_total_litros?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bpo_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          department: Database["public"]["Enums"]["bpo_department"]
          description: string | null
          due_date: string | null
          id: string
          is_synthetic: boolean
          status: Database["public"]["Enums"]["bpo_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          department: Database["public"]["Enums"]["bpo_department"]
          description?: string | null
          due_date?: string | null
          id?: string
          is_synthetic?: boolean
          status?: Database["public"]["Enums"]["bpo_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["bpo_department"]
          description?: string | null
          due_date?: string | null
          id?: string
          is_synthetic?: boolean
          status?: Database["public"]["Enums"]["bpo_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bpo_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bpo_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          collection_date: string
          company_id: string
          created_at: string
          driver_id: string | null
          estimated_distance_km: number | null
          id: string
          is_synthetic: boolean
          notes: string | null
          route_order: number | null
          status: Database["public"]["Enums"]["collection_status"]
          tenant_id: string
          updated_at: string
          vehicle_id: string | null
          volume_litros: number | null
        }
        Insert: {
          collection_date: string
          company_id: string
          created_at?: string
          driver_id?: string | null
          estimated_distance_km?: number | null
          id?: string
          is_synthetic?: boolean
          notes?: string | null
          route_order?: number | null
          status?: Database["public"]["Enums"]["collection_status"]
          tenant_id: string
          updated_at?: string
          vehicle_id?: string | null
          volume_litros?: number | null
        }
        Update: {
          collection_date?: string
          company_id?: string
          created_at?: string
          driver_id?: string | null
          estimated_distance_km?: number | null
          id?: string
          is_synthetic?: boolean
          notes?: string | null
          route_order?: number | null
          status?: Database["public"]["Enums"]["collection_status"]
          tenant_id?: string
          updated_at?: string
          vehicle_id?: string | null
          volume_litros?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_bairro: string | null
          address_cep: string | null
          address_cidade: string | null
          address_logradouro: string | null
          address_numero: string | null
          address_uf: string | null
          cnpj: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          ibge_code: string | null
          id: string
          is_synthetic: boolean
          license_expiry_date: string | null
          license_issue_date: string | null
          license_issuing_agency: string | null
          license_number: string | null
          license_type: string | null
          nome_fantasia: string | null
          razao_social: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address_bairro?: string | null
          address_cep?: string | null
          address_cidade?: string | null
          address_logradouro?: string | null
          address_numero?: string | null
          address_uf?: string | null
          cnpj: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          ibge_code?: string | null
          id?: string
          is_synthetic?: boolean
          license_expiry_date?: string | null
          license_issue_date?: string | null
          license_issuing_agency?: string | null
          license_number?: string | null
          license_type?: string | null
          nome_fantasia?: string | null
          razao_social: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address_bairro?: string | null
          address_cep?: string | null
          address_cidade?: string | null
          address_logradouro?: string | null
          address_numero?: string | null
          address_uf?: string | null
          cnpj?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          ibge_code?: string | null
          id?: string
          is_synthetic?: boolean
          license_expiry_date?: string | null
          license_issue_date?: string | null
          license_issuing_agency?: string | null
          license_number?: string | null
          license_type?: string | null
          nome_fantasia?: string | null
          razao_social?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          company_id: string | null
          created_at: string
          destinatario_id: string | null
          end_date: string | null
          id: string
          is_synthetic: boolean
          notes: string | null
          party_type: Database["public"]["Enums"]["contract_party_type"]
          price_per_litro: number | null
          sla_hours: number | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          destinatario_id?: string | null
          end_date?: string | null
          id?: string
          is_synthetic?: boolean
          notes?: string | null
          party_type: Database["public"]["Enums"]["contract_party_type"]
          price_per_litro?: number | null
          sla_hours?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          destinatario_id?: string | null
          end_date?: string | null
          id?: string
          is_synthetic?: boolean
          notes?: string | null
          party_type?: Database["public"]["Enums"]["contract_party_type"]
          price_per_litro?: number | null
          sla_hours?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "destinatarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_key: string
          metric_value: number
          period_end: string
          period_start: string
          scope: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_key: string
          metric_value: number
          period_end: string
          period_start: string
          scope: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_key?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          scope?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      destinatarios: {
        Row: {
          address_cidade: string | null
          address_uf: string | null
          authorization_expiry_date: string | null
          authorization_number: string | null
          cnpj: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          nome_fantasia: string | null
          razao_social: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address_cidade?: string | null
          address_uf?: string | null
          authorization_expiry_date?: string | null
          authorization_number?: string | null
          cnpj: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          nome_fantasia?: string | null
          razao_social: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address_cidade?: string | null
          address_uf?: string | null
          authorization_expiry_date?: string | null
          authorization_number?: string | null
          cnpj?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          nome_fantasia?: string | null
          razao_social?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "destinatarios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          collection_id: string | null
          created_at: string
          document_number: string | null
          expedition_id: string | null
          file_url: string | null
          id: string
          is_synthetic: boolean
          issue_date: string | null
          notes: string | null
          status: Database["public"]["Enums"]["document_status"]
          superseded_by: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          verification_code: string | null
          version: number
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          document_number?: string | null
          expedition_id?: string | null
          file_url?: string | null
          id?: string
          is_synthetic?: boolean
          issue_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          superseded_by?: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          verification_code?: string | null
          version?: number
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          document_number?: string | null
          expedition_id?: string | null
          file_url?: string | null
          id?: string
          is_synthetic?: boolean
          issue_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          superseded_by?: string | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          verification_code?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          cnh_category: string | null
          cnh_expiry: string | null
          cnh_number: string
          created_at: string
          id: string
          is_synthetic: boolean
          mopp_expiry: string | null
          profile_id: string
          status: Database["public"]["Enums"]["driver_status"]
          tenant_id: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          cnh_category?: string | null
          cnh_expiry?: string | null
          cnh_number: string
          created_at?: string
          id?: string
          is_synthetic?: boolean
          mopp_expiry?: string | null
          profile_id: string
          status?: Database["public"]["Enums"]["driver_status"]
          tenant_id: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          cnh_category?: string | null
          cnh_expiry?: string | null
          cnh_number?: string
          created_at?: string
          id?: string
          is_synthetic?: boolean
          mopp_expiry?: string | null
          profile_id?: string
          status?: Database["public"]["Enums"]["driver_status"]
          tenant_id?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      evidences: {
        Row: {
          captured_at: string
          captured_by: string | null
          collection_id: string
          created_at: string
          file_url: string | null
          id: string
          is_synthetic: boolean
          latitude: number | null
          longitude: number | null
          tenant_id: string
          type: Database["public"]["Enums"]["evidence_type"]
        }
        Insert: {
          captured_at?: string
          captured_by?: string | null
          collection_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_synthetic?: boolean
          latitude?: number | null
          longitude?: number | null
          tenant_id: string
          type: Database["public"]["Enums"]["evidence_type"]
        }
        Update: {
          captured_at?: string
          captured_by?: string | null
          collection_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_synthetic?: boolean
          latitude?: number | null
          longitude?: number | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["evidence_type"]
        }
        Relationships: [
          {
            foreignKeyName: "evidences_captured_by_fkey"
            columns: ["captured_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expedition_lots: {
        Row: {
          created_at: string
          expedition_id: string
          id: string
          is_synthetic: boolean
          lot_id: string
          tenant_id: string
          volume_litros: number
        }
        Insert: {
          created_at?: string
          expedition_id: string
          id?: string
          is_synthetic?: boolean
          lot_id: string
          tenant_id: string
          volume_litros: number
        }
        Update: {
          created_at?: string
          expedition_id?: string
          id?: string
          is_synthetic?: boolean
          lot_id?: string
          tenant_id?: string
          volume_litros?: number
        }
        Relationships: [
          {
            foreignKeyName: "expedition_lots_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expedition_lots_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expedition_lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expeditions: {
        Row: {
          created_at: string
          destinatario_id: string
          driver_id: string | null
          expedition_date: string
          id: string
          is_synthetic: boolean
          notes: string | null
          receipt_document_id: string | null
          reconciled_at: string | null
          status: Database["public"]["Enums"]["expedition_status"]
          tenant_id: string
          total_volume_litros: number | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          destinatario_id: string
          driver_id?: string | null
          expedition_date?: string
          id?: string
          is_synthetic?: boolean
          notes?: string | null
          receipt_document_id?: string | null
          reconciled_at?: string | null
          status?: Database["public"]["Enums"]["expedition_status"]
          tenant_id: string
          total_volume_litros?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          destinatario_id?: string
          driver_id?: string | null
          expedition_date?: string
          id?: string
          is_synthetic?: boolean
          notes?: string | null
          receipt_document_id?: string | null
          reconciled_at?: string | null
          status?: Database["public"]["Enums"]["expedition_status"]
          tenant_id?: string
          total_volume_litros?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expeditions_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "destinatarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expeditions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expeditions_receipt_document_id_fkey"
            columns: ["receipt_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expeditions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expeditions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_accounts: {
        Row: {
          bank_name: string | null
          created_at: string
          id: string
          initial_balance: number
          is_active: boolean
          kind: Database["public"]["Enums"]["financial_account_kind"]
          name: string
          tenant_id: string
        }
        Insert: {
          bank_name?: string | null
          created_at?: string
          id?: string
          initial_balance?: number
          is_active?: boolean
          kind: Database["public"]["Enums"]["financial_account_kind"]
          name: string
          tenant_id: string
        }
        Update: {
          bank_name?: string | null
          created_at?: string
          id?: string
          initial_balance?: number
          is_active?: boolean
          kind?: Database["public"]["Enums"]["financial_account_kind"]
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          type: Database["public"]["Enums"]["financial_entry_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          type: Database["public"]["Enums"]["financial_entry_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          type?: Database["public"]["Enums"]["financial_entry_type"]
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          account_id: string
          amount: number
          category_id: string
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          entry_date: string
          id: string
          is_synthetic: boolean
          paid_date: string | null
          reference_id: string | null
          reference_type: string | null
          status: Database["public"]["Enums"]["financial_entry_status"]
          tenant_id: string
          type: Database["public"]["Enums"]["financial_entry_type"]
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id: string
          created_at?: string
          created_by?: string | null
          description: string
          due_date?: string | null
          entry_date: string
          id?: string
          is_synthetic?: boolean
          paid_date?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["financial_entry_status"]
          tenant_id: string
          type: Database["public"]["Enums"]["financial_entry_type"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          entry_date?: string
          id?: string
          is_synthetic?: boolean
          paid_date?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["financial_entry_status"]
          tenant_id?: string
          type?: Database["public"]["Enums"]["financial_entry_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_metrics: {
        Row: {
          computation_mode: string
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          label: string
          metric_key: string
          period_label: string | null
          source: string | null
          tenant_id: string
          unit: string | null
          updated_at: string
          value: number
        }
        Insert: {
          computation_mode?: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          label: string
          metric_key: string
          period_label?: string | null
          source?: string | null
          tenant_id: string
          unit?: string | null
          updated_at?: string
          value?: number
        }
        Update: {
          computation_mode?: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          label?: string
          metric_key?: string
          period_label?: string | null
          source?: string | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "impact_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          closed_at: string | null
          code: string
          created_at: string
          id: string
          is_synthetic: boolean
          opened_at: string
          quality_classification: string | null
          status: Database["public"]["Enums"]["lot_status"]
          tank_id: string
          tenant_id: string
          updated_at: string
          volume_litros: number
        }
        Insert: {
          closed_at?: string | null
          code: string
          created_at?: string
          id?: string
          is_synthetic?: boolean
          opened_at?: string
          quality_classification?: string | null
          status?: Database["public"]["Enums"]["lot_status"]
          tank_id: string
          tenant_id: string
          updated_at?: string
          volume_litros?: number
        }
        Update: {
          closed_at?: string | null
          code?: string
          created_at?: string
          id?: string
          is_synthetic?: boolean
          opened_at?: string
          quality_classification?: string | null
          status?: Database["public"]["Enums"]["lot_status"]
          tank_id?: string
          tenant_id?: string
          updated_at?: string
          volume_litros?: number
        }
        Relationships: [
          {
            foreignKeyName: "lots_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tanks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_matrix: {
        Row: {
          blocking_condition: string | null
          created_at: string
          effective_date: string | null
          ibge_code: string | null
          id: string
          reference_law: string | null
          required_documents: string[] | null
          rule_description: string | null
          rule_title: string
          sphere: Database["public"]["Enums"]["regulatory_sphere"]
          uf: string | null
          updated_at: string
        }
        Insert: {
          blocking_condition?: string | null
          created_at?: string
          effective_date?: string | null
          ibge_code?: string | null
          id?: string
          reference_law?: string | null
          required_documents?: string[] | null
          rule_description?: string | null
          rule_title: string
          sphere: Database["public"]["Enums"]["regulatory_sphere"]
          uf?: string | null
          updated_at?: string
        }
        Update: {
          blocking_condition?: string | null
          created_at?: string
          effective_date?: string | null
          ibge_code?: string | null
          id?: string
          reference_law?: string | null
          required_documents?: string[] | null
          rule_description?: string | null
          rule_title?: string
          sphere?: Database["public"]["Enums"]["regulatory_sphere"]
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      samples: {
        Row: {
          classification: string | null
          collection_id: string
          contaminants_declared: string | null
          created_at: string
          id: string
          is_synthetic: boolean
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          seal_code: string | null
          status: Database["public"]["Enums"]["sample_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          classification?: string | null
          collection_id: string
          contaminants_declared?: string | null
          created_at?: string
          id?: string
          is_synthetic?: boolean
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seal_code?: string | null
          status?: Database["public"]["Enums"]["sample_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          classification?: string | null
          collection_id?: string
          contaminants_declared?: string | null
          created_at?: string
          id?: string
          is_synthetic?: boolean
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seal_code?: string | null
          status?: Database["public"]["Enums"]["sample_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "samples_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          collection_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_synthetic: boolean
          lot_id: string | null
          reason: string | null
          related_movement_id: string | null
          tank_id: string
          tenant_id: string
          type: Database["public"]["Enums"]["movement_type"]
          volume_litros: number
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_synthetic?: boolean
          lot_id?: string | null
          reason?: string | null
          related_movement_id?: string | null
          tank_id: string
          tenant_id: string
          type: Database["public"]["Enums"]["movement_type"]
          volume_litros: number
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_synthetic?: boolean
          lot_id?: string | null
          reason?: string | null
          related_movement_id?: string | null
          tank_id?: string
          tenant_id?: string
          type?: Database["public"]["Enums"]["movement_type"]
          volume_litros?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_related_movement_id_fkey"
            columns: ["related_movement_id"]
            isOneToOne: false
            referencedRelation: "stock_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tanks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tanks: {
        Row: {
          base_id: string
          capacity_litros: number
          code: string
          created_at: string
          id: string
          material_class: string | null
          status: Database["public"]["Enums"]["tank_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_id: string
          capacity_litros: number
          code: string
          created_at?: string
          id?: string
          material_class?: string | null
          status?: Database["public"]["Enums"]["tank_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_id?: string
          capacity_litros?: number
          code?: string
          created_at?: string
          id?: string
          material_class?: string | null
          status?: Database["public"]["Enums"]["tank_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tanks_base_id_fkey"
            columns: ["base_id"]
            isOneToOne: false
            referencedRelation: "bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tanks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address_cidade: string | null
          address_logradouro: string | null
          address_uf: string | null
          anp_authorization_number: string | null
          cnpj: string
          created_at: string
          id: string
          nome_fantasia: string | null
          razao_social: string
          status: string
          updated_at: string
        }
        Insert: {
          address_cidade?: string | null
          address_logradouro?: string | null
          address_uf?: string | null
          anp_authorization_number?: string | null
          cnpj: string
          created_at?: string
          id?: string
          nome_fantasia?: string | null
          razao_social: string
          status?: string
          updated_at?: string
        }
        Update: {
          address_cidade?: string | null
          address_logradouro?: string | null
          address_uf?: string | null
          anp_authorization_number?: string | null
          cnpj?: string
          created_at?: string
          id?: string
          nome_fantasia?: string | null
          razao_social?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_maintenance: {
        Row: {
          cost: number
          created_at: string
          description: string | null
          id: string
          is_synthetic: boolean
          maintenance_date: string
          maintenance_type: Database["public"]["Enums"]["maintenance_type"]
          tenant_id: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          cost: number
          created_at?: string
          description?: string | null
          id?: string
          is_synthetic?: boolean
          maintenance_date: string
          maintenance_type: Database["public"]["Enums"]["maintenance_type"]
          tenant_id: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          is_synthetic?: boolean
          maintenance_date?: string
          maintenance_type?: Database["public"]["Enums"]["maintenance_type"]
          tenant_id?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_shifts: {
        Row: {
          created_at: string
          driver_id: string
          end_km: number | null
          end_time: string | null
          fuel_added_liters: number | null
          id: string
          start_km: number
          start_time: string
          tenant_id: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          end_km?: number | null
          end_time?: string | null
          fuel_added_liters?: number | null
          id?: string
          start_km: number
          start_time?: string
          tenant_id: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          end_km?: number | null
          end_time?: string | null
          fuel_added_liters?: number | null
          id?: string
          start_km?: number
          start_time?: string
          tenant_id?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_shifts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_shifts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_shifts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string | null
          capacity_litros: number | null
          created_at: string
          id: string
          insurance_expiry_date: string | null
          is_synthetic: boolean
          license_expiry_date: string | null
          model: string | null
          plate: string
          status: Database["public"]["Enums"]["vehicle_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          capacity_litros?: number | null
          created_at?: string
          id?: string
          insurance_expiry_date?: string | null
          is_synthetic?: boolean
          license_expiry_date?: string | null
          model?: string | null
          plate: string
          status?: Database["public"]["Enums"]["vehicle_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          capacity_litros?: number | null
          created_at?: string
          id?: string
          insurance_expiry_date?: string | null
          is_synthetic?: boolean
          license_expiry_date?: string | null
          model?: string | null
          plate?: string
          status?: Database["public"]["Enums"]["vehicle_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role_claim: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      is_system_admin: { Args: never; Returns: boolean }
      tenant_id: { Args: never; Returns: string }
    }
    Enums: {
      bpo_department:
        | "comercial"
        | "operacional"
        | "administrativo"
        | "financeiro"
        | "rh"
      bpo_status: "pending" | "in_progress" | "done" | "blocked"
      collection_status: "scheduled" | "in_progress" | "completed" | "canceled"
      contract_party_type: "gerador" | "destinatario"
      contract_status: "draft" | "active" | "suspended" | "terminated"
      document_status: "draft" | "issued" | "canceled"
      document_type: "CCO" | "MTR" | "CRC"
      driver_status: "active" | "inactive"
      evidence_type: "photo" | "signature" | "geolocation" | "document"
      expedition_status:
        | "scheduled"
        | "in_transit"
        | "delivered"
        | "reconciled"
        | "canceled"
      financial_account_kind: "banco" | "caixa"
      financial_entry_status: "pending" | "paid" | "canceled"
      financial_entry_type: "receita" | "despesa"
      lot_status: "open" | "closed" | "expedited" | "blocked"
      maintenance_type: "oleo" | "pneu" | "lavagem" | "mecanica" | "documento"
      movement_type:
        | "entrada"
        | "transferencia"
        | "ajuste"
        | "perda"
        | "expedicao"
        | "inventario"
      regulatory_sphere: "federal" | "estadual" | "municipal"
      sample_status: "pending" | "approved" | "quarantine" | "rejected"
      tank_status: "active" | "maintenance" | "inactive"
      user_role:
        | "system_admin"
        | "tenant_admin"
        | "tenant_operator"
        | "tenant_driver"
        | "client"
      vehicle_status: "active" | "maintenance" | "inactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bpo_department: [
        "comercial",
        "operacional",
        "administrativo",
        "financeiro",
        "rh",
      ],
      bpo_status: ["pending", "in_progress", "done", "blocked"],
      collection_status: ["scheduled", "in_progress", "completed", "canceled"],
      contract_party_type: ["gerador", "destinatario"],
      contract_status: ["draft", "active", "suspended", "terminated"],
      document_status: ["draft", "issued", "canceled"],
      document_type: ["CCO", "MTR", "CRC"],
      driver_status: ["active", "inactive"],
      evidence_type: ["photo", "signature", "geolocation", "document"],
      expedition_status: [
        "scheduled",
        "in_transit",
        "delivered",
        "reconciled",
        "canceled",
      ],
      financial_account_kind: ["banco", "caixa"],
      financial_entry_status: ["pending", "paid", "canceled"],
      financial_entry_type: ["receita", "despesa"],
      lot_status: ["open", "closed", "expedited", "blocked"],
      maintenance_type: ["oleo", "pneu", "lavagem", "mecanica", "documento"],
      movement_type: [
        "entrada",
        "transferencia",
        "ajuste",
        "perda",
        "expedicao",
        "inventario",
      ],
      regulatory_sphere: ["federal", "estadual", "municipal"],
      sample_status: ["pending", "approved", "quarantine", "rejected"],
      tank_status: ["active", "maintenance", "inactive"],
      user_role: [
        "system_admin",
        "tenant_admin",
        "tenant_operator",
        "tenant_driver",
        "client",
      ],
      vehicle_status: ["active", "maintenance", "inactive"],
    },
  },
} as const
