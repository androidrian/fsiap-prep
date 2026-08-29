import type { FamilyId } from '../types'

export interface GeneratedExercise {
  id: string
  familyId: FamilyId
  templateId: string
  seed: number
  level: number
  prompt: string
  options: string[]
  correctIndex: number
  correctAnswer: string
  explanation: string
  hints: string[]
  source: string
  estimatedMinutes: number
  parameters: Array<{ label: string; value: string }>
}

type Rng = () => number
type Template = (rng: Rng, seed: number, level: number) => GeneratedExercise

const sources: Record<FamilyId, string> = {
  thermal_transport: 'Padrão de 2022/23 Normal P1, 2025 Normal P5 e 2026 Normal P5.',
  optics: 'Padrão de 2023/24 Normal P4, 2025 Normal P4 e 2026 Normal P4.',
  electrostatics: 'Padrão de 2025 Normal P1, Recurso P1 e 2026 Normal P1.',
  magnetic_particles: 'Padrão dos testes intercalares, 2025 Normal P3 e 2026 Normal P3.',
  rc_circuits: 'Padrão de 2025 Normal P2, Especial P2 e 2026 Normal P2.',
  em_waves: 'Padrão de 2022/23 Recurso P5 e 2025 Normal/Recurso P4.',
  dc_circuits: 'Padrão de 2023/24 Normal P2 e 2025/2026 P2.',
  uniform_fields: 'Padrão de 2016/17 Normal P2, 2022/23 Normal P2 e 2023/24 Normal P1.',
  induction_sources: 'Padrão de 2016/17 P4, 2018/19 P4 e 2022/23 Normal P4.',
  thermal_equilibrium: 'Padrão de 2017/18 P1, 2022/23 Recurso P1 e 2023/24 Normal P5.',
}

export function createRng(seed: number): Rng {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296
  }
}

const pick = <T,>(rng: Rng, values: readonly T[]): T => values[Math.floor(rng() * values.length)]
const integer = (rng: Rng, min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const round = (value: number, digits = 2) => Number(value.toFixed(digits))
const format = (value: number, digits = 2) => value.toLocaleString('pt-PT', { maximumFractionDigits: digits, minimumFractionDigits: digits })
const scientific = (value: number, unit: string) => `${value.toExponential(2).replace('.', ',')} ${unit}`

function shuffledChoice(rng: Rng, answer: string, distractors: string[]) {
  const values = Array.from(new Set([answer, ...distractors])).slice(0, 4)
  while (values.length < 4) values.push(`Nenhuma: ${values.length}`)
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1)); [values[index], values[swap]] = [values[swap], values[index]]
  }
  return { options: values, correctIndex: values.indexOf(answer), correctAnswer: answer }
}

function numericChoice(rng: Rng, answer: number, unit: string, digits = 2, factors = [0.5, 2, 10]) {
  const text = (value: number) => `${format(value, digits)} ${unit}`.trim()
  return shuffledChoice(rng, text(answer), factors.map((factor) => text(answer * factor)))
}

function build(
  familyId: FamilyId, templateId: string, seed: number, level: number, prompt: string,
  choice: ReturnType<typeof shuffledChoice>, explanation: string, hints: string[], parameters: Array<{ label: string; value: string }>,
): GeneratedExercise {
  return { id: `${familyId}-${templateId}-${seed}`, familyId, templateId, seed, level, prompt, ...choice, explanation, hints, source: sources[familyId], estimatedMinutes: Math.min(12, 3 + level * 2), parameters }
}

const thermalTemplates: Template[] = [
  (rng, seed, level) => {
    const k = pick(rng, [0.04, 0.08, 0.2, 0.8]); const area = integer(rng, 2, 8); const thickness = integer(rng, 2, 12) / 100; const delta = integer(rng, 15, 40)
    const answer = round(k * area * delta / thickness, 1); const choice = numericChoice(rng, answer, 'W', 1, [0.1, 0.5, 2])
    return build('thermal_transport', 'conduction', seed, level, `Uma parede homogénea tem k=${format(k, 2)} W/(m·K), área ${area} m², espessura ${format(thickness * 100, 0)} cm e ΔT=${delta} K. Qual é o fluxo de calor estacionário?`, choice, `Converte L para metros e aplica Q̇=kAΔT/L: ${format(k, 2)}×${area}×${delta}/${format(thickness, 2)}=${format(answer, 1)} W.`, ['A espessura tem de estar em metros.', 'Usa Q̇=kAΔT/L.', 'Aumentar a espessura reduz o fluxo.'], [{ label: 'k', value: `${k} W/(m·K)` }, { label: 'A', value: `${area} m²` }, { label: 'L', value: `${thickness} m` }])
  },
  (rng, seed, level) => {
    const k = pick(rng, [0.04, 0.13, 0.5, 0.8]); const area = integer(rng, 1, 6); const thickness = integer(rng, 2, 20) / 100
    const answer = round(thickness / (k * area), 3); const choice = numericChoice(rng, answer, 'K/W', 3, [0.1, 2, 10])
    return build('thermal_transport', 'resistance', seed, level, `Qual é a resistência térmica de uma camada com L=${format(thickness * 100, 0)} cm, k=${format(k, 2)} W/(m·K) e A=${area} m²?`, choice, `Rth=L/(kA)=${format(thickness, 2)}/(${format(k, 2)}×${area})=${format(answer, 3)} K/W.`, ['Converte centímetros para metros.', 'Resistência aumenta com L.', 'Divide L por kA.'], [{ label: 'L', value: `${thickness} m` }, { label: 'k', value: `${k}` }, { label: 'A', value: `${area} m²` }])
  },
  (rng, seed, level) => {
    const r1 = integer(rng, 2, 8) / 10; const r2 = integer(rng, 2, 8) / 10; const delta = integer(rng, 18, 36); const answer = round(delta / (r1 + r2), 2)
    const choice = numericChoice(rng, answer, 'W', 2, [0.5, 2, (r1 + r2)])
    return build('thermal_transport', 'series', seed, level, `Duas camadas em série têm R₁=${format(r1, 1)} K/W e R₂=${format(r2, 1)} K/W. Para ΔT=${delta} K, qual é Q̇?`, choice, `Em série, Req=R₁+R₂=${format(r1 + r2, 1)} K/W e Q̇=ΔT/Req=${format(answer, 2)} W.`, ['As resistências estão em série.', 'Soma R₁ e R₂.', 'Depois usa Q̇=ΔT/Req.'], [{ label: 'R₁', value: `${r1} K/W` }, { label: 'R₂', value: `${r2} K/W` }, { label: 'ΔT', value: `${delta} K` }])
  },
]

const opticsTemplates: Template[] = [
  (rng, seed, level) => {
    const n2 = pick(rng, [1.33, 1.4, 1.5, 1.54]); const angle = integer(rng, 20, 55); const theta2 = round(Math.asin(Math.sin(angle * Math.PI / 180) / n2) * 180 / Math.PI, 1)
    const choice = numericChoice(rng, theta2, '°', 1, [0.5, 1.5, 2])
    return build('optics', 'snell', seed, level, `Um raio passa do ar para um meio com n=${format(n2, 2)}, incidindo a ${angle}° da normal. Qual é o ângulo refratado?`, choice, `Pela lei de Snell, sinθ₂=sin(${angle}°)/${format(n2, 2)}, logo θ₂=${format(theta2, 1)}°.`, ['Os ângulos são medidos à normal.', 'Usa n₁sinθ₁=n₂sinθ₂.', 'No ar, n₁≈1.'], [{ label: 'n₂', value: `${n2}` }, { label: 'θ₁', value: `${angle}°` }])
  },
  (rng, seed, level) => {
    const n = pick(rng, [1.33, 1.4, 1.5, 1.6]); const answer = round(Math.asin(1 / n) * 180 / Math.PI, 1); const choice = numericChoice(rng, answer, '°', 1, [0.5, 1.25, 1.8])
    return build('optics', 'critical', seed, level, `A luz tenta sair de um material com n=${format(n, 2)} para o ar. Qual é o ângulo crítico?`, choice, `No limite, θ₂=90°. Assim, sinθc=n_ar/n=${format(1 / n, 3)} e θc=${format(answer, 1)}°.`, ['Reflexão total só ocorre do meio mais refringente para o menos refringente.', 'No limite, o raio refratado faz 90°.', 'Usa sinθc=n₂/n₁.'], [{ label: 'n₁', value: `${n}` }, { label: 'n₂', value: '1,00' }])
  },
  (rng, seed, level) => {
    const lambdaAir = pick(rng, [532, 560, 633, 660]); const n = pick(rng, [1.33, 1.4, 1.5, 1.54]); const answer = round(lambdaAir / n, 1); const choice = numericChoice(rng, answer, 'nm', 1, [0.67, 1.33, n])
    return build('optics', 'wavelength', seed, level, `Um laser tem λ=${lambdaAir} nm no ar e entra num meio de índice ${format(n, 2)}. Qual passa a ser o comprimento de onda?`, choice, `A frequência mantém-se. λ_meio=λ_ar/n=${lambdaAir}/${format(n, 2)}=${format(answer, 1)} nm.`, ['A frequência não muda na fronteira.', 'A velocidade passa a c/n.', 'Logo λ também é dividida por n.'], [{ label: 'λ ar', value: `${lambdaAir} nm` }, { label: 'n', value: `${n}` }])
  },
]

const electroTemplates: Template[] = [
  (rng, seed, level) => {
    const q1 = integer(rng, 1, 8); const q2 = integer(rng, 1, 8); const r = integer(rng, 2, 8) / 2; const answer = round(8.99e-3 * q1 * q2 / r ** 2, 4)
    const choice = numericChoice(rng, answer, 'N', 4, [0.25, 2, 4])
    return build('electrostatics', 'coulomb', seed, level, `Duas cargas de ${q1} μC e ${q2} μC estão separadas por ${format(r, 1)} m. Qual é o módulo da força elétrica?`, choice, `F=k|q₁q₂|/r²=${format(answer, 4)} N, depois de converter μC para C.`, ['Converte μC para C.', 'A distância aparece ao quadrado.', 'Usa o módulo dos produtos das cargas.'], [{ label: 'q₁', value: `${q1} μC` }, { label: 'q₂', value: `${q2} μC` }, { label: 'r', value: `${r} m` }])
  },
  (rng, seed, level) => {
    const q = pick(rng, [-6, -3, 2, 4, 5]); const r = integer(rng, 1, 6); const answer = round(8.99e3 * q / r, 1); const choice = numericChoice(rng, answer, 'V', 1, [-1, 0.5, 2])
    return build('electrostatics', 'potential', seed, level, `Qual é o potencial criado por uma carga de ${q} μC a ${r} m de distância?`, choice, `V=kq/r. O potencial conserva o sinal da carga: V=${format(answer, 1)} V.`, ['Potencial é escalar.', 'Não retires o sinal de q.', 'Usa V=kq/r.'], [{ label: 'q', value: `${q} μC` }, { label: 'r', value: `${r} m` }])
  },
  (rng, seed, level) => {
    const q = pick(rng, [-4, -2, 2, 5]); const vi = integer(rng, -40, 80); const vf = vi + pick(rng, [-30, -20, 20, 40]); const answer = round(q * (vi - vf), 1); const choice = numericChoice(rng, answer, 'μJ', 1, [-1, 0.5, 2])
    return build('electrostatics', 'work', seed, level, `Uma carga q=${q} μC desloca-se de Vᵢ=${vi} V para V𝒇=${vf} V. Qual é o trabalho da força elétrica?`, choice, `W=q(Vᵢ−V𝒇)=${q}×(${vi}−${vf})=${format(answer, 1)} μJ.`, ['Mantém os sinais.', 'Usa a diferença inicial menos final.', 'μC·V resulta diretamente em μJ.'], [{ label: 'q', value: `${q} μC` }, { label: 'Vᵢ', value: `${vi} V` }, { label: 'V𝒇', value: `${vf} V` }])
  },
]

const magneticTemplates: Template[] = [
  (rng, seed, level) => {
    const mass = integer(rng, 2, 9); const velocity = integer(rng, 2, 8); const charge = pick(rng, [1, 2, 3]); const b = integer(rng, 2, 9); const answer = round(mass * velocity / (charge * b), 2)
    const choice = numericChoice(rng, answer, 'm', 2, [0.5, 2, charge])
    return build('magnetic_particles', 'radius', seed, level, `Em unidades consistentes, uma partícula tem m=${mass}, v=${velocity}, |q|=${charge} e B=${b}. Qual é o raio da trajetória perpendicular?`, choice, `r=mv/(|q|B)=(${mass}×${velocity})/(${charge}×${b})=${format(answer, 2)} m.`, ['A força magnética é centrípeta.', 'Iguala |q|vB a mv²/r.', 'Isola r=mv/(|q|B).'], [{ label: 'm', value: `${mass}` }, { label: 'v', value: `${velocity}` }, { label: '|q|B', value: `${charge}×${b}` }])
  },
  (rng, seed, level) => {
    const q = integer(rng, 1, 6); const v = integer(rng, 2, 9); const b = integer(rng, 2, 8); const angle = pick(rng, [30, 45, 60, 90]); const answer = round(q * v * b * Math.sin(angle * Math.PI / 180), 2)
    const choice = numericChoice(rng, answer, 'N', 2, [0.5, 2, 1 / Math.max(0.1, Math.sin(angle * Math.PI / 180))])
    return build('magnetic_particles', 'lorentz', seed, level, `Uma carga (em unidades consistentes) tem |q|=${q}, v=${v}, B=${b} e faz ${angle}° com B. Qual é |Fᴮ|?`, choice, `|Fᴮ|=|q|vB sinθ=${format(answer, 2)} N.`, ['Só a componente perpendicular contribui.', 'Usa sinθ.', 'Para 90°, sinθ=1.'], [{ label: '|q|', value: `${q}` }, { label: 'v', value: `${v}` }, { label: 'θ', value: `${angle}°` }])
  },
  (rng, seed, level) => {
    const m = integer(rng, 2, 8); const q = pick(rng, [1, 2, 4]); const b = integer(rng, 2, 8); const answer = round(2 * Math.PI * m / (q * b), 2)
    const choice = numericChoice(rng, answer, 's', 2, [0.5, 2, Math.PI])
    return build('magnetic_particles', 'period', seed, level, `Em unidades consistentes, m=${m}, |q|=${q} e B=${b}. Qual é o período ciclotrónico?`, choice, `T=2πm/(|q|B)=${format(answer, 2)} s; a velocidade não entra no período.`, ['O período não depende de v.', 'Usa T=2πm/(|q|B).', 'Não confundas período com tempo de ¼ de volta.'], [{ label: 'm', value: `${m}` }, { label: '|q|', value: `${q}` }, { label: 'B', value: `${b}` }])
  },
]

const rcTemplates: Template[] = [
  (rng, seed, level) => {
    const r = integer(rng, 1, 12); const c = integer(rng, 1, 20); const answer = round(r * c, 1); const choice = numericChoice(rng, answer, 'ms', 1, [0.001, 2, 5])
    return build('rc_circuits', 'tau', seed, level, `Um circuito tem R=${r} kΩ e C=${c} μF. Qual é a constante de tempo?`, choice, `τ=RC. kΩ·μF resulta em ms: τ=${r}×${c}=${format(answer, 1)} ms.`, ['Usa a resistência vista pelo condensador.', 'τ=RC.', 'kΩ·μF=ms.'], [{ label: 'R', value: `${r} kΩ` }, { label: 'C', value: `${c} μF` }])
  },
  (rng, seed, level) => {
    const vf = pick(rng, [5, 10, 12, 20]); const multiple = pick(rng, [0.5, 1, 2, 3]); const answer = round(vf * (1 - Math.exp(-multiple)), 2); const choice = numericChoice(rng, answer, 'V', 2, [0.5, 1.5, vf / Math.max(answer, 0.1)])
    return build('rc_circuits', 'charge-voltage', seed, level, `Um condensador carrega até ${vf} V. Qual é Vc ao fim de ${format(multiple, 1)}τ?`, choice, `Vc=Vf(1−e^(−t/τ))=${vf}(1−e^(−${multiple}))=${format(answer, 2)} V.`, ['É uma carga, não uma descarga.', 'Usa 1−e^(−t/τ).', 'Em 1τ obténs cerca de 63%.'], [{ label: 'Vf', value: `${vf} V` }, { label: 't', value: `${multiple}τ` }])
  },
  (rng, seed, level) => {
    const percent = pick(rng, [50, 65, 80, 90]); const tau = integer(rng, 2, 12); const answer = round(-tau * Math.log(1 - percent / 100), 2); const choice = numericChoice(rng, answer, 'ms', 2, [0.5, 2, 5])
    return build('rc_circuits', 'charge-time', seed, level, `Num circuito com τ=${tau} ms, quanto tempo demora Vc a atingir ${percent}% do valor final?`, choice, `t=−τ ln(1−${format(percent / 100, 2)})=${format(answer, 2)} ms.`, ['Parte de Vc/Vf=1−e^(−t/τ).', 'Isola a exponencial.', 'Aplica o logaritmo natural.'], [{ label: 'τ', value: `${tau} ms` }, { label: 'Vc/Vf', value: `${percent}%` }])
  },
]

const emTemplates: Template[] = [
  (rng, seed, level) => {
    const f = pick(rng, [1.2, 2.4, 3, 5, 10]); const answer = round(300 / f, 1); const choice = numericChoice(rng, answer, 'm', 1, [0.5, 2, 1000])
    return build('em_waves', 'wavelength', seed, level, `Uma onda EM no vazio tem frequência ${format(f, 1)} MHz. Qual é o comprimento de onda?`, choice, `λ=c/f=3×10⁸/(${format(f, 1)}×10⁶)=${format(answer, 1)} m.`, ['Converte MHz para Hz.', 'Usa c=λf.', 'Isola λ=c/f.'], [{ label: 'f', value: `${f} MHz` }, { label: 'c', value: '3×10⁸ m/s' }])
  },
  (rng, seed, level) => {
    const b = integer(rng, 2, 12); const answer = round(0.3 * b, 2); const choice = numericChoice(rng, answer, 'V/m', 2, [0.5, 2, 1000])
    return build('em_waves', 'field-relation', seed, level, `No vazio, uma onda tem B₀=${b} nT. Qual é E₀?`, choice, `E₀=cB₀=3×10⁸×${b}×10⁻⁹=${format(answer, 2)} V/m.`, ['Usa E₀=cB₀.', 'Converte nT para T.', '10⁸×10⁻⁹=10⁻¹.'], [{ label: 'B₀', value: `${b} nT` }])
  },
  (rng, seed, level) => {
    const p = integer(rng, 50, 300) * 1000; const r = integer(rng, 2, 8) * 1e8; const answer = p / (4 * Math.PI * r ** 2); const choice = numericChoice(rng, answer, 'W/m²', 12, [0.25, 2, 4])
    return build('em_waves', 'point-source', seed, level, `Uma fonte isotrópica emite ${p / 1000} kW. Qual é a intensidade a ${(r / 1e8).toFixed(0)}×10⁸ m?`, choice, `I=P/(4πr²)=${answer.toExponential(2)} W/m².`, ['A potência distribui-se numa esfera.', 'A área é 4πr².', 'A intensidade diminui com 1/r².'], [{ label: 'P', value: `${p / 1000} kW` }, { label: 'r', value: `${r.toExponential(1)} m` }])
  },
]

const dcTemplates: Template[] = [
  (rng, seed, level) => {
    const voltage = integer(rng, 5, 24); const resistance = integer(rng, 2, 20); const answer = round(voltage / resistance, 2); const choice = numericChoice(rng, answer, 'mA', 2, [0.5, 2, 1000])
    return build('dc_circuits', 'ohm', seed, level, `Uma resistência de ${resistance} kΩ está ligada a ${voltage} V. Qual é a corrente?`, choice, `I=V/R=${voltage}/${resistance}=${format(answer, 2)} mA, porque V/kΩ=mA.`, ['Aplica a lei de Ohm.', 'V/kΩ resulta em mA.', 'I=V/R.'], [{ label: 'V', value: `${voltage} V` }, { label: 'R', value: `${resistance} kΩ` }])
  },
  (rng, seed, level) => {
    const r1 = integer(rng, 2, 12); const r2 = integer(rng, 2, 12); const answer = round(r1 * r2 / (r1 + r2), 2); const choice = numericChoice(rng, answer, 'Ω', 2, [0.5, 2, (r1 + r2) / Math.max(answer, 0.1)])
    return build('dc_circuits', 'parallel', seed, level, `Duas resistências de ${r1} Ω e ${r2} Ω estão em paralelo. Qual é Req?`, choice, `Req=R₁R₂/(R₁+R₂)=${format(answer, 2)} Ω, menor que a menor resistência.`, ['Em paralelo, a resistência equivalente diminui.', 'Para duas resistências: produto sobre soma.', 'Verifica se o resultado é inferior a ambas.'], [{ label: 'R₁', value: `${r1} Ω` }, { label: 'R₂', value: `${r2} Ω` }])
  },
  (rng, seed, level) => {
    const current = integer(rng, 1, 8); const resistance = integer(rng, 2, 15); const answer = current ** 2 * resistance; const choice = numericChoice(rng, answer, 'mW', 1, [0.5, 2, current])
    return build('dc_circuits', 'power', seed, level, `Numa resistência de ${resistance} kΩ circulam ${current} mA. Qual é a potência dissipada?`, choice, `P=I²R. Com mA e kΩ, o resultado sai em mW: P=${current}²×${resistance}=${answer} mW.`, ['Usa P=I²R.', 'Eleva a corrente ao quadrado.', 'mA²·kΩ=mW.'], [{ label: 'I', value: `${current} mA` }, { label: 'R', value: `${resistance} kΩ` }])
  },
]

const uniformTemplates: Template[] = [
  (rng, seed, level) => {
    const voltage = integer(rng, 20, 200); const distance = integer(rng, 2, 20) / 100; const answer = round(voltage / distance, 0); const choice = numericChoice(rng, answer, 'V/m', 0, [0.01, 0.5, 2])
    return build('uniform_fields', 'plate-field', seed, level, `Duas placas têm |ΔV|=${voltage} V e estão separadas por ${format(distance * 100, 0)} cm. Qual é |E|?`, choice, `E=|ΔV|/d=${voltage}/${format(distance, 2)}=${format(answer, 0)} V/m.`, ['Converte cm para m.', 'O campo entre placas ideais é uniforme.', 'Usa E=|ΔV|/d.'], [{ label: 'ΔV', value: `${voltage} V` }, { label: 'd', value: `${distance} m` }])
  },
  (rng, seed, level) => {
    const q = integer(rng, 1, 8); const e = integer(rng, 2, 9); const answer = q * e; const choice = numericChoice(rng, answer, 'μN', 1, [0.5, 2, 1e6])
    return build('uniform_fields', 'electric-force', seed, level, `Uma carga de ${q} μC está num campo de ${e} N/C. Qual é o módulo da força?`, choice, `F=|q|E=${q}×${e}=${answer} μN.`, ['Usa F=qE.', 'Para o módulo usa |q|.', 'μC·N/C=μN.'], [{ label: 'q', value: `${q} μC` }, { label: 'E', value: `${e} N/C` }])
  },
  (rng, seed, level) => {
    const q = pick(rng, [2, 3, 5]); const field = pick(rng, [1.5, 2, 3]); const dxCm = pick(rng, [-2, -4, -6]); const dyCm = pick(rng, [-2, -3, -5]); const massScale = pick(rng, [100, 200, 300])
    const electricWork = q * 1e-15 * field * 1e3 * dxCm / 100
    const gravityWork = -(massScale * 1e-15) * 9.8 * dyCm / 100
    const answer = -(electricWork + gravityWork)
    const answerText = scientific(answer, 'J')
    const choice = shuffledChoice(rng, answerText, [scientific(-answer, 'J'), scientific(-electricWork, 'J'), scientific(-gravityWork, 'J')])
    return build('uniform_fields', 'work-components', seed, level, `Uma partícula com q=${q}×10⁻¹⁵ C e m=${massScale}×10⁻¹² g desloca-se Δx=${dxCm} cm e Δy=${dyCm} cm num campo E=${format(field, 1)}×10³ V/m dirigido segundo +x. Qual é ΔU total, incluindo a gravidade?`, choice, `Wₑ=qEΔx=${scientific(electricWork, 'J')}; Wg=−mgΔy=${scientific(gravityWork, 'J')}; ΔU=−(Wₑ+Wg)=${answerText}.`, ['Decompõe o deslocamento: o campo elétrico só usa Δx.', 'A força gravítica aponta para −y, logo Wg=−mgΔy.', 'A variação da energia potencial total é o simétrico do trabalho das forças conservativas.'], [{ label: 'q', value: `${q}×10⁻¹⁵ C` }, { label: 'E', value: `${field}×10³ V/m` }, { label: '(Δx,Δy)', value: `(${dxCm}, ${dyCm}) cm` }, { label: 'm', value: `${massScale}×10⁻¹² g` }])
  },
]

const inductionTemplates: Template[] = [
  (rng, seed, level) => {
    const turns = integer(rng, 2, 20); const radius = integer(rng, 2, 8) / 100; const rate = integer(rng, 1, 9); const answer = round(turns * Math.PI * radius ** 2 * rate, 3); const choice = numericChoice(rng, answer, 'V', 3, [0.5, 2, turns])
    return build('induction_sources', 'faraday', seed, level, `Uma bobina de ${turns} espiras e raio ${format(radius * 100, 0)} cm sofre dB/dt=${rate} T/s perpendicularmente. Qual é |ℰ|?`, choice, `|ℰ|=NA|dB/dt|=${turns}×π×${format(radius, 2)}²×${rate}=${format(answer, 3)} V.`, ['A área é πr².', 'O campo é perpendicular, logo cosθ=1.', 'Multiplica por N.'], [{ label: 'N', value: `${turns}` }, { label: 'r', value: `${radius} m` }, { label: 'dB/dt', value: `${rate} T/s` }])
  },
  (rng, seed, level) => {
    const turns = integer(rng, 200, 1200); const current = integer(rng, 1, 15); const length = integer(rng, 20, 100) / 100; const answer = 4 * Math.PI * 1e-7 * turns * current / length * 1000; const choice = numericChoice(rng, answer, 'mT', 3, [0.5, 2, 1000])
    return build('induction_sources', 'solenoid', seed, level, `Um solenóide tem N=${turns}, I=${current} A e comprimento ${format(length, 2)} m. Qual é B no centro?`, choice, `B=μ₀NI/l=${format(answer, 3)} mT.`, ['Usa o número de espiras por comprimento.', 'B=μ₀NI/l.', 'Converte T para mT no fim.'], [{ label: 'N', value: `${turns}` }, { label: 'I', value: `${current} A` }, { label: 'l', value: `${length} m` }])
  },
  (rng, seed, level) => {
    const vp = pick(rng, [120, 230]); const np = integer(rng, 500, 1500); const ns = integer(rng, 50, 400); const answer = round(vp * ns / np, 1); const choice = numericChoice(rng, answer, 'V', 1, [0.5, 2, np / ns])
    return build('induction_sources', 'transformer', seed, level, `Num transformador ideal, Vp=${vp} V, Np=${np} e Ns=${ns}. Qual é Vs?`, choice, `Vs/Vp=Ns/Np, logo Vs=${vp}×${ns}/${np}=${format(answer, 1)} V.`, ['Num transformador ideal, V/N é igual nos enrolamentos.', 'Usa Vs=Vp·Ns/Np.', 'Menos espiras no secundário reduz a tensão.'], [{ label: 'Vp', value: `${vp} V` }, { label: 'Np', value: `${np}` }, { label: 'Ns', value: `${ns}` }])
  },
]

const calorimetryTemplates: Template[] = [
  (rng, seed, level) => {
    const mass = integer(rng, 1, 8) / 10; const delta = integer(rng, 10, 60); const answer = round(mass * 4190 * delta / 1000, 1); const choice = numericChoice(rng, answer, 'kJ', 1, [0.5, 2, 1000])
    return build('thermal_equilibrium', 'sensible-heat', seed, level, `Quanta energia é necessária para aquecer ${format(mass, 1)} kg de água em ${delta} °C?`, choice, `Q=mcΔT=${format(mass, 1)}×4190×${delta}=${format(answer, 1)} kJ.`, ['Usa Q=mcΔT.', 'Para água, c=4190 J/(kg·K).', 'Converte J para kJ no fim.'], [{ label: 'm', value: `${mass} kg` }, { label: 'ΔT', value: `${delta} °C` }])
  },
  (rng, seed, level) => {
    const m1 = integer(rng, 1, 5); const m2 = integer(rng, 1, 5); const t1 = integer(rng, 50, 90); const t2 = integer(rng, 5, 25); const answer = round((m1 * t1 + m2 * t2) / (m1 + m2), 1); const choice = numericChoice(rng, answer, '°C', 1, [0.5, 1.25, 1.75])
    return build('thermal_equilibrium', 'mixing', seed, level, `Misturam-se ${m1} kg de água a ${t1}°C com ${m2} kg a ${t2}°C, sem perdas. Qual é Tf?`, choice, `Como o material é o mesmo, Tf=(m₁T₁+m₂T₂)/(m₁+m₂)=${format(answer, 1)}°C.`, ['O calor cedido é igual ao recebido.', 'O c da água cancela.', 'Tf deve ficar entre as duas temperaturas iniciais.'], [{ label: 'água quente', value: `${m1} kg a ${t1}°C` }, { label: 'água fria', value: `${m2} kg a ${t2}°C` }])
  },
  (rng, seed, level) => {
    const mass = integer(rng, 1, 12) / 10; const latent = 334; const answer = round(mass * latent, 1); const choice = numericChoice(rng, answer, 'kJ', 1, [0.5, 2, 1000])
    return build('thermal_equilibrium', 'latent', seed, level, `Que energia é necessária para fundir ${format(mass, 1)} kg de gelo já a 0°C?`, choice, `Na mudança de fase, Q=mLf=${format(mass, 1)}×334=${format(answer, 1)} kJ.`, ['A temperatura não varia durante a fusão.', 'Usa calor latente, não mcΔT.', 'Lf do gelo é 334 kJ/kg.'], [{ label: 'm', value: `${mass} kg` }, { label: 'Lf', value: '334 kJ/kg' }])
  },
]

const templates: Record<FamilyId, Template[]> = {
  thermal_transport: thermalTemplates,
  optics: opticsTemplates,
  electrostatics: electroTemplates,
  magnetic_particles: magneticTemplates,
  rc_circuits: rcTemplates,
  em_waves: emTemplates,
  dc_circuits: dcTemplates,
  uniform_fields: uniformTemplates,
  induction_sources: inductionTemplates,
  thermal_equilibrium: calorimetryTemplates,
}

export const exerciseTemplateCount = Object.values(templates).reduce((sum, familyTemplates) => sum + familyTemplates.length, 0)

export function generateExercise(familyId: FamilyId, seed = Date.now(), level = 2): GeneratedExercise {
  const rng = createRng(seed)
  const available = templates[familyId]
  const template = available[Math.floor(rng() * available.length)]
  return template(rng, seed, Math.max(1, Math.min(6, level)))
}

export function generateMixedSet(count: number, seed = Date.now(), familyPool?: FamilyId[]): GeneratedExercise[] {
  const rng = createRng(seed)
  const pool = familyPool ?? (Object.keys(templates) as FamilyId[])
  const recent: FamilyId[] = []
  return Array.from({ length: count }, (_, index) => {
    const candidates = pool.filter((familyId) => !recent.slice(-2).includes(familyId))
    const familyId = pick(rng, candidates.length ? candidates : pool)
    recent.push(familyId)
    return generateExercise(familyId, seed + index * 7919, integer(rng, 2, 5))
  })
}
