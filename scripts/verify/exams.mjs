// Verificação numérica dos 14 exercícios de exame (src/data/exams.*.ts).
// Uso: node scripts/verify/exams.mjs
// Calcula cada resposta de forma independente, compara com os valores de referência das
// calculadoras do site e com os `check` escritos nos ficheiros de dados.
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(here, '..', '..', 'src', 'data')

const K = 8.99e9
const MU0 = 4 * Math.PI * 1e-7
const C = 3.0e8
const E = 1.60217653e-19
const MP = 1.673e-27
const MN = 1.675e-27
const G = 9.81
const deg = (value) => value * Math.PI / 180

/** Linhas: [id, alínea, valor calculado, unidade, tem check?] */
const rows = []
const info = []
const add = (id, part, value, unit, checked = true) => rows.push({ id, part, value, unit, checked })
const say = (id, text) => info.push(`${id}: ${text}`)

// ── 1. Quatro cargas no círculo ───────────────────────────────────────────────
{
  const id = 'user-provided-p1-four-charges'
  const [q1, q2, q3, q4] = [6e-6, 5e-6, 5e-6, -6e-6]
  const R = 3
  const chord = R * Math.SQRT2
  const vP = K * (q1 + q2 + q3 + q4) / R
  const f12 = K * q1 * q2 / chord ** 2
  const f13 = K * q1 * q3 / chord ** 2
  const f14 = K * q1 * Math.abs(q4) / (2 * R) ** 2
  const radial = Math.hypot(f12, f13) - f14 // para fora, ao longo do diâmetro Q4→Q1
  // componentes no referencial do simulador (Q1 em cima à esquerda)
  const fx = -f12 + f14 / Math.SQRT2
  const fy = f13 - f14 / Math.SQRT2
  const vPothers = K * (q2 + q3 + q4) / R
  const v1others = K * (q2 / chord + q3 / chord + q4 / (2 * R))
  const wExt = q1 * (vPothers - v1others)
  say(id, `corda=${chord.toFixed(4)} m F12=${f12.toExponential(4)} F14=${f14.toExponential(4)} Fx=${fx.toExponential(4)} Fy=${fy.toExponential(4)} |F|=${Math.hypot(fx, fy).toExponential(4)} V'P=${vPothers.toFixed(1)} V'1=${v1others.toFixed(1)}`)
  add(id, 'a', vP / 1000, 'kV')
  add(id, 'b', radial, 'N')
  add(id, 'c', wExt, 'J')
}

// ── 2. Condensadores em série a descarregar ───────────────────────────────────
{
  const id = 'user-provided-p2-capacitor-network'
  const ceq = 20e-6 * 90e-6 / (20e-6 + 90e-6)
  const q0 = ceq * 20
  const rp = 10 * 15 / 25
  const req = rp + 5
  const i0 = 20 / req
  const i15 = i0 * rp / 15
  const tau = req * ceq
  const qt = q0 * Math.exp(-18e-6 / tau)
  say(id, `Ceq=${(ceq * 1e6).toFixed(3)} uF Rp=${rp} Req=${req} I0=${i0.toFixed(4)} A Vp=${(i0 * rp).toFixed(3)} V tau=${(tau * 1e6).toFixed(2)} us exp=${Math.exp(-18e-6 / tau).toFixed(5)}`)
  add(id, 'a', q0 * 1e6, 'μC')
  add(id, 'b', i15, 'A')
  add(id, 'c', qt * 1e6, 'μC')
}

// ── 3. Partícula no solenoide ─────────────────────────────────────────────────
{
  const id = 'user-provided-p3-solenoid-particle'
  const B = MU0 * 840 * 22 / 0.60
  const q = 2.5 * E
  const m = 2 * MP
  const v = 6450
  const fm = q * v * B
  const w = m * G
  const theta = deg(25)
  const fx = -fm * Math.cos(theta)
  const fy = fm * Math.sin(theta) - w
  const fr = Math.hypot(fx, fy)
  const a = fr / m
  const fn = fm - w * Math.sin(theta)
  const radius = m * v ** 2 / fn
  say(id, `B=${(B * 1e3).toFixed(4)} mT |q|=${q.toExponential(5)} m=${m.toExponential(4)} Fm=${fm.toExponential(5)} P=${w.toExponential(4)} P/Fm=${(w / fm).toExponential(2)} FR=${fr.toExponential(5)}`)
  add(id, 'a', fr, 'N')
  add(id, 'b', a, 'm/s²')
  add(id, 'c', radius * 1e3, 'mm')
}

// ── 4. 2016/17 Normal P2: campo uniforme ──────────────────────────────────────
{
  const id = 'e1617n-p2-full'
  const q = 3.0e-15
  const field = 2.0e3
  const F = q * field
  const W = F * -0.040
  const m = 200e-12 * 1e-3
  const dEpEl = -W
  const dEpG = m * G * -0.030
  say(id, `m=${m.toExponential(2)} kg P=${(m * G).toExponential(3)} N dEp_el=${dEpEl.toExponential(3)} dEp_g=${dEpG.toExponential(4)}`)
  add(id, 'a', F, 'N')
  add(id, 'b', W, 'J')
  add(id, 'c', dEpEl + dEpG, 'J')
}

// ── 5. 2026 Normal P1: duas cargas (k = 9e9) ──────────────────────────────────
{
  const id = 'e2026n-p1-full'
  const k = 9e9
  const q1 = -2.5e-6 // em D (0, 3)
  const q2 = 5e-6 // em A (-4, 0)
  const ex = k * q2 / 4 ** 2 // +x (afasta-se de Q2)
  const ey = k * Math.abs(q1) / 3 ** 2 // +y (aponta para Q1)
  const e = Math.hypot(ex, ey)
  const angle = Math.atan2(ey, ex) * 180 / Math.PI
  const vB = k * (q1 / 5 + q2 / 8)
  const vC = k * (q1 / 3 + q2 / 4)
  const w = 0.5e-6 * (vB - vC)
  say(id, `Ex=${ex.toFixed(1)} Ey=${ey.toFixed(1)} ângulo=${angle.toFixed(2)}° VC=${vC.toFixed(1)} V`)
  add(id, 'a', e, 'N/C')
  add(id, 'b', vB, 'V')
  add(id, 'c', w * 1e3, 'mJ')
}

// ── 6. 2026 Normal P2: circuito da figura (sem topologia → sem valores) ───────
{
  const id = 'e2026n-p2-full'
  say(id, 'depende da figura: sem check. 5·C = 12,5 μF → t = 12,5 ms por cada kΩ de R_carga')
  add(id, 'a', NaN, '—', false)
  add(id, 'b', NaN, '—', false)
  add(id, 'c', NaN, '—', false)
}

// ── 7. 2026 Normal P3: protão junto a um fio ──────────────────────────────────
{
  const id = 'e2026n-p3-full'
  const B = MU0 * 6.0 / (2 * Math.PI * 5.0e-3)
  const F = E * 1.75e3 * B
  const field = 1.75e3 * B
  say(id, `peso do protão=${(MP * G).toExponential(3)} N (desprezável face a ${F.toExponential(3)} N)`)
  add(id, 'a', B * 1e3, 'mT')
  add(id, 'b', F, 'N')
  add(id, 'c', field, 'V/m')
}

// ── 8. 2026 Normal P4: bloco (leituras possíveis dos ângulos; sem check) ──────
{
  const id = 'e2026n-p4-full'
  const X = 0.60
  const readings = [
    ['ambos à normal', 35, 18],
    ['θ1 à normal, θ2 à face', 35, 72],
    ['θ1 à face, θ2 à normal', 55, 18],
    ['ambos à face', 55, 72],
  ]
  for (const [name, a1, a2] of readings) {
    const n = Math.hypot(Math.sin(deg(a1)), Math.sin(deg(a2)))
    const beta = Math.asin(Math.sin(deg(a1)) / n) * 180 / Math.PI
    const t = n * X / (C * Math.sin(deg(beta)))
    const limit = n > 1 ? Math.asin(Math.min(1, Math.sqrt(n * n - 1))) * 180 / Math.PI : NaN
    say(id, `${name}: n=${n.toFixed(4)} β=${beta.toFixed(2)}° t=${(t * 1e9).toFixed(3)} ns α1 limite=${Number.isNaN(limit) ? 'impossível (n<1)' : limit.toFixed(2) + '°'}`)
  }
  add(id, 'a', NaN, '—', false)
  add(id, 'b', NaN, '—', false)
  add(id, 'c', NaN, '—', false)
}

// ── 9. 2026 Normal P5: caixa térmica ──────────────────────────────────────────
{
  const id = 'e2026n-p5-full'
  const area = 2.50 * 5 / 6
  const dT = 308 - 273.15
  const rPlastic = 0.007 / (0.17 * area)
  const rFoam = 0.03 / (0.04 * area)
  const flux = dT / (rPlastic + rFoam)
  const interfaceT = dT - flux * rPlastic
  const hours = 3.0 * 3.34e5 / flux / 3600
  say(id, `A=${area.toFixed(4)} m² ΔT=${dT.toFixed(2)} K Rp=${rPlastic.toFixed(5)} Re=${rFoam.toFixed(5)} Rtot=${(rPlastic + rFoam).toFixed(5)} K/W | com ΔT=35 K: ${(35 / (rPlastic + rFoam)).toFixed(2)} W | t=${(hours * 3600).toFixed(0)} s | interface=${(interfaceT + 273.15).toFixed(2)} K`)
  add(id, 'a', flux, 'W')
  add(id, 'b', interfaceT, '°C')
  add(id, 'c', hours, 'h')
}

// ── 10. 2022/23 Recurso P4: espectrómetro de massa ────────────────────────────
{
  const id = 'e2223r-p4-full'
  const field = 1950 / 0.050
  const v = field / 0.150
  const r1 = 1.87e-26 * v / (E * 0.150)
  const r2 = 2.25e-26 * v / (E * 0.150)
  say(id, `E=${field} V/m r1=${r1.toFixed(5)} m r2=${r2.toFixed(5)} m`)
  add(id, 'a', v, 'm/s')
  add(id, 'b', r1 * 100, 'cm')
  add(id, 'c', 2 * (r2 - r1) * 100, 'cm')
}

// ── 11. 2022/23 Recurso P5: sonda lunar ───────────────────────────────────────
{
  const id = 'e2223r-p5-full'
  const d = C * 1.28
  const S = 150e3 / (4 * Math.PI * d ** 2)
  const eMax = Math.sqrt(2 * MU0 * C * S)
  const final = S / 2 * Math.cos(deg(80)) ** 2
  say(id, `d=${d.toExponential(3)} m área=${(4 * Math.PI * d ** 2).toExponential(4)} m² cos²80=${(Math.cos(deg(80)) ** 2).toFixed(5)} Bmax=${(eMax / C).toExponential(3)} T`)
  add(id, 'a', S, 'W/m²')
  add(id, 'b', eMax, 'V/m')
  add(id, 'c', final, 'W/m²')
}

// ── 12. 2021/22 Normal P3: ciclotrão de trítio ────────────────────────────────
{
  const id = 'e2122n-p3-full'
  const m = MP + 2 * MN
  const B = 0.350e-3
  const r = m * 6500 / (E * B)
  const T = 2 * Math.PI * m / (E * B)
  const field = 2000 / 35
  const a = E * field / m
  say(id, `m=${m.toExponential(4)} kg r=${r.toFixed(5)} m f=${(1 / T).toFixed(1)} Hz E=${field.toFixed(3)} V/m Ec=${(0.5 * m * 6500 ** 2 / E).toFixed(3)} eV paragem em ${(6500 ** 2 / (2 * a) * 100).toFixed(3)} cm`)
  add(id, 'a', 2 * r, 'm')
  add(id, 'b', T * 1e3, 'ms')
  add(id, 'c', a, 'm/s²')
}

// ── 13. 2021/22 Normal P4: micro-ondas ────────────────────────────────────────
{
  const id = 'e2122n-p4-full'
  const kWave = 80 * Math.PI
  const omega = 12 / 5 * Math.PI * 1e10
  const lambda = 2 * Math.PI / kWave
  const f = omega / (2 * Math.PI)
  const bMax = 10e-3
  const eMax = C * bMax
  const intensity = eMax * bMax / (2 * MU0)
  const power = intensity * 4 * Math.PI * 2 ** 2
  const n = Math.sin(deg(70)) / Math.sin(deg(45))
  const v = C / n
  say(id, `f=${f.toExponential(3)} Hz λf=${(lambda * f).toExponential(3)} Em=${eMax.toExponential(2)} V/m I=${intensity.toExponential(4)} W/m² n=${n.toFixed(4)} | leitura literal (20° à normal): n=${(Math.sin(deg(20)) / Math.sin(deg(45))).toFixed(4)} v=${(C * Math.sin(deg(45)) / Math.sin(deg(20))).toExponential(3)} m/s > c`)
  add(id, 'a', lambda * 100, 'cm')
  add(id, 'b', power, 'W')
  add(id, 'c', v, 'm/s')
}

// ── 14. 2021/22 Normal P5: varas em Y ─────────────────────────────────────────
{
  const id = 'e2122n-p5-full'
  const A = 2.00e-4
  const rCu = 0.130 / (401 * A)
  const rBrass = 0.180 / (109 * A)
  const rSteel = 0.24 / (14 * A)
  const T = (100 / rCu) / (1 / rCu + 1 / rBrass + 1 / rSteel)
  const qCu = (100 - T) / rCu
  const qBrass = T / rBrass
  const qSteel = T / rSteel
  say(id, `R: cobre=${rCu.toFixed(4)} latão=${rBrass.toFixed(4)} aço=${rSteel.toFixed(3)} K/W | fluxos: cobre=${qCu.toFixed(3)} latão=${qBrass.toFixed(3)} aço=${qSteel.toFixed(3)} W (soma=${(qBrass + qSteel).toFixed(3)})`)
  add(id, 'a', rCu, 'K/W')
  add(id, 'b', T, '°C')
  add(id, 'c', qCu, 'W')
}

// ── Valores de referência das calculadoras do site ────────────────────────────
const references = [
  ['user-provided-p1-four-charges', 'a', 29.97, 0.001],
  ['user-provided-p1-four-charges', 'b', 1.220e-2, 0.001],
  ['user-provided-p1-four-charges', 'c', -1.278e-3, 0.001],
  ['user-provided-p2-capacitor-network', 'a', 327.27, 0.0005],
  ['user-provided-p2-capacitor-network', 'b', 0.727, 0.001],
  ['user-provided-p2-capacitor-network', 'c', 296.13, 0.0005],
  ['user-provided-p3-solenoid-particle', 'a', 9.999e-17, 0.001],
  ['user-provided-p3-solenoid-particle', 'b', 2.98844132e10, 0.0001],
  ['user-provided-p3-solenoid-particle', 'c', 1.392, 0.001],
]

// ── Lê os `check` escritos nos ficheiros de dados ─────────────────────────────
const written = new Map()
for (const file of ['exams.a.ts', 'exams.b.ts', 'exams.c.ts']) {
  const path = resolve(dataDir, file)
  if (!existsSync(path)) continue
  const text = readFileSync(path, 'utf8')
  const token = /\bid: '([^']+)'|\blabel: '([a-z]?)',\s*\n?\s*question:|check: \{ value: ([-+0-9.e]+), unit: '([^']+)'/g
  let currentId = ''
  let currentLabel = ''
  for (const match of text.matchAll(token)) {
    if (match[1] !== undefined) currentId = match[1]
    else if (match[2] !== undefined) currentLabel = match[2]
    else written.set(`${currentId}|${currentLabel}`, { value: Number(match[3]), unit: match[4] })
  }
}

const close = (a, b, tolerance) => Math.abs(a - b) <= tolerance * Math.max(Math.abs(b), 1e-300)
const show = (value) => Number.isNaN(value) ? '—' : (Math.abs(value) >= 1e4 || Math.abs(value) < 1e-2 ? value.toExponential(4) : value.toPrecision(5))
let failures = 0

console.log('id alínea | calculado | ficha | check no ficheiro')
for (const row of rows) {
  const key = `${row.id}|${row.part}`
  const check = written.get(key)
  let status = ''
  if (row.checked) {
    if (!check) status = written.size ? 'FALTA check' : '(ficheiro ainda não escrito)'
    else if (check.unit !== row.unit || !close(check.value, row.value, 0.005)) status = `DIFERENTE: ${check.value} ${check.unit}`
    else status = `ok (${check.value} ${check.unit})`
    if (status.startsWith('FALTA') || status.startsWith('DIFERENTE')) failures += 1
  } else if (check) {
    status = `INESPERADO: ${check.value} ${check.unit}`
    failures += 1
  } else status = 'sem check (depende da figura)'
  console.log(`${row.id} ${row.part} | ${show(row.value)} ${row.unit} | — | ${status}`)
}

console.log('\nValores de referência (calculadoras do site)')
for (const [id, part, expected, tolerance] of references) {
  const row = rows.find((item) => item.id === id && item.part === part)
  const ok = close(row.value, expected, tolerance)
  if (!ok) failures += 1
  console.log(`${id} ${part} | ${show(row.value)} | referência ${show(expected)} | ${ok ? 'ok' : 'DIFERENTE'}`)
}

console.log('\nValores intermédios')
for (const line of info) console.log(line)

if (failures > 0) {
  console.error(`\n${failures} verificação(ões) falharam.`)
  process.exit(1)
}
console.log('\nTudo conferido.')
