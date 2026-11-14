// Verificação numérica da Ficha 2 — Circuitos elétricos em corrente contínua.
// Correr com: node scripts/verify/folha2.mjs
// Imprime: id alínea | calculado | ficha

const e = 1.60217653e-19
const eps0 = 8.85e-12

const rows = []
function row(id, part, value, unit, official) {
  rows.push(`${id} ${part} | ${Number(value).toPrecision(5)} ${unit} | ${official}`)
}
function info(text) {
  rows.push(`      ${text}`)
}

/** Eliminação de Gauss com pivotagem parcial: resolve A x = b. */
function solve(A, b) {
  const n = b.length
  const M = A.map((line, i) => [...line, b[i]])
  for (let col = 0; col < n; col += 1) {
    let pivot = col
    for (let i = col + 1; i < n; i += 1) if (Math.abs(M[i][col]) > Math.abs(M[pivot][col])) pivot = i
    if (Math.abs(M[pivot][col]) < 1e-12) throw new Error('sistema singular')
    const swap = M[col]
    M[col] = M[pivot]
    M[pivot] = swap
    for (let i = col + 1; i < n; i += 1) {
      const factor = M[i][col] / M[col][col]
      for (let j = col; j <= n; j += 1) M[i][j] -= factor * M[col][j]
    }
  }
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i -= 1) {
    let sum = M[i][n]
    for (let j = i + 1; j < n; j += 1) sum -= M[i][j] * x[j]
    x[i] = sum / M[i][i]
  }
  return x
}

const series = (...values) => values.reduce((total, value) => total + value, 0)
const parallel = (...values) => 1 / values.reduce((total, value) => total + 1 / value, 0)
const near = (a, b, tolerance = 1e-9) => Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b))
function assert(condition, message) {
  if (!condition) throw new Error(`FALHOU: ${message}`)
  info(`ok: ${message}`)
}

/** Três ramos entre os nós a e b: e_k > 0 empurra corrente de b para a. Devolve Vab e as correntes b→a. */
function threeBranches(branches) {
  const active = branches.filter((branch) => !branch.open)
  const vab = active.reduce((total, branch) => total + branch.e / branch.r, 0) / active.reduce((total, branch) => total + 1 / branch.r, 0)
  const currents = branches.map((branch) => (branch.open ? 0 : (branch.e - vab) / branch.r))
  return { vab, currents }
}

// ───────── 1 ─────────
{
  const n = 5.8e28
  const I = 1.0
  const d = 1.0e-3
  const A = (Math.PI * d ** 2) / 4
  row('f2-01', '', I / (n * e * A), 'm/s', '1,37e-4 m/s')
}

// ───────── 2 ─────────
{
  const emf = 6 / 3.0
  row('f2-02', 'fem', emf, 'V', '2,0 V')
  row('f2-02', 'série (cada)', emf / 2, 'V', '1,0 V')
  row('f2-02', 'paralelo (cada)', emf, 'V', '2,0 V')
}

// ───────── 3 ─────────
{
  const energy = 3 * 0.100 * 5 * 15
  row('f2-03', 'energia', energy, 'kWh', '—')
  row('f2-03', 'custo', energy * 0.0674, 'euros', '1,51 euros')
}

// ───────── 4 ─────────
{
  const I = 60 / 120
  const R = 120 / I
  row('f2-04', 'b I', I, 'A', '0,50 A')
  row('f2-04', 'b R', R, 'ohm', '240 ohm')
  row('f2-04', 'c P', R * 0.25 ** 2, 'W', '15 W')
  row('f2-04', 'c V', R * 0.25, 'V', '—')
}

// ───────── 5 ─────────
{
  const rho = 1.72e-8
  const d = 0.362e-2
  const A = (Math.PI * d ** 2) / 4
  const rPerMetre = rho / A
  row('f2-05', 'a', rPerMetre, 'ohm/m', '1,67e-3 ohm/m')
  row('f2-05', 'b', Math.sqrt(3.0 / rPerMetre), 'A', '42,4 A')
  const rMax = 3.0 / 100 ** 2
  const Amin = rho / rMax
  row('f2-05', 'c', Math.sqrt((4 * Amin) / Math.PI) * 1e3, 'mm', '8,5 mm')
}

// ───────── 6 ─────────
{
  const emf = 10
  const rin = 75
  const official = ['250 mW', '320 mW', '334 mW', '326 mW', '312 mW']
  ;[25, 50, 75, 100, 125].forEach((R, index) => {
    const I = emf / (R + rin)
    row('f2-06', `a R=${R}`, R * I ** 2 * 1e3, 'mW', official[index])
  })
  row('f2-06', 'b Pmax', (emf ** 2 / (4 * rin)) * 1e3, 'mW', '(R = Rin)')
}

// ───────── 7 ───────── ponte: N1 entrada, N2, N3, N4 saída (kΩ, mA, V)
{
  // incógnitas i1..i5
  const A = [
    [1, 1, 0, 0, 0], // nó N1: i1 + i2 = 1
    [0, 1, -1, -1, 0], // nó N2: i2 = i3 + i4
    [1, 0, 1, 0, -1], // nó N3: i1 + i3 = i5
    [-2, 1, 1, 0, 0], // malha N1-N2-N3: 1 i2 + 1 i3 - 2 i1 = 0
    [0, 0, 1, -2, 1], // malha N2-N3-N4: 1 i3 + 1 i5 - 2 i4 = 0
  ]
  const [i1, i2, i3, i4, i5] = solve(A, [1, 0, 0, 0, 0])
  const official = ['2/5 mA', '3/5 mA', '1/5 mA', '3/5 mA (trocado com i5)', '2/5 mA (trocado com i4)']
  ;[i1, i2, i3, i4, i5].forEach((value, index) => row('f2-07', `i${index + 1}`, value, 'mA', official[index]))
  assert(near(i4 + i5, 1), 'f2-07 nó de saída: i4 + i5 = 1 mA')
  const vTotal = 2 * i1 + 1 * i5
  row('f2-07', 'Req', vTotal / 1, 'kohm', '—')
  const dissipated = 2 * i1 ** 2 + i2 ** 2 + i3 ** 2 + 2 * i4 ** 2 + i5 ** 2
  assert(near(dissipated, vTotal * 1), 'f2-07 potência: V·I = soma R i²')
}

// ───────── 8 ─────────
{
  // incógnitas i1..i6 (sentidos da figura)
  const A = [
    [-1, -1, 0, 0, 0, 1], // nó A: i6 = i1 + i2
    [1, 0, -1, 0, -1, 0], // nó de cima: i1 = i3 + i5
    [0, 1, 0, -1, 1, 0], // nó C: i2 + i5 = i4
    [3, -2, 0, 0, 3, 0], // malha esquerda: 3 i1 + 3 i5 - 2 i2 = 5
    [0, 0, 4, -1, -3, 0], // malha direita: 4 i3 - 3 i5 - 1 i4 = 0
    [0, 2, 0, 1, 0, 3], // malha exterior: 2 i2 + 5 + 1 i4 + 3 i6 = 10
  ]
  const [i1, i2, i3, i4, i5, i6] = solve(A, [0, 0, 0, 5, 0, 5])
  const official = ['1,19 A', '0,14 A', '0,61 A', '0,72 A', '0,58 A', '1,33 A']
  ;[i1, i2, i3, i4, i5, i6].forEach((value, index) => row('f2-08', `a i${index + 1}`, value, 'A', official[index]))
  row('f2-08', 'b', 4 * i3 ** 2, 'W', '1,5 W')
  const vab = 3 * i1 + 4 * i3
  const vac = 2 * i2 + 5
  row('f2-08', 'c VA-VB', vab, 'V', '-6,0 V (sinal: VB-VA)')
  row('f2-08', 'c VA-VC', vac, 'V', '5,3 V')
  assert(near(vab, 10 - 3 * i6), 'f2-08 VAB pelo ramo da fonte de 10 V')
  assert(near(vac, 3 * i1 + 3 * i5), 'f2-08 VAC pelo ramo de cima')
  const delivered = 10 * i6 - 5 * i2
  const dissipated = 3 * i1 ** 2 + 2 * i2 ** 2 + 4 * i3 ** 2 + 1 * i4 ** 2 + 3 * i5 ** 2 + 3 * i6 ** 2
  assert(near(delivered, dissipated), `f2-08 potência: ${delivered.toFixed(3)} W fornecidos = ${dissipated.toFixed(3)} W dissipados`)
}

// ───────── 9 ─────────
{
  const { vab, currents } = threeBranches([{ e: 2, r: 2 }, { e: 4, r: 4 }, { e: 2, r: 2 }])
  row('f2-09', 'Vab', vab, 'V', '12/5 V')
  currents.forEach((value, index) => row('f2-09', `ramo ${index + 1} (b→a)`, value, 'A', '—'))
  assert(near(currents[0] + currents[1] + currents[2], 0), 'f2-09 nó a: soma das correntes = 0')
  const delivered = 2 * currents[0] + 4 * currents[1] + 2 * currents[2]
  const dissipated = 2 * currents[0] ** 2 + 4 * currents[1] ** 2 + 2 * currents[2] ** 2
  assert(near(delivered, dissipated), 'f2-09 potência')
}

// ───────── 10 ─────────
{
  const V = 6.0
  const r1 = 100
  const r2 = 200
  const real = (V * r1) / (r1 + r2)
  row('f2-10', 'real', real, 'V', '—')
  for (const [rv, official] of [[100, '40%'], [10000, '0,5%']]) {
    const eq = parallel(r1, rv)
    const measured = (V * eq) / (eq + r2)
    row('f2-10', `RV=${rv}k medido`, measured, 'V', '—')
    row('f2-10', `RV=${rv}k desvio`, ((real - measured) / real) * 100, '%', official)
  }
  row('f2-10', 'desvio com 1,99 V', ((2 - 1.99) / 2) * 100, '%', '0,5% (arredondamento)')
}

// ───────── 11 ─────────
row('f2-11', '', (12 - 0.6) / 10e-3 / 1e3, 'kohm', '1,14 kohm')

// ───────── 12 ─────────
{
  const A = 100.0e-6
  const er = 3.0
  const d0 = 5.0e-3
  const c0 = (er * eps0 * A) / d0
  const c1 = c0 + 20.0e-12
  const d1 = (er * eps0 * A) / c1
  row('f2-12', 'C0', c0 * 1e12, 'pF', '—')
  row('f2-12', 'd final', d1 * 1e3, 'mm', '—')
  row('f2-12', 'variação', (d0 - d1) * 1e3, 'mm', '4,87 mm')
}

// ───────── 13 ─────────
{
  const energy = 0.5 * 200e-6 * 300 ** 2
  const dt = energy / 30e6
  row('f2-13', 'energia', energy, 'J', '—')
  row('f2-13', 'tempo', dt, 's', '—')
  row('f2-13', 'distância', 1000 * dt * 1e3, 'mm', '0,3 mm')
}

// ───────── 14 ─────────
{
  const C = 5.0e-6
  const V0 = 10.0
  const rc = parallel(2000, 2000)
  const rd = series(1.0, parallel(2.0, series(1.0, parallel(2.0, 2.0))), 1.0)
  row('f2-14', 'a carga', rc, 'ohm', '—')
  row('f2-14', 'a descarga', rd, 'ohm', '—')
  row('f2-14', 'b', (V0 / rc) * 1e3, 'mA', '10 mA')
  row('f2-14', 'c Q', C * V0 * 1e6, 'uC', '0 mA, 10 V, 50 uC')
  row('f2-14', 'd', rc * C * 1e3, 'ms', '5,0 ms')
  row('f2-14', 'e', ((V0 - V0 / 2) / rc) * 1e3, 'mA', '5,0 mA')
  row('f2-14', 'f', V0 / rd, 'A', '3,3 A')
  row('f2-14', 'g', rd * C * 1e6, 'us', '15 us')
  for (const k of [1, 2, 3]) row('f2-14', `h i(${k}τ) descarga`, (V0 / rd) * Math.exp(-k), 'A', '—')
  for (const k of [1, 2, 3]) row('f2-14', `h i(${k}τ) carga`, (V0 / rc) * Math.exp(-k) * 1e3, 'mA', '—')
}

// ───────── 15 ───────── (exemplo numérico: R = 100 kΩ, RV = 1 MΩ, C = 1 μF)
row('f2-15', 'exemplo', parallel(100e3, 1e6) * 1e-6 * 1e3, 'ms', 'C·RV·R/(R+RV)')

// ───────── 16 ─────────
{
  // a) S aberto: uma só malha
  const open = (12 - 9) / (3 + 4 + 3 + 5)
  row('f2-16', 'a I1=I2', open, 'A', '0,2 A')
  // b) S fechado: incógnitas I1 (sobe à esquerda), I2 (desce à direita), I3 (sobe no meio)
  const A = [
    [1, -1, 1], // nó a: I1 + I3 = I2
    [7, 0, -4], // malha esquerda: 12 - 7 I1 + 4 I3 = 0
    [0, 8, 4], // malha direita: -9 - 8 I2 - 4 I3 = 0
  ]
  const [I1, I2, I3] = solve(A, [0, 12, -9])
  row('f2-16', 'b I1', I1, 'A', '0,93 A')
  row('f2-16', 'b I2', I2, 'A', '-0,44 A')
  row('f2-16', 'b I3', I3, 'A', '-1,37 A')
  const alt = threeBranches([{ e: 12, r: 7 }, { e: 9, r: 8 }, { e: 0, r: 4 }])
  assert(near(alt.currents[0], I1) && near(alt.currents[1], -I2) && near(alt.currents[2], I3), 'f2-16 b) confere com a fórmula dos três ramos')
  const delivered = 12 * I1 - 9 * I2
  const dissipated = 7 * I1 ** 2 + 8 * I2 ** 2 + 4 * I3 ** 2
  assert(near(delivered, dissipated), `f2-16 potência: ${delivered.toFixed(3)} W = ${dissipated.toFixed(3)} W`)
  row('f2-16', 'c Vab', 12 - 7 * open, 'V', '10,6 V')
  assert(near(12 - 7 * open, 9 + 8 * open), 'f2-16 c) Vab igual pelos dois lados')
}

// ───────── 17 ─────────
{
  // Ia: ramo de 12 V/4 Ω (b→a); Ib: ramo de 6 V/2 Ω (b→a); Ic: ramo de baixo (a→b)
  const A = [
    [1, 1, -1], // nó a: Ia + Ib = Ic
    [4, -2, 0], // 12 - 4 Ia = 6 - 2 Ib
    [0, 2, 6], // 6 - 2 Ib = 6 Ic - 2
  ]
  const [Ia, Ib, Ic] = solve(A, [0, 6, 8])
  row('f2-17', 'a I(4 ohm)', Ia, 'A', '1,45 A')
  row('f2-17', 'a I(2 ohm) b→a', Ib, 'A', '0,09 A')
  row('f2-17', 'a I(6 ohm) a→b', Ic, 'A', '1,36 A')
  row('f2-17', 'b', 8 * Ic, 'W', '10,9 W')
  row('f2-17', 'c Vab', 12 - 4 * Ia, 'V', '6,2 V')
  const delivered = 12 * Ia + 6 * Ib + 8 * Ic - 6 * Ic
  const dissipated = 4 * Ia ** 2 + 2 * Ib ** 2 + 6 * Ic ** 2
  assert(near(delivered, dissipated), `f2-17 potência: ${delivered.toFixed(3)} W = ${dissipated.toFixed(3)} W`)
}

// ───────── 18 ─────────
{
  const r8 = parallel(8, 8)
  const open = (12 + 6) / (4 + 3 + 1 + r8)
  row('f2-18', 'a', open, 'A', '1,5 A')
  // K ligado: I4 (desce na de 4 Ω), I6 (para a esquerda na de 6 Ω), I1 (sobe na de 1 Ω)
  const A = [
    [1, 1, -1], // nó esquerdo: I4 + I6 = I1
    [4 + r8, -6, 0], // 12 - 8 I4 = 10 - 6 I6
    [0, 6, 4], // 10 - 6 I6 = 4 I1 - 6
  ]
  const [I4, I6, I1] = solve(A, [0, 2, 16])
  row('f2-18', 'b I(4 ohm)', I4, 'A', '1,12 A')
  row('f2-18', 'b I(6 ohm)', I6, 'A', '1,15 A')
  row('f2-18', 'b I(1 ohm)', I1, 'A', '2,27 A')
  const delivered = 12 * I4 + 10 * I6 + 6 * I1
  const dissipated = (4 + r8) * I4 ** 2 + 6 * I6 ** 2 + 4 * I1 ** 2
  assert(near(delivered, dissipated), `f2-18 potência: ${delivered.toFixed(3)} W = ${dissipated.toFixed(3)} W`)
  row('f2-18', 'c P(6 ohm)', 6 * I6 ** 2, 'W', '—')
  row('f2-18', 'c', (6 * I6 ** 2 * 3600) / 1e3, 'kJ', '28,6 kJ')
  row('f2-18', 'c com 1,15 A', (6 * 1.15 ** 2 * 3600) / 1e3, 'kJ', '28,6 kJ (arredondamento)')
}

// ───────── 19 ─────────
{
  const E = 60
  const C = 50e-3
  const tau = 2 / Math.log(E / (E - 20))
  row('f2-19', 'a τ', tau, 's', '—')
  row('f2-19', 'a 5τ', 5 * tau, 's', '24,7 s')
  const r1 = tau / C
  const tauD = 30 / Math.log(E / 36.5)
  row('f2-19', 'b τ descarga', tauD, 's', '—')
  row('f2-19', 'b R1', r1, 'ohm', '98,8 ohm')
  row('f2-19', 'b R1+R2', tauD / C, 'ohm', '—')
  row('f2-19', 'b R2', tauD / C - r1, 'ohm', '1108,4 ohm')
}

// ───────── 20 ─────────
{
  const rRight = series(1, parallel(6, 6))
  row('f2-20', 'a', rRight, 'ohm', '4 ohm')
  // I1 (B→A na de 2 Ω), I2 (de A para a esquerda), I3 (de C para A)
  const A = [
    [1, -1, 1], // nó A: I1 + I3 = I2
    [-2, 0, rRight], // 14 - 4 I3 = VAB = -2 I1
    [2, 6, 0], // VAB = 6 I2 - 10 = -2 I1
  ]
  const [I1, I2, I3] = solve(A, [0, 14, 10])
  row('f2-20', 'b I1', I1, 'A', '-1 A')
  row('f2-20', 'b I2', I2, 'A', '2 A')
  row('f2-20', 'b I3', I3, 'A', '3 A')
  const vcd = 1 * I3 + -2 * I1 - 6 * I2
  row('f2-20', 'c VC-VD', vcd, 'V', '-7 V')
  const delivered = 14 * I3 + 10 * I2
  const dissipated = rRight * I3 ** 2 + 2 * I1 ** 2 + 6 * I2 ** 2
  assert(near(delivered, dissipated), `f2-20 potência: ${delivered.toFixed(3)} W = ${dissipated.toFixed(3)} W`)
}

// ───────── 21 ───────── (condensadores: série ↔ paralelo trocados em relação às resistências)
{
  const cs = parallel(4, 15)
  const ceq = cs + 12
  row('f2-21', 'a', ceq, 'uF', '15,16 uF')
  row('f2-21', 'b Q12', 12 * 200 * 1e-3, 'mC', '2,4 mC')
  row('f2-21', 'b Q4=Q15', cs * 200, 'uC', '632 uC')
  row('f2-21', 'b V4', (cs * 200) / 4, 'V', '—')
  row('f2-21', 'b V15', (cs * 200) / 15, 'V', '—')
  row('f2-21', 'c', 0.5 * ceq * 1e-6 * 200 ** 2, 'J', '0,303 J')
}

// ───────── 22 ─────────
{
  const left3 = parallel(18, 18, 18)
  const right3 = parallel(6, 6, 6)
  row('f2-22', 'a', 4 + left3 + right3, 'pF', '12 pF')
  const bd = 4 + right3
  row('f2-22', 'b', 18 + parallel(parallel(18, 18), bd), 'pF', '21,6 pF')
  row('f2-22', 'c', parallel(18, 18) + parallel(18, bd), 'pF', '13,5 pF')
}

// ───────── 23 ─────────
{
  const top = series(4, parallel(10, series(5, 10)))
  const bottom = series(5, parallel(10, 10))
  const req = parallel(top, bottom)
  row('f2-23', 'Req', req, 'ohm', '5 ohm')
  const I = 12 / req
  row('f2-23', 'I', I, 'A', '2,4')
  const iTop = 12 / top
  const iBottom = 12 / bottom
  row('f2-23', 'I4', iTop, 'A', '1,2')
  row('f2-23', 'I5 (baixo)', iBottom, 'A', '1,2')
  const vp = iTop * parallel(10, 15)
  row('f2-23', 'I10 (cima)', vp / 10, 'A', '0,71')
  row('f2-23', 'I15 (5+10)', vp / 15, 'A', '0,48')
  row('f2-23', 'I10 (baixo, cada)', iBottom / 2, 'A', '—')
  const dissipated = 4 * iTop ** 2 + 10 * (vp / 10) ** 2 + 15 * (vp / 15) ** 2 + 5 * iBottom ** 2 + 2 * 10 * (iBottom / 2) ** 2
  assert(near(dissipated, 12 * I), `f2-23 potência: ${dissipated.toFixed(3)} W = ${(12 * I).toFixed(3)} W`)
}

// ───────── 24 ─────────
{
  const E = 30.0
  const left = series(parallel(14, 14), parallel(6, 6))
  const right = series(1.5, parallel(6, 2))
  row('f2-24', 'R esquerda', left, 'ohm', '—')
  row('f2-24', 'R direita', right, 'ohm', '—')
  const i2 = E / left
  const i4 = E / right
  row('f2-24', 'i2', i2, 'A', '—')
  row('f2-24', 'i4', i4, 'A', '—')
  row('f2-24', 'i3', i2 / 2, 'A', '—')
  row('f2-24', 'i5 (R6)', (i4 * 6) / (6 + 2), 'A', '—')
  row('f2-24', 'i1', i2 + i4, 'A', '13 A')
  row('f2-24', 'Req', parallel(left, right), 'ohm', '—')
  assert(near(E * (i2 + i4), left * i2 ** 2 + right * i4 ** 2), 'f2-24 potência')
}

console.log(rows.join('\n'))
