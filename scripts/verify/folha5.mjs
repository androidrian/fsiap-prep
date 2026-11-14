// Verificação numérica da Ficha 5 — Térmica. Transferência de calor.
// Correr com: node scripts/verify/folha5.mjs
// Imprime: id alínea | calculado | ficha

const SIGMA = 5.6697e-8 // W m^-2 K^-4 (formulário)
const WIEN = 2.898e-3 // m K
const CAL = 4.186 // J
const G = 9.81 // m/s^2
const K0 = 273.15

const rows = []
function row(id, part, value, unit, official, extra = '') {
  rows.push({ id, part, value, unit, official, extra })
}
function fmt(x) {
  if (typeof x !== 'number') return String(x)
  const a = Math.abs(x)
  if (a !== 0 && (a < 1e-2 || a >= 1e5)) return x.toExponential(4)
  return x.toFixed(4)
}

// ── 1 ── escalas
row('f5-01', 'a', (9 / 5) * -71 + 32, '°F', '-96 °F')
row('f5-01', 'b', ((134 - 32) * 5) / 9, '°C', '56,7 °C')
row('f5-01', 'c1', -71 + K0, 'K', '(sem resposta)')
row('f5-01', 'c2', ((134 - 32) * 5) / 9 + K0, 'K', '(sem resposta)')

// ── 2 ── dilatação e massa específica
{
  const dl = 0.0023
  const alpha = dl / 100
  const exact = 1 / (1 + dl) ** 3 - 1
  row('f5-02', 'a', -3 * dl * 100, '%', '-0,69 %', `exato (1+0,0023)^-3 - 1 = ${(exact * 100).toFixed(4)} %`)
  row('f5-02', 'b', alpha * 1e6, '×10^-6 /°C', 'alumínio (23)')
}

// ── 3 ── ponte
row('f5-03', '', 2000 * 1.27e-5 * 40, 'm', '1 m')

// ── 4 ── bloco de ferro fundido
{
  const V = 0.05 * 0.1 * 0.06
  const beta = 3 * 1.0e-5
  const dT = 47 - 15
  const exact = V * ((1 + 1.0e-5 * dT) ** 3 - 1)
  row('f5-04', '', V * beta * dT, 'm^3', '2,9e-7 m^3', `exato = ${exact.toExponential(4)}`)
}

// ── 5 ── calorimetria
row('f5-05', '', (0.4 * 4186 * (22.4 - 20)) / (0.05 * (200 - 22.4)), 'J/(kg °C)', '452,54')

// ── 6 ── fundir gelo
{
  const q1 = 10 * 0.5 * 10 // kcal
  const q2 = 10 * 79.7 // kcal (79,7 cal/g = 79,7 kcal/kg)
  row('f5-06', '', q1 + q2, 'kcal', '847 kcal', `= ${((q1 + q2) * 1000 * CAL).toExponential(4)} J`)
}

// ── 7 ── Joule
{
  const W = 25 * 6.0 * G * 2.0
  const Qcal = 500 * 1 * 1.4
  row('f5-07', '', W / Qcal, 'J/cal', '4,2 J', `W = ${W.toFixed(1)} J; Q = ${Qcal} cal`)
}

// ── 8 ── chip
row('f5-08', '', (150 * (10e-3 * 10e-3) * 5) / 1.0e-3, 'W', '75 W')

// ── 9 ── convecção
{
  const q = 1.7e-3 * 1.5 * 30
  row('f5-09', '', q, 'kcal/s', '7,65e-2 kcal/s', `= ${(q * 1000 * CAL).toFixed(1)} W`)
}

// ── 10 ── frigorífico
{
  const qdot = (1e-4 * 2.0e4 * (20 - 5)) / 5.0 // cal/s (k em cal/(s cm K), A em cm^2, L em cm)
  const Q = qdot * 3600 // cal por hora
  const mOnlyMelt = Q / 79.7
  const mMeltAndWarm = Q / (79.7 + 1 * 5)
  row('f5-10', '', mMeltAndWarm, 'g', '255,02 g', `Q̇ = ${qdot} cal/s; Q = ${Q} cal/h; só fusão = ${mOnlyMelt.toFixed(2)} g`)
}

// ── 11 ── duas placas
{
  const r1 = 2.0 / 0.12 // por cm^2
  const r2 = 7 / 0.49
  const q = 80 / (r1 + r2)
  row('f5-11', '', 100 - q * r1, '°C', '56,92 °C', `R1'=${r1.toFixed(3)} R2'=${r2.toFixed(3)} q=${q.toFixed(4)} cal/(s cm^2); pelo lado frio ${(20 + q * r2).toFixed(2)}`)
}

// ── 12 ── sala de aula
{
  const P = (50 * 100 * 0.5 * 1000) / 3600 // cal/s
  const dT_s = (P * 0.01) / (0.2 * 10) // k = 0,2 cal/(s m K)
  const dT_h = ((50 * 100 * 0.5 * 1000) * 0.01) / (0.2 * 10) // k = 0,2 cal/(h m K)
  row('f5-12', '', 15 + dT_s, '°C', '18,5 °C', `P = ${P.toFixed(1)} cal/s = ${(P * CAL).toFixed(0)} W; se k fosse por hora: ΔT = ${dT_h.toFixed(0)} K (absurdo)`)
}

// ── 13 ── vidro simples e duplo
{
  const A = 1.0
  const Rv = 0.005 / (0.8 * A)
  const Rgap = 0.0015 / (0.025 * A)
  const Rd = 2 * Rv + Rgap
  const Rint = 0.003 / (0.025 * A)
  const Rext = 0.0015 / (0.025 * A)
  row('f5-13', 'a', Rd / Rv, '(razão)', '12', `Rv=${Rv.toFixed(5)} Rgap=${Rgap.toFixed(3)} Rd=${Rd.toFixed(4)} aumento=${(Rd - Rv).toFixed(5)} K/W; Rint=${Rint.toFixed(2)} Rext=${Rext.toFixed(2)}; razão eficaz=${((Rint + Rd + Rext) / (Rint + Rv + Rext)).toFixed(3)}`)
  row('f5-13', 'b simples', Rint + Rv + Rext, '°C/W', '0,19 °C/W')
  row('f5-13', 'b duplo', Rint + Rd + Rext, '°C/W', '0,25 °C/W')
}

// ── 14 ── Sol
row('f5-14', '', (3.9e26 / (SIGMA * 4 * Math.PI * 7.0e8 ** 2)) ** 0.25, 'K', '5,8e3 K')

// ── 15 ── Terra
{
  const I = SIGMA * 6000 ** 4 * (6.96e8 / 1.49e11) ** 2 // W/m^2 à distância da Terra
  const viaI = (I / (4 * SIGMA)) ** 0.25
  row('f5-15', '', 6000 * Math.sqrt(6.96e8 / (2 * 1.49e11)), 'K', '290 K', `I = ${I.toFixed(1)} W/m^2; via I: ${viaI.toFixed(2)} K = ${(viaI - K0).toFixed(1)} °C`)
}

// ── 16 ── campista
{
  const T = 35 + K0
  const Tsky = -5 + K0
  const eA = 0.9 * 0.9
  row('f5-16', 'a', (WIEN / T) * 1e9, 'nm', '9400 nm')
  row('f5-16', 'b', eA * SIGMA * (T ** 4 - Tsky ** 4), 'W', '177 W')
  const Teq = (Tsky ** 4 + 50 / (eA * SIGMA)) ** 0.25
  row('f5-16', 'c', Teq - K0, '°C', '8 °C', `Teq = ${Teq.toFixed(2)} K`)
}

// ── 17 ── parede a | (b ∥ c) | d
{
  const A = 1.5 * 1.5
  const Ra = 0.025 / (175 * A)
  const Rb = 0.075 / (40 * (A / 2))
  const Rc = 0.075 / (50 * (A / 2))
  const Rbc = 1 / (1 / Rb + 1 / Rc)
  const Rd = 0.05 / (80 * A)
  const R = Ra + Rbc + Rd
  const Q = 380 / R
  row('f5-17', 'a', R, 'K/W', '1,1e-3 K/W', `Ra=${Ra.toExponential(4)} Rb=${Rb.toExponential(4)} Rc=${Rc.toExponential(4)} Rbc=${Rbc.toExponential(4)} Rd=${Rd.toExponential(4)}`)
  row('f5-17', 'b', Q, 'W', '345,45e3 W', `ficha: 380/1,1e-3 = ${(380 / 1.1e-3).toFixed(1)}`)
  row('f5-17', 'c a-bc', 370 - Q * Ra, '°C', '348,06 °C', `ficha: 370 - 345,45e3*6,35e-5 = ${(370 - 345.45e3 * 6.35e-5).toFixed(2)}`)
  row('f5-17', 'c bc-d', -10 + Q * Rd, '°C', '86,03 °C', `ficha: -10 + 345,45e3*2,78e-4 = ${(-10 + 345.45e3 * 2.78e-4).toFixed(2)}; conferir: ${(370 - Q * Ra - Q * Rbc).toFixed(2)}`)
}

// ── 18 ── parede de montanha (por m^2)
{
  const Rp = 0.15 / 3.5
  const Re = 0.05 / 0.025
  const Rm = 0.02 / 0.14
  const R = Rp + Re + Rm
  const q = 15 / R
  row('f5-18', 'a', R, 'K/W (A = 1 m^2)', '2,18 K/W', `Rp=${Rp.toFixed(5)} Re=${Re} Rm=${Rm.toFixed(5)}`)
  row('f5-18', 'b', q, 'W/m^2', '6,88 W', `ficha: 15/2,18 = ${(15 / 2.18).toFixed(3)}`)
  row('f5-18', 'c p-e', 35 - q * Rp, '°C', '34,7 °C')
  row('f5-18', 'c e-m', 20 + q * Rm, '°C', '20,98 °C', `conferir: ${(35 - q * Rp - q * Re).toFixed(3)}`)
}

// ── 19 ── cubos Cu e Al
{
  const A = 0.03 * 0.03
  const Rcu = 0.03 / (401 * A)
  const Ral = 0.03 / (237 * A)
  const R = Rcu + Ral
  const Q = 80 / R
  row('f5-19', 'a', R, 'K/W', '223,8e-3 K/W', `Rcu=${Rcu.toFixed(5)} Ral=${Ral.toFixed(5)}`)
  row('f5-19', 'b', Q, 'W', '357,5 W')
  row('f5-19', 'c', 100 - Q * Rcu, '°C', '70,3 °C', `conferir: ${(20 + Q * Ral).toFixed(2)}`)
}

// ── 20 ── três materiais (A = 1 m^2)
{
  const R1 = 0.03 / 50
  const R2 = 0.05 / 30
  const R3 = 0.07 / 15
  const R = R1 + R2 + R3
  const Q = 80 / R
  row('f5-20', 'a R1', R1, 'K/W', '6e-4')
  row('f5-20', 'a R2', R2, 'K/W', '16,67e-4')
  row('f5-20', 'a R3', R3, 'K/W', '46,67e-4')
  row('f5-20', 'b', Q, 'W', '11,53e3 W', `Req=${R.toExponential(4)}`)
  row('f5-20', 'c', Q / 15, 'K/m (3.º)', '3.º material', `gradientes: ${(Q / 50).toFixed(1)}, ${(Q / 30).toFixed(1)}, ${(Q / 15).toFixed(1)} K/m; quedas: ${(Q * R1).toFixed(2)}, ${(Q * R2).toFixed(2)}, ${(Q * R3).toFixed(2)} K; interfaces: ${(100 - Q * R1).toFixed(2)} e ${(100 - Q * (R1 + R2)).toFixed(2)} °C`)
}

// ── 21 ── caixa térmica
{
  const Af = 0.75 / 6
  const Rm = 0.01 / (0.12 * Af)
  const Re = 0.02 / (0.1 * Af)
  const R = Rm + Re
  const Q = 30 / R
  const Qtot = 6 * Q
  const t = (2.5 * 3.34e5) / Qtot
  row('f5-21', 'a', Q, 'W', '13,21 K/W', `Af=${Af} Rm=${Rm.toFixed(4)} Re=${Re.toFixed(4)} R=${R.toFixed(4)}; ficha: 30/2,27 = ${(30 / 2.27).toFixed(3)}`)
  row('f5-21', 'b', 30 - Q * Rm, '°C', '21,15 °C', `ficha: 30 - 13,21*0,67 = ${(30 - 13.21 * 0.67).toFixed(2)}; conferir: ${(0 + Q * Re).toFixed(2)}`)
  row('f5-21', 'c', t / 3600, 'h', '≈ 3 horas', `Qtot=${Qtot.toFixed(2)} W; t=${t.toFixed(0)} s; só uma face: ${(t * 6 / 3600).toFixed(1)} h`)
}

// ── 22 ── estudante
{
  const T = 37 + K0
  const Tq = 22 + K0
  const P = 0.9 * SIGMA * 1.85 * (T ** 4 - Tq ** 4)
  const R = 0.025 / (0.13 * 0.8)
  const Qc = 0.45 * P
  row('f5-22', 'a', P * 900, 'J', '141,40e3 J', `P = ${P.toFixed(2)} W; com 310 K e 295 K: ${(0.9 * SIGMA * 1.85 * (310 ** 4 - 295 ** 4) * 900).toFixed(0)} J`)
  row('f5-22', 'b', R, 'K/W', '0,240 K/W')
  row('f5-22', 'c', 37 - Qc * R, '°C', '20,0 °C', `Q̇c = ${Qc.toFixed(2)} W; ΔT = ${(Qc * R).toFixed(2)} K`)
}

for (const item of rows) {
  const label = `${item.id} ${item.part}`.trim().padEnd(16)
  const value = `${fmt(item.value)} ${item.unit}`.padEnd(30)
  console.log(`${label} | ${value} | ${item.official}${item.extra ? `   [${item.extra}]` : ''}`)
}
