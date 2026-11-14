import type { StudyExercise } from '../../domain/study'

const r = String.raw

/** Ficha 3 — exercícios 7 a 11. */
export const folha3b: StudyExercise[] = [
  {
    id: 'f3-07',
    source: { kind: 'sheet', sheet: 3, number: 7 },
    title: 'Espira quadrada que acende uma lâmpada',
    familyIds: ['induction_sources'],
    difficulty: 2,
    statement: 'Qual a velocidade com que a espira quadrada (de resistência desprezável) de lado igual a 25,0 cm tem de se mover, para que a lâmpada de 3 V acenda? O campo magnético tem uma intensidade de 1,2 T e é perpendicular ao plano da espira.',
    figure: {
      src: 'figures/f3-07.png',
      alt: 'Uma espira quadrada no plano da página com uma lâmpada ligada no seu lado esquerdo. Uma seta v indica que a espira se move para a direita. À direita existe uma região sombreada com cruzes, identificada como B in: campo magnético uniforme a entrar na página. A espira está a entrar nessa região: só o lado direito (vertical) e uma pequena parte dos lados de cima e de baixo já estão dentro do campo; o resto da espira e a lâmpada estão fora.',
    },
    data: [
      { symbol: 'l', value: '25,0 cm = 0,250 m (lado da espira)' },
      { symbol: r`\mathcal E`, value: '3 V (tensão necessária para a lâmpada acender)' },
      { symbol: 'B', value: '1,2 T, perpendicular ao plano da espira (a entrar na página)' },
    ],
    strategy: r`Espira a entrar num campo uniforme: a área dentro do campo cresce com a velocidade e a força eletromotriz induzida é $\mathcal E=B\,l\,v$ (FEM de movimento). Impõe $\mathcal E=3$ V e resolve em ordem a $v$.`,
    pitfalls: [
      'Só há FEM enquanto a espira está a entrar (ou a sair) do campo; totalmente dentro, o fluxo é constante e a lâmpada apaga.',
      'O comprimento que conta é o do lado perpendicular à velocidade (0,250 m), em metros.',
    ],
    formulaIds: ['magnetic-flux', 'faraday', 'motional-emf'],
    parts: [
      {
        label: '',
        question: 'Qual a velocidade com que a espira tem de se mover para que a lâmpada de 3 V acenda?',
        hint: 'Escreve o fluxo através da parte da espira que já está dentro do campo e vê como varia quando a espira avança.',
        steps: [
          {
            title: 'Ler a figura',
            text: r`A espira move-se para a direita e está a entrar na região do campo. Se $x$ for o comprimento da espira que já está dentro do campo, a área atravessada pelo campo é $l\,x$ e cresce à taxa $dx/dt=v$.`,
          },
          {
            title: 'Lei de Faraday',
            text: 'O campo é perpendicular ao plano da espira (cosseno igual a 1). Em módulo:',
            math: r`\Phi=B\,l\,x\quad\Rightarrow\quad|\mathcal E|=\left|\frac{d\Phi}{dt}\right|=B\,l\,\frac{dx}{dt}=B\,l\,v`,
          },
          {
            title: 'Velocidade necessária',
            text: 'A espira tem resistência desprezável, por isso toda a força eletromotriz aparece aos terminais da lâmpada: tem de valer 3 V.',
            math: r`v=\frac{\mathcal E}{B\,l}=\frac{3}{1{,}2\times0{,}250}=10\ \mathrm{m/s}`,
          },
          {
            title: 'Sentido da corrente (Lenz)',
            text: r`O fluxo a entrar na página está a aumentar, por isso a corrente induzida cria um campo a sair da página: circula no sentido anti-horário. Confirma com a força nas cargas do lado direito: $\vec v\times\vec B=\vec e_x\times(-\vec e_z)=+\vec e_y$, a corrente sobe nesse lado.`,
          },
        ],
        answer: r`$v=10$ m/s (enquanto a espira está a entrar no campo)`,
        official: 'v = 10 m/s',
        check: { value: 10, unit: 'm/s' },
      },
    ],
    labs: [
      { family: 'induction_sources', scenario: 'motional', label: 'Ver a FEM de movimento', coverage: 'direct', params: { B: '1.2', l: '0.25', v: '10' } },
    ],
  },
  {
    id: 'f3-08',
    source: { kind: 'sheet', sheet: 3, number: 8 },
    title: 'Espira a rodar num campo magnético (gerador)',
    familyIds: ['induction_sources'],
    difficulty: 2,
    statement: 'A lei de Faraday está na base de uma revolução tecnológica profunda: a capacidade de produzir energia elétrica a partir de outras formas de energia (carvão, petróleo, núcleo atómico de urânio...). Consideremos o seguinte exemplo: uma espira circular de raio igual a 11,0 cm, e de resistência 10 Ω, está mergulhada num campo magnético de intensidade B = 0,63 T. A espira roda com uma velocidade angular de 250 rad s⁻¹. Qual a tensão e a corrente induzida?',
    data: [
      { symbol: 'r', value: '11,0 cm = 0,110 m' },
      { symbol: 'R', value: '10 Ω' },
      { symbol: 'B', value: '0,63 T' },
      { symbol: r`\omega`, value: '250 rad/s' },
    ],
    strategy: r`Espira a rodar num campo uniforme: o ângulo entre $\vec B$ e a normal à espira é $\theta=\omega t$, o fluxo é $\Phi=BA\cos(\omega t)$ e a lei de Faraday dá uma tensão sinusoidal de amplitude $BA\omega$. A corrente vem da lei de Ohm.`,
    pitfalls: [
      'Dar só um número: a tensão e a corrente variam no tempo, a resposta é uma função sinusoidal.',
      'Esquecer o fator ω que aparece ao derivar o cosseno.',
      'Usar o raio em centímetros no cálculo da área.',
    ],
    formulaIds: ['magnetic-flux', 'faraday', 'generator-emf', 'ohm'],
    parts: [
      {
        label: '',
        question: 'Qual a tensão e a corrente induzida?',
        hint: 'Escreve o fluxo em função do tempo, com o ângulo entre o campo e a normal a crescer como ωt, e deriva.',
        steps: [
          {
            title: 'Área da espira',
            text: 'Converte o raio para metros.',
            math: r`A=\pi r^2=\pi\times(0{,}110)^2\approx3{,}80\times10^{-2}\ \mathrm{m^2}`,
          },
          {
            title: 'Fluxo em função do tempo',
            text: r`A espira roda em torno de um diâmetro perpendicular ao campo. Conta o tempo a partir do instante em que o plano da espira é perpendicular a $\vec B$ (fluxo máximo): o ângulo entre $\vec B$ e a normal é $\theta=\omega t$.`,
            math: r`\Phi(t)=B\,A\cos(\omega t)`,
          },
          {
            title: 'Lei de Faraday',
            text: 'Deriva o fluxo. A amplitude da tensão é o produto B·A·ω.',
            math: r`\mathcal E(t)=-\frac{d\Phi}{dt}=B\,A\,\omega\sin(\omega t)\qquad\mathcal E_{max}=0{,}63\times3{,}80\times10^{-2}\times250\approx6{,}0\ \mathrm{V}`,
          },
          {
            title: 'Corrente induzida',
            text: 'A espira é um circuito com resistência de 10 Ω: aplica a lei de Ohm em cada instante.',
            math: r`i(t)=\frac{\mathcal E(t)}{R}\qquad i_{max}=\frac{6{,}0}{10}=0{,}60\ \mathrm{A}`,
          },
          {
            title: 'Funções do tempo',
            text: r`Tensão e corrente estão em fase e têm período $T=2\pi/\omega\approx25$ ms (frequência de cerca de 40 Hz).`,
            math: r`\mathcal E(t)=6{,}0\sin(250\,t)\ \mathrm{(V)}\qquad i(t)=0{,}60\sin(250\,t)\ \mathrm{(A)}`,
          },
        ],
        answer: r`$\mathcal E(t)\approx6{,}0\sin(250\,t)$ V e $i(t)\approx0{,}60\sin(250\,t)$ A, com $t$ em segundos (amplitudes 6,0 V e 0,60 A)`,
        official: 'Vε(t) = 6sen250t (V); i(t) = 0,6sen250t (A)',
        check: { value: 5.99, unit: 'V (amplitude)' },
      },
    ],
    note: 'O enunciado não diz em torno de que eixo roda a espira nem a posição inicial. Assume-se rotação em torno de um diâmetro perpendicular ao campo e t = 0 com o plano da espira perpendicular a B; com outra posição inicial muda apenas a fase (por exemplo, um cosseno em vez de um seno).',
    labs: [
      { family: 'induction_sources', scenario: 'generator', label: 'Ver o fluxo, a tensão e a corrente a oscilar', coverage: 'direct', params: { B: '0.63', r: '0.11', N: '1', w: '250', R: '10' } },
    ],
  },
  {
    id: 'f3-09',
    source: { kind: 'sheet', sheet: 3, number: 9 },
    title: 'Protão num campo magnético uniforme',
    familyIds: ['magnetic_particles'],
    difficulty: 2,
    statement: r`Um protão é lançado num campo magnético uniforme, $\vec B=2{,}0\times10^{-2}\,\vec e_y$ Tesla, com uma velocidade, $\vec v=3{,}0\times10^{5}\,\vec e_x$ m/s, perpendicular ao campo. Determine:`,
    data: [
      { symbol: r`\vec B`, value: r`$2{,}0\times10^{-2}\,\vec e_y$ T` },
      { symbol: r`\vec v`, value: r`$3{,}0\times10^{5}\,\vec e_x$ m/s` },
      { symbol: 'q', value: r`$+e=1{,}602\times10^{-19}$ C` },
      { symbol: 'm_p', value: r`$1{,}673\times10^{-27}$ kg` },
    ],
    strategy: r`Carga lançada perpendicularmente a um campo uniforme: a força $q\,\vec v\times\vec B$ é sempre perpendicular à velocidade, a trajetória é circular (aqui no plano $xz$), o módulo da velocidade não muda e a força não realiza trabalho.`,
    pitfalls: [
      'Trocar a ordem do produto vetorial: v × B, não B × v (troca o sinal).',
      'Meia circunferência demora meio período, não o período inteiro.',
      'A força magnética muda a direção da velocidade, mas não o seu módulo: a energia cinética mantém-se.',
    ],
    formulaIds: ['lorentz-magnetic', 'centripetal', 'cyclotron-radius', 'cyclotron-period', 'kinetic-energy', 'work-force'],
    parts: [
      {
        label: 'a',
        question: r`A força magnética, $\vec F_m$, que atua no protão, no momento em que entra no campo.`,
        hint: r`Calcula $\vec v\times\vec B$ com o determinante e multiplica pela carga do protão (positiva).`,
        steps: [
          {
            title: 'Regra da mão direita',
            text: r`Dedos segundo $\vec v$ ($+x$), a rodar para $\vec B$ ($+y$): o polegar aponta para $+z$. A carga é positiva, logo a força tem esse sentido.`,
          },
          {
            title: 'Produto vetorial por componentes',
            text: r`Com $\vec v=(v;0;0)$ e $\vec B=(0;B;0)$ só sobra a componente $z$.`,
            math: r`\vec v\times\vec B=\begin{vmatrix}\vec e_x&\vec e_y&\vec e_z\\v&0&0\\0&B&0\end{vmatrix}=vB\,\vec e_z=3{,}0\times10^{5}\times2{,}0\times10^{-2}\,\vec e_z=6{,}0\times10^{3}\,\vec e_z\ \mathrm{T\,m/s}`,
          },
          {
            title: 'Força',
            text: 'Multiplica pela carga do protão.',
            math: r`\vec F_m=q\,\vec v\times\vec B=1{,}602\times10^{-19}\times6{,}0\times10^{3}\,\vec e_z\approx9{,}6\times10^{-16}\,\vec e_z\ \mathrm{N}`,
          },
        ],
        answer: r`$\vec F_m\approx9{,}6\times10^{-16}\,\vec e_z$ N (módulo $9{,}6\times10^{-16}$ N, segundo $+z$)`,
        official: 'Fm = 9,6×10⁻¹⁶ e_z (N)',
        check: { value: 9.61e-16, unit: 'N (componente z)' },
      },
      {
        label: 'b',
        question: 'O raio da trajetória.',
        hint: 'A força magnética faz de força centrípeta.',
        steps: [
          {
            title: 'Força magnética = força centrípeta',
            text: r`A força é perpendicular à velocidade e tem módulo constante: o protão descreve uma circunferência no plano $xz$ (perpendicular a $\vec B$).`,
            math: r`|q|\,v\,B=\frac{m\,v^2}{r}\quad\Rightarrow\quad r=\frac{m\,v}{|q|\,B}`,
          },
          {
            title: 'Substituição',
            text: 'Usa a massa do protão do formulário.',
            math: r`r=\frac{1{,}673\times10^{-27}\times3{,}0\times10^{5}}{1{,}602\times10^{-19}\times2{,}0\times10^{-2}}\approx0{,}157\ \mathrm{m}\approx1{,}6\times10^{-1}\ \mathrm{m}`,
          },
        ],
        answer: r`$r\approx0{,}16$ m (15,7 cm)`,
        official: 'r = 1,6×10⁻¹ m',
        check: { value: 0.157, unit: 'm' },
      },
      {
        label: 'c',
        question: 'O tempo de permanência do protão no campo, sabendo que descreve uma trajetória semicircular até abandonar o campo.',
        hint: 'Meia circunferência tem comprimento πr e é percorrida com velocidade de módulo constante.',
        steps: [
          {
            title: 'Meia volta',
            text: 'O módulo da velocidade é constante, por isso o tempo é a distância percorrida a dividir pela velocidade. É metade do período.',
            math: r`t=\frac{\pi\,r}{v}=\frac{T}{2}=\frac{\pi\,m}{|q|\,B}`,
          },
          {
            title: 'Substituição',
            text: 'Com o raio da alínea b):',
            math: r`t=\frac{\pi\times0{,}157}{3{,}0\times10^{5}}\approx1{,}6\times10^{-6}\ \mathrm{s}`,
          },
          {
            title: 'Comparação com a ficha',
            text: r`A ficha indica $3{,}3\times10^{-6}$ s, que é o período completo $T=2\pi m/(|q|B)$, ou seja, o tempo de uma volta inteira. Para a meia volta descrita no enunciado o tempo é metade.`,
            math: r`T=\frac{2\pi\,m}{|q|\,B}=\frac{2\pi\times1{,}673\times10^{-27}}{1{,}602\times10^{-19}\times2{,}0\times10^{-2}}\approx3{,}3\times10^{-6}\ \mathrm{s}`,
          },
        ],
        answer: r`$t=T/2\approx1{,}6\times10^{-6}$ s (a ficha indica $3{,}3\times10^{-6}$ s, que é o período de uma volta completa)`,
        official: 't = 3,3×10⁻⁶ s',
        check: { value: 1.64e-6, unit: 's' },
      },
      {
        label: 'd',
        question: 'A energia cinética da partícula no instante em que abandona o campo.',
        hint: 'O que acontece ao módulo da velocidade quando a única força é perpendicular à velocidade?',
        steps: [
          {
            title: 'Velocidade à saída',
            text: r`A força magnética só muda a direção da velocidade. À saída o protão tem $\vec v=-3{,}0\times10^{5}\,\vec e_x$ m/s: mesmo módulo, sentido contrário.`,
          },
          {
            title: 'Energia cinética',
            text: 'É igual à energia cinética de entrada.',
            math: r`E_c=\tfrac12\,m\,v^2=\tfrac12\times1{,}673\times10^{-27}\times(3{,}0\times10^{5})^2\approx7{,}5\times10^{-17}\ \mathrm{J}`,
          },
        ],
        answer: r`$E_c\approx7{,}5\times10^{-17}$ J`,
        official: 'Ec = 7,5×10⁻¹⁷ J',
        check: { value: 7.53e-17, unit: 'J' },
      },
      {
        label: 'e',
        question: 'O trabalho realizado pela força magnética desde que a partícula entra no campo até que o abandona.',
        hint: 'Compara a direção da força com a direção do deslocamento em cada instante.',
        steps: [
          {
            title: 'Força perpendicular ao deslocamento',
            text: r`$\vec F_m=q\,\vec v\times\vec B$ é sempre perpendicular a $\vec v$, logo perpendicular a cada pequeno deslocamento: $\cos90^\circ=0$ e o trabalho é nulo.`,
            math: r`W=\int\vec F_m\cdot d\vec r=0\ \mathrm{J}`,
          },
          {
            title: 'Verificação pela energia',
            text: 'O trabalho da força resultante é a variação da energia cinética, que na alínea d) viste que é zero.',
            math: r`W=\Delta E_c=0\ \mathrm{J}`,
          },
        ],
        answer: r`$W=0$ J (a força magnética nunca realiza trabalho)`,
        official: 'W = 0 J',
        check: { value: 0, unit: 'J' },
      },
    ],
    note: 'Na alínea c) a solução impressa (3,3×10⁻⁶ s) é o período de uma volta completa. Para a trajetória semicircular do enunciado o tempo é metade: 1,6×10⁻⁶ s.',
    labs: [
      { family: 'magnetic_particles', scenario: 'vectors', label: 'Ver v, B e a força no protão', coverage: 'direct', params: { v: '3e5,0,0', B: '0,0.02,0', q: '1.602e-19', m: '1.673e-27' } },
      { family: 'magnetic_particles', scenario: 'orbit', label: 'Ver a meia volta do protão', coverage: 'direct', params: { m: '1.673e-27', q: '1.602e-19', v: '3e5', B: '0.02', arc: 'half' } },
    ],
  },
  {
    id: 'f3-10',
    source: { kind: 'sheet', sheet: 3, number: 10 },
    title: 'Partícula em campos elétrico e magnético cruzados',
    familyIds: ['magnetic_particles'],
    difficulty: 3,
    statement: r`Uma partícula com carga (+) $3{,}0\times10^{-11}$ C desloca-se com velocidade $\vec v=2{,}0\times10^{6}\,\vec e_y$ m/s, numa região do espaço onde existe um campo magnético $\vec B=2{,}0\times10^{-2}\,\vec e_x$ T e um campo elétrico, $\vec E=4{,}0\times10^{3}\,\vec e_z$ V/m. Calcule:`,
    data: [
      { symbol: 'q', value: r`$+3{,}0\times10^{-11}$ C` },
      { symbol: r`\vec v`, value: r`$2{,}0\times10^{6}\,\vec e_y$ m/s` },
      { symbol: r`\vec B`, value: r`$2{,}0\times10^{-2}\,\vec e_x$ T` },
      { symbol: r`\vec E`, value: r`$4{,}0\times10^{3}\,\vec e_z$ V/m` },
    ],
    strategy: r`Força de Lorentz: soma vetorial da força elétrica $q\vec E$ com a magnética $q\,\vec v\times\vec B$. Para não haver desvio a resultante tem de ser nula, o que dá a condição do seletor de velocidades, $v=E/B$.`,
    pitfalls: [
      'Somar os módulos das duas forças: aqui têm sentidos opostos e subtraem-se.',
      'Trocar a ordem no produto vetorial: e_y × e_x = −e_z.',
      'Uma velocidade paralela a B não produz força magnética, por isso não pode compensar a força elétrica.',
    ],
    formulaIds: ['field-force', 'lorentz-magnetic', 'lorentz-total', 'velocity-selector', 'newton-second'],
    parts: [
      {
        label: 'a',
        question: 'A força eletromagnética que atua sobre a partícula.',
        hint: 'Calcula separadamente a força elétrica e a força magnética (com o determinante) e soma-as componente a componente.',
        steps: [
          {
            title: 'Força elétrica',
            text: r`Carga positiva: a força elétrica tem o sentido do campo, $+z$.`,
            math: r`\vec F_e=q\,\vec E=3{,}0\times10^{-11}\times4{,}0\times10^{3}\,\vec e_z=+1{,}2\times10^{-7}\,\vec e_z\ \mathrm{N}`,
          },
          {
            title: 'Produto vetorial',
            text: r`Regra da mão direita: dedos segundo $\vec v$ ($+y$), a rodar para $\vec B$ ($+x$): o polegar aponta para $-z$. O determinante confirma.`,
            math: r`\vec v\times\vec B=\begin{vmatrix}\vec e_x&\vec e_y&\vec e_z\\0&v&0\\B&0&0\end{vmatrix}=-vB\,\vec e_z=-2{,}0\times10^{6}\times2{,}0\times10^{-2}\,\vec e_z=-4{,}0\times10^{4}\,\vec e_z\ \mathrm{T\,m/s}`,
          },
          {
            title: 'Força magnética',
            text: 'A carga é positiva, por isso a força mantém o sentido do produto vetorial.',
            math: r`\vec F_m=q\,\vec v\times\vec B=3{,}0\times10^{-11}\times(-4{,}0\times10^{4})\,\vec e_z=-1{,}2\times10^{-6}\,\vec e_z\ \mathrm{N}`,
          },
          {
            title: 'Soma vetorial',
            text: 'As duas forças estão no eixo z com sentidos opostos. A magnética é dez vezes maior.',
            math: r`\vec F_{em}=\vec F_e+\vec F_m=(1{,}2\times10^{-7}-1{,}2\times10^{-6})\,\vec e_z=-1{,}08\times10^{-6}\,\vec e_z\approx-1{,}1\times10^{-6}\,\vec e_z\ \mathrm{N}`,
          },
        ],
        answer: r`$\vec F_{em}\approx-1{,}1\times10^{-6}\,\vec e_z$ N`,
        official: 'Fem = −1,1×10⁻⁶ e_z (N)',
        check: { value: -1.08e-6, unit: 'N (componente z)' },
      },
      {
        label: 'b',
        question: 'A velocidade com que deveria ser lançada a partícula para não sofrer desvio na sua trajetória.',
        hint: 'Sem desvio significa força resultante nula: a força magnética tem de ser simétrica da força elétrica.',
        steps: [
          {
            title: 'Condição de não desvio',
            text: r`A resultante tem de ser nula. A força elétrica aponta para $+z$, logo a magnética tem de apontar para $-z$, como acontece com a velocidade segundo $+y$.`,
            math: r`q\,\vec E+q\,\vec v\times\vec B=\vec 0\quad\Rightarrow\quad\vec v\times\vec B=-\vec E`,
          },
          {
            title: 'Módulo da velocidade',
            text: r`Com $\vec v=v\,\vec e_y$ tens $\vec v\times\vec B=-vB\,\vec e_z$. Igualando a $-E\,\vec e_z$:`,
            math: r`vB=E\quad\Rightarrow\quad v=\frac{E}{B}=\frac{4{,}0\times10^{3}}{2{,}0\times10^{-2}}=2{,}0\times10^{5}\ \mathrm{m/s}`,
          },
          {
            title: 'Direção e sentido',
            text: r`A partícula tem de continuar a deslocar-se segundo $+\vec e_y$, mas dez vezes mais devagar do que no enunciado. Em geral, a condição $\vec v\times\vec B=-\vec E$ obriga a $v_y=E/B$ e $v_z=0$; uma componente $v_x$ (paralela a $\vec B$) não altera a força.`,
            math: r`\vec v=2{,}0\times10^{5}\,\vec e_y\ \mathrm{m/s}`,
          },
          {
            title: 'Comparação com a ficha',
            text: r`A ficha imprime $2{,}0\times10^{5}\,\vec e_x$. O módulo coincide, mas a direção $\vec e_x$ não pode estar certa: uma velocidade paralela a $\vec B$ dá força magnética nula e a força elétrica ($1{,}2\times10^{-7}$ N segundo $+z$) ficava por compensar.`,
          },
        ],
        answer: r`$\vec v=2{,}0\times10^{5}\,\vec e_y$ m/s (módulo $E/B$; a ficha imprime a direção $\vec e_x$, que parece gralha)`,
        official: 'v = 2,0×10⁵ e_x (m/s)',
        check: { value: 2.0e5, unit: 'm/s' },
      },
      {
        label: 'c',
        question: 'Caracterize o movimento da partícula para o caso da alínea anterior.',
        hint: 'Se a força resultante é nula, o que diz a 2.ª lei de Newton sobre a aceleração?',
        steps: [
          {
            title: 'Resultante nula',
            text: r`Com $v=E/B$ a força elétrica ($+z$) e a força magnética ($-z$) anulam-se: $\vec a=\vec 0$.`,
            math: r`\vec F_{em}=q\,(E-vB)\,\vec e_z=\vec 0\quad\Rightarrow\quad\vec a=\frac{\vec F_{em}}{m}=\vec 0`,
          },
          {
            title: 'Tipo de movimento',
            text: r`Sem aceleração, a velocidade mantém módulo, direção e sentido: movimento retilíneo uniforme segundo $y$, com $v=2{,}0\times10^{5}$ m/s. É o princípio do seletor de velocidades: partículas mais rápidas desviam-se para $-z$ (ganha a força magnética) e as mais lentas para $+z$ (ganha a elétrica).`,
          },
        ],
        answer: r`Movimento retilíneo uniforme segundo o eixo $y$, com velocidade constante de $2{,}0\times10^{5}$ m/s (força resultante nula).`,
      },
    ],
    note: 'Na alínea b) a solução impressa indica a direção e_x. O módulo (2,0×10⁵ m/s) está certo, mas a direção tem de ser e_y: com a velocidade segundo x (paralela a B) a força magnética é nula e a partícula é desviada pelo campo elétrico. Deve ser gralha da ficha.',
    labs: [
      { family: 'magnetic_particles', scenario: 'vectors', label: 'Ver as forças elétrica e magnética', coverage: 'direct', params: { v: '0,2e6,0', B: '0.02,0,0', E: '0,0,4000', q: '3e-11' } },
      { family: 'magnetic_particles', scenario: 'selector', label: 'Ver o seletor de velocidades', coverage: 'direct', params: { E: '4000', B: '0.02', v: '2e5', q: '1' } },
    ],
  },
  {
    id: 'f3-11',
    source: { kind: 'sheet', sheet: 3, number: 11 },
    title: 'Transformador de 8,5 kV para 120 V',
    familyIds: ['induction_sources'],
    difficulty: 2,
    statement: 'Um transformador (ideal) opera a 8,5 kV no circuito primário e fornece uma tensão no circuito secundário de 120 V (valores eficazes) a uma série de equipamentos.',
    data: [
      { symbol: 'V_P', value: r`8,5 kV = $8{,}5\times10^{3}$ V (eficaz)` },
      { symbol: 'V_S', value: '120 V (eficaz)' },
      { symbol: 'P', value: r`78 kW = $7{,}8\times10^{4}$ W` },
    ],
    strategy: 'Transformador ideal: a razão das tensões é a razão do número de espiras e a potência no primário é igual à do secundário. As correntes saem de P = VI e as resistências da lei de Ohm em cada lado.',
    pitfalls: [
      'Trocar a razão: a corrente é maior no lado de menor tensão (secundário).',
      'Usar kV e kW sem converter para V e W.',
      'A resistência vista do primário não é igual à da carga: fica multiplicada pelo quadrado da razão de espiras.',
    ],
    formulaIds: ['transformer-voltage', 'transformer-current', 'power-electric', 'ohm'],
    parts: [
      {
        label: 'a',
        question: 'Qual a razão entre o número de espiras no primário e no secundário?',
        hint: 'Num transformador ideal a razão de espiras é igual à razão das tensões.',
        steps: [
          {
            title: 'Razão de transformação',
            text: 'Converte a tensão do primário para volt e divide.',
            math: r`\frac{N_P}{N_S}=\frac{V_P}{V_S}=\frac{8{,}5\times10^{3}}{120}\approx70{,}8\approx71`,
          },
          {
            title: 'Leitura do resultado',
            text: 'O primário tem cerca de 71 vezes mais espiras do que o secundário: é um transformador abaixador de tensão.',
          },
        ],
        answer: r`$N_P/N_S\approx71$`,
        official: '71',
        check: { value: 70.8, unit: 'sem unidade' },
      },
      {
        label: 'b',
        question: 'A taxa de consumo de energia numa habitação é 78 kW. Qual a corrente (eficaz) no circuito primário e secundário?',
        hint: 'Transformador ideal: a potência que entra no primário é a que sai no secundário. Usa P = VI em cada lado.',
        steps: [
          {
            title: 'Conservação da potência',
            text: 'Sem perdas, os 78 kW consumidos no secundário são fornecidos ao primário.',
            math: r`P_P=P_S=V_P\,i_P=V_S\,i_S=7{,}8\times10^{4}\ \mathrm{W}`,
          },
          {
            title: 'Corrente no primário',
            text: 'Tensão alta, corrente baixa.',
            math: r`i_P=\frac{P}{V_P}=\frac{7{,}8\times10^{4}}{8{,}5\times10^{3}}\approx9{,}2\ \mathrm{A}`,
          },
          {
            title: 'Corrente no secundário',
            text: 'Tensão baixa, corrente alta.',
            math: r`i_S=\frac{P}{V_S}=\frac{7{,}8\times10^{4}}{120}=650\ \mathrm{A}`,
          },
          {
            title: 'Verificação',
            text: 'A razão das correntes tem de ser o inverso da razão de espiras.',
            math: r`\frac{i_S}{i_P}=\frac{650}{9{,}18}\approx70{,}8=\frac{N_P}{N_S}`,
          },
        ],
        answer: r`$i_P\approx9{,}2$ A e $i_S=650$ A`,
        official: 'ip = 9,2 A, is = 650 A',
        check: { value: 9.18, unit: 'A (primário)' },
      },
      {
        label: 'c',
        question: 'Qual a resistência da carga no circuito secundário e no primário?',
        hint: 'Aplica a lei de Ohm em cada lado, com a tensão e a corrente desse lado.',
        steps: [
          {
            title: 'Resistência no secundário',
            text: 'É a resistência equivalente dos equipamentos ligados.',
            math: r`R_S=\frac{V_S}{i_S}=\frac{120}{650}\approx0{,}18\ \Omega`,
          },
          {
            title: 'Resistência vista do primário',
            text: 'É a resistência que a rede "vê" aos terminais do primário.',
            math: r`R_P=\frac{V_P}{i_P}=\frac{8{,}5\times10^{3}}{9{,}18}\approx926\ \Omega\approx9{,}3\times10^{2}\ \Omega`,
          },
          {
            title: 'Verificação',
            text: 'A resistência vista do primário é a da carga multiplicada pelo quadrado da razão de espiras.',
            math: r`R_P=\left(\frac{N_P}{N_S}\right)^2R_S=(70{,}8)^2\times0{,}185\approx926\ \Omega`,
          },
        ],
        answer: r`$R_S\approx0{,}18\ \Omega$ e $R_P\approx9{,}3\times10^{2}\ \Omega$ (926 Ω)`,
        official: 'Rp = 930 Ω, Rs = 0,18 Ω',
        check: { value: 0.185, unit: 'Ω (secundário)' },
      },
    ],
    labs: [
      { family: 'induction_sources', scenario: 'transformer', label: 'Ver tensões, correntes e resistências no transformador', coverage: 'direct', params: { vp: '8500', vs: '120', P: '78000' } },
    ],
  },
]
