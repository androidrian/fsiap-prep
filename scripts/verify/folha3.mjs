// Verificação numérica da Ficha 3 — Força eletromagnética. Ondas eletromagnéticas.
// Correr com: node scripts/verify/folha3.mjs
// Imprime: id alínea | calculado | ficha

const e = 1.60217653e-19 // C
const mp = 1.673e-27 // kg
const mu0 = 4 * Math.PI * 1e-7 // N/A²

/** Produto vetorial a × b, componente a componente. */
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}
const scale = (k, a) => a.map((x) => k * x)
const add = (a, b) => a.map((x, i) => x + b[i])
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0)
const norm = (a) => Math.sqrt(dot(a, a))

const fmt = (x) => (typeof x === 'number' ? (x === 0 ? '0' : Math.abs(x) >= 1e4 || Math.abs(x) < 1e-2 ? x.toExponential(4) : x.toPrecision(5)) : String(x))
const vec = (a) => `(${a.map(fmt).join('; ')})`
const rows = []
function row(id, calc, sheet) {
  rows.push(`${id.padEnd(22)} | ${String(calc).padEnd(46)} | ${sheet}`)
}

// ───── 1) Espectrómetro de massa ─────
{
  const q = 1.6022e-19, v = 30761.722, B = 80.0e-3, x = 1.6254, u = 1.6605e-27
  // eixos: x direita, y cima, z fora da página; v = +y, B = +z
  const F = scale(q, cross([0, v, 0], [0, 0, B]))
  row('f3-01 a |F| (N)', fmt(norm(F)), '3,9429e-16 N')
  row('f3-01 a vetor F (N)', vec(F), 'direção/sentido: +x (para a direita)')
  const r = x / 2
  const m = (q * B * r) / v
  row('f3-01 b m (kg)', fmt(m), '—')
  row('f3-01 b m (u.m.a.)', fmt(m / u), '203,93 u.m.a.')
}

// ───── 2) Eletrão no tubo de raios catódicos ─────
{
  const q = -1.6e-19, m = 9.1e-31, v = 8.0e6, B = 0.025, th = (60 * Math.PI) / 180
  const Bv = [B * Math.cos(th), B * Math.sin(th), 0]
  const F = scale(q, cross([v, 0, 0], Bv))
  row('f3-02 a |F| (N)', fmt(norm(F)), '2,8e-14 N')
  row('f3-02 b vetor F (N)', vec(F), 'eixo zz, para baixo (−z)')
  row('f3-02 c a (m/s²)', fmt(norm(F) / m), '3,1e16 m/s²')
  row('f3-02 c a com F=2,8e-14', fmt(2.8e-14 / m), '(leitura da ficha: F arredondado)')
}

// ───── 3) Ciclotrão ─────
{
  const f = 12e6, R = 0.53, m = 3.34e-27, q = e
  const B = (2 * Math.PI * f * m) / q
  const v = 2 * Math.PI * f * R
  row('f3-03 a B (T)', fmt(B), '≈ 1,6 T')
  row('f3-03 b v (m/s)', fmt(v), '3,99e7 m/s')
  row('f3-03 b v = qBR/m', fmt((q * B * R) / m), '(mesma conta por outro caminho)')
}

// ───── 4) Fio num campo externo ─────
{
  const Bext = 2.0e-5, I = 1.0, r = 1.0e-2
  const Bw = (mu0 * I) / (2 * Math.PI * r)
  row('f3-04 B do fio (T)', fmt(Bw), '—')
  // fio segundo +z, campo externo segundo +x; campo do fio no ponto r̂: Bw (ẑ × r̂)
  const at = (rhat) => add([Bext, 0, 0], scale(Bw, cross([0, 0, 1], rhat)))
  row('f3-04 Bmax em (0,−r)', `${fmt(norm(at([0, -1, 0])))}  ${vec(at([0, -1, 0]))}`, '4,0e-5 T')
  row('f3-04 Bmin em (0,+r)', `${fmt(norm(at([0, 1, 0])))}  ${vec(at([0, 1, 0]))}`, '0 T')
  row('f3-04 B em (+r,0)', fmt(norm(at([1, 0, 0]))), '(intermédio)')
}

// ───── 5) Solenoide de MRI ─────
{
  const L = 2.4, d = 2.0e-3, B = 1.5
  const N = L / d
  const n = N / L
  const I = B / (mu0 * n)
  row('f3-05 N (espiras)', fmt(N), '—')
  row('f3-05 n (espiras/m)', fmt(n), '—')
  row('f3-05 I (A)', fmt(I), '2,4 kA')
}

// ───── 6) Espira com B variável ─────
{
  const r = 0.1, R = 2.0, rate = 0.10
  const emf = Math.PI * r * r * rate
  row('f3-06 fem (V)', fmt(emf), '—')
  row('f3-06 i (A)', fmt(emf / R), '1,6e-3 A')
}

// ───── 7) Espira quadrada e lâmpada ─────
{
  const l = 0.250, B = 1.2, V = 3
  row('f3-07 v (m/s)', fmt(V / (B * l)), '10 m/s')
  // sentido: lado direito move-se em +x com B = −z; força sobre carga positiva
  row('f3-07 v×B no lado direito', vec(cross([1, 0, 0], [0, 0, -1])), '(+y: corrente sobe → anti-horário)')
}

// ───── 8) Gerador ─────
{
  const r = 0.110, R = 10, B = 0.63, w = 250
  const A = Math.PI * r * r
  const emf = B * A * w
  row('f3-08 A (m²)', fmt(A), '—')
  row('f3-08 amplitude fem (V)', fmt(emf), '6 V  [V(t) = 6 sen 250t]')
  row('f3-08 amplitude i (A)', fmt(emf / R), '0,6 A  [i(t) = 0,6 sen 250t]')
  row('f3-08 período (s)', fmt((2 * Math.PI) / w), '—')
}

// ───── 9) Protão em B uniforme ─────
{
  const v = [3.0e5, 0, 0], B = [0, 2.0e-2, 0]
  const F = scale(e, cross(v, B))
  row('f3-09 a vetor F (N)', vec(F), '9,6e-16 e_z N')
  const r = (mp * norm(v)) / (e * norm(B))
  row('f3-09 b r (m)', fmt(r), '1,6e-1 m')
  const tHalf = (Math.PI * r) / norm(v)
  row('f3-09 c t meia volta (s)', fmt(tHalf), '3,3e-6 s')
  row('f3-09 c t volta inteira (s)', fmt(2 * tHalf), '(leitura que reproduz a ficha: período T)')
  row('f3-09 d Ec (J)', fmt(0.5 * mp * dot(v, v)), '7,5e-17 J')
  row('f3-09 e F·v (W)', fmt(dot(F, v)), 'W = 0 J')
}

// ───── 10) Campos cruzados ─────
{
  const q = 3.0e-11, v = [0, 2.0e6, 0], B = [2.0e-2, 0, 0], E = [0, 0, 4.0e3]
  const Fe = scale(q, E)
  const Fm = scale(q, cross(v, B))
  row('f3-10 a Fe (N)', vec(Fe), '—')
  row('f3-10 a Fm (N)', vec(Fm), '—')
  row('f3-10 a Fem (N)', vec(add(Fe, Fm)), '−1,1e-6 e_z N')
  const v0 = norm(E) / norm(B)
  row('f3-10 b v = E/B (m/s)', fmt(v0), '2,0e5 e_x m/s (direção impressa: e_x)')
  row('f3-10 b F com v = v0 e_y', vec(add(Fe, scale(q, cross([0, v0, 0], B)))), '(tem de dar zero)')
  row('f3-10 b F com v = v0 e_x', vec(add(Fe, scale(q, cross([v0, 0, 0], B)))), '(leitura da ficha: não anula a força)')
}

// ───── 11) Transformador 8,5 kV / 120 V ─────
{
  const Vp = 8500, Vs = 120, P = 78e3
  row('f3-11 a Np/Ns', fmt(Vp / Vs), '71')
  const ip = P / Vp, is = P / Vs
  row('f3-11 b ip (A)', fmt(ip), '9,2 A')
  row('f3-11 b is (A)', fmt(is), '650 A')
  row('f3-11 c Rs (Ω)', fmt(Vs / is), '0,18 Ω')
  row('f3-11 c Rp (Ω)', fmt(Vp / ip), '930 Ω')
}

// ───── 12) Transformador com carga resistiva ─────
{
  const Vs = 230, R = 4.4, ip = 2
  const is = Vs / R
  row('f3-12 b is (A)', fmt(is), '52 A')
  row('f3-12 a Np/Ns', fmt(is / ip), '26')
  row('f3-12 Vp (V)', fmt((Vs * is) / ip), '—')
}

// ───── 13) Partícula que atinge o anteparo em P ─────
{
  const m = 2.0e-8, B = [0, 0, -4.0e-2], v = [0, 50, 0], AP = 2.5e-2
  const r = AP / 2
  row('f3-13 a v×B', vec(cross(v, B)), '(aponta para −x, para P → q > 0)')
  const q = (m * norm(v)) / (r * norm(B))
  row('f3-13 a q (C)', fmt(q), '2,0e-3 C (q > 0)')
  row('f3-13 b Δt (s)', fmt((Math.PI * r) / norm(v)), '8e-4 s')
  row('f3-13 b Δt = πm/(qB)', fmt((Math.PI * m) / (q * norm(B))), '(mesma conta por outro caminho)')
}

// ───── 14) Corpo em E, B e gravidade ─────
{
  const m = 0.3, q = 3, E = [-1, -3, 0], B = [1, -2, 3], v = [3, 0, 0], g = [0, 0, -10]
  const Fm = scale(q, cross(v, B))
  const Fem = add(scale(q, E), Fm)
  const a = add(scale(1 / m, Fem), g)
  row('f3-14 a Fm (N)', `${vec(Fm)}  |Fm| = ${fmt(norm(Fm))}`, '−27 j − 18 k N')
  row('f3-14 b Fem (N)', `${vec(Fem)}  |Fem| = ${fmt(norm(Fem))}`, '−3 i − 36 j − 18 k N')
  row('f3-14 c a (m/s²)', `${vec(a)}  |a| = ${fmt(norm(a))}`, '−10 i − 120 j − 70 k m/s²')
}

// ───── 15) Quarto de círculo até ao alvo ─────
{
  const m = 2.0e-12, q = 4.4e-6, d = 3.0e-3, v = 2.0e6
  const r = d / Math.SQRT2
  const B = (m * v) / (q * r)
  row('f3-15 a r = d/√2 (m)', fmt(r), '—')
  row('f3-15 a B (T)', fmt(B), '428,55 e_z T')
  row('f3-15 a B com r = d', fmt((m * v) / (q * d)), '(leitura alternativa: não reproduz a ficha)')
  // à entrada: v = +x, B = +z → força tem de apontar para o centro (−y)
  row('f3-15 a F à entrada', vec(scale(q, cross([v, 0, 0], [0, 0, B]))), '(−y: para o centro)')
  // no alvo: v = −y
  const Fm = scale(q, cross([0, -v, 0], [0, 0, B]))
  const Fe = scale(q, [0, -3e8, 0])
  const F = add(Fm, Fe)
  row('f3-15 b Fem (N)', `${vec(F)}  |F| = ${fmt(norm(F))}`, '(−3771,24 e_x − 1320 e_y) N')
  const a = scale(1 / m, F)
  row('f3-15 c a (m/s²)', `${vec(a)}  |a| = ${fmt(norm(a))}`, '|a| = 1,99e15 m/s²')
}

// ───── 16) Protão paralelo a um fio ─────
{
  const I = 5.0, r = 4.0e-3, v = 1.5e3
  const Bmod = (mu0 * I) / (2 * Math.PI * r)
  // eixos: x direita, y cima, z fora da página. Corrente +y, protão em +x.
  const B = scale(Bmod, cross([0, 1, 0], [1, 0, 0]))
  row('f3-16 a B (T)', `${fmt(Bmod)}  ${vec(B)}`, '0,25 mT (para dentro da página)')
  const F = scale(e, cross([0, v, 0], B))
  row('f3-16 b F (N)', `${fmt(norm(F))}  ${vec(F)}`, '6e-20 N, segundo −x (para o fio)')
  const E = scale(-1, cross([0, v, 0], B))
  row('f3-16 c E (N/C)', `${fmt(norm(E))}  ${vec(E)}`, '0,375 N/C, segundo +x')
}

console.log(`${'id alínea'.padEnd(22)} | ${'calculado'.padEnd(46)} | ficha`)
console.log('-'.repeat(110))
for (const line of rows) console.log(line)
