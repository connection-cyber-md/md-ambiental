import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { createHash } from "crypto";

// Cores da identidade visual (ver tailwind.config.ts) — mantidas em sync manualmente
// porque pdf-lib não lê classes Tailwind.
const INK = rgb(0x10 / 255, 0x15 / 255, 0x0f / 255);
const STEEL = rgb(0x5c / 255, 0x66 / 255, 0x5b / 255);
const BRAND_GREEN = rgb(0x1e / 255, 0x6b / 255, 0x3c / 255);
const BRAND_AMBER = rgb(0xc1 / 255, 0x60 / 255, 0x2c / 255);

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 56;

export type CcoPdfData = {
  documentId: string;
  documentNumber: string | null;
  issueDate: string; // ISO date, já resolvida (existente ou hoje)
  tenant: {
    razaoSocial: string;
    cnpj: string;
    logradouro: string | null;
    cidade: string | null;
    uf: string | null;
    anpAuthorizationNumber: string | null;
  };
  company: {
    razaoSocial: string;
    cnpj: string;
    logradouro: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    licenseNumber: string | null;
  };
  collection: {
    collectionDate: string; // ISO
    volumeLitros: number | null;
    vehiclePlate: string | null;
    driverName: string | null;
  };
};

function fmtDatePtBr(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function notInformed(v: string | null | undefined) {
  return v && v.trim() ? v : "não informado";
}

function tenantAddress(t: CcoPdfData["tenant"]) {
  if (!t.logradouro && !t.cidade && !t.uf) return "não informado";
  const cityUf = [t.cidade, t.uf].filter(Boolean).join("/");
  return [t.logradouro, cityUf].filter(Boolean).join(" — ") || "não informado";
}

function companyAddress(c: CcoPdfData["company"]) {
  if (!c.logradouro && !c.cidade) return "não informado";
  const line1 = [c.logradouro, c.numero].filter(Boolean).join(", ");
  const cityUf = [c.cidade, c.uf].filter(Boolean).join("/");
  const line2 = [c.bairro, cityUf].filter(Boolean).join(" — ");
  return [line1, line2].filter(Boolean).join(" — ") || "não informado";
}

/**
 * Código de validação real (SHA-256 do id do documento + data de emissão),
 * substituindo o base64 reversível da proposta original do Gemini.
 */
export function validationCode(documentId: string, issueDate: string) {
  return createHash("sha256")
    .update(`${documentId}|${issueDate}`)
    .digest("hex")
    .toUpperCase()
    .slice(0, 16);
}

export async function generateCcoPdfBytes(data: CcoPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 780;

  function text(str: string, opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> } = {}) {
    page.drawText(str, {
      x: MARGIN_X,
      y,
      size: opts.size ?? 10.5,
      font: opts.f ?? font,
      color: opts.color ?? INK,
    });
  }

  function label(str: string) {
    text(str.toUpperCase(), { size: 8.5, f: bold, color: STEEL });
    y -= 13;
  }

  function value(str: string) {
    text(str, { size: 11.5 });
    y -= 20;
  }

  function rule(color = STEEL, thickness = 0.5) {
    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_WIDTH - MARGIN_X, y }, thickness, color });
    y -= 18;
  }

  // Cabeçalho
  text("CERTIFICADO DE COLETA — CCO", { size: 18, f: bold, color: BRAND_GREEN });
  y -= 20;
  text("Óleo lubrificante usado ou contaminado", { size: 11, color: STEEL });
  y -= 8;
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_WIDTH - MARGIN_X, y }, thickness: 2, color: BRAND_AMBER });
  y -= 26;

  // Emissor
  label("Emissor (empresa coletora)");
  value(data.tenant.razaoSocial);
  label("CNPJ");
  value(data.tenant.cnpj);
  label("Endereço");
  value(tenantAddress(data.tenant));
  label("Autorização ANP");
  value(notInformed(data.tenant.anpAuthorizationNumber));

  rule();

  // Gerador
  label("Dados do gerador (cliente)");
  value(data.company.razaoSocial);
  label("CNPJ");
  value(data.company.cnpj);
  label("Endereço");
  value(companyAddress(data.company));
  label("Nº de licença ambiental");
  value(notInformed(data.company.licenseNumber));

  rule();

  // Coleta
  label("Data da coleta");
  value(fmtDatePtBr(data.collection.collectionDate));
  label("Volume coletado");
  value(
    data.collection.volumeLitros != null
      ? `${data.collection.volumeLitros.toLocaleString("pt-BR")} L`
      : "não informado"
  );
  label("Veículo (placa)");
  value(notInformed(data.collection.vehiclePlate));
  label("Motorista responsável");
  value(notInformed(data.collection.driverName));

  rule();

  // Documento
  label("Número do documento");
  value(notInformed(data.documentNumber));
  label("Data de emissão");
  value(fmtDatePtBr(data.issueDate));

  y -= 10;
  text("Coleta e destinação realizadas em conformidade com a Resolução CONAMA nº 362/2005.", {
    size: 8.5,
    color: STEEL,
  });
  y -= 22;

  const code = validationCode(data.documentId, data.issueDate);
  text(`Código de validação: ${code}`, { size: 8.5, f: bold, color: INK });

  return doc.save();
}
