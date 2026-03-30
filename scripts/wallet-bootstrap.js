#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');

const walletDir = path.resolve(__dirname, '..', '.wallet');
const keypairPath = path.join(walletDir, 'id.json');

if (fs.existsSync(keypairPath)) {
    try {
        const existingSecretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
        if (!Array.isArray(existingSecretKey) || existingSecretKey.length !== 64) {
            throw new Error('Invalid keypair format: expected a 64-byte array containing private and public key data.');
        }
        Keypair.fromSecretKey(Uint8Array.from(existingSecretKey));
        console.log(`Wallet already exists at ${keypairPath}`);
        process.exit(0);
    } catch (error) {
        console.error(`Wallet at ${keypairPath} is invalid. Remove it to regenerate.`);
        process.exit(1);
    }
}

fs.mkdirSync(walletDir, { recursive: true });

const keypair = Keypair.generate();
const secretKey = Array.from(keypair.secretKey);

fs.writeFileSync(keypairPath, JSON.stringify(secretKey, null, 2));
fs.chmodSync(keypairPath, 0o600);

console.log(`Generated wallet at ${keypairPath}`);
