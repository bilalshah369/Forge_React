// import CryptoJS from 'crypto-js';

// export function encrypt(text: string): string {
//   var password: string = 'forgeadmin';
//   const salt = CryptoJS.lib.WordArray.random(128 / 8); // 128-bit salt
//   const key = CryptoJS.PBKDF2(password, salt, {
//     keySize: 256 / 32,
//     iterations: 1000,
//   });
//   const iv = CryptoJS.lib.WordArray.random(128 / 8); // 128-bit IV

//   const encrypted = CryptoJS.AES.encrypt(text, key, {
//     iv,
//   });

//   // Combine salt, iv, and ciphertext in one string (Base64 encoded)
//   const result = CryptoJS.enc.Base64.stringify(
//     salt.concat(iv).concat(encrypted.ciphertext),
//   );
//   return result;
// }
// export function decrypt(cipherTextBase64: string): string {
//   var password: string = 'forgeadmin';
//   const cipherParams = CryptoJS.enc.Base64.parse(cipherTextBase64);

//   const salt = CryptoJS.lib.WordArray.create(
//     cipherParams.words.slice(0, 4),
//     16,
//   );
//   const iv = CryptoJS.lib.WordArray.create(cipherParams.words.slice(4, 8), 16);
//   const ciphertext = CryptoJS.lib.WordArray.create(
//     cipherParams.words.slice(8),
//     cipherParams.sigBytes - 32,
//   );

//   const key = CryptoJS.PBKDF2(password, salt, {
//     keySize: 256 / 32,
//     iterations: 1000,
//   });

//   const fullParams = CryptoJS.lib.CipherParams.create({ciphertext});

//   const decrypted = CryptoJS.AES.decrypt(fullParams, key, {iv});
//   return decrypted.toString(CryptoJS.enc.Utf8);
// }

// import CryptoJS from 'crypto-js';

// const PASSWORD = 'forgeadmin';

// // Fixed, known salts (MUST be exactly the same across all platforms)
// const SALT_KEY = CryptoJS.enc.Utf8.parse('static-key-salt');
// const SALT_IV = CryptoJS.enc.Utf8.parse('static-iv--salt');

// /**
//  * Deterministically derive AES-256 key and AES-128 IV from password.
//  */
// function deriveKeyAndIV(password: string) {
//   const key = CryptoJS.PBKDF2(password, SALT_KEY, {
//     keySize: 256 / 32,
//     iterations: 1000,
//   });
//   const iv = CryptoJS.PBKDF2(password, SALT_IV, {
//     keySize: 128 / 32,
//     iterations: 1000,
//   });

//   return {key, iv};
// }

// /**
//  * Encrypts a string using AES-256-CBC + PKCS7 with password-based key/iv.
//  * @param text plaintext string
//  * @returns base64 encoded ciphertext (compatible with PostgreSQL)
//  */
// export function encrypt(text: string): string {
//   const {key, iv} = deriveKeyAndIV(PASSWORD);

//   const encrypted = CryptoJS.AES.encrypt(text, key, {
//     iv: iv,
//     mode: CryptoJS.mode.CBC,
//     padding: CryptoJS.pad.Pkcs7,
//   });

//   return encrypted.toString(); // base64
// }

// /**
//  * Decrypts a base64 string encrypted with the encrypt() function.
//  * @param cipherTextBase64 base64 AES-256 ciphertext
//  * @returns decrypted plaintext
//  */
// export function decrypt(cipherTextBase64: string): string {
//   //////debugger;
//   const {key, iv} = deriveKeyAndIV(PASSWORD);

//   const decrypted = CryptoJS.AES.decrypt(cipherTextBase64, key, {
//     iv: iv,
//     mode: CryptoJS.mode.CBC,
//     padding: CryptoJS.pad.Pkcs7,
//   });

//   return decrypted.toString(CryptoJS.enc.Utf8);
// }

import CryptoJS from "crypto-js";

const PASSWORD = "forgeadmin";
const SALT_KEY = CryptoJS.enc.Utf8.parse("static-key-salt");
const SALT_IV = CryptoJS.enc.Utf8.parse("static-iv--salt");
const ITERATIONS = 1000;

/**
 * Derive AES-256 key and AES-128 IV using PBKDF2 (SHA1)
 * Compatible with backend Node.js crypto.pbkdf2Sync(password, salt, 1000, length, 'sha1')
 */
function deriveKeyAndIv(password: string) {
  const key = CryptoJS.PBKDF2(password, SALT_KEY, {
    keySize: 256 / 32, // 256-bit key = 32 bytes
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA1,
  });

  const iv = CryptoJS.PBKDF2(password, SALT_IV, {
    keySize: 128 / 32, // 128-bit IV = 16 bytes
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA1,
  });

  return { key, iv };
}

export function encrypt(plaintext: string): string {
  const { key, iv } = deriveKeyAndIv(PASSWORD);

  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // base64 string
}

export function decrypt(base64Cipher: string): string {
  const { key, iv } = deriveKeyAndIv(PASSWORD);

  const decrypted = CryptoJS.AES.decrypt(base64Cipher, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
