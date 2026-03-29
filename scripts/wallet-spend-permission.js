#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const { Keypair } = require('@solana/web3.js');

const DEFAULT_EXPIRATION_DAYS = 7;
const projectRoot = path.join(__dirname, '..');
const walletDir = path.join(projectRoot, '.wallet');
const keypairPath = path.join(walletDir, 'id.json');
const permissionPath = path.join(walletDir, 'spend-permission.json');

main().catch(error => {
    console.error(`❌ ${error.message}`);
    process.exit(1);
});

async function main() {
    const keypair = await loadOrCreateKeypair();
    const permission = createSpendPermission(keypair);

    await fs.mkdir(walletDir, { recursive: true });
    await fs.writeFile(permissionPath, JSON.stringify(permission, null, 2), { mode: 0o600 });

    console.log(`✅ Spend permission saved to ${path.relative(projectRoot, permissionPath)}`);
    console.log(`Wallet: ${permission.publicKey}`);
    console.log(`Expires: ${permission.expiresAt}`);
}

async function loadOrCreateKeypair() {
    await fs.mkdir(walletDir, { recursive: true });

    try {
        const secretKey = await fs.readFile(keypairPath, 'utf8');
        const parsed = JSON.parse(secretKey);

        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error('Wallet keypair is invalid: expected a JSON array');
        }

        return Keypair.fromSecretKey(Uint8Array.from(parsed));
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }

        const keypair = Keypair.generate();
        await fs.writeFile(keypairPath, JSON.stringify(Array.from(keypair.secretKey)), { mode: 0o600 });
        return keypair;
    }
}

function createSpendPermission(keypair) {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    const payload = {
        application: 'solana-explorer',
        publicKey: keypair.publicKey.toBase58(),
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
    };

    const message = JSON.stringify(payload);
    const signature = nacl.sign.detached(Buffer.from(message), keypair.secretKey);

    return {
        ...payload,
        message,
        signature: bs58.encode(signature),
    };
}
