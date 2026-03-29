const fs = require('fs');
const path = require('path');

const { Keypair } = require('@solana/web3.js');

const args = process.argv.slice(2);
const getArgValue = flag => {
    const index = args.indexOf(flag);
    if (index === -1 || index + 1 >= args.length) {
        return undefined;
    }
    return args[index + 1];
};

const outputPath =
    getArgValue('--path') ??
    process.env.WALLET_BOOTSTRAP_PATH ??
    path.join(process.cwd(), '.wallet', 'id.json');
const resolvedPath = path.resolve(outputPath);
const force = args.includes('--force');

const ensureDirectory = targetPath => {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
};

const readExistingKeypair = targetPath => {
    const raw = fs.readFileSync(targetPath, 'utf8');
    const secretKey = Uint8Array.from(JSON.parse(raw));
    return Keypair.fromSecretKey(secretKey);
};

const writeKeypair = (targetPath, keypair) => {
    const serialized = JSON.stringify(Array.from(keypair.secretKey));
    fs.writeFileSync(targetPath, serialized, { mode: 0o600 });
};

ensureDirectory(resolvedPath);

if (fs.existsSync(resolvedPath) && !force) {
    const existingKeypair = readExistingKeypair(resolvedPath);
    console.log('Wallet bootstrap skipped (keypair already exists).');
    console.log(`Keypair path: ${resolvedPath}`);
    console.log(`Public key: ${existingKeypair.publicKey.toBase58()}`);
    console.log('Use --force to overwrite the existing keypair.');
    process.exit(0);
}

const keypair = Keypair.generate();
writeKeypair(resolvedPath, keypair);

console.log('Wallet bootstrap complete.');
console.log(`Keypair path: ${resolvedPath}`);
console.log(`Public key: ${keypair.publicKey.toBase58()}`);
