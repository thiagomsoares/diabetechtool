import { NextRequest, NextResponse } from 'next/server';
import { NightscoutConfig } from '@/app/types/nightscout';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url: string; apiSecret: string };
    let { url, apiSecret } = body;

    // Limpar a URL removendo barras extras
    url = url.replace(/([^:]\/)\/+/g, "$1");

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'API-SECRET': apiSecret
    };

    console.log('Fazendo requisição para:', url);
    console.log('Headers:', {
      ...headers,
      'API-SECRET': '****'
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      });

      if (response.status === 401) {
        const errorBody = await response.text();
        console.error('Corpo do erro 401:', errorBody);
        
        return NextResponse.json(
          { 
            error: 'Erro de autenticação: Verifique sua chave API',
            details: errorBody
          },
          { status: 401 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'URL não encontrada. Verifique se a URL do Nightscout está correta.',
            details: `Não foi possível acessar: ${url}`
          },
          { status: 404 }
        );
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro detalhado:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro ao buscar dados do Nightscout',
        details: error
      },
      { status: 500 }
    );
  }
} 