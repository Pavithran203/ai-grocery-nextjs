// NearMart Client-Side E2EE Cryptographic Utility
// Using standard Web Crypto API (native browser compatibility)

// Helper: Convert ArrayBuffer to Base64 String
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

// Helper: Convert Base64 String to ArrayBuffer
export function base64ToArrayBuffer(base64) {
  const binaryString = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// 1. PBKDF2 Key Derivation
export async function deriveMasterKey(password, saltHex) {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  const saltBuffer = base64ToArrayBuffer(saltHex);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}

// Helper: Generate Random Salt (Base64)
export function generateRandomSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return arrayBufferToBase64(salt.buffer);
}

// 2. Symmetric AES-GCM-256 Encryption
export async function encryptSymmetric(plaintextJson, key) {
  const enc = new TextEncoder();
  const plaintextBuffer = enc.encode(JSON.stringify(plaintextJson));
  
  const iv = new Uint8Array(12); // GCM standard 96-bit IV
  crypto.getRandomValues(iv);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    plaintextBuffer
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

// 3. Symmetric AES-GCM-256 Decryption
export async function decryptSymmetric(ciphertextBase64, ivBase64, key) {
  const dec = new TextDecoder();
  const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer
    },
    key,
    ciphertextBuffer
  );

  return JSON.parse(dec.decode(decryptedBuffer));
}

// 4. Generate Order Data-Encryption Key (AES-GCM-256)
export async function generateOrderKey() {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true, // extractable
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}

// 5. Generate Asymmetric RSA-OAEP Keypair (For Delivery Staff)
export async function generateDeliveryKeyPair() {
  return await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-256'
    },
    true, // extractable
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}

// 6. Export RSA Public Key (SPKI format, base64)
export async function exportPublicKey(key) {
  const spki = await crypto.subtle.exportKey('spki', key);
  return arrayBufferToBase64(spki);
}

// 7. Import RSA Public Key (SPKI format, base64)
export async function importPublicKey(spkiBase64) {
  const spkiBuffer = base64ToArrayBuffer(spkiBase64);
  return await crypto.subtle.importKey(
    'spki',
    spkiBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'wrapKey']
  );
}

// 8. Wrap Order Key (AES) using RSA-OAEP Public Key
export async function wrapOrderKeyWithRsa(aesKey, rsaPublicKey) {
  const wrapped = await crypto.subtle.wrapKey(
    'raw',
    aesKey,
    rsaPublicKey,
    { name: 'RSA-OAEP' }
  );
  return arrayBufferToBase64(wrapped);
}

// 9. Unwrap Order Key (AES) using RSA-OAEP Private Key
export async function unwrapOrderKeyWithRsa(wrappedKeyBase64, rsaPrivateKey) {
  const wrappedBuffer = base64ToArrayBuffer(wrappedKeyBase64);
  return await crypto.subtle.unwrapKey(
    'raw',
    wrappedBuffer,
    rsaPrivateKey,
    { name: 'RSA-OAEP' },
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// 10. Wrap Order Key (AES) using Customer Master Key (AES-GCM)
export async function wrapOrderKeyWithPassword(aesKey, masterKey) {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const wrapped = await crypto.subtle.wrapKey(
    'raw',
    aesKey,
    masterKey,
    {
      name: 'AES-GCM',
      iv: iv
    }
  );

  return {
    wrappedKey: arrayBufferToBase64(wrapped),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

// 11. Unwrap Order Key (AES) using Customer Master Key (AES-GCM)
export async function unwrapOrderKeyWithPassword(wrappedKeyBase64, ivBase64, masterKey) {
  const wrappedBuffer = base64ToArrayBuffer(wrappedKeyBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);

  return await crypto.subtle.unwrapKey(
    'raw',
    wrappedBuffer,
    masterKey,
    {
      name: 'AES-GCM',
      iv: ivBuffer
    },
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// 12. Wrap Asymmetric Private Key (RSA) using Master Key (AES-GCM)
export async function wrapPrivateKey(privateKey, masterKey) {
  const pkcs8 = await crypto.subtle.exportKey('pkcs8', privateKey);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    masterKey,
    pkcs8
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

// 13. Unwrap Asymmetric Private Key (RSA) using Master Key (AES-GCM)
export async function unwrapPrivateKey(ciphertextBase64, ivBase64, masterKey) {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer
    },
    masterKey,
    ciphertextBuffer
  );

  return await crypto.subtle.importKey(
    'pkcs8',
    decryptedBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    true,
    ['decrypt', 'unwrapKey']
  );
}
