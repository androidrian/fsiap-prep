import assert from 'node:assert/strict'
import test from 'node:test'
import { hashPassword, normalizeUsername, validateCredentials, verifyPassword } from './auth.mjs'

test('normaliza usernames sem confundir maiúsculas e espaços', () => {
  assert.equal(normalizeUsername('  Filipe.Teste  '), 'filipe.teste')
})

test('aceita usernames simples e rejeita credenciais frágeis', () => {
  assert.equal(validateCredentials('aluno_01', 'uma-password-segura').usernameKey, 'aluno_01')
  assert.match(validateCredentials('a', 'uma-password-segura').error, /username/)
  assert.match(validateCredentials('aluno', 'curta').error, /password/)
})

test('guarda apenas um hash e verifica a password em tempo constante', () => {
  const hash = hashPassword('segredo-com-12')
  assert.notEqual(hash, 'segredo-com-12')
  assert.equal(verifyPassword('segredo-com-12', hash), true)
  assert.equal(verifyPassword('password-errada', hash), false)
})
