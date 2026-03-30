import { PublicKey } from '@solana/web3.js';
import { NextResponse } from 'next/server';
import { Infer, is, number, refine, string, type } from 'superstruct';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };

const InvoiceRequestSchema = type({
    amount: refine(number(), 'positive', value => value > 0),
    recipient: string(),
});

type InvoiceRequest = Infer<typeof InvoiceRequestSchema>;

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

    const invoiceRequest = body;
    let recipient: string;

    try {
        recipient = new PublicKey(invoiceRequest.recipient).toBase58();
    } catch {
        return NextResponse.json({ error: 'Invalid recipient address' }, { headers: NO_STORE_HEADERS, status: 400 });
    }

    const url = buildPaymentUrl({ ...invoiceRequest, recipient });

    return NextResponse.json(
        {
            amount: invoiceRequest.amount,
            recipient,
            url,
        },
        { headers: NO_STORE_HEADERS },
    );
}
