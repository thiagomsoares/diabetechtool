import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, apiSecret } = body;

    // Validar se os dados necessários foram recebidos
    if (!url) {
      return NextResponse.json(
        { error: 'URL do Nightscout não fornecida' },
        { status: 400 }
      );
    }

    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Chave API não fornecida' },
        { status: 400 }
      );
    }

    // Limpar a URL e garantir que termina com /api/v1/status.json
    const cleanUrl = url.replace(/\/+$/, ''); // Remove barras extras do final
    const testUrl = `${cleanUrl}/api/v1/status.json`;
    
    console.log('Testando conexão:', {
      url: testUrl,
      hasApiSecret: !!apiSecret
    });

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'API-SECRET': apiSecret
    };

    const response = await fetch(testUrl, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Erro no teste:', {
        status: response.status,
        statusText: response.statusText,
        url: testUrl
      });

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Chave API inválida. Verifique se a chave está correta.' },
          { status: 401 }
        );
      }

      throw new Error(`Erro ao conectar com o Nightscout (${response.status}): ${response.statusText}`);
    }

    // Tentar ler o corpo da resposta para garantir que é um JSON válido
    const data = await response.json();

    return NextResponse.json({ 
      success: true,
      message: 'Conexão estabelecida com sucesso',
      status: data
    });

  } catch (error) {
    console.error('Erro no teste de conexão:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? `Erro ao testar conexão: ${error.message}`
          : 'Erro desconhecido ao testar conexão',
        details: error
      },
      { status: 500 }
    );
  }
} 