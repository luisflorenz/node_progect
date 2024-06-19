const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { toHex } = require('ethereum-cryptography/utils');
const crypto = require('crypto');

// Generate a random private key using crypto.randomBytes
const privateKey = crypto.randomBytes(32);
console.log('Private Key:', toHex(privateKey));

// Get the public key from the private key
const publicKey = secp256k1.getPublicKey(privateKey);
console.log('Public Key:', toHex(publicKey));

// Remove the first byte of the public key
const pkwhitoutFirstByte = publicKey.slice(1);

// Compute the keccak256 hash of the remaining bytes
const ethhash = keccak256(pkwhitoutFirstByte);


// Take the last 20 bytes of the hash as the Ethereum address
const address = toHex(ethhash.slice(-20));
console.log("Etheum Address:", address);