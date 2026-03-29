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
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        throw new Error('Keypair file contains invalid JSON.');
    }

    if (!Array.isArray(parsed)) {
        throw new Error('Keypair file must contain an array of numbers.');
    }

    try {
        const secretKey = Uint8Array.from(parsed);
        return Keypair.fromSecretKey(secretKey);
    } catch (error) {
        throw new Error('Keypair file contains invalid secret key data.');
    }
};

const writeKeypair = (targetPath, keypair) => {
    const serialized = JSON.stringify(Array.from(keypair.secretKey));
    if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath);
    }

    const fileDescriptor = fs.openSync(targetPath, 'wx', 0o600);
    try {
        fs.writeSync(fileDescriptor, serialized);
    } finally {
        fs.closeSync(fileDescriptor);
    }
};

ensureDirectory(resolvedPath);

if (fs.existsSync(resolvedPath) && !force) {
    let existingKeypair;
    try {
        existingKeypair = readExistingKeypair(resolvedPath);
    } catch (error) {
        console.error(`Failed to read keypair at ${resolvedPath}.`);
        console.error(error instanceof Error ? error.message : String(error));
        console.error('Fix the file contents or run with --force to regenerate.');
        process.exit(1);
    }

    console.log('Wallet bootstrap skipped (keypair already exists).');
    console.log(`Keypair path: ${resolvedPath}`);
    console.log(`Public key: ${existingKeypair.publicKey.toBase58()}`);
    console.log('Use --force to overwrite the existing keypair.');
    process.exit(0);
}

const keypair = Keypair.generate();
writeKeypair(resolvedPath, keypair);

if (process.platform === 'win32') {
    console.warn(
        'Note: Windows may ignore POSIX file permissions. Consider securing the keypair file manually.',
    );
}

console.log('Wallet bootstrap complete.');
console.log(`Keypair path: ${resolvedPath}`);
console.log(`Public key: ${keypair.publicKey.toBase58()}`);
