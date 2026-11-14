// Verificação numérica da Ficha 4 — Radiação. Ótica. Fibra ótica.
// Correr com: node scripts/verify/folha4.mjs
// Imprime: id alínea | calculado | ficha

const c = 3.0e8
const mu0 = 4 * Math.PI * 1e-7
const deg = (rad) => (rad * 180) / Math.PI
const rad = (d) => (d * Math.PI) / 180
const sind = (d) => Math.sin(rad(d))
const cosd = (d) => Math.cos(rad(d))
const tand = (d) => Math.tan(rad(d))
const asind = (x) => deg(Math.asin(x))

const rows = []
function row(id, part, label, value, official) {
  const shown = typeof value === 'number' ? value.toPrecision(5) : String(value)
  rows.push(`${id} ${part.padEnd(2)}| ${label.padEnd(34)}| ${shown.padEnd(14)}| ${official}`)
}

// ── 1 ─────────────────────────────────────────────
{
  const w = 2 * Math.PI * 1e8
  const k = (2 * Math.PI) / 3
  row('f4-01', 'a', 'f = w/2pi (Hz)', w / (2 * Math.PI), '1e8 Hz')
  row('f4-01', 'a', 'lambda = 2pi/k (m)', (2 * Math.PI) / k, '3 m')
  row('f4-01', 'b', 'v = w/k (m/s)', w / k, '(c = 3e8)')
  row('f4-01', 'c', 'Bm = Em/c (T)', 30 / c, '-')
}

// ── 2 ─────────────────────────────────────────────
{
  const w = 1e14
  const Bm = 1e-6
  const Em = c * Bm
  const f = w / (2 * Math.PI)
  row('f4-02', 'b', 'Em = c Bm (V/m)', Em, '300 V/m')
  row('f4-02', 'c', 'f = w/2pi (Hz)', f, '-')
  row('f4-02', 'c', 'lambda = 2pi c/w (m)', c / f, '1,89e-5 m')
  row('f4-02', 'd', 'I = Em Bm/(2 mu0) (W/m2)', (Em * Bm) / (2 * mu0), '120 W/m2')
}

// ── 3 ─────────────────────────────────────────────
{
  row('f4-03', 'a', 'lambda AM 520 kHz (m)', c / 520e3, '577 m')
  row('f4-03', 'a', 'lambda AM 1610 kHz (m)', c / 1610e3, '186 m')
  row('f4-03', 'a', 'lambda FM 88 MHz (m)', c / 88e6, '3,4 m')
  row('f4-03', 'a', 'lambda FM 108 MHz (m)', c / 108e6, '2,8 m')
  const l = c / 1000e3
  row('f4-03', 'b', 'lambda 1000 kHz (m)', l, '300 m')
  row('f4-03', 'b', 'antena lambda/4 (m)', l / 4, '75 m')
  const lc = 2 * 246
  row('f4-03', 'c', 'lambda = 2 x 246 (m)', lc, '-')
  row('f4-03', 'c', 'f = c/lambda (Hz)', c / lc, '609 Hz (gralha: kHz)')
  const ld = c / 900e6
  row('f4-03', 'd', 'lambda 900 MHz (m)', ld, '0,33 m')
  row('f4-03', 'd', 'lambda/4 (m)', ld / 4, '-')
}

// ── 4 ─────────────────────────────────────────────
{
  const P = 50e3
  const r = 100e3
  const Ihemi = P / (2 * Math.PI * r * r)
  const Isph = P / (4 * Math.PI * r * r)
  row('f4-04', '', 'I meia esfera (W/m2)', Ihemi, '-')
  row('f4-04', '', 'Em meia esfera (V/m)', Math.sqrt(2 * mu0 * c * Ihemi), '2,45e-2 V/m')
  row('f4-04', '', 'I esfera completa (W/m2)', Isph, '-')
  row('f4-04', '', 'Em esfera completa (V/m)', Math.sqrt(2 * mu0 * c * Isph), '(2,45e-2 V/m)')
}

// ── 5 ─────────────────────────────────────────────
{
  row('f4-05', '', 'lambda 430 THz (nm)', (c / 430e12) * 1e9, '698 nm')
  row('f4-05', '', 'lambda 760 THz (nm)', (c / 760e12) * 1e9, '395 nm')
}

// ── 6 ─────────────────────────────────────────────
{
  const ly = 9.46e15
  const r = 431 * ly
  const P = 2.2e3 * 3.9e26
  const I = P / (4 * Math.PI * r * r)
  const Em = Math.sqrt(2 * mu0 * c * I)
  row('f4-06', '', 'r (m)', r, '-')
  row('f4-06', '', 'P (W)', P, '-')
  row('f4-06', '', 'I (W/m2)', I, '-')
  row('f4-06', '', 'Em (V/m)', Em, '1,2e-3 V/m (valor eficaz)')
  row('f4-06', '', 'Eef = Em/sqrt2 (V/m)', Em / Math.SQRT2, '1,2e-3 V/m')
  row('f4-06', '', 'Bm = Em/c (T)', Em / c, '5,8e-12 T')
  row('f4-06', '', 'Bef (T)', Em / c / Math.SQRT2, '-')
}

// ── 7 ─────────────────────────────────────────────
{
  const I = 20
  const f = 1e6
  const w = 2 * Math.PI * f
  const k = w / c
  const Em = Math.sqrt(2 * mu0 * c * I)
  row('f4-07', '', 'w (rad/s)', w, '2pi e6 = 6,283e6')
  row('f4-07', '', 'k (rad/m)', k, '2/3 pi e-2 = 2,094e-2')
  row('f4-07', '', 'lambda (m)', c / f, '-')
  row('f4-07', '', 'Em (V/m)', Em, '123 V/m')
  row('f4-07', '', 'Bm (T)', Em / c, '4,15e-7 T')
}

// ── 8 ─────────────────────────────────────────────
{
  const I1 = 0.5
  const I2 = I1 * cosd(60) ** 2
  const I3 = I2 * cosd(90 - 60) ** 2
  row('f4-08', '', 'I1/I0', I1, '-')
  row('f4-08', '', 'I2/I0', I2, '-')
  row('f4-08', '', 'I3/I0', I3, '0,094')
}

// ── 9 ─────────────────────────────────────────────
{
  row('f4-09', 'a', 'thetaB ar-vidro n=1,5 (graus)', deg(Math.atan(1.5)), '(exemplo)')
  row('f4-09', 'b', 'It/Ir = cos2(90)', Math.abs(cosd(90) ** 2) < 1e-12 ? 0 : cosd(90) ** 2, '0')
}

// ── 10 ────────────────────────────────────────────
{
  const n = Math.sqrt(1 + sind(45) ** 2)
  const t2 = asind(sind(45) / n)
  row('f4-10', '', 'n minimo', n, '1,22')
  row('f4-10', '', 'theta2 em A (graus)', t2, '-')
  row('f4-10', '', 'incidencia em B (graus)', 90 - t2, '-')
  row('f4-10', '', 'angulo critico (graus)', asind(1 / n), '-')
}

// ── 11 ────────────────────────────────────────────
{
  const nn = 1.58
  const nb = 1.53
  const NA = Math.sqrt(nn * nn - nb * nb)
  row('f4-11', '', 'angulo critico (graus)', asind(nb / nn), '-')
  row('f4-11', '', 'NA', NA, '-')
  row('f4-11', '', 'phi max (graus)', asind(NA), '23,20')
}

// ── 12 ────────────────────────────────────────────
{
  const nn = 1.486
  const nb = nn * (1 - 0.01)
  const NA = Math.sqrt(nn * nn - nb * nb)
  row('f4-12', 'b', 'nb', nb, '-')
  row('f4-12', 'b', 'NA', NA, '-')
  row('f4-12', 'b', 'phi (graus)', asind(NA), '12,1')
}

// ── 13 ────────────────────────────────────────────
{
  const f = 2.0e4
  const v1 = 1.0e3
  const ratio = sind(40) / sind(60)
  row('f4-13', 'a', 'n2/n1 (40 e 60 a normal)', ratio, '0,74')
  row('f4-13', 'a', 'alt.: sin40/sin30', sind(40) / sind(30), '(0,74)')
  row('f4-13', 'a', 'alt.: sin50/sin60', sind(50) / sind(60), '(0,74)')
  row('f4-13', 'b', 'angulo critico (graus)', asind(ratio), '48')
  const v2 = v1 / ratio
  row('f4-13', 'c', 'v2 (m/s)', v2, '-')
  row('f4-13', 'c', 'lambda1 (m)', v1 / f, '-')
  row('f4-13', 'c', 'lambda2 (m)', v2 / f, '6,75e-2 m')
}

// ── 14 ────────────────────────────────────────────
{
  const n = 633 / 474
  row('f4-14', 'a', 'n', n, '1,34')
  row('f4-14', 'b', 'f (Hz)', c / 633e-9, '4,74e14 Hz')
  row('f4-14', 'c', 'angulo critico (graus)', asind(1 / n), '48,6')
  row('f4-14', 'c', 'com n = 1,34 (graus)', asind(1 / 1.34), '(48,6)')
}

// ── 15 ────────────────────────────────────────────
{
  const nn = 1.542
  const nb16 = Math.sqrt(nn * nn - sind(16) ** 2)
  const nb32 = Math.sqrt(nn * nn - sind(32) ** 2)
  row('f4-15', 'a', 'nb (semi-angulo 16)', nb16, '1,517')
  row('f4-15', 'a', 'alt.: nb (phi = 32)', nb32, '(1,517)')
  row('f4-15', 'b', 'v = c/nb (m/s)', c / nb16, '1,98e8 m/s')
}

// ── 16 ────────────────────────────────────────────
{
  const I = 50 / (4 * Math.PI * 3 * 3)
  const Em = Math.sqrt(2 * mu0 * c * I)
  row('f4-16', 'a', 'I (W/m2)', I, '0,442 W/m2')
  row('f4-16', 'b', 'Em (V/m)', Em, '18,2 V/m')
  row('f4-16', 'b', 'Bm (T)', Em / c, '6,08e-8 T')
}

// ── 17 ────────────────────────────────────────────
{
  const nn = 1.475
  const nb = 1.46
  const a = 25e-6
  const L = 1000
  const tc = asind(nb / nn)
  const NA = Math.sqrt(nn * nn - nb * nb)
  const dx = 2 * a * tand(tc)
  row('f4-17', 'a', 'theta1 limite (graus)', tc, '81,8')
  row('f4-17', 'b', 'phi max (graus)', asind(NA), '12,1')
  row('f4-17', 'c', 'tan(theta1)', tand(tc), '-')
  row('f4-17', 'c', 'dx = 2a tan(theta1) (m)', dx, '-')
  row('f4-17', 'c', 'N = L/dx', L / dx, '2,9e6')
  row('f4-17', 'c', 'alt.: N com a (raio)', L / (a * tand(tc)), '(2,9e6)')
  row('f4-17', 'c', 'alt.: N mesma parede (4a)', L / (4 * a * tand(tc)), '(2,9e6)')
}

// ── 18 ────────────────────────────────────────────
{
  const L = 0.5
  const s1 = sind(45)
  const nL = s1 / sind(90 - 60)
  row('f4-18', 'a', 'nL (theta3 a superficie)', nL, '1,41')
  row('f4-18', 'a', 'alt.: nL (theta3 a normal)', s1 / sind(60), '(1,41)')
  const ncos = nL * sind(90 - 14)
  const n = Math.sqrt(s1 * s1 + ncos * ncos)
  row('f4-18', 'b', 'n cos(theta_a)', ncos, '-')
  row('f4-18', 'b', 'n (theta2 a parede)', n, '1,54')
  row('f4-18', 'b', 'alt.: n (theta2 a normal)', Math.sqrt(s1 * s1 + (nL * sind(14)) ** 2), '(1,54)')
  const ta = asind(s1 / n)
  const leg = L / sind(ta)
  const v = c / n
  row('f4-18', 'c', 'theta_a (graus)', ta, '-')
  row('f4-18', 'c', 'troco L/sin(theta_a) (m)', leg, '-')
  row('f4-18', 'c', 'v = c/n (m/s)', v, '-')
  row('f4-18', 'c', 't dois trocos (s)', (2 * leg) / v, '1,1e-8 s')
  row('f4-18', 'c', 'alt.: t um troco (s)', leg / v, '(1,1e-8 s)')
}

console.log('id    al| grandeza                          | calculado     | ficha')
console.log('-'.repeat(80))
for (const line of rows) console.log(line)
