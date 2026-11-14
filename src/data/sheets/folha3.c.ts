import type { StudyExercise } from '../../domain/study'

const r = String.raw

/** Ficha 3 — exercícios 12 a 16. */
export const folha3c: StudyExercise[] = [
  {
    id: 'f3-12',
    source: { kind: 'sheet', sheet: 3, number: 12 },
    title: 'Transformador com carga resistiva de 4,4 Ω',
    familyIds: ['induction_sources'],
    difficulty: 2,
    statement: 'Um transformador suposto ideal, apresenta uma tensão de 230 V no secundário. Sabe-se que alimenta uma instalação elétrica puramente resistiva, cuja resistência equivalente é de 4,4 Ω. Sabendo que a corrente medida no primário é de 2 A. (Considere os valores referidos como valores eficazes.)',
    data: [
      { symbol: 'V_S', value: '230 V (eficaz)' },
      { symbol: 'R_S', value: '4,4 Ω (carga no secundário)' },
      { symbol: 'i_P', value: '2 A (eficaz)' },
    ],
    strategy: 'A carga resistiva está ligada ao secundário: a lei de Ohm dá a corrente no secundário. Num transformador ideal a razão de espiras é o inverso da razão das correntes.',
    pitfalls: [
      'Aplicar a lei de Ohm com a corrente do primário: a resistência de 4,4 Ω está no secundário.',
      'Inverter a razão: a corrente é maior no lado com menos espiras.',
    ],
    formulaIds: ['ohm', 'transformer-current', 'transformer-voltage'],
    parts: [
      {
        label: 'a',
        question: 'Calcule a razão entre o número de espiras do primário e do secundário.',
        hint: 'Não conheces a tensão do primário, mas conheces a corrente do primário. Calcula primeiro a corrente no secundário com a lei de Ohm.',
        steps: [
          {
            title: 'Corrente no secundário',
            text: 'A instalação é puramente resistiva e está ligada aos 230 V do secundário.',
            math: r`i_S=\frac{V_S}{R_S}=\frac{230}{4{,}4}\approx52{,}3\ \mathrm{A}`,
          },
          {
            title: 'Razão de espiras',
            text: r`Transformador ideal: $V_P\,i_P=V_S\,i_S$, por isso a razão de espiras é o inverso da razão das correntes.`,
            math: r`\frac{N_P}{N_S}=\frac{V_P}{V_S}=\frac{i_S}{i_P}=\frac{52{,}3}{2}\approx26`,
          },
          {
            title: 'Verificação',
            text: 'A tensão no primário fica cerca de 26 vezes maior do que no secundário, e a potência é igual dos dois lados.',
            math: r`V_P=26{,}1\times230\approx6{,}0\times10^{3}\ \mathrm{V}\qquad V_P\,i_P\approx V_S\,i_S\approx1{,}2\times10^{4}\ \mathrm{W}`,
          },
        ],
        answer: r`$N_P/N_S\approx26$`,
        official: '26',
        check: { value: 26.1, unit: 'sem unidade' },
      },
      {
        label: 'b',
        question: 'Qual a corrente no secundário?',
        hint: 'Lei de Ohm na carga, que está ligada ao secundário.',
        steps: [
          {
            title: 'Lei de Ohm no secundário',
            text: 'Já foi calculada na alínea a): é a tensão do secundário a dividir pela resistência da instalação.',
            math: r`i_S=\frac{V_S}{R_S}=\frac{230}{4{,}4}\approx52\ \mathrm{A}`,
          },
          {
            title: 'Ordem de grandeza',
            text: 'A corrente no secundário (52 A) é muito maior do que no primário (2 A), como esperado num transformador abaixador de tensão.',
          },
        ],
        answer: r`$i_S\approx52$ A`,
        official: 'Is = 52 A',
        check: { value: 52.3, unit: 'A' },
      },
    ],
    labs: [
      { family: 'induction_sources', scenario: 'transformer', label: 'Ver o transformador com a carga de 4,4 Ω', coverage: 'direct', params: { vp: '6011', vs: '230', rs: '4.4' } },
    ],
  },
  {
    id: 'f3-13',
    source: { kind: 'sheet', sheet: 3, number: 13 },
    title: 'Partícula que atinge o anteparo no ponto P',
    familyIds: ['magnetic_particles'],
    difficulty: 3,
    statement: r`Uma partícula de massa $2{,}0\times10^{-8}$ kg é lançada perpendicularmente a um campo magnético $\vec B=-4{,}0\times10^{-2}\,\vec e_z$ (T), com velocidade $\vec v=50\,\vec e_y$ (m/s), atingindo o anteparo no ponto P a 2,5 cm de A, tal como se indica na figura. Calcule:`,
    figure: {
      src: 'figures/f3-13.svg',
      alt: 'Região com campo magnético uniforme B representado por cruzes (campo a entrar na página, sentido negativo de z). Em baixo há um anteparo horizontal. O ponto A está no anteparo e o ponto P também, 2,5 cm à esquerda de A. A partícula sai de A com velocidade v vertical, a apontar para cima (sentido positivo de y). À direita estão os eixos: x horizontal para a direita, y vertical para cima, com origem 0.',
      caption: 'Figura redesenhada a partir do enunciado.',
    },
    data: [
      { symbol: 'm', value: r`$2{,}0\times10^{-8}$ kg` },
      { symbol: r`\vec B`, value: r`$-4{,}0\times10^{-2}\,\vec e_z$ T (a entrar na página)` },
      { symbol: r`\vec v`, value: r`$50\,\vec e_y$ m/s` },
      { symbol: r`\overline{AP}`, value: r`2,5 cm = $2{,}5\times10^{-2}$ m, com P à esquerda de A` },
    ],
    strategy: r`A partícula sai de A perpendicularmente ao anteparo e volta a ele em P: descreveu meia circunferência e $\overline{AP}$ é o diâmetro. O sinal da carga vem de comparar o sentido de $\vec v\times\vec B$ com o lado para onde a partícula curva; o valor vem de $|q|vB=mv^2/r$.`,
    pitfalls: [
      'Usar 2,5 cm como raio: é o diâmetro da meia circunferência.',
      'Esquecer o sinal de B (aponta para −z) ao aplicar a regra da mão direita.',
      'Usar o período completo em vez de meio período.',
    ],
    formulaIds: ['lorentz-magnetic', 'centripetal', 'cyclotron-radius', 'cyclotron-period'],
    parts: [
      {
        label: 'a',
        question: 'A carga da partícula e indique o respetivo sinal.',
        hint: 'Para que lado tem de apontar a força em A para a partícula ir ter a P? Compara com o sentido de v × B.',
        steps: [
          {
            title: 'Ler a figura',
            text: r`A partícula sai de A a subir e bate em P, que está 2,5 cm à esquerda de A. Como sai perpendicularmente ao anteparo e volta a ele, descreve meia circunferência de diâmetro $\overline{AP}$.`,
            math: r`r=\frac{\overline{AP}}{2}=\frac{2{,}5\times10^{-2}}{2}=1{,}25\times10^{-2}\ \mathrm{m}`,
          },
          {
            title: 'Sentido de v × B',
            text: r`Regra da mão direita: dedos segundo $\vec v$ ($+y$), a rodar para $\vec B$ (para dentro da página, $-z$): o polegar aponta para a esquerda, $-x$. O determinante confirma.`,
            math: r`\vec v\times\vec B=\begin{vmatrix}\vec e_x&\vec e_y&\vec e_z\\0&50&0\\0&0&-4{,}0\times10^{-2}\end{vmatrix}=50\times(-4{,}0\times10^{-2})\,\vec e_x=-2{,}0\,\vec e_x\ \mathrm{T\,m/s}`,
          },
          {
            title: 'Sinal da carga',
            text: r`O centro da trajetória está a meio de A e P, à esquerda de A. A força em A tem de apontar para o centro, ou seja, para $-x$. É o sentido de $\vec v\times\vec B$, logo $q>0$. Se a carga fosse negativa, a partícula curvava para a direita.`,
          },
          {
            title: 'Valor da carga',
            text: 'A força magnética faz de força centrípeta.',
            math: r`|q|\,v\,B=\frac{m\,v^2}{r}\quad\Rightarrow\quad q=\frac{m\,v}{r\,B}=\frac{2{,}0\times10^{-8}\times50}{1{,}25\times10^{-2}\times4{,}0\times10^{-2}}=2{,}0\times10^{-3}\ \mathrm{C}`,
          },
        ],
        answer: r`$q=+2{,}0\times10^{-3}$ C (carga positiva)`,
        official: 'q = 2,0×10⁻³ C (q>0)',
        check: { value: 2.0e-3, unit: 'C' },
      },
      {
        label: 'b',
        question: 'O intervalo de tempo que a partícula demora a atingir a posição P.',
        hint: 'A partícula percorre meia circunferência com velocidade de módulo constante.',
        steps: [
          {
            title: 'Distância percorrida',
            text: 'De A a P a partícula percorre meia circunferência, de comprimento πr, sempre a 50 m/s.',
            math: r`\Delta t=\frac{\pi\,r}{v}=\frac{\pi\times1{,}25\times10^{-2}}{50}\approx7{,}9\times10^{-4}\ \mathrm{s}\approx8\times10^{-4}\ \mathrm{s}`,
          },
          {
            title: 'Verificação pelo período',
            text: 'É metade do período de rotação, que não depende da velocidade.',
            math: r`\Delta t=\frac{T}{2}=\frac{\pi\,m}{|q|\,B}=\frac{\pi\times2{,}0\times10^{-8}}{2{,}0\times10^{-3}\times4{,}0\times10^{-2}}\approx7{,}9\times10^{-4}\ \mathrm{s}`,
          },
        ],
        answer: r`$\Delta t\approx7{,}9\times10^{-4}$ s $\approx8\times10^{-4}$ s`,
        official: 'Δt = 8×10⁻⁴ s',
        check: { value: 7.85e-4, unit: 's' },
      },
    ],
    labs: [
      { family: 'magnetic_particles', scenario: 'orbit', label: 'Ver a meia volta de A até P', coverage: 'direct', params: { m: '2e-8', q: '2e-3', v: '50', B: '0.04', arc: 'half' } },
    ],
  },
  {
    id: 'f3-14',
    source: { kind: 'sheet', sheet: 3, number: 14 },
    title: 'Corpo carregado em campos E e B com gravidade',
    familyIds: ['magnetic_particles'],
    difficulty: 2,
    statement: r`Um corpo de massa 0,3 kg e com uma carga de 3 C fica sujeito a um campo elétrico $\vec E=-\hat\imath-3\hat\jmath$ (N C⁻¹) e a um campo magnético $\vec B=\hat\imath-2\hat\jmath+3\hat k$ (T).`,
    data: [
      { symbol: 'm', value: '0,3 kg' },
      { symbol: 'q', value: '+3 C' },
      { symbol: r`\vec E`, value: r`$(-1;\,-3;\,0)$ N/C` },
      { symbol: r`\vec B`, value: r`$(1;\,-2;\,3)$ T` },
      { symbol: r`\vec v`, value: r`$(3;\,0;\,0)$ m/s` },
      { symbol: r`\vec g`, value: r`$(0;\,0;\,-10)$ m/s² (valor do enunciado)` },
    ],
    strategy: r`Tudo por componentes: $\vec F_m=q\,\vec v\times\vec B$ com o determinante, $\vec F_e=q\vec E$, soma vetorial e, no fim, 2.ª lei de Newton com o peso incluído.`,
    pitfalls: [
      'Errar o sinal da componente j do determinante (leva sinal menos).',
      'Somar módulos em vez de somar componente a componente.',
      'Na alínea c) usar g = 9,81: o enunciado dá g = −10 k m/s².',
    ],
    formulaIds: ['lorentz-magnetic', 'field-force', 'lorentz-total', 'weight', 'newton-second'],
    parts: [
      {
        label: 'a',
        question: r`Sabendo que o corpo possui uma velocidade $\vec v=3\hat\imath$ (m s⁻¹), qual a força magnética a que o corpo fica sujeito no instante inicial?`,
        hint: 'Monta o determinante com os versores na primeira linha, a velocidade na segunda e o campo magnético na terceira.',
        steps: [
          {
            title: 'Produto vetorial',
            text: r`Desenvolve o determinante pela primeira linha. Atenção ao sinal menos da componente $\hat\jmath$.`,
            math: r`\vec v\times\vec B=\begin{vmatrix}\hat\imath&\hat\jmath&\hat k\\3&0&0\\1&-2&3\end{vmatrix}=(0\times3-0\times(-2))\,\hat\imath-(3\times3-0\times1)\,\hat\jmath+(3\times(-2)-0\times1)\,\hat k=-9\,\hat\jmath-6\,\hat k`,
          },
          {
            title: 'Força magnética',
            text: 'A carga é positiva: a força tem o sentido do produto vetorial.',
            math: r`\vec F_m=q\,\vec v\times\vec B=3\times(-9\,\hat\jmath-6\,\hat k)=-27\,\hat\jmath-18\,\hat k\ \mathrm{(N)}`,
          },
          {
            title: 'Verificação',
            text: r`A força magnética tem de ser perpendicular a $\vec v$ (não tem componente $x$) e a $\vec B$ (produto escalar nulo). Em termos de mão direita: só as componentes de $\vec B$ perpendiculares a $\vec v$ contam, e $\hat\imath\times\hat\jmath=\hat k$, $\hat\imath\times\hat k=-\hat\jmath$.`,
            math: r`\vec F_m\cdot\vec B=0\times1+(-27)\times(-2)+(-18)\times3=54-54=0`,
          },
        ],
        answer: r`$\vec F_m=-27\,\hat\jmath-18\,\hat k$ (N), de módulo $\approx32{,}4$ N`,
        official: 'Fm = −27 j − 18 k (N)',
        check: { value: 32.45, unit: 'N (módulo)' },
      },
      {
        label: 'b',
        question: 'Qual a força eletromagnética aplicada na partícula?',
        hint: 'Soma a força elétrica qE à força magnética da alínea a), componente a componente.',
        steps: [
          {
            title: 'Força elétrica',
            text: 'Carga positiva: a força elétrica tem o sentido do campo elétrico.',
            math: r`\vec F_e=q\,\vec E=3\times(-\hat\imath-3\,\hat\jmath)=-3\,\hat\imath-9\,\hat\jmath\ \mathrm{(N)}`,
          },
          {
            title: 'Soma vetorial',
            text: 'Soma componente a componente.',
            math: r`\vec F_{em}=\vec F_e+\vec F_m=(-3)\,\hat\imath+(-9-27)\,\hat\jmath+(-18)\,\hat k=-3\,\hat\imath-36\,\hat\jmath-18\,\hat k\ \mathrm{(N)}`,
          },
        ],
        answer: r`$\vec F_{em}=-3\,\hat\imath-36\,\hat\jmath-18\,\hat k$ (N), de módulo $\approx40{,}4$ N`,
        official: 'Fem = −3 i − 36 j − 18 k (N)',
        check: { value: 40.36, unit: 'N (módulo)' },
      },
      {
        label: 'c',
        question: r`Se considerasse o efeito da gravidade $\vec g=-10\hat k$ (m s⁻²), qual seria a aceleração do corpo?`,
        hint: 'Junta o peso à força eletromagnética e divide a resultante pela massa.',
        steps: [
          {
            title: 'Peso',
            text: 'Usa o valor de g dado no enunciado.',
            math: r`\vec P=m\,\vec g=0{,}3\times(-10\,\hat k)=-3\,\hat k\ \mathrm{(N)}`,
          },
          {
            title: 'Força resultante',
            text: 'Soma o peso à força eletromagnética da alínea b).',
            math: r`\vec F_R=\vec F_{em}+\vec P=-3\,\hat\imath-36\,\hat\jmath-21\,\hat k\ \mathrm{(N)}`,
          },
          {
            title: '2.ª lei de Newton',
            text: 'Divide cada componente pela massa.',
            math: r`\vec a=\frac{\vec F_R}{m}=\frac{-3\,\hat\imath-36\,\hat\jmath-21\,\hat k}{0{,}3}=-10\,\hat\imath-120\,\hat\jmath-70\,\hat k\ \mathrm{(m/s^2)}`,
          },
        ],
        answer: r`$\vec a=-10\,\hat\imath-120\,\hat\jmath-70\,\hat k$ (m/s²), de módulo $\approx139$ m/s²`,
        official: 'a = −10 i − 120 j − 70 k (m/s²)',
        check: { value: 139.3, unit: 'm/s² (módulo)' },
      },
    ],
    labs: [
      { family: 'magnetic_particles', scenario: 'vectors', label: 'Ver os vetores e as forças em 3D', coverage: 'direct', params: { v: '3,0,0', B: '1,-2,3', E: '-1,-3,0', q: '3', m: '0.3', g: '10' } },
    ],
  },
  {
    id: 'f3-15',
    source: { kind: 'sheet', sheet: 3, number: 15 },
    title: 'Um quarto de círculo até ao alvo',
    familyIds: ['magnetic_particles'],
    difficulty: 3,
    statement: r`Pretende-se que uma partícula de massa $2{,}0\times10^{-12}$ kg e com carga positiva de $4{,}4\times10^{-6}$ C, atinja um alvo pré-definido depois de descrever ¼ de círculo. O alvo encontra-se a uma distância, d = 3 mm, do ponto de entrada da partícula carregada, tal como representado na figura. Despreze o efeito da gravidade.`,
    figure: {
      src: 'figures/f3-15.png',
      alt: 'A partícula entra no canto superior esquerdo com velocidade v horizontal, a apontar para a direita (sentido positivo de x). Descreve um quarto de circunferência no sentido dos ponteiros do relógio, a curvar para baixo, e termina no alvo, uma placa horizontal em baixo, onde chega a descer na vertical. O centro do arco é o canto inferior esquerdo: o raio r mede-se desse canto até ao arco. A distância d é o segmento de reta (corda) que une o ponto de entrada, em cima à esquerda, ao ponto de impacto no alvo, em baixo à direita. Os eixos indicados são x para a direita, y para cima e z a sair da página.',
    },
    data: [
      { symbol: 'm', value: r`$2{,}0\times10^{-12}$ kg` },
      { symbol: 'q', value: r`$+4{,}4\times10^{-6}$ C` },
      { symbol: 'd', value: r`3 mm = $3{,}0\times10^{-3}$ m (em linha reta, da entrada ao alvo)` },
      { symbol: 'v', value: r`$2{,}0\times10^{6}$ m/s (à entrada, segundo $+x$)` },
      { symbol: r`\vec E`, value: r`$-3\times10^{8}\,\vec e_y$ V/m (só depois do alvo)` },
    ],
    strategy: r`Primeiro a geometria: num quarto de círculo a corda $d$ e o raio $r$ formam um triângulo retângulo isósceles, $d=r\sqrt2$. Depois $|q|vB=mv^2/r$ dá $B$ e a regra da mão direita dá o sentido. No alvo a velocidade já rodou 90°: recalcula $\vec v\times\vec B$ e soma a força elétrica.`,
    pitfalls: [
      'Usar d como raio: d é a distância em linha reta entre a entrada e o alvo, o raio é d/√2.',
      'Na alínea b) usar a velocidade de entrada: no alvo a velocidade aponta para −y.',
      'Esquecer de converter 3 mm para metros.',
    ],
    formulaIds: ['centripetal', 'cyclotron-radius', 'lorentz-magnetic', 'field-force', 'lorentz-total', 'newton-second'],
    parts: [
      {
        label: 'a',
        question: r`Determine a intensidade do campo magnético, a sua direção e o seu sentido para que o alvo seja atingido, assumindo que a velocidade da partícula é $2{,}0\times10^{6}$ m/s.`,
        hint: 'Desenha os dois raios (do centro à entrada e do centro ao alvo): fazem 90° entre si e d é a hipotenusa.',
        steps: [
          {
            title: 'Ler a figura',
            text: r`A partícula entra em cima, a mover-se para $+x$, e curva para baixo até ao alvo. O centro do arco é o canto inferior esquerdo. O raio que vai do centro à entrada é vertical e o que vai do centro ao alvo é horizontal: fazem 90°, e $d$ é a hipotenusa.`,
            math: r`d^2=r^2+r^2\quad\Rightarrow\quad r=\frac{d}{\sqrt2}=\frac{3{,}0\times10^{-3}}{\sqrt2}\approx2{,}12\times10^{-3}\ \mathrm{m}`,
          },
          {
            title: 'Intensidade do campo',
            text: 'A força magnética é a força centrípeta do movimento circular.',
            math: r`|q|\,v\,B=\frac{m\,v^2}{r}\quad\Rightarrow\quad B=\frac{m\,v}{|q|\,r}=\frac{2{,}0\times10^{-12}\times2{,}0\times10^{6}}{4{,}4\times10^{-6}\times2{,}12\times10^{-3}}\approx428{,}5\ \mathrm{T}`,
          },
          {
            title: 'Direção e sentido',
            text: r`O campo tem de ser perpendicular ao plano da trajetória ($xy$), logo segundo $z$. À entrada a força tem de apontar para o centro, que está por baixo: $-y$. A carga é positiva, por isso $\vec v\times\vec B$ tem de apontar para $-y$. Mão direita: dedos segundo $+x$, a rodar para $+z$ (fora da página), o polegar aponta para $-y$. Serve $\vec B=+B\,\vec e_z$.`,
            math: r`\vec v\times\vec B=\begin{vmatrix}\vec e_x&\vec e_y&\vec e_z\\v&0&0\\0&0&B\end{vmatrix}=-vB\,\vec e_y`,
          },
          {
            title: 'Ordem de grandeza',
            text: 'Um campo de 428 T é irrealista (os dados são académicos), mas a conta está coerente com a ficha. Se a carga fosse negativa, o campo teria de apontar para −z.',
          },
        ],
        answer: r`$\vec B\approx428{,}5\,\vec e_z$ T: perpendicular ao plano da trajetória, a sair da página (sentido positivo de $z$).`,
        official: 'B = 428,55 e_z (T), no sentido positivo',
        check: { value: 428.55, unit: 'T' },
      },
      {
        label: 'b',
        question: r`Depois de atingir o alvo, a partícula entra numa zona do espaço onde existe também um campo elétrico constante, $\vec E=-3\times10^{8}\,\vec e_y$ V/m. Qual a força aplicada à partícula no momento em que entra nesta zona do espaço?`,
        hint: 'Qual é a velocidade (vetor) da partícula ao chegar ao alvo? Com ela calcula a força magnética e soma a força elétrica.',
        steps: [
          {
            title: 'Velocidade no alvo',
            text: r`Depois de um quarto de volta no sentido horário a velocidade rodou 90°: aponta para baixo. O módulo é o mesmo, porque a força magnética não realiza trabalho.`,
            math: r`\vec v=-2{,}0\times10^{6}\,\vec e_y\ \mathrm{m/s}`,
          },
          {
            title: 'Força magnética',
            text: r`Mão direita: dedos segundo $-y$, a rodar para $+z$: o polegar aponta para $-x$, ou seja, para o centro do arco, como tem de ser. O determinante confirma.`,
            math: r`\vec v\times\vec B=\begin{vmatrix}\vec e_x&\vec e_y&\vec e_z\\0&-v&0\\0&0&B\end{vmatrix}=-vB\,\vec e_x\quad\Rightarrow\quad\vec F_m=-q\,vB\,\vec e_x=-4{,}4\times10^{-6}\times2{,}0\times10^{6}\times428{,}55\,\vec e_x\approx-3771\,\vec e_x\ \mathrm{N}`,
          },
          {
            title: 'Força elétrica',
            text: 'Carga positiva: a força elétrica tem o sentido do campo elétrico, −y.',
            math: r`\vec F_e=q\,\vec E=4{,}4\times10^{-6}\times(-3\times10^{8})\,\vec e_y=-1320\,\vec e_y\ \mathrm{N}`,
          },
          {
            title: 'Soma vetorial',
            text: 'As duas forças são perpendiculares: soma por componentes; o módulo sai pelo teorema de Pitágoras.',
            math: r`\vec F_{em}=(-3771\,\vec e_x-1320\,\vec e_y)\ \mathrm{N}\qquad|\vec F_{em}|=\sqrt{3771^2+1320^2}\approx3996\ \mathrm{N}`,
          },
        ],
        answer: r`$\vec F_{em}\approx(-3771\,\vec e_x-1320\,\vec e_y)$ N, de módulo $\approx4{,}0\times10^{3}$ N`,
        official: 'Fem = (−1320 e_y − 3771,24 e_x) (N)',
        check: { value: 3996, unit: 'N (módulo)' },
      },
      {
        label: 'c',
        question: 'Determine a aceleração a que a partícula está sujeita nesse mesmo momento.',
        hint: 'A gravidade é desprezada: a força resultante é a força eletromagnética da alínea b).',
        steps: [
          {
            title: '2.ª lei de Newton',
            text: 'Divide cada componente da força pela massa.',
            math: r`\vec a=\frac{\vec F_{em}}{m}=\frac{-3771\,\vec e_x-1320\,\vec e_y}{2{,}0\times10^{-12}}\approx(-1{,}89\times10^{15}\,\vec e_x-6{,}6\times10^{14}\,\vec e_y)\ \mathrm{m/s^2}`,
          },
          {
            title: 'Módulo',
            text: 'A ficha pede (e dá) o módulo. O valor impresso, 1,99×10¹⁵, é este resultado truncado.',
            math: r`|\vec a|=\frac{|\vec F_{em}|}{m}=\frac{3996}{2{,}0\times10^{-12}}\approx2{,}0\times10^{15}\ \mathrm{m/s^2}`,
          },
        ],
        answer: r`$|\vec a|\approx2{,}0\times10^{15}$ m/s² ($1{,}998\times10^{15}$), com $\vec a\approx(-1{,}89\times10^{15}\,\vec e_x-6{,}6\times10^{14}\,\vec e_y)$ m/s²`,
        official: '|a| = 1,99×10¹⁵ m/s²',
        check: { value: 1.998e15, unit: 'm/s²' },
      },
    ],
    note: 'O valor B = 428,55 T da ficha parece estranho por ser enorme, mas não é gralha: resulta de ler d como a distância em linha reta (corda) entre a entrada e o alvo, o que dá r = d/√2 ≈ 2,12 mm. Com r = d obtinha-se 303 T, que não é o valor da ficha. Em c) a ficha trunca 1,998×10¹⁵ para 1,99×10¹⁵ m/s².',
    labs: [
      { family: 'magnetic_particles', scenario: 'orbit', label: 'Ver o quarto de volta até ao alvo', coverage: 'direct', params: { m: '2e-12', q: '4.4e-6', v: '2e6', B: '428.55', arc: 'quarter' } },
    ],
  },
  {
    id: 'f3-16',
    source: { kind: 'sheet', sheet: 3, number: 16 },
    title: 'Protão a viajar paralelamente a um fio com corrente',
    familyIds: ['magnetic_particles'],
    difficulty: 2,
    statement: r`Um fio reto e longo transporta uma corrente de 5,0 A. Num dado instante, um protão viaja a 4,0 mm do fio e a uma velocidade de $1{,}5\times10^{3}$ m/s paralelo ao fio e na mesma direção da corrente. Tal como se representa na figura.`,
    figure: {
      src: 'figures/f3-16.png',
      alt: 'Um fio reto vertical, à esquerda, com a corrente I a apontar para cima (sentido positivo de y). À direita do fio está o protão (carga positiva), com velocidade v vertical a apontar para cima, paralela à corrente e com o mesmo sentido. Os eixos indicados são xx horizontal para a direita e yy vertical para cima; o eixo zz está marcado com uma cruz, ou seja, perpendicular à página e a apontar para dentro.',
    },
    data: [
      { symbol: 'I', value: r`5,0 A (segundo $+y$)` },
      { symbol: 'r', value: r`4,0 mm = $4{,}0\times10^{-3}$ m (protão à direita do fio, lado $+x$)` },
      { symbol: 'v', value: r`$1{,}5\times10^{3}$ m/s (segundo $+y$)` },
      { symbol: 'q', value: r`$+e=1{,}602\times10^{-19}$ C` },
      { symbol: r`\mu_0`, value: r`$4\pi\times10^{-7}$ N/A²` },
    ],
    strategy: r`Três passos encadeados: campo de um fio longo, $B=\mu_0I/(2\pi r)$, com o sentido dado pela mão direita; força magnética $q\,\vec v\times\vec B$ sobre o protão; campo elétrico que anula essa força, $\vec E=-\vec v\times\vec B$, de módulo $vB$.`,
    pitfalls: [
      'Esquecer de converter 4,0 mm para metros.',
      'Pensar que o campo do fio aponta para o fio ou ao longo dele: é tangente a circunferências em torno do fio.',
      'Em c) esquecer que o campo elétrico tem de dar uma força oposta à magnética (carga positiva: E oposto a F magnética).',
    ],
    formulaIds: ['field-wire', 'lorentz-magnetic', 'field-force', 'velocity-selector'],
    parts: [
      {
        label: 'a',
        question: 'Determine a intensidade, direção e sentido do campo magnético criado pelo fio no protão.',
        hint: 'Usa a expressão do campo de um fio reto e longo. Para o sentido, polegar da mão direita na corrente.',
        steps: [
          {
            title: 'Eixos',
            text: r`Usa os eixos da figura: $x$ para a direita e $y$ para cima. Chama $\vec e_z$ ao versor que sai da página (sistema direto); "para dentro da página", que a figura marca com uma cruz, é então $-\vec e_z$.`,
          },
          {
            title: 'Intensidade',
            text: 'Converte a distância para metros.',
            math: r`B=\frac{\mu_0\,I}{2\pi\,r}=\frac{4\pi\times10^{-7}\times5{,}0}{2\pi\times4{,}0\times10^{-3}}=2{,}5\times10^{-4}\ \mathrm{T}=0{,}25\ \mathrm{mT}`,
          },
          {
            title: 'Direção e sentido',
            text: r`Regra da mão direita: polegar segundo a corrente (para cima), os dedos enrolam em torno do fio. À direita do fio, onde está o protão, os dedos entram na página. Por componentes, o campo tem a direção de (versor da corrente) × (versor do fio para o ponto).`,
            math: r`\vec e_y\times\vec e_x=-\vec e_z\quad\Rightarrow\quad\vec B=-2{,}5\times10^{-4}\,\vec e_z\ \mathrm{T}`,
          },
        ],
        answer: r`$B=2{,}5\times10^{-4}$ T = 0,25 mT, perpendicular ao plano da figura, a entrar na página (o sentido marcado com a cruz no eixo zz).`,
        official: 'B = 0,25 mT',
        check: { value: 0.25, unit: 'mT' },
      },
      {
        label: 'b',
        question: 'Determine a intensidade, direção e sentido da força magnética que o campo magnético do fio exerce no protão.',
        hint: r`Calcula $\vec v\times\vec B$ com a velocidade segundo $+y$ e o campo a entrar na página.`,
        steps: [
          {
            title: 'Regra da mão direita',
            text: r`Dedos segundo $\vec v$ (para cima), a rodar para $\vec B$ (para dentro da página): o polegar aponta para a esquerda, $-x$, ou seja, para o fio. O protão é positivo, por isso a força tem esse sentido.`,
          },
          {
            title: 'Produto vetorial por componentes',
            text: r`Com $\vec v=(0;v;0)$ e $\vec B=(0;0;-B)$:`,
            math: r`\vec v\times\vec B=\begin{vmatrix}\vec e_x&\vec e_y&\vec e_z\\0&v&0\\0&0&-B\end{vmatrix}=-vB\,\vec e_x=-1{,}5\times10^{3}\times2{,}5\times10^{-4}\,\vec e_x=-0{,}375\,\vec e_x\ \mathrm{T\,m/s}`,
          },
          {
            title: 'Força',
            text: 'Multiplica pela carga do protão.',
            math: r`\vec F_m=q\,\vec v\times\vec B=1{,}602\times10^{-19}\times(-0{,}375)\,\vec e_x\approx-6{,}0\times10^{-20}\,\vec e_x\ \mathrm{N}`,
          },
          {
            title: 'Verificação',
            text: 'Faz sentido: um protão a mover-se no sentido da corrente é como uma corrente paralela, e correntes paralelas com o mesmo sentido atraem-se.',
          },
        ],
        answer: r`$|\vec F_m|\approx6{,}0\times10^{-20}$ N, segundo $x$, no sentido negativo (dirigida para o fio).`,
        official: '6×10⁻²⁰ N, segundo xx, no sentido negativo, dirigido para o fio',
        check: { value: 6.0e-20, unit: 'N' },
      },
      {
        label: 'c',
        question: 'Determine a intensidade, direção e sentido do campo elétrico necessário para que o protão viaje sempre paralelo ao fio.',
        hint: 'Para o protão seguir em linha reta a força elétrica tem de anular a força magnética.',
        steps: [
          {
            title: 'Condição de equilíbrio',
            text: 'A resultante das forças elétrica e magnética tem de ser nula.',
            math: r`q\,\vec E+q\,\vec v\times\vec B=\vec 0\quad\Rightarrow\quad\vec E=-\vec v\times\vec B`,
          },
          {
            title: 'Campo elétrico',
            text: r`Usa o produto vetorial da alínea b). A carga não entra: o módulo é $E=vB$.`,
            math: r`\vec E=-(-0{,}375\,\vec e_x)=+0{,}375\,\vec e_x\ \mathrm{N/C}\qquad E=v\,B=1{,}5\times10^{3}\times2{,}5\times10^{-4}=0{,}375\ \mathrm{N/C}`,
          },
          {
            title: 'Sentido',
            text: r`A força magnética puxa o protão para o fio ($-x$). A força elétrica tem de apontar para $+x$ e, como a carga é positiva, o campo elétrico também: afasta-se do fio. Enquanto o protão se mantiver a 4,0 mm do fio, $B$ não muda e o equilíbrio mantém-se.`,
          },
        ],
        answer: r`$E=0{,}375$ N/C, segundo $x$, no sentido positivo (a afastar-se do fio, contrário à força magnética).`,
        official: '0,375 N/C, segundo xx no sentido (+), no sentido contrário da força magnética.',
        check: { value: 0.375, unit: 'N/C' },
      },
    ],
    note: 'Na figura o eixo zz está marcado com uma cruz (para dentro da página), que é o sentido do campo magnético do fio no ponto onde está o protão. Na resolução usa-se um sistema direto com z a sair da página, por isso esse sentido escreve-se −e_z.',
    labs: [
      { family: 'magnetic_particles', scenario: 'wire', label: 'Ver o campo do fio e a força no protão', coverage: 'direct', params: { I: '5', r: '0.004', v: '1500' } },
    ],
  },
]
