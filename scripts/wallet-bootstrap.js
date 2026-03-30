#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');

const walletDir = path.resolve(__dirname, '..', '.wallet');
const keypairPath = path.join(walletDir, 'id.json');

if (fs.existsSync(keypairPath)) {
    console.log(`Wallet already exists at ${keypairPath}`);
    process.exit(0);
}

fs.mkdirSync(walletDir, { recursive: true });

const keypair = Keypair.generate();
const secretKey = Array.from(keypair.secretKey);

fs.writeFileSync(keypairPath, JSON.stringify(secretKey, null, 2));

console.log(`Generated wallet at ${keypairPath}`);
