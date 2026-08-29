import type { FamilyId } from '../domain/types'

export interface ChoiceExercise {
  id: string
  familyId: FamilyId
  level: number
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  hints: string[]
  source: string
}

export const exercises: ChoiceExercise[] = [
  {
    id: 'thermal-r-01', familyId: 'thermal_transport', level: 2,
    prompt: 'Uma parede tem duas camadas em série. Qual é o primeiro passo correto para obter o fluxo de calor?',
    options: ['Somar as condutividades', 'Calcular R=L/(kA) para cada camada', 'Fazer a média das temperaturas', 'Usar Q=mcΔT'],
    correctIndex: 1,
    explanation: 'Em série, o mesmo fluxo atravessa as camadas. Calcula-se cada resistência L/(kA), somam-se e usa-se ΔT/Req.',
    hints: ['Pensa no análogo elétrico.', 'As camadas são resistências térmicas em série.', 'A fórmula de cada resistência contém L, k e A.'],
    source: 'Família observada em 13/14 exames; padrão de 2022/23 Normal P1 e 2026 Normal P5.',
  },
  {
    id: 'optics-snell-01', familyId: 'optics', level: 2,
    prompt: 'Um raio passa do ar para vidro (n=1,50) com 30° medidos à normal. Qual expressão deve ser usada primeiro?',
    options: ['sin θ₂ = 1,50 sin 30°', '1,00 sin 30° = 1,50 sin θ₂', 'θ₂ = 30°/1,50', 'v = λf'],
    correctIndex: 1,
    explanation: 'A lei de Snell é n₁ sinθ₁=n₂ sinθ₂, com todos os ângulos medidos à normal.',
    hints: ['Os índices acompanham os ângulos do respetivo meio.', 'O raio entra de n₁=1,00 para n₂=1,50.', 'Escreve n₁ sinθ₁=n₂ sinθ₂.'],
    source: 'Família observada em 13/14 exames; padrão de 2026 Normal P4.',
  },
  {
    id: 'electro-superposition-01', familyId: 'electrostatics', level: 2,
    prompt: 'Ao calcular o campo de várias cargas num ponto, o que deve ser somado?',
    options: ['Os módulos dos campos sempre', 'Os potenciais e depois dividir por q', 'As componentes vetoriais de cada campo', 'As distâncias entre as cargas'],
    correctIndex: 2,
    explanation: 'O campo elétrico é vetorial: calcula cada contribuição, decompõe em x/y e soma componentes. O potencial, ao contrário, soma-se escalarmente.',
    hints: ['Campo tem direção e sentido.', 'Contribuições opostas podem cancelar.', 'Soma Ex e Ey separadamente.'],
    source: 'Família observada em 11/14 exames e nos dois testes intercalares.',
  },
  {
    id: 'magnetic-radius-01', familyId: 'magnetic_particles', level: 3,
    prompt: 'Uma partícula entra perpendicularmente num campo B uniforme. Se a velocidade duplicar, o raio da trajetória…',
    options: ['fica metade', 'duplica', 'quadruplica', 'não muda'],
    correctIndex: 1,
    explanation: 'Como r=mv/(|q|B), mantendo m, q e B, o raio é diretamente proporcional à velocidade.',
    hints: ['A força magnética fornece a força centrípeta.', 'Iguala |q|vB a mv²/r.', 'Isola r.'],
    source: 'Família observada em 9/14 exames e nos dois testes intercalares.',
  },
  {
    id: 'rc-time-01', familyId: 'rc_circuits', level: 3,
    prompt: 'Num circuito RC em carga, ao fim de uma constante de tempo τ, Vc vale aproximadamente…',
    options: ['37% do valor final', '50% do valor final', '63% do valor final', '100% do valor final'],
    correctIndex: 2,
    explanation: 'Vc(τ)=Vf(1-e⁻¹)≈0,632 Vf. A carga prática completa é normalmente aproximada por 5τ.',
    hints: ['Usa Vc=Vf(1-e⁻ᵗ/τ).', 'Em t=τ, o expoente é −1.', '1−e⁻¹≈0,632.'],
    source: 'Família observada em 11/14 exames; padrão do Teste Intercalar 2025 P2.',
  },
  {
    id: 'em-intensity-01', familyId: 'em_waves', level: 3,
    prompt: 'No vazio, se a amplitude do campo elétrico E₀ duplicar, a intensidade média da onda…',
    options: ['duplica', 'quadruplica', 'fica metade', 'não muda'],
    correctIndex: 1,
    explanation: 'A intensidade média é proporcional a E₀². Duplicar a amplitude multiplica a intensidade por quatro.',
    hints: ['Procura a dependência em E₀.', 'I=½cε₀E₀².', 'Calcula (2E₀)².'],
    source: 'Família observada em 8/14 exames; padrão de 2025 Normal P4.',
  },
  {
    id: 'dc-kcl-01', familyId: 'dc_circuits', level: 2,
    prompt: 'Num nó entram 5 mA e 2 mA. Se sai apenas uma corrente I, então I é…',
    options: ['2 mA', '3 mA', '5 mA', '7 mA'],
    correctIndex: 3,
    explanation: 'Pela lei dos nós, a soma das correntes que entram é igual à soma das que saem: I=5+2=7 mA.',
    hints: ['Não há acumulação de carga no nó.', 'Aplica ΣIentrada=ΣIsaída.', 'Soma as duas correntes de entrada.'],
    source: 'Família observada em 8/14 exames.',
  },
  {
    id: 'uniform-sign-01', familyId: 'uniform_fields', level: 2,
    prompt: 'Uma carga negativa é colocada num campo elétrico uniforme apontado para cima. A força elétrica aponta…',
    options: ['para cima', 'para baixo', 'perpendicular ao campo', 'depende da massa'],
    correctIndex: 1,
    explanation: 'F=qE. Como q é negativa, a força tem sentido oposto ao campo.',
    hints: ['Começa por F=qE.', 'O sinal de q altera o sentido.', 'Carga negativa: força oposta a E.'],
    source: 'Família observada em 3/14 exames; padrão de 2022/23 Normal P2.',
  },
  {
    id: 'induction-lenz-01', familyId: 'induction_sources', level: 3,
    prompt: 'A lei de Lenz determina principalmente…',
    options: ['o módulo do campo externo', 'o sentido da corrente induzida', 'a resistência da espira', 'a carga do eletrão'],
    correctIndex: 1,
    explanation: 'O sinal negativo em Faraday-Lenz indica que a corrente induzida se opõe à variação do fluxo que a produz.',
    hints: ['Pensa no sinal negativo de ℰ=−N dΦ/dt.', 'A espira reage à mudança.', 'A oposição fixa o sentido.'],
    source: 'Família observada em 3/14 exames.',
  },
  {
    id: 'calorimetry-balance-01', familyId: 'thermal_equilibrium', level: 2,
    prompt: 'Num calorímetro isolado, qual é a equação central para encontrar a temperatura final?',
    options: ['ΣQ=0', 'Q̇=ΔT/R', 'PV=nRT', 'P=εσAT⁴'],
    correctIndex: 0,
    explanation: 'Sem trocas com o exterior, o calor cedido por uns corpos é absorvido pelos outros: a soma algébrica dos Q é zero.',
    hints: ['O sistema é isolado.', 'Usa conservação de energia.', 'Calor cedido + calor recebido = 0.'],
    source: 'Família observada em 3/14 exames.',
  },
]

export const diagnosticExercises = exercises.filter((exercise) =>
  ['thermal_transport', 'optics', 'electrostatics', 'magnetic_particles', 'rc_circuits', 'dc_circuits'].includes(exercise.familyId),
)

export const exerciseByFamily = Object.fromEntries(exercises.map((exercise) => [exercise.familyId, exercise])) as Record<FamilyId, ChoiceExercise>
