import { NextResponse } from "next/server";

// Endpoint público para recebimento de eventos de webhook do WhatsApp / Meta
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body || !body.entry) {
      return NextResponse.json({ status: "ignored", reason: "invalid_payload" }, { status: 200 });
    }

    return NextResponse.json({ status: "success", received: true }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse("MD Ambiental Webhook Gateway Ativo", { status: 200 });
}