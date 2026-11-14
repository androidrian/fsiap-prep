// Verificação numérica da Ficha 1 — Cargas, forças, campos e potencial elétrico.
// Correr com: node scripts/verify/folha1.mjs
// Imprime: id alínea | calculado | ficha

const k = 8.99e9
const eps0 = 8.85e-12
const e = 1.60217653e-19
const me = 9.109e-31
const g = 9.81
const G = 6.67e-11

const rows = []
function row(id, part, value, unit, official) {
  rows.push(`${id} ${part} | ${Number(value).toPrecision(5)} ${unit} | ${official}`)
}
const deg = (rad) => (rad * 180) / Math.PI
const hyp = Math.hypot

/** Campo (Ex, Ey) e potencial V criados por cargas [{x, y, q}] no ponto (px, py), tudo em SI. */
function fieldAt(charges, px, py) {
  let ex = 0
  let ey = 0
  let v = 0
  for (const c of charges) {
    const dx = px - c.x
    const dy = py - c.y
    const d = hyp(dx, dy)
    ex += (k * c.q * dx) / d ** 3
    ey += (k * c.q * dy) / d ** 3
    v += (k * c.q) / d
  }
  return { ex, ey, v, mod: hyp(ex, ey), angle: deg(Math.atan2(ey, ex)) }
}

// ── 1 ── dois protões a 4,0 fm
{
  const qp = 1.6e-19
  const mp = 1.67e-27
  const r = 4.0e-15
  const fe = (k * qp * qp) / r ** 2
  const fg = (G * mp * mp) / r ** 2
  row('f1-01', 'a', fe, 'N', '14 N')
  row('f1-01', 'b', fg, 'N', '1,2e-35 N')
  row('f1-01', 'c (Fe/Fg)', fe / fg, '', '—')
}

// ── 2 ── triângulo equilátero, força em q1 (q1 na origem, q3 em (1,0), q2 no vértice de cima)
{
  const q1 = -2e-6
  const others = [{ x: 1, y: 0, q: 1e-6 }, { x: 0.5, y: Math.sqrt(3) / 2, q: 1e-6 }]
  const f = fieldAt(others, 0, 0)
  row('f1-02', 'Fx', q1 * f.ex, 'N', '27e-3 N')
  row('f1-02', 'Fy', q1 * f.ey, 'N', '16e-3 N')
  row('f1-02', '|F|', Math.abs(q1) * f.mod, 'N', '—')
  row('f1-02', 'ângulo', deg(Math.atan2(q1 * f.ey, q1 * f.ex)), '°', '—')
}

// ── 3 e 4 ── simbólicos: confirma as expressões com um caso numérico
{
  // 3: escolhe theta, calcula q que equilibra e confirma sen²θ·tanθ = Kq²/(4 l² m g)
  const l = 0.5
  const m = 0.01
  const theta = 0.05
  const r = 2 * l * Math.sin(theta)
  const q = Math.sqrt((m * g * Math.tan(theta) * r * r) / k)
  const lhs = Math.sin(theta) ** 2 * Math.tan(theta)
  const rhs = (k * q * q) / (4 * l * l * m * g)
  row('f1-03', 'a (lhs/rhs)', lhs / rhs, '', '1 (identidade)')
  const xSmall = Math.cbrt((l * q * q) / (2 * Math.PI * eps0 * m * g))
  row('f1-03', 'b (x aprox / r exato)', xSmall / r, '', '≈1 para ângulos pequenos')
  // 4: escolhe geometria, calcula q pela expressão e confirma o equilíbrio Fe = m g tanθ
  const d = 0.3
  const rr = 0.2
  const half = (d - rr) / 2
  const q4 = Math.sqrt((4 * Math.PI * eps0 * m * g * rr * rr * half) / Math.sqrt(l * l - half * half))
  const fe = q4 * q4 / (4 * Math.PI * eps0 * rr * rr)
  const tan = half / Math.sqrt(l * l - half * half)
  row('f1-04', 'Fe/(m g tanθ)', fe / (m * g * tan), '', '1 (identidade)')
}

// ── 5 ── quadrado 5,0 mm: +q (0,L), +2q (0,0), +q (L,0); A = (L,L); P = centro
{
  const q = 1.6e-19
  const L = 5.0e-3
  const charges = [{ x: 0, y: L, q }, { x: 0, y: 0, q: 2 * q }, { x: L, y: 0, q }]
  const p = fieldAt(charges, L / 2, L / 2)
  const a = fieldAt(charges, L, L)
  const q0 = -100 * q
  row('f1-05', 'a |E|', p.mod, 'N/C', '2,3e-4 N/C')
  row('f1-05', 'a Ex', p.ex, 'N/C', '1,6e-4')
  row('f1-05', 'a Ey', p.ey, 'N/C', '1,6e-4')
  row('f1-05', 'b V_P', p.v, 'V', '1,62e-6 V')
  row('f1-05', 'c |F|', Math.abs(q0) * p.mod, 'N', '3,68e-21 N')
  row('f1-05', 'c Fx', q0 * p.ex, 'N', '-2,6e-21')
  row('f1-05', 'd V_A', a.v, 'V', '—')
  row('f1-05', 'd W', q0 * (p.v - a.v), 'J', '-1,04e-23 J')
}

// ── 6 ── gota de tinta
{
  const m = 1.3e-10
  const q = 1.5e-13
  const vx = 18
  const L = 1.6e-2
  const E = 1.4e6
  const a = (q * E) / m
  const t = L / vx
  row('f1-06', 'a_y', a, 'm/s²', '—')
  row('f1-06', 't', t, 's', '—')
  row('f1-06', 'y', 0.5 * a * t * t, 'm', '6,4e-4 m')
}

// ── 7 ── condensador plano
{
  const dV = 300
  const d = 50e-3
  const q = 2.0e-7
  const E = dV / d
  row('f1-07', 'b E', E, 'V/m', '—')
  row('f1-07', 'b F', q * E, 'N', '1,2e-3 N')
  row('f1-07', 'c W', q * dV, 'J', '6,0e-5 J')
}

// ── 8 ── q1 = 2 μC na origem, q2 = −3 μC em (0,5; 0); A = (0,18; 0,24); B = (0,75; 0)
{
  const charges = [{ x: 0, y: 0, q: 2.0e-6 }, { x: 0.5, y: 0, q: -3.0e-6 }]
  const ax = (0.3 ** 2 - 0.4 ** 2 + 0.5 ** 2) / (2 * 0.5)
  const ay = Math.sqrt(0.3 ** 2 - ax ** 2)
  const a = fieldAt(charges, ax, ay)
  row('f1-08', 'a A=(x,y) x', ax, 'm', '—')
  row('f1-08', 'a A=(x,y) y', ay, 'm', '—')
  row('f1-08', 'a E1', (k * 2.0e-6) / 0.09, 'N/C', '—')
  row('f1-08', 'a E2', (k * 3.0e-6) / 0.16, 'N/C', '—')
  row('f1-08', 'a |E|', a.mod, 'N/C', '2,60e5 N/C')
  row('f1-08', 'a ângulo', a.angle, '°', '13,3°')
  // b: 2/a = 3/(a+0,5)
  const dist = (2 * 0.5) / (3 - 2)
  row('f1-08', 'b x', -dist * 100, 'cm', '-100 cm')
  row('f1-08', 'b V(x)', fieldAt(charges, -dist, 0).v, 'V', '0')
  const b = fieldAt(charges, 0.75, 0)
  row('f1-08', 'c Ex', b.ex, 'N/C', '400e3 N/C (módulo)')
}

// ── 9 ── faísca no botão do elevador
{
  const E = 3.0e6
  const d = 0.50e-2
  row('f1-09', 'a ΔV', (E * d) / 1e3, 'kV', '15 kV')
  row('f1-09', 'b σ', eps0 * E * 1e6, 'μC/m²', '27 μC/m²')
}

// ── 10 ── protão abandonado (dados do enunciado: g = 10)
{
  const E = 8.0e4
  const q = 1.6e-19
  const m = 1.67e-27
  const fe = q * E
  const w = m * 10
  row('f1-10', 'a Fe', fe, 'N', '—')
  row('f1-10', 'a P', w, 'N', '—')
  row('f1-10', 'a FR', hyp(fe, w), 'N', '1,3e-14 N')
  row('f1-10', 'b ΔV', E * 0.5, 'V', '4,0e4 V')
  row('f1-10', 'c Ec', q * E * 0.5, 'J', '6,4e-15 J')
  row('f1-10', 'c v', Math.sqrt((2 * q * E * 0.5) / m), 'm/s', '—')
}

// ── 11 ── duas placas com σ diferentes
{
  const sp = 6.8e-6
  const sm = 4.3e-6
  const d = 5e-3
  const q = -3.5e-6
  const E = (sp + sm) / (2 * eps0)
  row('f1-11', 'a E+', sp / (2 * eps0), 'N/C', '—')
  row('f1-11', 'a E-', sm / (2 * eps0), 'N/C', '—')
  row('f1-11', 'a E', E, 'N/C', '6,3e5 N/C')
  row('f1-11', 'b ΔV', E * d, 'V', '3,15 kV')
  row('f1-11', 'c W', q * E * d, 'J', '-11e-3 J')
}

// ── 12 ── duas cargas de 5 nC em x = 0 e x = 8 cm
{
  const charges = [{ x: 0, y: 0, q: 5e-9 }, { x: 0.08, y: 0, q: 5e-9 }]
  const q0 = 3e-9
  const p = fieldAt(charges, 0.04, 0)
  const s = fieldAt(charges, -0.06, 0)
  row('f1-12', 'a V_P', p.v, 'V', '22,5e2 V')
  row('f1-12', 'b Fx', q0 * s.ex, 'N', '4,44e-5 N, xx negativo')
  row('f1-12', 'c V(-6 cm)', s.v, 'V', '—')
  row('f1-12', 'c W elétrica', q0 * (s.v - p.v), 'J', '—')
  row('f1-12', 'c W externo', q0 * (p.v - s.v), 'J', '3,5e-6 J')
}

// ── 13 ── quadrado 7,5 mm: +q (0,0), +2q (L,0), +q (L,L); A = centro
{
  const q = 3.2e-19
  const L = 7.5e-3
  const charges = [{ x: 0, y: 0, q }, { x: L, y: 0, q: 2 * q }, { x: L, y: L, q }]
  const a = fieldAt(charges, L / 2, L / 2)
  row('f1-13', 'a V', a.v, 'V', '2,17e-6 V')
  row('f1-13', 'b |E|', a.mod, 'N/C', '2,05e-4 N/C')
  row('f1-13', 'b ângulo', a.angle, '°', '— (135° = para o vértice vazio)')
  row('f1-13', 'c |F|', 150 * q * a.mod, 'N', '9,83e-21 N')
}

// ── 14 ── Q1 = 20 nC (0,0); Q2 = −80 nC (1,0) m
{
  const charges = [{ x: 0, y: 0, q: 20e-9 }, { x: 1, y: 0, q: -80e-9 }]
  const a = fieldAt(charges, 0.4, 0)
  const b = fieldAt(charges, 0.4, 0.5)
  const q3 = -15e-9
  row('f1-14', 'a Ex', a.ex, 'V/m', '3125 ex')
  row('f1-14', 'b Ex', b.ex, 'V/m', '1181')
  row('f1-14', 'b Ey', b.ey, 'V/m', '-412')
  row('f1-14', 'b |E|', b.mod, 'V/m', '—')
  row('f1-14', 'c |F|', Math.abs(q3) * b.mod, 'N', '1,87e-5 N')
  row('f1-14', 'c ângulo c/ xx negativo', deg(Math.atan2(q3 * b.ey, -q3 * b.ex)), '°', '19,8°')
  row('f1-14', 'c ângulo c/ valores da ficha', deg(Math.atan2(412, 1181)), '°', '19,8°')
}

// ── 15 ── condensador com polietileno
{
  const C = 0.5e-6
  const er = 2.3
  const d = 0.2e-3
  const V = 80
  row('f1-15', 'a A', (C * d) / (er * eps0), 'm²', '4,91 m²')
  row('f1-15', 'b E', 0.5 * C * V * V, 'J', '1,6e-3 J')
  row('f1-15', 'c campo', V / d, 'V/m', '—')
  row('f1-15', 'c F', (e * V) / d, 'N', '6,4e-14 N')
  row('f1-15', 'd v', Math.sqrt((2 * e * V) / me), 'm/s', '5,3e6 m/s')
}

// ── 16 ── trabalho de A para B (Δx = −4,0 cm contra o campo, Δy = −3,0 cm)
{
  const q = 3.0e-15
  const E = 2.0e3
  const dx = -0.04
  const dy = -0.03
  const m = 200e-12 * 1e-3
  const w = q * E * dx
  row('f1-16', 'a F', q * E, 'N', '6,0e-12 N')
  row('f1-16', 'b W', w, 'J', '-2,4e-13 J')
  row('f1-16', 'c ΔEp elétrica', -w, 'J', '—')
  row('f1-16', 'c ΔEp gravítica', m * g * dy, 'J', '—')
  row('f1-16', 'c ΔEp total', -w + m * g * dy, 'J', '1,8e-13 J')
}

// ── 17 ── triângulo equilátero de 4 cm: q1 (−2,0), q2 (2,0), q3 (0,h) cm; M = (0,0)
{
  const L = 0.04
  const h = (L * Math.sqrt(3)) / 2
  const charges = [{ x: -L / 2, y: 0, q: 2e-9 }, { x: L / 2, y: 0, q: -2e-9 }, { x: 0, y: h, q: 4e-9 }]
  const q4 = (-2 / 3) * 1e-3
  const m = fieldAt(charges, 0, 0)
  const c = fieldAt(charges, 0, h / 3)
  const half = fieldAt(charges, 0, h / 2)
  row('f1-17', 'a Ex', m.ex, 'N/C', '—')
  row('f1-17', 'a Ey', m.ey, 'N/C', '—')
  row('f1-17', 'a |E|', m.mod, 'N/C', '—')
  row('f1-17', 'b Fx', q4 * m.ex, 'N', '—')
  row('f1-17', 'b Fy', q4 * m.ey, 'N', '—')
  row('f1-17', 'b |F|', Math.abs(q4) * m.mod, 'N', '63,24 N')
  row('f1-17', 'b ângulo', deg(Math.atan2(q4 * m.ey, q4 * m.ex)), '°', '161,6°')
  row('f1-17', 'c V_M', m.v, 'V', '—')
  row('f1-17', 'c V_G (centroide, h/3)', c.v, 'V', '—')
  row('f1-17', 'c W (centroide)', q4 * (m.v - c.v), 'J', '0,69 J')
  row('f1-17', 'c W (ponto a meia altura, h/2)', q4 * (m.v - half.v), 'J', '0,69 J')
}

// ── 18 ── quadrado de 4 cm: +q (0,L), −q (L,L), +q (L,0); vértice vazio na origem
{
  const q = 15e-6
  const L = 0.04
  const charges = [{ x: 0, y: L, q }, { x: L, y: L, q: -q }, { x: L, y: 0, q }]
  const o = fieldAt(charges, 0, 0)
  const q0 = -10e-6
  row('f1-18', 'b kq/L²', (k * q) / (L * L), 'N/C', '—')
  row('f1-18', 'b Ex', o.ex, 'N/C', '-54,41e6')
  row('f1-18', 'b Ey', o.ey, 'N/C', '-54,5e6')
  row('f1-18', 'b |E|', o.mod, 'N/C', '77,0e6 N/C')
  row('f1-18', 'c Fx', q0 * o.ex, 'N', '-544,8 (sinal trocado na ficha)')
  row('f1-18', 'c Fy', q0 * o.ey, 'N', '-544,8 (sinal trocado na ficha)')
  row('f1-18', 'c |F|', Math.abs(q0) * o.mod, 'N', '—')
}

// ── 19 ── carga pendurada junto a um plano vertical
{
  const m = 40e-3
  const q = 75e-9
  const sigma = 22e-9 / 1e-4
  const E = sigma / (2 * eps0)
  row('f1-19', 'b σ', sigma, 'C/m²', '—')
  row('f1-19', 'b E', E, 'V/m', '12,42e6 V/m')
  row('f1-19', 'c qE', q * E, 'N', '—')
  row('f1-19', 'c mg', m * g, 'N', '—')
  row('f1-19', 'c θ', deg(Math.atan((q * E) / (m * g))), '°', '67,17°')
}

console.log('id alínea | calculado | ficha')
for (const line of rows) console.log(line)
