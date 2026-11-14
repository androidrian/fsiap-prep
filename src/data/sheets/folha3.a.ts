import type { StudyExercise } from '../../domain/study'

const r = String.raw

/** Ficha 3 — exercícios 1 a 6. */
export const folha3a: StudyExercise[] = [
  {
    id: 'f3-01',
    source: { kind: 'sheet', sheet: 3, number: 1 },
    title: 'Espectrómetro de massa',
    familyIds: ['magnetic_particles'],
    difficulty: 2,
    statement: r`Na figura representa-se esquematicamente um espectrómetro de massa, um dispositivo que é utilizado para determinar a massa de um ião. Neste dispositivo um ião monopositivo (carga igual a $1{,}6022\times10^{-19}$ C) vai ser acelerado devido a um campo elétrico até atingir uma velocidade igual a 30,761722 km s⁻¹ antes de entrar numa região do espaço onde existe um campo magnético uniforme de intensidade igual a 80,000 mT, cujo sentido e direção são indicados na figura.`,
    figure: {
      src: 'figures/f3-01.png',
      alt: 'Esquema de um espectrómetro de massa. Em baixo, uma fonte S emite iões de carga +q que sobem na vertical, acelerados por uma fonte de tensão V, e entram por uma fenda numa câmara retangular. Dentro da câmara o campo magnético B é uniforme e perpendicular ao plano da figura, a apontar para fora da página (representado por pontos). O ião descreve meia circunferência de raio r, a curvar para a direita (sentido dos ponteiros do relógio), e bate numa placa detetora na parede de baixo da câmara. A distância x mede-se na horizontal entre a fenda de entrada e o ponto de impacto, ou seja, x é o diâmetro da trajetória (x = 2r).',
    },
    data: [
      { symbol: 'q', value: r`$+1{,}6022\times10^{-19}$ C` },
      { symbol: 'v', value: r`30,761722 km/s = $3{,}0761722\times10^{4}$ m/s` },
      { symbol: 'B', value: r`80,000 mT = $8{,}0000\times10^{-2}$ T, a sair da página` },
      { symbol: 'x', value: r`1,6254 m (diâmetro da trajetória)` },
      { symbol: r`1\ \mathrm{u.m.a.}`, value: r`$1{,}6605\times10^{-27}$ kg` },
    ],
    strategy: r`Carga lançada perpendicularmente a um campo magnético uniforme: a força magnética $qvB$ faz de força centrípeta e a trajetória é circular. A força sai de $q\,\vec v\times\vec B$; a massa sai de $qvB=mv^2/r$ com $r=x/2$.`,
    pitfalls: [
      'A distância x é o diâmetro da meia circunferência, não o raio.',
      'Converter km/s para m/s e mT para T antes de multiplicar.',
      'Os pontos na figura significam campo a sair da página; cruzes seriam campo a entrar.',
    ],
    formulaIds: ['lorentz-magnetic', 'centripetal', 'cyclotron-radius'],
    parts: [
      {
        label: 'a',
        question: 'Determine a intensidade, direção e sentido da força que vai atuar no ião quando sujeito ao campo magnético B.',
        hint: r`A velocidade é perpendicular ao campo, por isso $\sin\theta=1$. Para o sentido, escolhe eixos e calcula $\vec v\times\vec B$.`,
        steps: [
          {
            title: 'Dados em SI e eixos',
            text: r`Usa $x$ para a direita, $y$ para cima e $z$ para fora da página. O ião entra a subir, $\vec v=v\,\vec e_y$, e os pontos indicam campo a sair da página, $\vec B=B\,\vec e_z$.`,
            math: r`v=3{,}0761722\times10^{4}\ \mathrm{m/s}\qquad B=8{,}0000\times10^{-2}\ \mathrm{T}\qquad q=1{,}6022\times10^{-19}\ \mathrm{C}`,
          },
          {
            title: 'Intensidade',
            text: r`Como $\vec v\perp\vec B$, o ângulo é 90° e $\sin\theta=1$.`,
            math: r`|\vec F_m|=|q|\,v\,B=1{,}6022\times10^{-19}\times3{,}0761722\times10^{4}\times8{,}0000\times10^{-2}\approx3{,}9429\times10^{-16}\ \mathrm{N}`,
          },
          {
            title: 'Regra da mão direita',
            text: r`Aponta os dedos da mão direita segundo $\vec v$ (para cima) e roda-os para $\vec B$ (para fora da página): o polegar fica a apontar para a direita. A carga é positiva, por isso a força tem o sentido de $\vec v\times\vec B$.`,
          },
          {
            title: 'Produto vetorial por componentes',
            text: r`O determinante confirma: só sobra a componente $x$, positiva.`,
            math: r`\vec v\times\vec B=\begin{vmatrix}\vec e_x&\vec e_y&\vec e_z\\0&v&0\\0&0&B\end{vmatrix}=vB\,\vec e_x\quad\Rightarrow\quad\vec F_m=q\,vB\,\vec e_x=+3{,}9429\times10^{-16}\,\vec e_x\ \mathrm{N}`,
          },
          {
            title: 'Verificação',
            text: 'A força aponta para o lado da placa detetora, o que bate certo com a trajetória desenhada (curva para a direita). Ao longo da trajetória a força roda com a velocidade e aponta sempre para o centro da circunferência.',
          },
        ],
        answer: r`$|\vec F_m|\approx3{,}9429\times10^{-16}$ N, no plano da figura, perpendicular à velocidade e a apontar para o centro da trajetória (à entrada: horizontal, para a direita).`,
        official: '|Fm| = 3,9429×10⁻¹⁶ N',
        check: { value: 3.9429e-16, unit: 'N' },
      },
      {
        label: 'b',
        question: 'Sabendo que a distância x é igual a 1,6254 m, qual a massa do ião? Represente o resultado em unidades de massa atómica (Nota: 1 u.m.a. = 1,6605×10⁻²⁷ kg).',
        hint: 'O ião entra pela fenda e bate na placa depois de meia volta. O que é x em relação ao raio? Depois iguala a força magnética à força centrípeta.',
        steps: [
          {
            title: 'Raio da trajetória',
            text: r`Entre a fenda e o ponto de impacto o ião descreve meia circunferência, por isso $x$ é o diâmetro.`,
            math: r`r=\frac{x}{2}=\frac{1{,}6254}{2}=0{,}8127\ \mathrm{m}`,
          },
          {
            title: 'Força magnética = força centrípeta',
            text: 'A força magnética é a única força relevante e é sempre perpendicular à velocidade: o movimento é circular uniforme.',
            math: r`|q|\,v\,B=\frac{m\,v^2}{r}\quad\Rightarrow\quad m=\frac{|q|\,B\,r}{v}`,
          },
          {
            title: 'Massa em kg',
            text: 'Substitui os valores em SI.',
            math: r`m=\frac{1{,}6022\times10^{-19}\times8{,}0000\times10^{-2}\times0{,}8127}{3{,}0761722\times10^{4}}\approx3{,}3863\times10^{-25}\ \mathrm{kg}`,
          },
          {
            title: 'Conversão para u.m.a.',
            text: 'Divide pela massa de 1 u.m.a. O resultado (cerca de 204) é a massa de um átomo pesado, o que é razoável para um ião.',
            math: r`m=\frac{3{,}3863\times10^{-25}}{1{,}6605\times10^{-27}}\approx203{,}93\ \mathrm{u.m.a.}`,
          },
        ],
        answer: r`$m\approx3{,}386\times10^{-25}$ kg $\approx203{,}93$ u.m.a.`,
        official: 'm = 203,93 u.m.a.',
        check: { value: 203.93, unit: 'u.m.a.' },
      },
    ],
    labs: [
      { family: 'magnetic_particles', scenario: 'orbit', label: 'Ver a meia volta do ião no espectrómetro', coverage: 'direct', params: { m: '3.3863e-25', q: '1.6022e-19', v: '30761.722', B: '0.08', arc: 'half' } },
    ],
  },
  {
    id: 'f3-02',
    source: { kind: 'sheet', sheet: 3, number: 2 },
    title: 'Eletrão no tubo de raios catódicos',
    familyIds: ['magnetic_particles'],
    difficulty: 2,
    statement: r`Num aparelho de televisão, um eletrão desloca-se no tubo de raios catódicos em direção ao ecrã, segundo o eixo dos xx, com velocidade de $8{,}0\times10^{6}$ m/s, sob ação de um campo magnético de 0,025 T. O campo magnético faz um ângulo de 60° com o eixo dos xx, no plano xy. ($m_e=9{,}1\times10^{-31}$ kg; $q_e=1{,}6\times10^{-19}$ C)`,
    data: [
      { symbol: r`\vec v`, value: r`$8{,}0\times10^{6}\,\vec e_x$ m/s` },
      { symbol: 'B', value: r`0,025 T, no plano $xy$, a 60° do eixo $x$` },
      { symbol: 'q', value: r`$-e=-1{,}6\times10^{-19}$ C (eletrão)` },
      { symbol: 'm_e', value: r`$9{,}1\times10^{-31}$ kg` },
    ],
    strategy: r`Força magnética sobre uma carga em movimento: o módulo é $|q|vB\sin\theta$ e a direção vem de $\vec v\times\vec B$. Como a carga é negativa, a força tem o sentido oposto ao do produto vetorial.`,
    pitfalls: [
      'Esquecer o seno de 60°: só a componente de B perpendicular à velocidade produz força.',
      'Esquecer que o eletrão é negativo: a força é oposta a v × B.',
    ],
    formulaIds: ['lorentz-magnetic', 'newton-second'],
    parts: [
      {
        label: 'a',
        question: 'Calcule a intensidade da força magnética que atua no eletrão.',
        hint: r`Usa $|\vec F_m|=|q|\,v\,B\sin\theta$ com o ângulo entre a velocidade e o campo.`,
        steps: [
          {
            title: 'Dados em SI',
            text: r`A velocidade está segundo $x$ e o campo faz 60° com $x$, por isso o ângulo entre $\vec v$ e $\vec B$ é $\theta=60^\circ$.`,
          },
          {
            title: 'Módulo da força',
            text: 'No módulo entra o valor absoluto da carga.',
            math: r`|\vec F_m|=|q|\,v\,B\sin\theta=1{,}6\times10^{-19}\times8{,}0\times10^{6}\times0{,}025\times\sin60^\circ\approx2{,}8\times10^{-14}\ \mathrm{N}`,
          },
        ],
        answer: r`$|\vec F_m|\approx2{,}8\times10^{-14}$ N`,
        official: 'Fm = 2,8×10⁻¹⁴ N',
        check: { value: 2.77e-14, unit: 'N' },
      },
      {
        label: 'b',
        question: 'Indique a direção e o sentido da força magnética.',
        hint: r`Escreve $\vec v$ e $\vec B$ por componentes, calcula $\vec v\times\vec B$ e no fim multiplica pela carga negativa.`,
        steps: [
          {
            title: 'Componentes',
            text: r`O campo está no plano $xy$: decompõe-no com o cosseno e o seno de 60°.`,
            math: r`\vec v=(8{,}0\times10^{6};\ 0;\ 0)\ \mathrm{m/s}\qquad\vec B=(0{,}025\cos60^\circ;\ 0{,}025\sin60^\circ;\ 0)=(0{,}0125;\ 0{,}0217;\ 0)\ \mathrm{T}`,
          },
          {
            title: 'Produto vetorial',
            text: r`Dois vetores no plano $xy$ dão um produto vetorial segundo $z$.`,
            math: r`\vec v\times\vec B=\begin{vmatrix}\vec e_x&\vec e_y&\vec e_z\\v&0&0\\B_x&B_y&0\end{vmatrix}=v\,B_y\,\vec e_z=8{,}0\times10^{6}\times0{,}0217\,\vec e_z\approx+1{,}73\times10^{5}\,\vec e_z\ \mathrm{T\,m/s}`,
          },
          {
            title: 'Regra da mão direita',
            text: r`Dedos segundo $\vec v$ ($+x$), a rodar para $\vec B$ (que está 60° para o lado de $+y$): o polegar aponta para $+z$. Isto é o sentido de $\vec v\times\vec B$.`,
          },
          {
            title: 'Efeito da carga negativa',
            text: r`O eletrão tem $q<0$, por isso a força é oposta a $\vec v\times\vec B$: aponta para $-z$. A ficha chama a este sentido "para baixo".`,
            math: r`\vec F_m=q\,\vec v\times\vec B=-1{,}6\times10^{-19}\times1{,}73\times10^{5}\,\vec e_z\approx-2{,}8\times10^{-14}\,\vec e_z\ \mathrm{N}`,
          },
        ],
        answer: r`Direção do eixo $z$ (perpendicular ao plano $xy$ que contém $\vec v$ e $\vec B$), sentido negativo: $\vec F_m\approx-2{,}8\times10^{-14}\,\vec e_z$ N.`,
        official: 'Eixo do zz, para baixo',
      },
      {
        label: 'c',
        question: 'Determine o módulo da aceleração.',
        hint: 'A força magnética é a única força considerada: aplica a 2.ª lei de Newton.',
        steps: [
          {
            title: '2.ª lei de Newton',
            text: 'Usa a força da alínea a) sem a arredondar e a massa do eletrão dada no enunciado.',
            math: r`a=\frac{|\vec F_m|}{m_e}=\frac{2{,}77\times10^{-14}}{9{,}1\times10^{-31}}\approx3{,}0\times10^{16}\ \mathrm{m/s^2}`,
          },
          {
            title: 'Comparação com a ficha',
            text: r`A ficha dá $3{,}1\times10^{16}$ m/s² porque divide a força já arredondada ($2{,}8\times10^{-14}$ N). A diferença é só de arredondamento.`,
          },
        ],
        answer: r`$a\approx3{,}0\times10^{16}$ m/s² (a ficha arredonda para $3{,}1\times10^{16}$ m/s²)`,
        official: 'a = 3,1×10¹⁶ m/s²',
        check: { value: 3.05e16, unit: 'm/s²' },
      },
    ],
    note: 'Na alínea c) a ficha usa a força arredondada a dois algarismos (2,8×10⁻¹⁴ N) e obtém 3,1×10¹⁶ m/s²; sem arredondar a força obtém-se 3,05×10¹⁶ m/s².',
    labs: [
      { family: 'magnetic_particles', scenario: 'vectors', label: 'Ver v, B e a força no eletrão', coverage: 'direct', params: { v: '8e6,0,0', B: '0.0125,0.021651,0', q: '-1.6e-19', m: '9.1e-31' } },
    ],
  },
  {
    id: 'f3-03',
    source: { kind: 'sheet', sheet: 3, number: 3 },
    title: 'Ciclotrão de Lawrence com deutério',
    familyIds: ['magnetic_particles'],
    difficulty: 2,
    statement: r`A ação de campos magnéticos sobre cargas em movimento é utilizada para guiar feixes de partículas. O ciclotrão de Lawrence foi o primeiro dispositivo a acelerar partículas a velocidades elevadas. O facto de o ciclotrão (e de uma grande parte dos aceleradores) serem aproximadamente circulares está ligado ao uso de campos magnéticos que fazem as partículas mudar ciclicamente de direção e assim possuírem trajetórias circulares fechadas. O ciclotrão é constituído por duas cavidades semicilíndricas (forma de "D") onde atua um campo magnético uniforme, separadas por uma fenda estreita onde atua um campo elétrico alternado (ou seja, uma tensão alternada). Devido ao campo magnético, as partículas carregadas seguem trajetórias circulares com velocidade constante. Na fenda a partícula é acelerada pela ação do campo elétrico. Claro que tem que haver um sincronismo perfeito entre a frequência da tensão e a frequência do movimento de rotação da partícula. Suponha que num ciclotrão que opera a uma frequência de 12 MHz e em que o raio do "D" é de 53 cm, pretende-se acelerar deutério (de massa igual a $3{,}34\times10^{-27}$ kg).`,
    figure: {
      src: 'figures/f3-03.png',
      alt: 'Desenho em perspetiva de um ciclotrão. Duas cavidades metálicas ocas em forma de D (Dee 1 e Dee 2), deitadas na horizontal sobre o polo de um íman, estão separadas por uma fenda estreita. O campo magnético B é vertical, a apontar para cima, e atravessa os dois D. Uma fonte S no centro emite as partículas, que descrevem uma espiral a tracejado cujo raio aumenta a cada passagem pela fenda, até saírem pela periferia num feixe. Os dois D estão ligados a uma tensão alternada de frequência constante.',
    },
    data: [
      { symbol: 'f', value: r`12 MHz = $1{,}2\times10^{7}$ Hz` },
      { symbol: 'R', value: r`53 cm = 0,53 m (raio do D)` },
      { symbol: 'm', value: r`$3{,}34\times10^{-27}$ kg` },
      { symbol: 'q', value: r`$+e=1{,}602\times10^{-19}$ C (núcleo de deutério: um protão e um neutrão)` },
    ],
    strategy: r`No ciclotrão a frequência da tensão tem de ser igual à frequência de rotação da partícula, $f=\dfrac{|q|B}{2\pi m}$, que não depende da velocidade. Daí tiras $B$. A velocidade final é a da órbita de raio máximo, $r=R$.`,
    pitfalls: [
      'Usar 12 MHz sem converter para Hz, ou 53 cm sem converter para m.',
      'Confundir frequência f (Hz) com velocidade angular ω = 2πf (rad/s).',
      'O enunciado não dá a carga: o núcleo de deutério tem um protão, logo q = +e.',
    ],
    formulaIds: ['cyclotron-radius', 'cyclotron-period', 'circular-motion'],
    parts: [
      {
        label: 'a',
        question: 'Qual a intensidade do campo magnético necessário no ciclotrão?',
        hint: 'Iguala a força magnética à força centrípeta e escreve a velocidade angular. A frequência de rotação tem de ser a da tensão: 12 MHz.',
        steps: [
          {
            title: 'Frequência de rotação',
            text: r`Dentro de cada D só atua a força magnética, que é centrípeta. A velocidade angular $\omega=v/r$ fica independente de $v$ e de $r$.`,
            math: r`|q|\,v\,B=\frac{m\,v^2}{r}\quad\Rightarrow\quad\omega=\frac{v}{r}=\frac{|q|\,B}{m}\quad\Rightarrow\quad f=\frac{\omega}{2\pi}=\frac{|q|\,B}{2\pi\,m}`,
          },
          {
            title: 'Condição de sincronismo',
            text: 'Para a partícula ser acelerada sempre que passa na fenda, a frequência de rotação tem de ser igual à da tensão alternada. Resolve em ordem a B.',
            math: r`B=\frac{2\pi\,f\,m}{|q|}=\frac{2\pi\times1{,}2\times10^{7}\times3{,}34\times10^{-27}}{1{,}602\times10^{-19}}\approx1{,}57\ \mathrm{T}\approx1{,}6\ \mathrm{T}`,
          },
        ],
        answer: r`$B\approx1{,}6$ T (1,57 T), perpendicular ao plano dos D`,
        official: 'B ≅ 1,6 T',
        check: { value: 1.57, unit: 'T' },
      },
      {
        label: 'b',
        question: 'Qual a velocidade final conseguida?',
        hint: 'A partícula sai quando a órbita atinge o raio do D. Num movimento circular, v = ωr.',
        steps: [
          {
            title: 'Órbita de raio máximo',
            text: r`A velocidade aumenta a cada passagem na fenda e o raio cresce com ela ($r=mv/|q|B$). A velocidade final corresponde a $r=R$.`,
            math: r`v=\omega\,R=2\pi\,f\,R=2\pi\times1{,}2\times10^{7}\times0{,}53\approx4{,}0\times10^{7}\ \mathrm{m/s}`,
          },
          {
            title: 'Verificação',
            text: r`Pela outra expressão, $v=|q|BR/m$ com $B=1{,}57$ T, obtém-se o mesmo valor. É cerca de 13% da velocidade da luz, por isso a mecânica clássica ainda é uma aproximação aceitável.`,
            math: r`v=\frac{|q|\,B\,R}{m}=\frac{1{,}602\times10^{-19}\times1{,}57\times0{,}53}{3{,}34\times10^{-27}}\approx4{,}0\times10^{7}\ \mathrm{m/s}`,
          },
        ],
        answer: r`$v\approx4{,}0\times10^{7}$ m/s ($3{,}996\times10^{7}$ m/s)`,
        official: 'v = 3,99×10⁷ m/s',
        check: { value: 3.996e7, unit: 'm/s' },
      },
    ],
    note: 'O enunciado não indica a carga do deutério: usa-se q = +e (um protão no núcleo). A ficha trunca a velocidade para 3,99×10⁷ m/s; o valor calculado é 3,996×10⁷ m/s.',
    labs: [
      { family: 'magnetic_particles', scenario: 'cyclotron', label: 'Ver a espiral no ciclotrão', coverage: 'direct', params: { f: '12', R: '0.53', m: '3.34e-27', q: '1.602e-19' } },
    ],
  },
  {
    id: 'f3-04',
    source: { kind: 'sheet', sheet: 3, number: 4 },
    title: 'Fio com corrente num campo magnético externo',
    familyIds: ['magnetic_particles'],
    difficulty: 3,
    statement: r`Um fio retilíneo é colocado perpendicularmente à direção de um campo magnético de intensidade igual a $2{,}0\times10^{-5}$ T. Se uma corrente elétrica de 1,0 A percorre o fio qual o campo magnético resultante máximo e mínimo à distância de 1,0 cm do fio? Localize esses pontos.`,
    data: [
      { symbol: r`B_{ext}`, value: r`$2{,}0\times10^{-5}$ T, uniforme e perpendicular ao fio` },
      { symbol: 'I', value: '1,0 A' },
      { symbol: 'r', value: r`1,0 cm = $1{,}0\times10^{-2}$ m` },
      { symbol: r`\mu_0`, value: r`$4\pi\times10^{-7}$ N/A²` },
    ],
    strategy: 'Sobreposição de dois campos: o campo uniforme externo e o campo circular do fio. Calcula o módulo do campo do fio a 1,0 cm e procura, na circunferência com esse raio, os pontos onde os dois campos são paralelos (máximo) e antiparalelos (mínimo).',
    pitfalls: [
      'Somar os módulos em todos os pontos: os campos são vetores e só se somam diretamente onde são paralelos.',
      'Esquecer que o campo do fio é tangente à circunferência centrada no fio (não aponta para o fio nem para fora).',
    ],
    formulaIds: ['field-wire'],
    parts: [
      {
        label: '',
        question: 'Qual o campo magnético resultante máximo e mínimo à distância de 1,0 cm do fio? Localize esses pontos.',
        hint: 'Começa por calcular o campo criado pelo fio a 1,0 cm e compara-o com o campo externo. Depois pensa em que pontos da circunferência os dois vetores têm a mesma direção.',
        steps: [
          {
            title: 'Campo criado pelo fio',
            text: 'A 1,0 cm do fio o campo criado pela corrente tem o mesmo módulo em todos os pontos e, neste caso, é igual ao campo externo.',
            math: r`B_{fio}=\frac{\mu_0\,I}{2\pi\,r}=\frac{4\pi\times10^{-7}\times1{,}0}{2\pi\times1{,}0\times10^{-2}}=2{,}0\times10^{-5}\ \mathrm{T}`,
          },
          {
            title: 'Eixos e direção do campo do fio',
            text: r`Escolhe o fio segundo $z$ com a corrente a sair da página ($+z$) e o campo externo segundo $+x$. Regra da mão direita: polegar na corrente, os dedos dão a volta ao fio no sentido anti-horário. Num ponto de direção radial $\vec e_r$, o campo do fio tem a direção de $\vec e_z\times\vec e_r$.`,
            math: r`\vec B_{fio}=B_{fio}\,(\vec e_z\times\vec e_r)\qquad\vec B_{ext}=B_{ext}\,\vec e_x`,
          },
          {
            title: 'Ponto de campo máximo',
            text: r`O máximo ocorre onde $\vec B_{fio}$ tem o sentido de $\vec B_{ext}$. Isso acontece para $\vec e_r=-\vec e_y$, ou seja, no ponto $(0;\,-1{,}0\ \mathrm{cm})$.`,
            math: r`\vec e_z\times(-\vec e_y)=+\vec e_x\quad\Rightarrow\quad B_{max}=B_{ext}+B_{fio}=2{,}0\times10^{-5}+2{,}0\times10^{-5}=4{,}0\times10^{-5}\ \mathrm{T}`,
          },
          {
            title: 'Ponto de campo mínimo',
            text: r`No ponto diametralmente oposto, $(0;\,+1{,}0\ \mathrm{cm})$, o campo do fio é contrário ao externo. Como os módulos são iguais, o campo anula-se.`,
            math: r`\vec e_z\times\vec e_y=-\vec e_x\quad\Rightarrow\quad B_{min}=B_{ext}-B_{fio}=0\ \mathrm{T}`,
          },
          {
            title: 'Localização e verificação',
            text: r`Os dois pontos estão na reta que passa pelo fio e é perpendicular ao fio e ao campo externo, um de cada lado do fio. Se inverteres o sentido da corrente, os dois pontos trocam. Nos restantes pontos da circunferência o módulo fica entre 0 e $4{,}0\times10^{-5}$ T (por exemplo, em $(\pm1{,}0\ \mathrm{cm};\,0)$ os campos são perpendiculares e o módulo é $2{,}8\times10^{-5}$ T).`,
          },
        ],
        answer: r`$B_{max}=4{,}0\times10^{-5}$ T e $B_{min}=0$ T, em dois pontos diametralmente opostos a 1,0 cm do fio, sobre a reta perpendicular ao fio e ao campo externo: o máximo do lado onde o campo do fio tem o sentido do campo externo, o mínimo do lado oposto.`,
        official: 'Bmax = 4,0×10⁻⁵ T; Bmin = 0 T',
        check: { value: 4.0e-5, unit: 'T (máximo)' },
      },
    ],
    labs: [
      { family: 'magnetic_particles', scenario: 'wire-field', label: 'Ver os pontos de campo máximo e nulo', coverage: 'direct', params: { I: '1', Bext: '20', r: '1' } },
    ],
  },
  {
    id: 'f3-05',
    source: { kind: 'sheet', sheet: 3, number: 5 },
    title: 'Solenoide de um equipamento de MRI',
    familyIds: ['induction_sources'],
    difficulty: 2,
    statement: r`Os solenóides são utilizados para produzir campos magnéticos intensos em equipamentos de diagnóstico médico conhecidos como MRI ("Magnetic Ressonance Imaging"). Nestes equipamentos conseguem-se imagens do interior do corpo humano sem a utilização de raios X. O solenóide do MRI utiliza um fio supercondutor arrefecido com hélio líquido para obter uma elevada corrente e assim um elevado campo magnético. Se o solenóide tiver 2,4 m de comprimento e 95 cm de diâmetro e se a espessura do fio for de 2,0 mm (a espessura do revestimento do isolador é desprezável), qual a corrente necessária para produzir um campo magnético de 1,5 T no interior do solenóide?`,
    data: [
      { symbol: 'L', value: '2,4 m (comprimento)' },
      { symbol: 'D', value: '95 cm = 0,95 m (diâmetro; não entra na conta)' },
      { symbol: 'd', value: r`2,0 mm = $2{,}0\times10^{-3}$ m (espessura do fio)` },
      { symbol: 'B', value: '1,5 T' },
      { symbol: r`\mu_0`, value: r`$4\pi\times10^{-7}$ N/A²` },
    ],
    strategy: r`Campo no interior de um solenoide longo: $B=\mu_0\,n\,I$. O número de espiras não é dado, mas sai da espessura do fio: as espiras estão encostadas umas às outras ao longo do comprimento.`,
    pitfalls: [
      'Usar o diâmetro do solenoide: o campo no interior de um solenoide longo não depende do raio.',
      'Confundir N (número total de espiras) com n (espiras por metro).',
      'Esquecer de converter 2,0 mm para metros.',
    ],
    formulaIds: ['field-solenoid'],
    parts: [
      {
        label: '',
        question: 'Qual a corrente necessária para produzir um campo magnético de 1,5 T no interior do solenóide?',
        hint: 'Quantas espiras de fio com 2,0 mm de espessura cabem lado a lado em 2,4 m? Com isso tens as espiras por metro.',
        steps: [
          {
            title: 'Número de espiras',
            text: 'Com o isolamento desprezável, cada espira ocupa 2,0 mm do comprimento do solenoide.',
            math: r`N=\frac{L}{d}=\frac{2{,}4}{2{,}0\times10^{-3}}=1200\ \text{espiras}\qquad n=\frac{N}{L}=\frac{1}{d}=500\ \mathrm{espiras/m}`,
          },
          {
            title: 'Campo no interior do solenoide',
            text: 'Escreve a expressão e resolve em ordem à corrente.',
            math: r`B=\mu_0\,n\,I\quad\Rightarrow\quad I=\frac{B}{\mu_0\,n}`,
          },
          {
            title: 'Substituição',
            text: 'O resultado é uma corrente muito elevada, daí a necessidade de um fio supercondutor (sem resistência, não aquece).',
            math: r`I=\frac{1{,}5}{4\pi\times10^{-7}\times500}\approx2{,}4\times10^{3}\ \mathrm{A}=2{,}4\ \mathrm{kA}`,
          },
        ],
        answer: r`$I\approx2{,}4\times10^{3}$ A = 2,4 kA`,
        official: 'i = 2,4 kA',
        check: { value: 2.39, unit: 'kA' },
      },
    ],
    labs: [
      { family: 'induction_sources', scenario: 'solenoid', label: 'Ver o campo no interior do solenoide', coverage: 'direct', params: { N: '1200', L: '2.4', I: '2387' } },
    ],
  },
  {
    id: 'f3-06',
    source: { kind: 'sheet', sheet: 3, number: 6 },
    title: 'Corrente induzida numa espira circular',
    familyIds: ['induction_sources'],
    difficulty: 2,
    statement: 'Uma espira circular metálica, de raio 0,1 m, possui uma resistência elétrica de 2,0 Ω. Um campo magnético atua perpendicularmente ao plano da espira aumentando de intensidade à taxa de 0,10 T s⁻¹. Qual a intensidade da corrente induzida na espira?',
    data: [
      { symbol: 'r', value: '0,1 m' },
      { symbol: 'R', value: '2,0 Ω' },
      { symbol: r`\dfrac{dB}{dt}`, value: '0,10 T/s' },
      { symbol: r`\theta`, value: '0° (campo perpendicular ao plano da espira, paralelo à normal)' },
    ],
    strategy: r`O fluxo magnético através da espira varia porque $B$ varia: a lei de Faraday dá a força eletromotriz induzida e a lei de Ohm dá a corrente.`,
    pitfalls: [
      'Usar o perímetro em vez da área da espira.',
      'O campo é perpendicular ao plano, logo paralelo à normal: o cosseno vale 1 (não 0).',
    ],
    formulaIds: ['magnetic-flux', 'faraday', 'ohm'],
    parts: [
      {
        label: '',
        question: 'Qual a intensidade da corrente induzida na espira?',
        hint: 'Escreve o fluxo através da espira e deriva-o em ordem ao tempo. Só o campo varia; a área é constante.',
        steps: [
          {
            title: 'Fluxo magnético',
            text: r`O campo é perpendicular ao plano da espira, por isso faz 0° com a normal e $\cos\theta=1$.`,
            math: r`\Phi=B\,A\cos0^\circ=B\,\pi r^2\qquad A=\pi\times(0{,}1)^2\approx3{,}14\times10^{-2}\ \mathrm{m^2}`,
          },
          {
            title: 'Lei de Faraday',
            text: 'A área não varia; só o campo. Em módulo:',
            math: r`|\mathcal E|=\left|\frac{d\Phi}{dt}\right|=A\,\frac{dB}{dt}=3{,}14\times10^{-2}\times0{,}10\approx3{,}14\times10^{-3}\ \mathrm{V}`,
          },
          {
            title: 'Lei de Ohm',
            text: 'A força eletromotriz induzida faz circular corrente na resistência da própria espira.',
            math: r`i=\frac{|\mathcal E|}{R}=\frac{3{,}14\times10^{-3}}{2{,}0}\approx1{,}6\times10^{-3}\ \mathrm{A}`,
          },
          {
            title: 'Sentido (lei de Lenz)',
            text: 'O fluxo está a aumentar, por isso a corrente induzida circula no sentido que cria um campo contrário ao campo aplicado.',
          },
        ],
        answer: r`$i\approx1{,}6\times10^{-3}$ A = 1,6 mA`,
        official: 'i = 1,6×10⁻³ A',
        check: { value: 1.57e-3, unit: 'A' },
      },
    ],
    labs: [
      { family: 'induction_sources', scenario: 'faraday', label: 'Ver a FEM induzida na espira', coverage: 'direct', params: { N: '1', r: '0.1', rate: '0.1', R: '2' } },
    ],
  },
]
