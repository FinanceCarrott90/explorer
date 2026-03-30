import { describe, expect, it } from 'vitest';

const VALID_RECIPIENT = '0xFB32B8A24648E376D387190E665A5DFe9880e27B';

const createRequest = (body: unknown) =>
    new Request('http://localhost:3000/api/invoice', {
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
    });

describe('POST /api/invoice', () => {
    it('returns 400 for a missing recipient', async () => {
        const { POST } = await import('../route');

        const response = await POST(createRequest({ amount: 2 }));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: 'Invalid request' });
        expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
    });

    it('returns 400 for a non-positive amount', async () => {
        const { POST } = await import('../route');

        const response = await POST(createRequest({ amount: 0, recipient: VALID_RECIPIENT }));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: 'Invalid request' });
        expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
    });

    it('returns a payment url for a valid request', async () => {
        const { POST } = await import('../route');

        const response = await POST(createRequest({ amount: 2, recipient: VALID_RECIPIENT }));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            amount: 2,
            recipient: VALID_RECIPIENT,
            url: `solana:${VALID_RECIPIENT}?amount=2`,
        });
        expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
    });
});
