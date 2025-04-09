import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://near-protocol-rewards-tracking.com/dashboard', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da API' },
      { status: 500 }
    );
  }
} 