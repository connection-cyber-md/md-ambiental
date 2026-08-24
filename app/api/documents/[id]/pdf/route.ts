/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Verificar autenticação do usuário
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Buscar documento e dados da coleta relacionada aplicando as regras de RLS
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id, type, document_number, issue_date, status, file_url, collection_id")
    .eq("id", id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Documento não encontrado ou acesso negado." }, { status: 404 });
  }

  // Se o documento já possui um file_url de armazenamento externo, redirecionar
  if (doc.file_url && doc.file_url.startsWith("http")) {
    return NextResponse.redirect(doc.file_url);
  }

  // Gerar HTML corporativo formatado para o documento MTR / Certificado de Destinação
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>MD Ambiental - Certificado de Destinação / MTR</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111; margin: 0; padding: 40px; }
        .header { border-bottom: 2px solid #047857; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 22px; font-weight: bold; color: #047857; text-transform: uppercase; letter-spacing: 1px; }
        .doc-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; }
        .label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; font-family: monospace; }
        .value { font-size: 15px; font-weight: 600; color: #111; }
        .footer { margin-top: 50px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; pt: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">MD Ambiental — Gestão de OLUC</div>
        <div style="text-align: right; font-family: monospace; font-size: 12px; color: #6b7280;">
          Ref: ${doc.document_number || doc.id.substring(0, 8)}<br>
          Emissão: ${doc.issue_date ? new Date(doc.issue_date).toLocaleDateString("pt-BR") : "Data não informada"}
        </div>
      </div>

      <div class="doc-title">
        ${doc.type === 'CCO' ? 'Certificado de Coleta e Destinação de Óleo (CCO)' : 'Manifesto de Transporte de Resíduos (MTR)'}
      </div>

      <div class="grid">
        <div class="box">
          <div class="label">Tipo de Documento</div>
          <div class="value">${doc.type}</div>
        </div>
        <div class="box">
          <div class="label">Status Operacional</div>
          <div class="value" style="text-transform: uppercase;">${doc.status}</div>
        </div>
        <div class="box">
          <div class="label">Número de Registro</div>
          <div class="value">${doc.document_number || "Gerado por Sistema"}</div>
        </div>
        <div class="box">
          <div class="label">Identificador da Coleta</div>
          <div class="value">#${doc.collection_id ? doc.collection_id.substring(0, 8) : "N/A"}</div>
        </div>
      </div>

      <div class="footer">
        MD Ambiental Ltda. — Documento oficial gerado eletronicamente em conformidade com as normativas ambientais vigentes.<br>
        Autenticidade verificada e blindada via banco de dados corporativo com RLS ativo.
      </div>
    </body>
    </html>
  `;

  return new NextResponse(htmlContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="documento-${doc.document_number || doc.id}.html"`,
    },
  });
}