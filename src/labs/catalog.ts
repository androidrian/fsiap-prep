import type { FamilyId } from '../domain/types'

/**
 * Catálogo declarativo dos cenários de laboratório.
 *
 * É o contrato entre os exercícios (que ligam a um cenário com `params`) e os componentes
 * (registados em src/labs/registry.ts). Todos os parâmetros chegam pela query string como texto;
 * números usam ponto decimal e podem estar em notação científica (ex.: 1.6e-19).
 */
export interface CatalogScenario {
  id: string
  label: string
  /** O que o cenário permite ver/compreender. */
  summary: string
  /** Parâmetros aceites: nome → descrição com unidade. */
  params: Record<string, string>
}

export const labCatalog: Record<FamilyId, CatalogScenario[]> = {
  electrostatics: [
    { id: 'charges', label: 'Mapa de cargas', summary: 'Coloca várias cargas pontuais no plano e mede campo (vetores individuais e resultante), potencial e força num ponto de prova.', params: { c: 'cargas "x,y,q;x,y,q;…" (posições em `lu`, cargas em `qu`)', lu: 'unidade de comprimento: m | cm | mm', qu: 'unidade de carga: C | mC | uC | nC | e', p: 'ponto de prova "x,y" (em `lu`)', qt: 'carga de prova colocada em p (em `qu`), opcional', names: 'nomes das cargas separados por vírgula, ex.: "q1,q2,q3"', pn: 'nome do ponto de prova, ex.: "P"', p2: 'segundo ponto "x,y" para trabalho p → p2, opcional', p2n: 'nome do segundo ponto' } },
    { id: 'symmetry', label: 'Componentes que anulam', summary: 'Duas cargas iguais: as componentes horizontais do campo cancelam no eixo de simetria.', params: {} },
    { id: 'pair', label: 'Duas cargas', summary: 'Lei de Coulomb entre duas cargas: atração/repulsão e dependência com 1/r².', params: { q1: 'carga 1 (μC)', q2: 'carga 2 (μC)', r: 'distância (m)' } },
    { id: 'circle', label: '4 cargas no círculo', summary: 'Quatro cargas equidistantes do centro: potencial no centro, força numa carga e trabalho.', params: { q1: 'μC', q2: 'μC', q3: 'μC', q4: 'μC', d: 'diâmetro (m)' } },
    { id: 'pendulum', label: 'Pêndulos carregados', summary: 'Equilíbrio entre peso, tensão e força elétrica: dois pêndulos que se repelem ou uma carga suspensa junto de um plano carregado.', params: { mode: 'pair (dois pêndulos) | plane (plano vertical infinito)', m: 'massa de cada partícula (g)', q: 'carga (nC)', l: 'comprimento do fio (cm)', sigma: 'densidade do plano (nC/cm²) — só em mode=plane' } },
  ],
  uniform_fields: [
    { id: 'plates', label: 'Campo entre placas', summary: 'Campo uniforme E = ΔV/d entre placas e força sobre uma carga.', params: { V: 'diferença de potencial (V)', d: 'separação (m)', q: 'carga (μC)' } },
    { id: 'motion', label: 'Lançamento transversal', summary: 'Partícula lançada perpendicularmente ao campo: trajetória parabólica e deflexão à saída das placas.', params: { E: 'campo (N/C)', q: 'carga com sinal (C)', m: 'massa (kg)', vx: 'velocidade inicial (m/s)', L: 'comprimento das placas (m)' } },
    { id: 'work', label: 'Trabalho A → B', summary: 'Trabalho da força elétrica e variação de energia potencial num deslocamento oblíquo.', params: { q: '×10⁻¹⁵ C', E: '×10³ V/m', dx: 'cm', dy: 'cm', m: '×10⁻¹² g' } },
    { id: 'sheets', label: 'Duas placas carregadas', summary: 'Sobreposição do campo de dois planos infinitos com densidades σ₊ e σ₋: campo entre placas, ΔV e trabalho.', params: { sp: 'σ da placa positiva (μC/m²)', sm: 'módulo de σ da placa negativa (μC/m²)', d: 'separação (mm)', q: 'carga transportada de A para B (μC, com sinal)' } },
    { id: 'release', label: 'Carga abandonada no campo', summary: 'Carga largada do repouso num campo uniforme: força, diferença de potencial percorrida, energia cinética e velocidade final.', params: { E: 'campo (V/m)', d: 'distância percorrida ao longo do campo (m)', q: 'carga (C)', m: 'massa (kg)' } },
  ],
  dc_circuits: [
    { id: 'parallel', label: 'Ramos em paralelo', summary: 'Resistência equivalente e repartição da corrente por dois ramos.', params: {} },
    { id: 'meshes', label: '2 malhas · 2 fontes', summary: 'Correntes de malha com duas fontes e ramo comum.', params: {} },
    { id: 'network', label: 'Redutor série/paralelo', summary: 'Reduz passo a passo uma associação de resistências e mostra tensão e corrente em cada uma.', params: { net: 'expressão com s(…) série e p(…) paralelo, valores em Ω, ex.: "s(4,p(10,s(5,10)))"', V: 'tensão total aplicada (V) — ou', I: 'corrente total (A)', unit: 'unidade das resistências a mostrar: ohm | kohm' } },
    { id: 'kirchhoff', label: '3 ramos entre dois nós', summary: 'Circuito de três ramos (cada um com fonte e resistência) entre os nós a e b: tensão Vab e corrente em cada ramo pelas leis de Kirchhoff.', params: { e1: 'f.e.m. do ramo 1 (V; positiva se empurra corrente de b para a)', r1: 'resistência total do ramo 1 (Ω)', e2: 'V', r2: 'Ω', e3: 'V', r3: 'Ω', open: 'ramo aberto (1, 2 ou 3), opcional — interruptor desligado' } },
    { id: 'source', label: 'Fonte real e potência máxima', summary: 'Fonte com resistência interna: curva da potência entregue à carga, máxima quando R = Rin.', params: { emf: 'f.e.m. (V)', rin: 'resistência interna (Ω)', r: 'resistência de carga (Ω)' } },
    { id: 'meter', label: 'Voltímetro real', summary: 'Efeito da resistência interna do voltímetro na tensão medida num divisor de tensão.', params: { V: 'fonte (V)', r1: 'resistência medida (kΩ)', r2: 'resistência em série (kΩ)', rv: 'resistência interna do voltímetro (kΩ)' } },
    { id: 'wire', label: 'Fio condutor', summary: 'Resistência por metro, potência dissipada e velocidade de deriva num fio de cobre.', params: { d: 'diâmetro (mm)', rho: 'resistividade (Ω·m)', I: 'corrente (A)', n: 'eletrões livres por m³' } },
  ],
  rc_circuits: [
    { id: 'charge', label: 'Carga', summary: 'Curva de carga de um condensador e significado de τ.', params: { V: 'tensão final (V)', tau: 'constante de tempo (s)', t: 'instante (s)' } },
    { id: 'discharge', label: 'Descarga', summary: 'Curva de descarga de um condensador.', params: { V: 'tensão inicial (V)', tau: 'constante de tempo (s)', t: 'instante (s)' } },
    { id: 'network', label: '2 condensadores · rede', summary: 'Dois condensadores em série a descarregar numa rede de resistências.', params: { c1: 'μF', c2: 'μF', V: 'V', r1: 'Ω', r2: 'Ω', rs: 'Ω', t: 'μs' } },
    { id: 'switch', label: 'Comutador carga/descarga', summary: 'Condensador que carrega por uma resistência e descarrega por outra: duas constantes de tempo, correntes iniciais e curvas i(t), V(t).', params: { V: 'f.e.m. (V)', C: 'capacidade (μF)', rc: 'resistência equivalente de carga (Ω)', rd: 'resistência equivalente de descarga (Ω)' } },
    { id: 'capacitor', label: 'Condensador plano', summary: 'Capacidade a partir da geometria e do dielétrico; carga, campo e energia armazenada.', params: { A: 'área de cada placa (m²)', d: 'separação (mm)', er: 'constante dielétrica', V: 'tensão (V)' } },
    { id: 'capnet', label: 'Associação de condensadores', summary: 'Reduz associações série/paralelo de condensadores e mostra carga, tensão e energia em cada um.', params: { net: 'expressão com s(…) e p(…), ex.: "p(s(4,15),12)"', unit: 'unidade: uF | nF | pF', V: 'tensão aplicada (V)' } },
  ],
  magnetic_particles: [
    { id: 'particle', label: 'Partícula em B', summary: 'Curvatura de uma partícula num campo magnético: sinal da carga e sentido de B.', params: { v: 'm/s', B: 'mT', mass: '×10⁻²⁵ kg' } },
    { id: 'orbit', label: 'Espectrómetro / arco', summary: 'Trajetória circular com valores reais: raio, período, ponto de impacto após ¼, ½ ou volta completa.', params: { m: 'massa (kg)', q: 'carga com sinal (C)', v: 'velocidade (m/s)', B: 'campo (T)', arc: 'quarter | half | full' } },
    { id: 'vectors', label: 'Produto vetorial v × B', summary: 'Eixos x, y, z em perspetiva com os vetores v, B, E e as forças magnética, elétrica e total; regra da mão direita.', params: { v: 'velocidade "x,y,z" (m/s)', B: 'campo magnético "x,y,z" (T)', E: 'campo elétrico "x,y,z" (V/m), opcional', q: 'carga com sinal (C)', m: 'massa (kg), opcional', g: 'aceleração gravítica segundo −z (m/s²), opcional' } },
    { id: 'selector', label: 'Seletor de velocidades', summary: 'Campos E e B cruzados: só passa em linha reta a partícula com v = E/B.', params: { E: 'campo elétrico (V/m)', B: 'campo magnético (T)', v: 'velocidade da partícula (m/s)', q: 'sinal da carga: 1 | -1' } },
    { id: 'cyclotron', label: 'Ciclotrão', summary: 'Espiral num ciclotrão: campo necessário para a frequência dada e velocidade/energia final no raio do D.', params: { f: 'frequência (MHz)', R: 'raio do D (m)', m: 'massa (kg)', q: 'carga (C)' } },
    { id: 'wire', label: 'Campo de um fio', summary: 'Campo em torno de um fio reto e força sobre uma carga que viaja paralela ao fio.', params: { I: 'A', r: 'm', v: 'm/s' } },
    { id: 'wire-field', label: 'Fio num campo externo', summary: 'Soma do campo circular do fio com um campo uniforme externo: pontos de campo máximo e nulo.', params: { I: 'corrente (A)', Bext: 'campo externo (μT)', r: 'distância ao fio (cm)' } },
    { id: 'loop', label: 'Campo de uma espira', summary: 'Campo no centro de uma espira/bobina.', params: {} },
    { id: 'solenoid-particle', label: 'Partícula no solenoide', summary: 'Força magnética e peso numa partícula dentro de um solenoide.', params: { qE: 'e', N: 'espiras', L: 'm', I: 'A', v: 'm/s', mP: 'massas do protão', theta: '°' } },
  ],
  induction_sources: [
    { id: 'faraday', label: 'Fluxo variável', summary: 'FEM induzida numa espira quando B varia; corrente induzida se houver resistência.', params: { N: 'espiras', r: 'raio (m)', rate: 'dB/dt (T/s)', R: 'resistência (Ω), opcional' } },
    { id: 'motional', label: 'Barra em movimento', summary: 'FEM de movimento ℰ = Bℓv.', params: { B: 'T', l: 'm', v: 'm/s' } },
    { id: 'solenoid', label: 'Solenoide', summary: 'Campo no interior de um solenoide em função de N/L e I.', params: { N: 'espiras', L: 'm', I: 'A' } },
    { id: 'generator', label: 'Espira a rodar', summary: 'Gerador: fluxo, FEM e corrente sinusoidais de uma espira a rodar num campo uniforme.', params: { B: 'campo (T)', r: 'raio da espira (m)', N: 'espiras', w: 'velocidade angular (rad/s)', R: 'resistência (Ω)' } },
    { id: 'transformer', label: 'Transformador ideal', summary: 'Razão de espiras, tensões, correntes e resistência vista do primário.', params: { vp: 'tensão no primário (V)', vs: 'tensão no secundário (V)', P: 'potência transferida (W) — ou', rs: 'resistência de carga no secundário (Ω)' } },
  ],
  em_waves: [
    { id: 'wave', label: 'Onda EM', summary: 'Campos E e B perpendiculares e em fase; relação entre ω, k, λ e f.', params: { f: 'frequência (Hz)', E0: 'amplitude do campo elétrico (V/m)' } },
    { id: 'source', label: 'Fonte isotrópica', summary: 'Potência espalhada por uma esfera: intensidade 1/r² e amplitudes E e B à distância r.', params: { P: 'potência emitida (W)', r: 'distância (m)' } },
    { id: 'spectrum', label: 'Espetro e antenas', summary: 'Localiza uma frequência no espetro eletromagnético e calcula λ, λ/2 e λ/4 (antenas).', params: { f: 'frequência (Hz)' } },
    { id: 'three', label: '3 polarizadores', summary: 'Luz não polarizada por três polarizadores: metade no primeiro, Malus nos seguintes.', params: { a1: 'eixo de P1 (°)', a2: 'eixo de P2 (°)', a3: 'eixo de P3 (°)' } },
    { id: 'malus', label: 'Lei de Malus', summary: 'Dois polarizadores.', params: { angle2: '°' } },
    { id: 'single', label: '1.º polarizador', summary: 'Um polarizador com luz natural ou polarizada.', params: {} },
    { id: 'brewster', label: 'Ângulo de Brewster', summary: 'Reflexão totalmente polarizada quando os raios refletido e refratado fazem 90°.', params: { n1: 'índice do meio de incidência', n2: 'índice do meio de transmissão' } },
  ],
  optics: [
    { id: 'slab', label: 'Faces paralelas', summary: 'Desvio lateral numa lâmina de faces paralelas.', params: {} },
    { id: 'snell', label: 'Lei de Snell', summary: 'Refração entre dois meios.', params: { angle: 'ângulo de incidência à normal (°)', n1: 'índice do meio 1', n2: 'índice do meio 2' } },
    { id: 'critical', label: 'Ângulo crítico', summary: 'Reflexão total interna.', params: { angle: '°', n1: '', n2: '' } },
    { id: 'fiber', label: 'Fibra ótica', summary: 'Cone de aceitação, abertura numérica, ângulo crítico núcleo/bainha e número de reflexões ao longo da fibra.', params: { nn: 'índice do núcleo', nb: 'índice da bainha', a: 'raio do núcleo (μm)', L: 'comprimento da fibra (m)', phi: 'ângulo de entrada no ar (°), opcional' } },
    { id: 'block', label: 'Bloco com parede lateral', summary: 'Raio que entra pelo topo de um bloco e atinge a parede lateral: refração, condição de reflexão total, percurso e tempo de viagem.', params: { theta1: 'ângulo de incidência no topo (°)', n: 'índice do bloco', nout: 'índice do meio para lá da parede lateral', L: 'distância horizontal do ponto de entrada à parede (cm)' } },
  ],
  thermal_transport: [
    { id: 'wall', label: 'Parede de N camadas', summary: 'Perfil de temperatura numa parede com várias camadas em série: resistências, fluxo e temperaturas de interface.', params: { layers: 'camadas "L:k:nome;L:k:nome;…" com L em m e k em W/(m·K), do lado quente para o frio', area: 'm²', hot: '°C', cold: '°C' } },
    { id: 'layers', label: 'Parede composta', summary: 'Duas camadas em série.', params: { area: 'm²', hot: '°C', cold: '°C', l1: 'm', k1: '', l2: 'm', k2: '' } },
    { id: 'single', label: 'Camada única', summary: 'Condução numa camada.', params: { area: 'm²', hot: '°C', cold: '°C', l1: 'm', k1: 'W/(m·K)' } },
    { id: 'mixed', label: 'Série + paralelo', summary: 'Parede a | (b ∥ c) | d: resistências em série e em paralelo e temperaturas de interface.', params: { area: 'área total (m²)', hot: '°C', cold: '°C', la: 'm', ka: '', lbc: 'm', kb: '', kc: '', ld: 'm', kd: '' } },
    { id: 'network', label: 'Rede térmica em Y', summary: 'Três barras numa junção.', params: {} },
    { id: 'radiation', label: 'Radiação térmica', summary: 'Stefan–Boltzmann e Wien: potência emitida, troca líquida com a vizinhança e comprimento de onda do máximo.', params: { T: 'temperatura da superfície (°C)', Tenv: 'temperatura da vizinhança (°C)', A: 'área (m²)', e: 'emissividade' } },
    { id: 'convection', label: 'Convecção', summary: 'Lei de arrefecimento de Newton Q̇ = hAΔT.', params: { h: 'W/(m²·K)', A: 'm²', Ts: 'superfície (°C)', Tinf: 'fluido (°C)' } },
  ],
  thermal_equilibrium: [
    { id: 'mixing', label: 'Calorímetro', summary: 'Dois corpos trocam calor até ao equilíbrio: ΣQ = 0.', params: { m1: 'massa do corpo quente (kg)', c1: 'calor específico (J/(kg·K))', T1: '°C', m2: 'massa do corpo frio (kg)', c2: 'J/(kg·K)', T2: '°C' } },
    { id: 'heating', label: 'Curva de aquecimento', summary: 'Gelo → água: patamares de mudança de fase e energia em cada etapa.', params: { m: 'massa (kg)', T0: 'temperatura inicial (°C)', Tf: 'temperatura final (°C)' } },
    { id: 'expansion', label: 'Dilatação térmica', summary: 'Dilatação linear e volúmica e variação da massa específica.', params: { L0: 'comprimento inicial (m)', alpha: 'coeficiente linear (×10⁻⁶ K⁻¹)', dT: 'variação de temperatura (K)' } },
    { id: 'scales', label: 'Escalas de temperatura', summary: 'Termómetro com as escalas Celsius, Fahrenheit e Kelvin lado a lado.', params: { C: 'temperatura (°C)' } },
    { id: 'joule', label: 'Experiência de Joule', summary: 'Trabalho mecânico convertido em calor: equivalente mecânico da caloria.', params: { M: 'massa que cai (kg)', h: 'altura (m)', n: 'número de quedas', mw: 'massa de água (g)', dT: 'aquecimento medido (°C)' } },
  ],
}

export function catalogScenario(family: FamilyId, id: string): CatalogScenario | undefined {
  return labCatalog[family].find((scenario) => scenario.id === id)
}
