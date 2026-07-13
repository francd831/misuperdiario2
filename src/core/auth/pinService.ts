const HASH_PREFIX = "pbkdf2_sha256";
const ITERATIONS = 120_000;
const KEY_LENGTH_BITS = 256;

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function derivePin(pin: string, salt: Uint8Array, iterations = ITERATIONS) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    keyMaterial,
    KEY_LENGTH_BITS,
  );

  return new Uint8Array(bits);
}

export async function hashPin(pin: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePin(pin, salt);
  return [HASH_PREFIX, String(ITERATIONS), bytesToBase64(salt), bytesToBase64(hash)].join("$");
}

export async function verifyPin(pin: string, storedHash?: string) {
  if (!storedHash) return false;

  const [prefix, iterationsText, saltText, hashText] = storedHash.split("$");
  if (prefix !== HASH_PREFIX || !iterationsText || !saltText || !hashText) {
    return false;
  }

  const iterations = Number(iterationsText);
  if (!Number.isFinite(iterations) || iterations < 1) return false;

  const expected = base64ToBytes(hashText);
  const actual = await derivePin(pin, base64ToBytes(saltText), iterations);
  return timingSafeEqual(actual, expected);
}

export function isValidPin(pin: string) {
  return /^\d{4}$/.test(pin);
}
