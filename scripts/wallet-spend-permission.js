#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const nacl = require('tweetnacl');
const { Keypair } = require('@solana/web3.js');

const walletDir = path.resolve(__dirname, '..', '.wallet');
const keypairPath = path.join(walletDir, 'id.json');
const spendPermissionPath = path.join(walletDir, 'spend-permission.json');
const spendPermissionMessage = 'explorer-local-spend-permission'; // Signed message for local spend permission payloads.

if (!fs.existsSync(keypairPath)) {
    console.error(`Wallet not found at ${keypairPath}. Run "pnpm wallet:bootstrap" first.`);
    process.exit(1);
}

const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

const message = Buffer.from(spendPermissionMessage);
const signature = nacl.sign.detached(message, keypair.secretKey);

const payload = {
    publicKey: keypair.publicKey.toBase58(),
    message: message.toString('base64'),
    signature: Buffer.from(signature).toString('base64'),
};

fs.writeFileSync(spendPermissionPath, JSON.stringify(payload, null, 2));
fs.chmodSync(spendPermissionPath, 0o600);

console.log(`Generated spend permission at ${spendPermissionPath}`);
