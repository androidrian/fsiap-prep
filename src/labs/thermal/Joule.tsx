import { useEffect, useState } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, compact, fix, positive, widen } from './format'
import { GRAVITY, JOULE_PER_CAL, jouleExperiment } from './physics'

const PULLEY_X = 96
const PULLEY_Y = 34
const WEIGHT_TOP = 58
const SHAFT_X = 310
const VESSEL_LEFT = 242
const VESSEL_RIGHT = 378
const VESSEL_TOP = 112
const VESSEL_BOTTOM = 214
const FALL_MS = 950

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function Joule({ params }: LabProps) {
  const initialMass = positive(numberParam(params, 'M', 6), 6)
  const initialHeight = positive(numberParam(params, 'h', 2), 2)
  const initialDrops = Math.max(Math.round(positive(numberParam(params, 'n', 25), 25)), 1)
  const initialWater = positive(numberParam(params, 'mw', 500), 500)
  const initialDelta = positive(numberParam(params, 'dT', 1.4), 1.4)
  const [mass, setMass] = useState(initialMass)
  const [height, setHeight] = useState(initialHeight)
  const [drops, setDrops] = useState(initialDrops)
  const [water, setWater] = useState(initialWater)
  const [delta, setDelta] = useState(initialDelta)
  const [done, setDone] = useState(0)
  const [falling, setFalling] = useState(false)

  useEffect(() => {
    if (!falling) return undefined
    const timer = window.setTimeout(() => { setFalling(false); setDone((count) => count + 1) }, FALL_MS)
    return () => window.clearTimeout(timer)
  }, [falling])

  const result = jouleExperiment(mass, height, drops, water, delta)
  const completed = Math.min(done, drops)
  const progress = completed / drops
  const perDrop = mass * GRAVITY * height
  const expected = water > 0 ? result.work / JOULE_PER_CAL / water : 0
  const deviation = Number.isFinite(result.ratio) ? (result.ratio / JOULE_PER_CAL - 1) * 100 : Number.NaN

  const fall = clamp(16 + 32 * height, 20, 112)
  const side = clamp(14 + 7 * Math.cbrt(mass), 16, 36)
  const waterHeight = clamp(26 + 0.1 * water, 30, 86)
  const waterTop = VESSEL_BOTTOM - 6 - waterHeight
  const mercury = clamp(6 + 9 * delta * progress, 6, 60)
  const paddleY = VESSEL_BOTTOM - 6 - waterHeight / 2
  const offset = falling ? fall : 0

  const drop = () => {
    if (falling || completed >= drops) return
    if (prefersReducedMotion()) setDone((count) => count + 1)
    else setFalling(true)
  }

  const label = `Experiência de Joule: massa de ${compact(mass)} kg cai ${compact(height)} m, ${drops} vezes, e faz rodar as pás dentro de ${compact(water)} g de água. Quedas feitas: ${completed} de ${drops}; a água aqueceu ${fix(delta * progress, 2)} °C. Trabalho total ${sig(result.work, 4)} J para ${compact(result.heat, 4)} cal.`

  return <>
    <svg className="lab-thermal-stage lab-thermal-joule" viewBox="0 0 480 240" role="img" aria-label={label}>
      <defs><clipPath id="joule-rope-clip"><rect x="0" y={PULLEY_Y} width="200" height="206" /></clipPath></defs>
      <path className="lab-thermal-support" d={`M${PULLEY_X - 34} 14H${PULLEY_X + 34}M${PULLEY_X} 14V${PULLEY_Y}`} />
      <line className="lab-thermal-rope" x1={PULLEY_X} y1={PULLEY_Y - 9} x2={SHAFT_X - 12} y2={PULLEY_Y - 9} />
      <circle className="lab-thermal-pulley" cx={PULLEY_X} cy={PULLEY_Y} r="9" />
      <g clipPath="url(#joule-rope-clip)">
        <g className={`lab-thermal-weight${falling ? ' falling' : ''}`} data-offset={offset.toFixed(1)} style={{ transform: `translateY(${offset.toFixed(1)}px)` }}>
          <line className="lab-thermal-rope" x1={PULLEY_X - 9} y1={WEIGHT_TOP - 220} x2={PULLEY_X - 9} y2={WEIGHT_TOP} />
          <rect className="lab-thermal-mass" x={(PULLEY_X - 9 - side / 2).toFixed(1)} y={WEIGHT_TOP} width={side.toFixed(1)} height={side.toFixed(1)} rx="2" />
        </g>
      </g>
      <text className="lab-thermal-name" x={PULLEY_X + 22} y={WEIGHT_TOP + 14}>M = {compact(mass)} kg</text>
      <path className="lab-thermal-dimension" d={`M30 ${WEIGHT_TOP}V${(WEIGHT_TOP + fall).toFixed(1)}M24 ${WEIGHT_TOP}h12M24 ${(WEIGHT_TOP + fall).toFixed(1)}h12`} />
      <text className="lab-thermal-value" x="14" y={(WEIGHT_TOP + fall + 16).toFixed(1)}>h = {compact(height)} m</text>

      <rect className="lab-thermal-spool" x={SHAFT_X - 12} y={PULLEY_Y - 18} width="24" height="28" rx="3" />
      <line className="lab-thermal-shaft" x1={SHAFT_X} y1={PULLEY_Y + 10} x2={SHAFT_X} y2={paddleY + 16} />
      <rect className="lab-thermal-water" x={VESSEL_LEFT + 6} y={waterTop.toFixed(1)} width={VESSEL_RIGHT - VESSEL_LEFT - 12} height={waterHeight.toFixed(1)} />
      <path className="lab-thermal-vessel" d={`M${VESSEL_LEFT} ${VESSEL_TOP}V${VESSEL_BOTTOM}H${VESSEL_RIGHT}V${VESSEL_TOP}`} />
      <g className={`lab-thermal-paddle${falling ? ' spinning' : ''}`} style={{ transformOrigin: `${SHAFT_X}px ${paddleY.toFixed(1)}px` }}>
        <rect x={SHAFT_X - 30} y={(paddleY - 14).toFixed(1)} width="26" height="28" rx="2" />
        <rect x={SHAFT_X + 4} y={(paddleY - 14).toFixed(1)} width="26" height="28" rx="2" />
      </g>
      <rect className="lab-thermal-tube" x={VESSEL_RIGHT - 24} y={VESSEL_TOP - 26} width="8" height={VESSEL_BOTTOM - VESSEL_TOP + 12} rx="4" />
      <rect className="lab-thermal-mercury" x={VESSEL_RIGHT - 22} y={(VESSEL_BOTTOM - 16 - mercury).toFixed(1)} width="4" height={mercury.toFixed(1)} rx="2" />
      <text className="lab-thermal-value" x={VESSEL_RIGHT + 8} y={VESSEL_TOP - 14}>ΔT = +{fix(delta * progress, 2)} °C</text>
      <text x={VESSEL_RIGHT + 8} y={VESSEL_TOP + 2}>de {compact(delta)} °C</text>
      <text x={(VESSEL_LEFT + VESSEL_RIGHT) / 2} y={VESSEL_BOTTOM + 16} textAnchor="middle">água · {compact(water)} g</text>
      <text className="lab-thermal-value" x="14" y="234">queda {completed} de {drops} · W = {sig(perDrop * completed, 4)} J</text>
    </svg>
    <ResultStrip label="Equivalente mecânico obtido" value={`${sig(result.ratio)} J/cal`} formula="\dfrac{W}{Q}=\dfrac{n\,Mgh}{m_{\text{água}}\,c\,\Delta T}" secondary={`valor aceite 4,186 J/cal · desvio ${Number.isFinite(deviation) ? `${deviation > 0 ? '+' : ''}${fix(deviation, 1)} %` : '—'}`} />
    <Metrics items={[
      { label: 'Trabalho mecânico', value: `${sig(result.work, 4)} J` },
      { label: 'Calor na água', value: `${compact(result.heat, 4)} cal` },
      { label: 'Trabalho por queda', value: `${sig(perDrop)} J` },
      { label: 'ΔT previsto com 4,186', value: `${fix(expected, 2)} °C` },
    ]} />
    <div className="source-kind lab-thermal-actions"><span>Quedas · {completed} de {drops}</span><div>
      <button type="button" onClick={drop} disabled={falling || completed >= drops}>Largar</button>
      <button type="button" onClick={() => { setFalling(false); setDone(drops) }} disabled={completed >= drops}>Todas as quedas</button>
      <button type="button" onClick={() => { setFalling(false); setDone(0) }} disabled={completed === 0 && !falling}>Repor</button>
    </div></div>
    <Control label="Massa que cai M" value={mass} {...widen(initialMass, 0.5, 20, 0.1)} onChange={setMass} unit="kg" />
    <Control label="Altura da queda h" value={height} {...widen(initialHeight, 0.2, 3, 0.1)} onChange={setHeight} unit="m" />
    <Control label="Número de quedas n" value={drops} {...widen(initialDrops, 1, 60, 1)} onChange={(value) => setDrops(Math.max(Math.round(value), 1))} unit="" />
    <Control label="Massa de água" value={water} {...widen(initialWater, 50, 2000, 10)} onChange={setWater} unit="g" />
    <Control label="Aquecimento medido ΔT" value={delta} {...widen(initialDelta, 0.1, 10, 0.1)} onChange={setDelta} unit="°C" />
    <LabNote title="Leitura da experiência.">A energia potencial perdida pela massa (M·g·h por queda, com g = 9,81 m/s²) é dissipada pelas pás e aparece como aumento da energia interna da água. Dividindo o trabalho em joules pelo calor em calorias (c = 1 cal/(g·°C)) obtém-se quantos joules vale uma caloria; com os dados do exercício 7 dá 4,2 J/cal.</LabNote>
  </>
}
