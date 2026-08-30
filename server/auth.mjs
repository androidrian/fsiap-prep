import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const USERNAME_PATTERN = /^[\p{L}\p{N}._-]{3,32}$/u
const SCRYPT_OPTIONS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

export function normalizeUsername(username) {
  return username.trim().normalize('NFKC').toLocaleLowerCase('pt-PT')
}

export function validateCredentials(username, password) {
  const cleanUsername = username.trim().normalize('NFKC')
  if (!USERNAME_PATTERN.test(cleanUsername)) {
    return { error: 'O username deve ter entre 3 e 32 caracteres e usar apenas letras, números, ponto, hífen ou underscore.' }
  }
  if (password.length < 8 || password.length > 128) {
    return { error: 'A password deve ter entre 8 e 128 caracteres.' }
  }
  return { username: cleanUsername, usernameKey: normalizeUsername(cleanUsername) }
}

export function hashPassword(password) {
  const salt = randomBytes(16)
  const derived = scryptSync(password, salt, 64, SCRYPT_OPTIONS)
  return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`
}

export function verifyPassword(password, storedHash) {
  const [algorithm, saltText, hashText] = storedHash.split('$')
  if (algorithm !== 'scrypt' || !saltText || !hashText) return false
  try {
    const expected = Buffer.from(hashText, 'base64url')
    const actual = scryptSync(password, Buffer.from(saltText, 'base64url'), expected.length, SCRYPT_OPTIONS)
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}
