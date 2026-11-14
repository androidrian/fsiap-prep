import { useState } from 'react'
import { Choice, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { drawnTurns, transformer } from './physics'
import { ArrowHeads } from './svg'

type Given = 'power' | 'load'

const givenOptions = [['power', 'potência P'], ['load', 'resistência Rₛ']] as const
const PRIMARY_X = 189
const SECONDARY_X = 291
const WINDING_TOP = 76
const WINDING_HEIGHT = 84
const TOP_LEAD = 80
const BOTTOM_LEAD = 156

function turnPositions(count: number): number[] {
  return Array.from({ length: count }, (_, index) => WINDING_TOP + (index + 0.5) * WINDING_HEIGHT / count)
}

/** Transformador ideal: razão de espiras, correntes e resistência vista do primário (ficha 3, ex. 11 e 12). */
export function Transformer({ params }: LabProps) {
  const hasLoad = params.rs !== undefined && params.rs !== ''
  const [primary, setPrimary] = useState(Math.abs(numberParam(params, 'vp', 8500)))
  const [secondary, setSecondary] = useState(Math.abs(numberParam(params, 'vs', 120)))
  const [given, setGiven] = useState<Given>(hasLoad ? 'load' : 'power')
  const [power, setPower] = useState(Math.abs(numberParam(params, 'P', 78000)))
  const [load, setLoad] = useState(Math.abs(numberParam(params, 'rs', 0.185)))

  const result = transformer(primary, secondary, given === 'power' ? { power } : { resistance: load })
  const turns = drawnTurns(result.ratio)
  const primaryTurns = turnPositions(turns.primary)
  const secondaryTurns = turnPositions(turns.secondary)
  const kind = !Number.isFinite(result.ratio) ? 'razão indefinida' : Math.abs(result.ratio - 1) < 1e-9 ? 'transformador de isolamento (1 : 1)' : result.ratio > 1 ? 'transformador abaixador de tensão' : 'transformador elevador de tensão'
  const ratioText = !Number.isFinite(result.ratio) ? '—' : result.ratio >= 1 ? `${sig(result.ratio)} : 1` : `1 : ${sig(1 / result.ratio)}`
  const winding = (x: number, positions: number[], name: string) => positions.map((y) => <ellipse key={`${name}${y}`} className={`lab-magnetism-turn ${name}`} cx={x} cy={y} rx="19" ry={Math.min(4.5, WINDING_HEIGHT / positions.length / 2.3)} />)

  const switchGiven = (next: Given) => {
    if (next === given) return
    if (next === 'load' && Number.isFinite(result.loadResistance)) setLoad(Number(result.loadResistance.toPrecision(6)))
    if (next === 'power' && Number.isFinite(result.power)) setPower(Number(result.power.toPrecision(6)))
    setGiven(next)
  }

  return <>
    <svg className="lab-magnetism-stage lab-magnetism-transformer" viewBox="0 0 480 240" role="img" aria-label={`${kind}: ${sig(primary)} V no primário e ${sig(secondary)} V no secundário, razão de espiras ${ratioText}. Corrente de ${sig(result.primaryCurrent)} A no primário e ${sig(result.secondaryCurrent)} A no secundário, que alimenta uma carga de ${sig(result.loadResistance)} Ω`}>
      <defs><ArrowHeads prefix="transformer" tones={['b']} /></defs>
      <text x="240" y="24" textAnchor="middle">{kind}</text>
      <path className="lab-magnetism-core" fillRule="evenodd" d="M176 40H304V196H176ZM202 66V170H278V66Z" />
      <path className="lab-magnetism-flux" d="M240 53H291V183H189V53H232" markerEnd="url(#transformer-head-b)" />
      <text className="lab-magnetism-label lab-magnetism-tone-b" x="240" y="88" textAnchor="middle">Φ comum</text>

      <path className="lab-magnetism-lead" d={`M120 ${TOP_LEAD}H168V${primaryTurns[0]}M120 ${BOTTOM_LEAD}H168V${primaryTurns[primaryTurns.length - 1]}M120 ${TOP_LEAD}V${BOTTOM_LEAD}`} />
      <circle className="lab-magnetism-source" cx="120" cy="118" r="10" />
      <text className="lab-magnetism-strong" x="120" y="122" textAnchor="middle">~</text>
      {winding(PRIMARY_X, primaryTurns, 'primary')}
      <text x="10" y="62">primário</text>
      <text className="lab-magnetism-strong" x="10" y="84">Vₚ = {sig(primary)} V</text>
      <text className="lab-magnetism-strong" x="10" y="102">Iₚ = {sig(result.primaryCurrent)} A</text>
      <text x="170" y="214" textAnchor="end">{turns.primary} {turns.primary === 1 ? 'espira' : 'espiras'}</text>

      <path className="lab-magnetism-lead" d={`M360 ${TOP_LEAD}H312V${secondaryTurns[0]}M360 ${BOTTOM_LEAD}H312V${secondaryTurns[secondaryTurns.length - 1]}M360 ${TOP_LEAD}V98M360 138V${BOTTOM_LEAD}`} />
      <rect className="lab-magnetism-resistor" x="352" y="98" width="16" height="40" />
      {winding(SECONDARY_X, secondaryTurns, 'secondary')}
      <text x="378" y="62">secundário</text>
      <text className="lab-magnetism-strong" x="378" y="84">Vₛ = {sig(secondary)} V</text>
      <text className="lab-magnetism-strong" x="378" y="102">Iₛ = {sig(result.secondaryCurrent)} A</text>
      <text className="lab-magnetism-strong" x="378" y="122">Rₛ = {sig(result.loadResistance)} Ω</text>
      <text x="310" y="214">{turns.secondary} {turns.secondary === 1 ? 'espira' : 'espiras'}</text>
      <text x="240" y="234" textAnchor="middle">Nₚ : Nₛ = {ratioText}{turns.capped ? ' · desenho limitado a 16 espiras' : ''}</text>
    </svg>

    <ResultStrip label="Razão de espiras Nₚ/Nₛ" value={sig(result.ratio)} formula="\dfrac{N_p}{N_s}=\dfrac{V_p}{V_s}=\dfrac{I_s}{I_p}" secondary={`${kind} · ${sig(result.power)} W entram no primário e saem no secundário`} />
    <Metrics items={[
      { label: 'Corrente no primário', value: `${sig(result.primaryCurrent)} A` },
      { label: 'Corrente no secundário', value: `${sig(result.secondaryCurrent)} A` },
      { label: 'Carga no secundário Vₛ/Iₛ', value: `${sig(result.loadResistance)} Ω` },
      { label: 'Vista do primário Vₚ/Iₚ', value: `${sig(result.reflectedResistance)} Ω` },
    ]} />

    <Choice label="Dado conhecido" value={given} onChange={switchGiven} options={givenOptions} />
    <div className="lab-magnetism-fields">
      <NumberField label="Tensão no primário Vp" value={primary} onChange={(value) => setPrimary(Math.abs(value))} unit="V" />
      <NumberField label="Tensão no secundário Vs" value={secondary} onChange={(value) => setSecondary(Math.abs(value))} unit="V" />
      {given === 'power'
        ? <NumberField label="Potência transferida P" value={power} onChange={(value) => setPower(Math.abs(value))} unit="W" />
        : <NumberField label="Resistência de carga Rs" value={load} onChange={(value) => setLoad(Math.abs(value))} unit="Ω" />}
    </div>
    <LabNote title="Armadilha típica:">a tensão acompanha o número de espiras, mas a corrente varia ao contrário (a potência conserva-se: VₚIₚ = VₛIₛ). Por isso a resistência vista do primário é Rₛ multiplicada pelo quadrado da razão de espiras, não pela razão. Os valores são eficazes.</LabNote>
  </>
}
