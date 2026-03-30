#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const nacl = require('tweetnacl');
const { Keypair } = require('@solana/web3.js');

const walletDir = path.resolve(__dirname, '..', '.wallet');
const keypairPath = path.join(walletDir, 'id.json');
const spendPermissionPath = path.join(walletDir, 'spend-permission.json');

if (!fs.existsSync(keypairPath)) {
    console.error(`Wallet not found at ${keypairPath}. Run "pnpm wallet:bootstrap" first.`);
    process.exit(1);
}

const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

const message = Buffer.from('explorer-local-spend-permission');
const signature = nacl.sign.detached(message, keypair.secretKey);

fs.mkdirSync(walletDir, { recursive: true });

const payload = {
    publicKey: keypair.publicKey.toBase58(),
    message: message.toString('base64'),
    signature: Buffer.from(signature).toString('base64'),
    createdAt: new Date().toISOString(),
};

fs.writeFileSync(spendPermissionPath, JSON.stringify(payload, null, 2));

console.log(`Generated spend permission at ${spendPermissionPath}`);
