import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";

const INK = rgb(0x10 / 255, 0x15 / 255, 0x0f / 255);
const STEEL = rgb(0x5c / 255, 0x66 / 255, 0x5b / 255);
const BRAND_GREEN = rgb(0x1e / 255, 0x6b / 255, 0x3c / 255);
const BRAND_AMBER = rgb(0xc1 / 255, 0x60 / 255, 0x2c / 255);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 56;
const MARGIN_TOP = 70;
const MARGIN_BOTTOM = 60;

const SPHERE_LABEL: Record<string, string> = {
  federal: "Federal",
  estadual: "Estadual",
  municipal: "Municipal",
};

export type MatrixRule = {
  sphere: string;
  uf: string | null;
  rule_title: string;
  rule_description: string | null;
  required_documents: string[] | null;
  blocking_condition: string | null;
  reference_law: string | null;
};

export async function generateRegulatoryMatrixPdfBytes(tenantName: string, rules: MatrixRule[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = await readFile(path.join(process.cwd(), "public/brand/logo.png"));
  const logo = await doc.embedPng(logoBytes);
  const LOGO_HEIGHT = 40;
  const logoWidth = logo.width * (LOGO_HEIGHT / logo.height);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN_TOP;

  function newPage() {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN_TOP;
  }

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN_BOTTOM) newPage();
  }

  function drawHeader(p: PDFPage) {
    p.drawImage(logo, { x: MARGIN_X, y: PAGE_HEIGHT - 46, width: logoWidth, height: LOGO_HEIGHT });
    p.drawText("MATRIZ REGULATÓRIA", {
      x: MARGIN_X + logoWidth + 14,
      y: PAGE_HEIGHT - 34,
      size: 15,
      font: bold,
      color: BRAND_GREEN,
    });
    p.drawText(`${tenantName} — gerado em ${new Date().toLocaleDateString("pt-BR")}`, {
      x: MARGIN_X + logoWidth + 14,
      y: PAGE_HEIGHT - 50,
      size: 9.5,
      font,
      color: STEEL,
    });
    p.drawLine({
      start: { x: MARGIN_X, y: PAGE_HEIGHT - 58 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - 58 },
      thickness: 1.5,
      color: BRAND_AMBER,
    });
  }

  drawHeader(page);

  function text(str: string, opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb>; x?: number } = {}) {
    page.drawText(str, {
      x: opts.x ?? MARGIN_X,
      y,
      size: opts.size ?? 10.5,
      font: opts.f ?? font,
      color: opts.color ?? INK,
    });
  }

  function wrapText(str: string, maxChars: number): string[] {
    const words = str.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const w of words) {
      if ((current + " " + w).trim().length > maxChars) {
        if (current) lines.push(current.trim());
        current = w;
      } else {
        current = `${current} ${w}`.trim();
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  if (rules.length === 0) {
    ensureSpace(20);
    text("Nenhuma regra cadastrada na matriz regulatória.", { color: STEEL });
  }

  for (const rule of rules) {
    ensureSpace(90);

    text(`${SPHERE_LABEL[rule.sphere] ?? rule.sphere}${rule.uf ? ` — ${rule.uf}` : " — Nacional"}`, {
      size: 8.5,
      f: bold,
      color: BRAND_AMBER,
    });
    y -= 13;

    text(rule.rule_title, { size: 12, f: bold });
    y -= 16;

    if (rule.rule_description) {
      for (const line of wrapText(rule.rule_description, 95)) {
        ensureSpace(13);
        text(line, { size: 9.5, color: STEEL });
        y -= 13;
      }
    }

    if (rule.required_documents && rule.required_documents.length > 0) {
      ensureSpace(13);
      text(`Documentos exigidos: ${rule.required_documents.join(", ")}`, { size: 9, color: INK });
      y -= 13;
    }

    if (rule.blocking_condition) {
      ensureSpace(13);
      text(`Condição de bloqueio: ${rule.blocking_condition}`, { size: 9, color: rgb(0.6, 0.2, 0.1) });
      y -= 13;
    }

    if (rule.reference_law) {
      ensureSpace(13);
      text(`Referência: ${rule.reference_law}`, { size: 9, color: STEEL });
      y -= 13;
    }

    y -= 12;
    ensureSpace(1);
    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_WIDTH - MARGIN_X, y }, thickness: 0.5, color: STEEL });
    y -= 18;
  }

  return doc.save();
}
