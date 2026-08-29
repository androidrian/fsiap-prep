import type { FamilyId } from '../domain/types'

export interface ExamExercise {
  id: string
  exam: string
  number: number
  sourcePath: string
  familyIds: FamilyId[]
  statement: string
  parts: string[]
  hasFigure: boolean
  lab: { family: FamilyId; scenario: string; label: string; coverage: 'direct' | 'concept'; params?: Record<string, string> }
}

export const examExercises: ExamExercise[] = [
  {
    id: 'e1617n-p2-full', exam: '2016/17 · Normal', number: 2,
    sourcePath: 'FSIAP/Felix-Felicis/FSIAP-2019-2020-no-underscore/Exames/2016-2017/Normal.pdf', familyIds: ['uniform_fields'], hasFigure: true,
    statement: 'Uma partícula carregada positivamente, com q = 3,0×10⁻¹⁵ C, é lançada num campo elétrico uniforme de intensidade E = 2,0×10³ V/m. De A para B desloca-se 4,0 cm no sentido oposto ao campo e desce 3,0 cm.',
    parts: ['Calcule a intensidade da força elétrica no interior do campo.', 'Determine o trabalho realizado pela força elétrica de A para B.', 'Considere agora que a partícula tem massa 200×10⁻¹² g. Qual é a variação da energia potencial da partícula entre A e B?'],
    lab: { family: 'uniform_fields', scenario: 'work', label: 'Recriar o percurso A → B', coverage: 'direct', params: { q: '3', E: '2', dx: '-4', dy: '-3', m: '200' } },
  },
  {
    id: 'e2026n-p1-full', exam: '2026 · Época Normal', number: 1,
    sourcePath: 'FSIAP/FSIAP exames - 2026/exame-2026-normal.pdf', familyIds: ['electrostatics'], hasFigure: true,
    statement: 'Duas cargas elétricas estão fixas nos pontos A e D, no vácuo. Q₁ = −2,5 μC está em D, 3,0 m acima de C; Q₂ = 5 μC está em A, 4,0 m à esquerda de C; B fica 4,0 m à direita de C. Considere k = 9×10⁹ N·m²/C².',
    parts: ['Determine a intensidade, direção e sentido do campo elétrico no ponto C.', 'Determine o potencial elétrico no ponto B.', 'Determine o trabalho da força elétrica resultante sobre q = 0,5 μC quando é levada de B para C.'],
    lab: { family: 'electrostatics', scenario: 'symmetry', label: 'Explorar soma vetorial de campos', coverage: 'concept' },
  },
  {
    id: 'e2026n-p2-full', exam: '2026 · Época Normal', number: 2,
    sourcePath: 'FSIAP/FSIAP exames - 2026/exame-2026-normal.pdf', familyIds: ['dc_circuits', 'rc_circuits'], hasFigure: true,
    statement: 'No circuito da figura: ε₁ = 15 V, ε₂ = 6 V, R₁ = 2 kΩ, R₂ = 6 kΩ, R₃ = 3 kΩ, R₄ = 4 kΩ e C = 2,5 μF. O condensador está inicialmente descarregado.',
    parts: ['Feche o interruptor e calcule a resistência de carga do condensador.', 'Determine quanto tempo demoraria o condensador a carregar.', 'Determine a potência em R₂ depois de o condensador estar completamente carregado.'],
    lab: { family: 'rc_circuits', scenario: 'charge', label: 'Abrir curva de carga RC', coverage: 'concept' },
  },
  {
    id: 'e2026n-p3-full', exam: '2026 · Época Normal', number: 3,
    sourcePath: 'FSIAP/FSIAP exames - 2026/exame-2026-normal.pdf', familyIds: ['magnetic_particles'], hasFigure: true,
    statement: 'Um fio reto e longo transporta uma corrente de 6,0 A. Um protão, q = 1,60217653×10⁻¹⁹ C, viaja a 5,0 mm do fio com velocidade 1,75×10³ m/s, paralela ao fio e no mesmo sentido da corrente.',
    parts: ['Determine a intensidade, direção e sentido do campo magnético criado pelo fio no protão.', 'Determine a intensidade, direção e sentido da força magnética exercida sobre o protão.', 'Determine o campo elétrico necessário para o protão continuar a viajar paralelamente ao fio.'],
    lab: { family: 'magnetic_particles', scenario: 'wire', label: 'Ver campo em torno do fio', coverage: 'direct', params: { I: '6', r: '0.005', v: '1750' } },
  },
  {
    id: 'e2026n-p4-full', exam: '2026 · Época Normal', number: 4,
    sourcePath: 'FSIAP/FSIAP exames - 2026/exame-2026-normal.pdf', familyIds: ['optics'], hasFigure: true,
    statement: 'Um feixe viaja no ar, incide num bloco com θ₁ = 35° e emerge por uma face perpendicular com θ₂ = 18°. A distância horizontal assinalada desde a entrada até à face lateral é X = 60 cm.',
    parts: ['Determine o índice de refração do bloco.', 'Determine o tempo de viagem dentro do bloco.', 'Determine o valor de θ₁ necessário para o feixe não emergir do bloco.'],
    lab: { family: 'optics', scenario: 'critical', label: 'Explorar refração e ângulo crítico', coverage: 'concept' },
  },
  {
    id: 'e2026n-p5-full', exam: '2026 · Época Normal', number: 5,
    sourcePath: 'FSIAP/FSIAP exames - 2026/exame-2026-normal.pdf', familyIds: ['thermal_transport'], hasFigure: false,
    statement: 'Uma caixa cúbica tem área superficial total de 2,50 m² e está pousada numa superfície de cimento. As superfícies exteriores são de plástico com 7 mm e o interior é revestido por 3 cm de esferovite. O interior permanece a 0 °C. Use Lf(gelo) = 3,34×10⁵ J/kg, k(plástico) = 0,17 W/(m·K) e k(esferovite) = 0,04 W/(m·K).',
    parts: ['Determine o fluxo de calor pelas faces expostas ao ar quando a temperatura exterior é 308 K.', 'Determine a temperatura na interface esferovite/plástico.', 'Com 3,0 kg de gelo, determine durante quantas horas se mantém a diferença de temperatura.'],
    lab: { family: 'thermal_transport', scenario: 'layers', label: 'Representar as duas camadas', coverage: 'direct', params: { area: '2.0833', hot: '35', cold: '0', l1: '0.007', k1: '0.17', l2: '0.03', k2: '0.04' } },
  },
  {
    id: 'e2223r-p4-full', exam: '2022/23 · Recurso', number: 4,
    sourcePath: 'FSIAP/Felix-Felicis/FSIAP-2023-2024/Exames/2022-2023/Recurso.pdf', familyIds: ['uniform_fields', 'magnetic_particles'], hasFigure: true,
    statement: 'Num espectrómetro de massa existe um campo elétrico entre placas horizontais X e Y e um campo magnético B = 150 mT, perpendicular ao papel e dirigido para fora. A diferença de potencial é 1950 V e a separação das placas é 50 mm.',
    parts: ['Calcule a velocidade dos iões para seguirem em linha reta no seletor.', 'Para massa 1,87×10⁻²⁶ kg e carga elementar negativa, calcule o raio da trajetória semicircular.', 'Para uma segunda massa 2,25×10⁻²⁶ kg, calcule a separação das partículas na linha de deteção e indique o lado atingido.'],
    lab: { family: 'magnetic_particles', scenario: 'particle', label: 'Simular a trajetória no campo B', coverage: 'direct' },
  },
  {
    id: 'e2223r-p5-full', exam: '2022/23 · Recurso', number: 5,
    sourcePath: 'FSIAP/Felix-Felicis/FSIAP-2023-2024/Exames/2022-2023/Recurso.pdf', familyIds: ['em_waves'], hasFigure: false,
    statement: 'Uma sonda na superfície lunar emite radiação eletromagnética com potência média de 150 kW. A luz demora em média 1,28 s entre a Lua e a Terra. Despreze a absorção atmosférica.',
    parts: ['Determine o valor médio da magnitude do vetor de Poynting que chega à Terra.', 'Calcule o valor máximo do campo elétrico detetado.', 'Para radiação não polarizada e dois filtros cujos eixos fazem 80°, determine a intensidade final no sensor.'],
    lab: { family: 'em_waves', scenario: 'malus', label: 'Aplicar os dois polarizadores', coverage: 'direct', params: { angle2: '80' } },
  },
  {
    id: 'e2122n-p3-full', exam: '2021/22 · Normal', number: 3,
    sourcePath: 'FSIAP/Felix-Felicis/FSIAP-2023-2024/Exames/2021-2022/Normal.pdf', familyIds: ['magnetic_particles', 'uniform_fields'], hasFigure: false,
    statement: 'Pretende-se construir um ciclotrão para núcleos de trítio, constituídos por um protão e dois neutrões. O campo magnético B = 0,350 mT é perpendicular ao movimento. Use mp = 1,673×10⁻²⁷ kg e mn = 1,675×10⁻²⁷ kg.',
    parts: ['Determine o diâmetro necessário para ejeção a 6500 m/s.', 'Determine o período de uma volta completa.', 'Com ΔV = 2 kV à saída, determine a desaceleração ao longo de 35 m, desprezando a gravidade.'],
    lab: { family: 'magnetic_particles', scenario: 'particle', label: 'Visualizar raio e período', coverage: 'direct' },
  },
  {
    id: 'e2122n-p4-full', exam: '2021/22 · Normal', number: 4,
    sourcePath: 'FSIAP/Felix-Felicis/FSIAP-2023-2024/Exames/2021-2022/Normal.pdf', familyIds: ['em_waves', 'optics'], hasFigure: false,
    statement: 'Um feixe de micro-ondas tem Bx = 0, By = 0 e Bz = 10 cos(80πx − (12/5)π×10¹⁰t) mT.',
    parts: ['Determine o comprimento de onda no vazio e a frequência.', 'Determine as componentes do campo elétrico e a potência do feixe a 2 m da fonte.', 'O feixe incide a 70° com a superfície de uma solução e refrata-se a 45°. Determine a velocidade na solução.'],
    lab: { family: 'em_waves', scenario: 'wave', label: 'Relacionar onda, E e B', coverage: 'direct' },
  },
  {
    id: 'e2122n-p5-full', exam: '2021/22 · Normal', number: 5,
    sourcePath: 'FSIAP/Felix-Felicis/FSIAP-2023-2024/Exames/2021-2022/Normal.pdf', familyIds: ['thermal_transport'], hasFigure: true,
    statement: 'Três varas de cobre, latão e aço são soldadas em Y. Cada área transversal é 2,00 cm². O extremo do cobre está a 100 °C e os extremos do latão e aço a 0 °C. Os comprimentos são 13,0 cm, 18,0 cm e 24 cm; as condutividades são 401, 109 e 14 W/(m·K), respetivamente. Não há perdas laterais.',
    parts: ['Determine a resistência térmica de cada vara.', 'Determine a temperatura do ponto de junção.', 'Calcule o fluxo de calor em cada vara.'],
    lab: { family: 'thermal_transport', scenario: 'network', label: 'Simular as três barras em Y', coverage: 'direct' },
  },
]
