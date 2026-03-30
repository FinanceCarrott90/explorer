const APPROVED_ACCOUNTS_ENV = process.env.NEXT_PUBLIC_INTERACTIVE_IDL_APPROVED_ACCOUNTS ?? '';

export function getApprovedAccounts(): string[] {
    const trimmed = APPROVED_ACCOUNTS_ENV.trim();
    if (!trimmed) {
        return [];
    }

    return trimmed.split(',')
        .map(account => account.trim())
        .filter(Boolean);
}

export function extractAccountAddresses(accounts: Record<string, string>): string[] {
    return Object.values(accounts)
        .map(account => account.trim())
        .filter(Boolean);
}

export function findApprovedAccount(approvedAccounts: string[], accounts: string[]): string | null {
    if (approvedAccounts.length === 0) {
        return null;
    }

    const approvedSet = new Set(approvedAccounts);

    for (const account of accounts) {
        if (approvedSet.has(account)) {
            return account;
        }
    }

    return null;
}
