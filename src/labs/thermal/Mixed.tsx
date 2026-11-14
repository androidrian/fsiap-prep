import { useState } from 'react'
import { Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { compact, fix, positive, watts, widen } from './format'
import { FlowArrow, Zigzag } from './parts'
import { mixedWall } from './physics'

const X0 = 70
const WIDTH = 340
const MIN_WIDTH = 70
const TOP = 28
const BOTTOM = 138
const MIDDLE = (TOP + BOTTOM) / 2
const NET_Y = 200
const BRANCH = 16

function centimetres(metres: number): string {
  return metres < 1 ? `${compact(metres * 100)} cm` : `${compact(metres)} m`
}

export function Mixed({ params }: LabProps) {
  const initial = (key: string, fallback: number) => positive(numberParam(params, key, fallback), fallback)
  const [area, setArea] = useState(() => initial('area', 2.25))
  const [hot, setHot] = useState(() => numberParam(params, 'hot', 370))
  const [cold, setCold] = useState(() => numberParam(params, 'cold', -10))
  const [la, setLa] = useState(() => initial('la', 0.025))
  const [ka, setKa] = useState(() => initial('ka', 175))
  const [lbc, setLbc] = useState(() => initial('lbc', 0.075))
  const [kb, setKb] = useState(() => initial('kb', 40))
  const [kc, setKc] = useState(() => initial('kc', 50))
  const [ld, setLd] = useState(() => initial('ld', 0.05))
  const [kd, setKd] = useState(() => initial('kd', 80))
  const kbRange = widen(initial('kb', 40), 1, 400, 1)
  const kcRange = widen(initial('kc', 50), 1, 400, 1)

  const wall = mixedWall({ area, hot, cold, la, ka, lbc, kb, kc, ld, kd })
  const total = la + lbc + ld
  const widths = [la, lbc, ld].map((thickness) => MIN_WIDTH + (WIDTH - 3 * MIN_WIDTH) * (thickness / total))
  const x1 = X0 + widths[0]
  const x2 = x1 + widths[1]
  const x3 = X0 + WIDTH
  const forward = hot >= cold
  const thicknessB = 2 + 16 * wall.shareB
  const thicknessC = 2 + 16 * (1 - wall.shareB)
  const arrow = (from: number, to: number) => (forward ? { x1: from + 12, x2: to - 12 } : { x1: to - 12, x2: from + 12 })
  const firstSide = forward ? 'hot' : 'cold'
  const lastSide = forward ? 'cold' : 'hot'
  const setPositive = (setter: (value: number) => void) => (value: number) => { if (value > 0) setter(value) }

  const label = `Parede a, b em paralelo com c, e d, entre ${compact(hot)} °C e ${compact(cold)} °C. Fluxo total ${watts(Math.abs(wall.flow))}:${fix(wall.shareB * 100, 0)} % passa por b e ${fix((1 - wall.shareB) * 100, 0)} % por c. Interfaces a ${fix(wall.t1, 1)} °C e ${fix(wall.t2, 1)} °C.`

  return <>
    <svg className="lab-thermal-stage lab-thermal-mixed" viewBox="0 0 480 240" role="img" aria-label={label}>
      <rect className={`lab-thermal-side ${firstSide}`} x={X0 - 5} y={TOP} width="5" height={BOTTOM - TOP} />
      <rect className={`lab-thermal-side ${lastSide}`} x={x3} y={TOP} width="5" height={BOTTOM - TOP} />
      <text className={`lab-thermal-tag ${firstSide}`} x={X0 - 9} y={MIDDLE + 4} textAnchor="end">{compact(hot)} °C</text>
      <text className={`lab-thermal-tag ${lastSide}`} x={x3 + 9} y={MIDDLE + 4}>{compact(cold)} °C</text>
      <rect className="lab-thermal-block a" x={X0} y={TOP} width={widths[0].toFixed(1)} height={BOTTOM - TOP} />
      <rect className="lab-thermal-block b" x={x1.toFixed(1)} y={TOP} width={widths[1].toFixed(1)} height={MIDDLE - TOP} />
      <rect className="lab-thermal-block c" x={x1.toFixed(1)} y={MIDDLE} width={widths[1].toFixed(1)} height={BOTTOM - MIDDLE} />
      <rect className="lab-thermal-block d" x={x2.toFixed(1)} y={TOP} width={widths[2].toFixed(1)} height={BOTTOM - TOP} />
      <FlowArrow className="lab-thermal-heat total" {...arrow(X0, x1)} y={MIDDLE} thickness={18} />
      <FlowArrow className="lab-thermal-heat branch-b" {...arrow(x1, x2)} y={(TOP + MIDDLE) / 2 + 8} thickness={thicknessB} />
      <FlowArrow className="lab-thermal-heat branch-c" {...arrow(x1, x2)} y={(MIDDLE + BOTTOM) / 2 + 8} thickness={thicknessC} />
      <FlowArrow className="lab-thermal-heat total" {...arrow(x2, x3)} y={MIDDLE} thickness={18} />
      <text className="lab-thermal-name" x={(X0 + x1) / 2} y={TOP + 16} textAnchor="middle">a</text>
      <text className="lab-thermal-name" x={(x1 + x2) / 2} y={TOP + 16} textAnchor="middle">b · {watts(Math.abs(wall.flowB))}</text>
      <text className="lab-thermal-name" x={(x1 + x2) / 2} y={MIDDLE + 16} textAnchor="middle">c · {watts(Math.abs(wall.flowC))}</text>
      <text className="lab-thermal-name" x={(x2 + x3) / 2} y={TOP + 16} textAnchor="middle">d</text>
      <text className="lab-thermal-value" x={x1 + 16} y="18" textAnchor="end">T₁ = {fix(wall.t1, 1)} °C</text>
      <text className="lab-thermal-value" x={x2 - 16} y="18">T₂ = {fix(wall.t2, 1)} °C</text>
      <text x={(X0 + x1) / 2} y={BOTTOM + 15} textAnchor="middle">{centimetres(la)}</text>
      <text x={(x1 + x2) / 2} y={BOTTOM + 15} textAnchor="middle">{centimetres(lbc)}</text>
      <text x={(x2 + x3) / 2} y={BOTTOM + 15} textAnchor="middle">{centimetres(ld)}</text>
      {[x1, x2].map((x) => <line key={x} className="lab-thermal-guide" x1={x.toFixed(1)} y1={BOTTOM} x2={x.toFixed(1)} y2={NET_Y - BRANCH} />)}
      <path className="lab-thermal-wire" d={`M${X0} ${NET_Y}H${((X0 + x1) / 2 - 18).toFixed(1)}M${((X0 + x1) / 2 + 18).toFixed(1)} ${NET_Y}H${x1.toFixed(1)}M${x2.toFixed(1)} ${NET_Y}H${((x2 + x3) / 2 - 18).toFixed(1)}M${((x2 + x3) / 2 + 18).toFixed(1)} ${NET_Y}H${x3}`} />
      <path className="lab-thermal-wire branch-b" style={{ strokeWidth: 1 + 3 * wall.shareB }} d={`M${x1.toFixed(1)} ${NET_Y}V${NET_Y - BRANCH}H${((x1 + x2) / 2 - 18).toFixed(1)}M${((x1 + x2) / 2 + 18).toFixed(1)} ${NET_Y - BRANCH}H${x2.toFixed(1)}V${NET_Y}`} />
      <path className="lab-thermal-wire branch-c" style={{ strokeWidth: 1 + 3 * (1 - wall.shareB) }} d={`M${x1.toFixed(1)} ${NET_Y}V${NET_Y + BRANCH}H${((x1 + x2) / 2 - 18).toFixed(1)}M${((x1 + x2) / 2 + 18).toFixed(1)} ${NET_Y + BRANCH}H${x2.toFixed(1)}V${NET_Y}`} />
      <Zigzag x={(X0 + x1) / 2} y={NET_Y} />
      <Zigzag x={(x1 + x2) / 2} y={NET_Y - BRANCH} />
      <Zigzag x={(x1 + x2) / 2} y={NET_Y + BRANCH} />
      <Zigzag x={(x2 + x3) / 2} y={NET_Y} />
      <text className="lab-thermal-value" x={(X0 + x1) / 2} y={NET_Y - 10} textAnchor="middle">Ra</text>
      <text className="lab-thermal-value" x={(x1 + x2) / 2} y={NET_Y - BRANCH - 9} textAnchor="middle">Rb</text>
      <text className="lab-thermal-value" x={(x1 + x2) / 2} y={NET_Y + BRANCH + 18} textAnchor="middle">Rc</text>
      <text className="lab-thermal-value" x={(x2 + x3) / 2} y={NET_Y - 10} textAnchor="middle">Rd</text>
      {[X0, x1, x2, x3].map((x) => <circle key={x} className="lab-thermal-node" cx={x.toFixed(1)} cy={NET_Y} r="3.5" />)}
      <text x={X0 - 9} y={NET_Y + 4} textAnchor="end">{forward ? 'T quente' : 'T frio'}</text>
      <text x={x3 + 9} y={NET_Y + 4}>{forward ? 'T frio' : 'T quente'}</text>
    </svg>
    <ResultStrip label={forward ? 'Fluxo de calor total' : 'Fluxo de calor total (de d para a)'} value={watts(Math.abs(wall.flow), 4)} formula="R_{eq}=R_a+\dfrac{R_bR_c}{R_b+R_c}+R_d" secondary={`R_eq = ${sig(wall.total, 4)} K/W · R_b ∥ R_c = ${sig(wall.rbc)} K/W`} />
    <Metrics items={[
      { label: 'Fluxo por b', value: watts(Math.abs(wall.flowB), 4) },
      { label: 'Fluxo por c', value: watts(Math.abs(wall.flowC), 4) },
      { label: 'T₁ entre a e b/c', value: `${fix(wall.t1, 2)} °C` },
      { label: 'T₂ entre b/c e d', value: `${fix(wall.t2, 2)} °C` },
    ]} />
    <Metrics items={[
      { label: 'Resistência de a', value: `${sig(wall.ra)} K/W` },
      { label: 'Resistência de b (meia área)', value: `${sig(wall.rb)} K/W` },
      { label: 'Resistência de c (meia área)', value: `${sig(wall.rc)} K/W` },
      { label: 'Resistência de d', value: `${sig(wall.rd)} K/W` },
    ]} />
    <Control label="Condutividade de b" value={kb} {...kbRange} onChange={setKb} unit="W/(m·K)" />
    <Control label="Condutividade de c" value={kc} {...kcRange} onChange={setKc} unit="W/(m·K)" />
    <div className="lab-thermal-fields">
      <NumberField label="Temperatura do lado de a" value={hot} unit="°C" onChange={setHot} />
      <NumberField label="Temperatura do lado de d" value={cold} unit="°C" onChange={setCold} />
      <NumberField label="Área total" value={area} unit="m²" onChange={setPositive(setArea)} />
      <NumberField label="Espessura de a" value={la} unit="m" onChange={setPositive(setLa)} />
      <NumberField label="Condutividade de a" value={ka} unit="W/(m·K)" onChange={setPositive(setKa)} />
      <NumberField label="Espessura de b e c" value={lbc} unit="m" onChange={setPositive(setLbc)} />
      <NumberField label="Espessura de d" value={ld} unit="m" onChange={setPositive(setLd)} />
      <NumberField label="Condutividade de d" value={kd} unit="W/(m·K)" onChange={setPositive(setKd)} />
    </div>
    <LabNote title="Armadilha.">b e c só têm metade da área cada, por isso Rb e Rc usam A/2 e somam-se em paralelo antes de entrarem na série com Ra e Rd; o calor reparte-se na razão inversa das resistências. Com os dados do exercício 17 obtém-se R_eq = 1,082×10⁻³ K/W, Q̇ ≈ 351 kW, T₁ = 347,7 °C e T₂ = 87,6 °C. A ficha imprime 345,45×10³ W, 348,06 °C e 86,03 °C porque divide por R_eq já arredondado a 1,1×10⁻³ K/W.</LabNote>
  </>
}
