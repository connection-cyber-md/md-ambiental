import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Endpoint de processamento e ingestão de webhooks do WhatsApp / Meta
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação estrutural do payload da API da Meta
    if (!body || !body.entry || !body.entry[0]?.changes) {
      return NextResponse.json({ status: "ignored", reason: "invalid_payload" }, { status: 200 });
    }

    const change = body.entry[0].changes[0];
    const value = change.value;

    // Verifica se existem mensagens de entrada (incoming messages)
    if (value && value.messages && value.messages.length > 0) {
      const message = value.messages[0];
      const senderPhone = message.from; // Número do WhatsApp do gerador
      const messageText = message.text?.body || "Solicitação de Coleta via WhatsApp";
      const senderName = value.contacts?.[0]?.profile?.name || "Gerador OLUC";

      const supabase = await createClient();

      // 1. Verificar se o contato já existe na tabela 'contacts'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingContact } = await (supabase.from("contacts" as any))
        .select("id, company_id")
        .eq("phone", senderPhone)
        .maybeSingle();

      const existingRecord = existingContact as Record<string, unknown> | null;
      let contactId = existingRecord?.id as string | undefined;

      if (!contactId) {
        // Criar novo contato automaticamente caso não exista
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newContact, error: contactError } = await (supabase.from("contacts" as any))
          .insert({
            name: senderName,
            phone: senderPhone,
            status: "lead"
          })
          .select("id")
          .single();

        const newRecord = newContact as Record<string, unknown> | null;
        if (!contactError && newRecord) {
          contactId = newRecord.id as string | undefined;
        }
      }

      if (contactId) {
        // 2. Injetar o lead automaticamente na tabela de Deals do CRM (oluc_crm_deals)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("oluc_crm_deals" as any)).insert({
          contact_id: contactId,
          title: `Coleta OLUC: ${senderName}`,
          stage: "nova_solicitacao",
          notes: `Mensagem recebida via WhatsApp: "${messageText}"`,
          volume_estimado_litros: 100
        });
      }
    }

    return NextResponse.json({ status: "success", received: true, processed: true }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido no webhook";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  // Validação de verificação de token exigida pela Meta (Webhook Challenge)
  return new NextResponse("MD Ambiental Webhook Gateway Ativo", { status: 200 });
}