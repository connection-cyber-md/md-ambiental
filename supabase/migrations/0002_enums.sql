-- Enum types shared across tables.

create type public.user_role as enum (
  'system_admin',
  'tenant_admin',
  'tenant_operator',
  'tenant_driver',
  'client'
);

create type public.vehicle_status as enum ('active', 'maintenance', 'inactive');

create type public.driver_status as enum ('active', 'inactive');

create type public.collection_status as enum ('scheduled', 'in_progress', 'completed', 'canceled');

create type public.document_type as enum ('CCO', 'MTR');

create type public.document_status as enum ('draft', 'issued', 'canceled');

create type public.bpo_department as enum ('comercial', 'operacional', 'administrativo', 'financeiro', 'rh');

create type public.bpo_status as enum ('pending', 'in_progress', 'done', 'blocked');

create type public.regulatory_sphere as enum ('federal', 'estadual', 'municipal');
