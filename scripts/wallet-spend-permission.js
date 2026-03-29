#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const { Keypair } = require('@solana/web3.js');

const DEFAULT_EXPIRATION_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
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
    await fs.writeFile(permissionPath, JSON.stringify(permission, null, 2));
    await fs.chmod(permissionPath, 0o600);

    console.log(`✅ Spend permission saved to ${path.relative(projectRoot, permissionPath)}`);
    console.log(`Wallet: ${permission.publicKey}`);
    console.log(`Expires: ${permission.expiresAt}`);
}

async function loadOrCreateKeypair() {
    await fs.mkdir(walletDir, { recursive: true });

    try {
        return await readKeypair();
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }

        const keypair = Keypair.generate();
        try {
            await fs.writeFile(keypairPath, JSON.stringify(Array.from(keypair.secretKey)), {
                flag: 'wx',
            });
            await fs.chmod(keypairPath, 0o600);
            return keypair;
        } catch (writeError) {
            if (writeError.code === 'EEXIST') {
                return await readKeypair();
            }

            throw writeError;
        }
    }
}

async function readKeypair() {
    const secretKey = await fs.readFile(keypairPath);
    let parsed;

    try {
        parsed = JSON.parse(secretKey.toString('utf8'));
    } catch (error) {
        throw new Error(`Wallet keypair is invalid JSON. Delete ${keypairPath} and re-run the script.`);
    }

    if (!Array.isArray(parsed) || parsed.length !== 64) {
        throw new Error('Wallet keypair is invalid: expected a 64-byte secret key array');
    }

    return Keypair.fromSecretKey(Uint8Array.from(parsed));
}

function createSpendPermission(keypair) {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + DEFAULT_EXPIRATION_DAYS * MILLISECONDS_PER_DAY);
    const payload = {
        application: 'solana-explorer',
        publicKey: keypair.publicKey.toBase58(),
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
    };

    const message = JSON.stringify(payload, [
        'application',
        'publicKey',
        'issuedAt',
        'expiresAt',
    ]);
    const signature = nacl.sign.detached(Buffer.from(message), keypair.secretKey);

    return {
        ...payload,
        signature: bs58.encode(signature),
    };
}
