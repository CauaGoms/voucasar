import { NextResponse } from 'next/server';
import { getRsvpNames, insertRsvpNames } from '../../../lib/rsvp-db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const names = getRsvpNames();
    return NextResponse.json({ ok: true, names });
  } catch {
    return NextResponse.json({ ok: false, error: 'Erro ao buscar nomes.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { names?: string[] };
    const names = Array.isArray(body.names) ? body.names : [];

    if (names.length === 0) {
      return NextResponse.json({ ok: false, error: 'Nenhum nome recebido.' }, { status: 400 });
    }

    insertRsvpNames(names);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Erro ao salvar nomes.' }, { status: 500 });
  }
}
