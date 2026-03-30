import { NextResponse } from 'next/server';
import { is, number, refine, string, type } from 'superstruct';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };

const InvoiceRequestSchema = type({
    amount: refine(number(), 'positive', value => Number.isFinite(value) && value > 0),
    recipient: string(),
});

type InvoiceRequest = {
    amount: number;
    recipient: string;
};

function buildPaymentUrl({ amount, recipient }: InvoiceRequest): string {
    const url = new URL(`solana:${recipient}`);
    url.searchParams.set('amount', amount.toString());
    return url.toString();
}

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { headers: NO_STORE_HEADERS, status: 400 });
    }

    if (!is(body, InvoiceRequestSchema)) {
        return NextResponse.json({ error: 'Invalid request' }, { headers: NO_STORE_HEADERS, status: 400 });
    }

    const invoice = body as InvoiceRequest;
    const url = buildPaymentUrl(invoice);

    return NextResponse.json(
        {
            amount: invoice.amount,
            recipient: invoice.recipient,
            url,
        },
        { headers: NO_STORE_HEADERS },
    );
}
