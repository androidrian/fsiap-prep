// Verificação numérica da folha de preparação para o teste (matéria das fichas 1 a 4).
// Correr com: node scripts/verify/folha6.mjs
// Imprime: id alínea | calculado | folha

// Constantes dadas no cabeçalho da folha
const k = 8.99e9
const eps0 = 8.85e-12
const mu0 = 4 * Math.PI * 1e-7
const c = 3.0e8
const e = 1.6e-19
const mp = 1.67e-27
const me = 9.1e-31
const u = 1.66e-27
const g = 9.8

const deg = (rad) => (rad * 180) / Math.PI
const rad = (d) => (d * Math.PI) / 180
const sind = (d) => Math.sin(rad(d))
const cosd = (d) => Math.cos(rad(d))
const tand = (d) => Math.tan(rad(d))
const asind = (x) => deg(Math.asin(x))

const rows = []
function row(id, part, label, value, official) {
  const shown = typeof value === 'number' ? value.toPrecision(5) : String(value)
  rows.push(`${id} ${part.padEnd(2)}| ${label.padEnd(38)}| ${shown.padEnd(14)}| ${official}`)
}

// ── I – Cargas, campo e potencial ─────────────────
{
  const F = (k * 6e-9 * 2e-9) / 0.03 ** 2
  const q = (6e-9 - 2e-9) / 2
  row('f6-01', 'a', 'F = k|q1 q2|/r2 (N)', F, '1,2e-4 N, atrativa')
  row('f6-01', 'b', "q' = (q1+q2)/2 (C)", q, '+2,0 nC')
  row('f6-01', 'b', "F' = k q'2/r2 (N)", (k * q * q) / 0.03 ** 2, '4,0e-5 N, repulsiva')
}
{
  const r = 5.3e-11
  row('f6-02', 'a', 'F = k e2/r2 (N)', (k * e * e) / r ** 2, '8,2e-8 N')
  row('f6-02', 'b', 'E = k e/r2 (N/C)', (k * e) / r ** 2, '5,1e11 N/C')
  row('f6-02', 'b', 'V = k e/r (V)', (k * e) / r, '27 V')
}
{
  const dV = 5.0e4 * 0.02
  const W = e * dV
  row('f6-03', 'a', 'dV = E d (V)', dV, '1,0 kV')
  row('f6-03', 'b', 'W = e dV (J)', W, '1,6e-16 J')
  row('f6-03', 'b', 'v = sqrt(2W/mp) (m/s)', Math.sqrt((2 * W) / mp), '4,4e5 m/s')
}
{
  const F13 = (k * 2e-6 * 1e-6) / 0.2 ** 2
  const F23 = (k * 3e-6 * 1e-6) / 0.2 ** 2
  const d = 0.4 / (Math.sqrt(3 / 2) - 1)
  row('f6-04', 'a', 'F3x = F13 + F23 (N)', F13 + F23, '1,12 ex N')
  row('f6-04', 'b', 'x de campo nulo (m)', -d, '-1,78 m')
  row('f6-04', 'b', 'controlo: E1 - E2 nesse ponto', (k * 2e-6) / d ** 2 - (k * 3e-6) / (d + 0.4) ** 2, '0')
}
{
  const m = 2.0e-3
  row('f6-05', 'b', '|q| = m g tan15/E (C)', (m * g * tand(15)) / 1.5e4, '3,5e-7 C')
  row('f6-05', 'b', 'T = m g/cos15 (N)', (m * g) / cosd(15), '2,0e-2 N')
}
{
  const a = 0.1
  const q = 5e-9
  const E1 = (k * q) / (a * a / 2)
  row('f6-06', 'a', 'E de cada carga (N/C)', E1, '-')
  row('f6-06', 'a', 'Ey = 4 E1 sin45 (N/C)', 4 * E1 * sind(45), '2,54e4 ey N/C')
  row('f6-06', 'b', 'V = k(q+q-q-q)/d (V)', 0, '0 V')
  row('f6-06', 'c', 'W = q0 V (J)', 0, '0 J')
}
{
  const E = 150 / 0.02
  const a = (e * E) / me
  const t = 0.05 / 2.0e7
  const y = 0.5 * a * t * t
  const vy = a * t
  row('f6-07', 'a', 'E = dV/d (V/m)', E, '7,5e3 V/m')
  row('f6-07', 'a', 'a = e E/me (m/s2)', a, '1,32e15 m/s2')
  row('f6-07', 'b', 'y = a t2/2 (mm)', y * 1e3, '4,1 mm, não toca')
  row('f6-07', 'c', 'vy = a t (m/s)', vy, '3,3e6 m/s')
  row('f6-07', 'c', 'desvio = atan(vy/vx) (graus)', deg(Math.atan(vy / 2.0e7)), '9,4 graus')
}
{
  const C = (eps0 * 50e-4) / 1.0e-3
  row('f6-08', 'a', 'C = eps0 A/d (pF)', C * 1e12, '44 pF')
  row('f6-08', 'a', 'Q = C V (C)', C * 12, '5,3e-10 C')
  row('f6-08', 'a', 'E = V/d (V/m)', 12 / 1.0e-3, '1,2e4 V/m')
  row('f6-08', 'a', 'U = C V2/2 (J)', 0.5 * C * 144, '3,2e-9 J')
  row('f6-08', 'b', "C' = 3 C (pF)", 3 * C * 1e12, '133 pF')
  row('f6-08', 'b', "Q' = C' V (C)", 3 * C * 12, '1,6e-9 C')
}
{
  const VP = k * (8e-9 / 0.4 - 2e-9 / Math.hypot(0.3, 0.4))
  row('f6-09', 'a', 'x entre as cargas: x = 4(0,30-x) (cm)', (4 * 0.3 * 100) / 5, '24 cm')
  row('f6-09', 'a', 'x à direita: x = 4(x-0,30) (cm)', (4 * 0.3 * 100) / 3, '40 cm')
  row('f6-09', 'b', 'V_P (V)', VP, '144 V')
  row('f6-09', 'c', 'W_ext = q V_P (J)', 1e-9 * VP, '1,4e-7 J')
}
{
  const a = 0.1
  const q = 3e-9
  const F = (k * q * q) / (a * a)
  const d = a / Math.sqrt(3)
  row('f6-10', 'a', 'Fy = -2 F cos30 (N)', -2 * F * cosd(30), '-1,4e-5 ey N')
  row('f6-10', 'b', 'V = k(q1+q2+q3)/d (V)', (k * q) / d, '467 V')
  row('f6-10', 'c', 'U = k(q1q2+q1q3+q2q3)/a (J)', (k / a) * (q * q - q * q - q * q), '-8,1e-7 J')
}

// ── II – Circuitos e condensadores ────────────────
{
  const A = Math.PI * (0.5e-3) ** 2
  const R = (1.72e-8 * 20) / A
  row('f6-11', 'a', 'R = rho l/A (ohm)', R, '0,44 ohm')
  row('f6-11', 'a', 'V = R I (V)', R * 2, '0,88 V')
  row('f6-11', 'a', 'P = R I2 (W)', R * 4, '1,8 W')
  row('f6-11', 'b', 'vd = I/(n e A) (m/s)', 2 / (8.5e28 * e * A), '1,9e-4 m/s')
}
{
  const R = 230 ** 2 / 60
  row('f6-12', 'a', 'I = P/V (A)', 60 / 230, '0,26 A')
  row('f6-12', 'a', 'R = V2/P (ohm)', R, '882 ohm')
  row('f6-12', 'b', "P' = 115^2/R (W)", 115 ** 2 / R, '15 W')
}
{
  const Ep = 0.065 * 6 * 30
  const Es = 0.35 * 24 * 365
  row('f6-13', 'a', 'E portátil (kWh)', Ep, '11,7 kWh')
  row('f6-13', 'a', 'custo (euros)', Ep * 0.16, '1,87 euros')
  row('f6-13', 'b', 'E servidor (kWh)', Es, '3066 kWh')
  row('f6-13', 'b', 'custo (euros)', Es * 0.16, '491 euros')
}
{
  const I = 9.0 / (4.0 + 0.5)
  const V = 9.0 - 0.5 * I
  row('f6-14', 'a', 'I = fem/(R+r) (A)', I, '2,0 A')
  row('f6-14', 'a', 'V = fem - r I (V)', V, '8,0 V')
  row('f6-14', 'a', 'rendimento = V/fem (%)', (V / 9.0) * 100, '89 %')
  row('f6-14', 'b', 'P_int = r I2 (W)', 0.5 * I * I, '2,0 W')
  row('f6-14', 'c', 'Pmax = fem2/(4r) (W)', 81 / (4 * 0.5), '40,5 W')
}
{
  const I = 15e-3
  row('f6-15', 'a', 'R = (5,0-2,0)/I (ohm)', 3.0 / I, '200 ohm')
  row('f6-15', 'b', 'P_R (mW)', 3.0 * I * 1e3, '45 mW')
  row('f6-15', 'b', 'P_LED (mW)', 2.0 * I * 1e3, '30 mW')
  row('f6-15', 'b', 'fração útil (%)', (2.0 / 5.0) * 100, '40 %')
}
{
  const R23 = (6 * 3) / (6 + 3)
  const R123 = 2 + R23
  const Req = (R123 * 8) / (R123 + 8)
  const I1 = 12 / R123
  row('f6-16', 'a', 'Req (ohm)', Req, '2,67 ohm')
  row('f6-16', 'b', 'I1 (A)', I1, '3,0 A')
  row('f6-16', 'b', 'I2 (A)', (I1 * R23) / 6, '1,0 A')
  row('f6-16', 'b', 'I3 (A)', (I1 * R23) / 3, '2,0 A')
  row('f6-16', 'b', 'I4 (A)', 12 / 8, '1,5 A')
}
{
  const Rp = (100 * 1000) / (100 + 1000)
  const Vm = (10 * Rp) / (100 + Rp)
  row('f6-17', 'a', 'sem voltímetro (V)', 5.0, '5,0 V')
  row('f6-17', 'a', 'V medido (V)', Vm, '4,76 V')
  row('f6-17', 'b', 'erro relativo (%)', ((5.0 - Vm) / 5.0) * 100, '4,8 %')
}
{
  // I1 sobe no ramo de e1, I2 desce no ramo de e2, I3 de a para b.
  // nó a: I1 = I2 + I3 | malha esq.: 10 - 2 I1 - 4 I3 = 0 | malha dir.: -4 I2 + 4 + 4 I3 = 0
  const I3 = (10 - 2 * 1.0) / (4 + 4)
  const I2 = I3 + 1.0
  const I1 = I2 + I3
  row('f6-18', 'a', 'I1 (A)', I1, '3,0 A (sobe no ramo de e1)')
  row('f6-18', 'a', 'I2 (A)', I2, '2,0 A (desce no ramo de e2)')
  row('f6-18', 'a', 'I3 (A)', I3, '1,0 A (de a para b)')
  row('f6-18', 'a', 'controlo: malha esquerda (V)', 10 - 2 * I1 - 4 * I3, '0')
  row('f6-18', 'b', 'Va - Vb = R3 I3 (V)', 4 * I3, '4,0 V')
  row('f6-18', 'c', 'P fontes = 10 I1 + 4 I2 (W)', 10 * I1 + 4 * I2, '38 W')
  row('f6-18', 'c', 'P resistências (W)', 2 * I1 ** 2 + 4 * I2 ** 2 + 4 * I3 ** 2, '38 W')
}
{
  const C23 = 3 + 5
  const Ceq = (2 * C23) / (2 + C23)
  const Q = Ceq * 12
  row('f6-19', 'a', 'Ceq (uF)', Ceq, '1,6 uF')
  row('f6-19', 'a', 'Q (uC)', Q, '19,2 uC')
  row('f6-19', 'b', 'V1 (V)', Q / 2, '9,6 V')
  row('f6-19', 'b', 'V2 = V3 (V)', Q / C23, '2,4 V')
  row('f6-19', 'b', 'Q2 (uC)', (3 * Q) / C23, '7,2 uC')
  row('f6-19', 'b', 'Q3 (uC)', (5 * Q) / C23, '12 uC')
  row('f6-19', 'b', 'U = Ceq V2/2 (J)', 0.5 * Ceq * 1e-6 * 144, '1,15e-4 J')
}
{
  const tau = 47e3 * 10e-6
  row('f6-20', 'a', 'tau = R C (s)', tau, '0,47 s')
  row('f6-20', 'a', 'I0 = V/R (uA)', (5.0 / 47e3) * 1e6, '106 uA')
  row('f6-20', 'b', 't = -tau ln(1-3/5) (s)', -tau * Math.log(1 - 3 / 5), '0,43 s')
  row('f6-20', 'c', '5 tau (s)', 5 * tau, '2,4 s')
  row('f6-20', 'c', 'Q = C V (uC)', 10e-6 * 5.0 * 1e6, '50 uC')
}
{
  const tau = 100e3 * 1.0
  row('f6-21', 'a', 'tau (h)', tau / 3600, '27,8 h')
  row('f6-21', 'b', 't = tau ln(5/2) (h)', (tau * Math.log(5 / 2)) / 3600, '25,5 h')
  row('f6-21', 'c', 'dU = C(V0^2 - V^2)/2 (J)', 0.5 * 1.0 * (25 - 4), '10,5 J')
}
{
  const I = 12 / (4 + 6)
  const Vc = 6 * I
  const C = 50e-6
  row('f6-22', 'a', 'I1 = I2 (A)', I, '1,2 A; 0 em R3')
  row('f6-22', 'b', 'Vc = R2 I (V)', Vc, '7,2 V')
  row('f6-22', 'b', 'Q = C Vc (uC)', C * Vc * 1e6, '360 uC')
  row('f6-22', 'b', 'U = C Vc2/2 (J)', 0.5 * C * Vc * Vc, '1,3e-3 J')
  row('f6-22', 'c', 'tau = (R2+R3) C (ms)', (6 + 2) * C * 1e3, '0,40 ms')
  row('f6-22', 'c', 'I0 = Vc/(R2+R3) (A)', Vc / 8, '0,90 A, de a para b')
}

// ── III – Força eletromagnética e indução ─────────
{
  const v = [2.0e5, 3.0e5, 0]
  const B = [0, 0, 0.4]
  const F = [e * (v[1] * B[2] - v[2] * B[1]), e * (v[2] * B[0] - v[0] * B[2]), e * (v[0] * B[1] - v[1] * B[0])]
  row('f6-23', '', 'Fx (N)', F[0], '1,92e-14')
  row('f6-23', '', 'Fy (N)', F[1], '-1,28e-14')
  row('f6-23', '', '|F| (N)', Math.hypot(...F), '2,3e-14 N')
}
{
  const T = (2 * Math.PI * me) / (e * 2.0e-3)
  row('f6-24', 'a', 'r = me v/(e B) (cm)', ((me * 4.0e6) / (e * 2.0e-3)) * 100, '1,1 cm')
  row('f6-24', 'b', 'T (s)', T, '1,8e-8 s')
  row('f6-24', 'b', 'f (Hz)', 1 / T, '5,6e7 Hz')
}
{
  const v = 3.0e4 / 0.15
  row('f6-25', 'a', 'v = E/B (m/s)', v, '2,0e5 m/s')
  row('f6-25', 'b', 'Fy de um protão 10% mais rápido (N)', e * (3.0e4 - 1.1 * v * 0.15), '< 0: desvia segundo -ey')
  row('f6-25', 'c', 'r = mp v/(e B) (cm)', ((mp * v) / (e * 0.15)) * 100, '1,4 cm')
}
{
  const v = (e * 1.2 * 0.4) / mp
  const Ec = 0.5 * mp * v * v
  row('f6-26', 'a', 'f = e B/(2 pi mp) (MHz)', (e * 1.2) / (2 * Math.PI * mp) / 1e6, '18 MHz')
  row('f6-26', 'b', 'v = e B R/mp (m/s)', v, '4,6e7 m/s')
  row('f6-26', 'b', 'Ec (J)', Ec, '1,8e-12 J')
  row('f6-26', 'b', 'Ec (MeV)', Ec / e / 1e6, '11 MeV')
}
{
  const radius = (m) => Math.sqrt((2 * m * 1.0e3) / e) / 0.25
  const r12 = radius(12 * u)
  const r13 = radius(13 * u)
  row('f6-27', 'a', 'v de 12C (m/s)', Math.sqrt((2 * e * 1.0e3) / (12 * u)), '-')
  row('f6-27', 'a', 'r12 (cm)', r12 * 100, '6,31 cm')
  row('f6-27', 'a', 'r13 (cm)', r13 * 100, '6,57 cm')
  row('f6-27', 'b', '2(r13 - r12) (mm)', 2 * (r13 - r12) * 1e3, '5,2 mm')
}
{
  row('f6-28', 'a', 'Fz = I L B sin30 (N)', 8.0 * 0.5 * 0.3 * sind(30), '0,60 ez N')
  row('f6-28', 'b', 'Fmax = I L B (N)', 8.0 * 0.5 * 0.3, '1,2 N')
}
{
  const B1 = (mu0 * 15) / (2 * Math.PI * 0.05)
  row('f6-29', 'a', 'B1 = mu0 I1/(2 pi d) (T)', B1, '6,0e-5 T')
  row('f6-29', 'b', 'F/L = I2 B1 (N/m)', 10 * B1, '6,0e-4 N/m, atrativa')
}
{
  const emf = 50 * 0.1 ** 2 * 0.1
  row('f6-30', 'a', 'fem = N A |dB/dt| (V)', emf, '0,050 V')
  row('f6-30', 'a', 'I = fem/R (mA)', (emf / 2.0) * 1e3, '25 mA')
  row('f6-30', 'c', 'Q = I dt (C)', (emf / 2.0) * 4.0, '0,10 C')
}
{
  const emf = 0.5 * 0.25 * 4.0
  const I = emf / 1.5
  const F = I * 0.25 * 0.5
  row('f6-31', 'a', 'fem = B l v (V)', emf, '0,50 V')
  row('f6-31', 'a', 'I = fem/R (A)', I, '0,33 A')
  row('f6-31', 'b', 'F = I l B (N)', F, '4,2e-2 N')
  row('f6-31', 'c', 'F v (W)', F * 4.0, '0,17 W')
  row('f6-31', 'c', 'R I2 (W)', 1.5 * I * I, '0,17 W')
}
{
  row('f6-32', 'a', 'Ns = Np Vs/Vp', (1200 * 9.0) / 230, '47 espiras')
  row('f6-32', 'b', 'P = Vs Is (W)', 9.0 * 1.5, '13,5 W')
  row('f6-32', 'b', 'Ip = P/Vp (mA)', ((9.0 * 1.5) / 230) * 1e3, '59 mA')
}

// ── IV – Ondas eletromagnéticas, ótica e fibra ────
{
  for (const [name, f, official] of [['2,4 GHz', 2.4e9, '12,5 cm; 3,1 cm'], ['5,0 GHz', 5.0e9, '6,0 cm; 1,5 cm'], ['3,6 GHz', 3.6e9, '8,3 cm; 2,1 cm']]) {
    row('f6-33', '', `lambda a ${name} (cm)`, (c / f) * 100, official)
    row('f6-33', '', `antena lambda/4 a ${name} (cm)`, (c / f / 4) * 100, official)
  }
}
{
  row('f6-34', 'a', 'f a 700 nm (Hz)', c / 700e-9, '4,3e14 Hz (vermelho)')
  row('f6-34', 'a', 'f a 400 nm (Hz)', c / 400e-9, '7,5e14 Hz (violeta)')
  row('f6-34', 'b', 'f a 650 nm (Hz)', c / 650e-9, '4,6e14 Hz')
  row('f6-34', 'b', 'lambda no vidro (nm)', 650 / 1.5, '433 nm')
}
{
  const w = 1.26e10
  const kz = 42
  const Em = c * 2.0e-8
  row('f6-35', 'a', 'f = w/2pi (GHz)', w / (2 * Math.PI) / 1e9, '2,0 GHz')
  row('f6-35', 'a', 'lambda = 2pi/k (cm)', ((2 * Math.PI) / kz) * 100, '15 cm')
  row('f6-35', 'a', 'controlo: w/k (m/s)', w / kz, '3,0e8')
  row('f6-35', 'b', 'Em = c Bm (V/m)', Em, '6,0 V/m, segundo ey')
  row('f6-35', 'c', 'I = Em Bm/(2 mu0) (W/m2)', (Em * 2.0e-8) / (2 * mu0), '4,8e-2 W/m2')
}
{
  const I = 0.1 / (4 * Math.PI * 5.0 ** 2)
  const Em = Math.sqrt(2 * mu0 * c * I)
  row('f6-36', 'a', 'I = P/(4 pi r2) (W/m2)', I, '3,2e-4 W/m2')
  row('f6-36', 'b', 'Em (V/m)', Em, '0,49 V/m')
  row('f6-36', 'b', 'Bm = Em/c (T)', Em / c, '1,6e-9 T')
}
{
  const I1 = 80 / 2
  row('f6-37', 'a', 'I1 = I0/2 (W/m2)', I1, '40 W/m2')
  row('f6-37', 'a', 'I2 = I1 cos2(30) (W/m2)', I1 * cosd(30) ** 2, '30 W/m2')
  row('f6-37', 'b', 'I3 = I1 cos2(45) cos2(45) (W/m2)', I1 * cosd(45) ** 2 * cosd(45) ** 2, '10 W/m2')
  row('f6-37', 'c', 'Brewster = atan(1,52) (graus)', deg(Math.atan(1.52)), '56,7 graus')
}
{
  const t2 = asind(sind(60) / 1.52)
  const v = c / 1.52
  row('f6-38', 'a', 'refração (graus)', t2, '34,7 graus')
  row('f6-38', 'b', 'v = c/n (m/s)', v, '1,97e8 m/s')
  row('f6-38', 'b', 't = e/(cos t2 v) (s)', 0.01 / cosd(t2) / v, '6,2e-11 s')
}
{
  row('f6-39', 'a', 'v vidro (m/s)', c / 1.5, '2,0e8 m/s')
  row('f6-39', 'a', 'v água (m/s)', c / 1.33, '2,26e8 m/s')
  row('f6-39', 'b', 'refração a 40 graus (graus)', asind((1.5 * sind(40)) / 1.33), '46,5 graus')
  row('f6-39', 'c', 'ângulo crítico (graus)', asind(1.33 / 1.5), '62,5 graus')
}
{
  const nn = 1.5
  const nb = 1.47
  const NA = Math.sqrt(nn * nn - nb * nb)
  const dt = ((1000 * nn) / c) * (nn / nb - 1)
  row('f6-40', 'a', 'ângulo crítico (graus)', asind(nb / nn), '78,5 graus')
  row('f6-40', 'a', 'AN', NA, '0,30')
  row('f6-40', 'a', 'aceitação no ar (graus)', asind(NA), '17,4 graus')
  row('f6-40', 'b', 'aceitação na água (graus)', asind(NA / 1.33), '13,0 graus')
  row('f6-40', 'c', 'dt (us)', dt * 1e6, '0,10 us')
  row('f6-40', 'c', 'débito ~ 1/dt (Mbit/s)', 1 / dt / 1e6, '10 Mbit/s por km')
}

console.log('id    al| grandeza                              | calculado     | folha')
console.log('-'.repeat(96))
for (const line of rows) console.log(line)
