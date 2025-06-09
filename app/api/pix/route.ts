import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { value, webhook_url } = await request.json();

    // Validação dos dados recebidos
    if (!value || typeof value !== "number") {
      return NextResponse.json(
        { error: "Valor é obrigatório e deve ser um número" },
        { status: 400 }
      );
    } // Chamar a API externa do PushInPay
    const response = await fetch(
      "https://api.pushinpay.com.br/api/pix/cashIn",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer 28039|PZ7Icht09wi47SY7cp2ZoAgbvQzJWMNeTr1gI1EX9940be6d",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: value,
          webhook_url: webhook_url || "https://seuservico.com/webhook",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Erro ao gerar pagamento PIX" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Verificar se os dados necessários estão presentes
    if (!data.qr_code) {
      return NextResponse.json(
        { error: "QR Code não foi gerado pela API" },
        { status: 500 }
      );
    }

    // Retornar os dados formatados
    return NextResponse.json({
      id: data.id,
      qr_code: data.qr_code,
      qr_code_base64: data.qr_code_base64,
      amount: value,
      created_at: new Date().toISOString(),
      status: "pending",
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID da transação é obrigatório" },
      { status: 400 }
    );
  }

  try {
    // Verificar status do pagamento na API externa
    const response = await fetch(
      `https://api.pushinpay.com.br/api/transactions/${id}`,
      {
        headers: {
          Authorization:
            "Bearer 28039|PZ7Icht09wi47SY7cp2ZoAgbvQzJWMNeTr1gI1EX9940be6d",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Erro ao verificar pagamento" },
        { status: response.status }
      );
    }
    const data = await response.json();

    return NextResponse.json({
      id: data.id,
      status: data.status,
      amount: data.amount,
      created_at: data.created_at,
      paid_at: data.paid_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
