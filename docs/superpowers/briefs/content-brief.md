# Brief — exercícios resolvidos (fichas TP e exames)

Estás a escrever conteúdo para o FSIAP Prep, um site de estudo de Física Aplicada (ISEP, LEI).
O aluno vai usar a tua resolução para aprender a resolver o exercício sozinho. Tem de estar
**certa**, **clara** e **no formato exato** do modelo.

Vários agentes trabalham em paralelo neste repositório. Só podes criar/alterar os ficheiros que
o teu pedido te atribui. Se o typecheck mostrar erros em ficheiros de outros, ignora-os.

## Lê primeiro

- `src/domain/study.ts` — o modelo `StudyExercise` (lê os comentários: são as regras).
- `src/data/formulas.ts` — registo de fórmulas. Em `formulaIds` só podes usar ids que existam aqui.
  Se te faltar uma fórmula, **não edites o ficheiro**: usa a mais próxima e diz no relatório final qual faltou.
- `src/labs/catalog.ts` — cenários de laboratório e os parâmetros que cada um aceita (só podes usar estes ids e estes nomes de parâmetros).
- `src/tests/library.test.ts` — o teste de integridade que o teu ficheiro tem de passar.

## Regras de conteúdo

1. **Enunciado fiel.** Transcreve o enunciado em português de Portugal, com todos os dados e alíneas.
   Corrige só gralhas evidentes. Não inventes dados. Se o enunciado depende de uma figura, descreve no
   `figure.alt` tudo o que a figura mostra (posições, ligações, valores, ângulos e de onde se medem).
2. **Dados.** `data` lista os dados já convertidos: `symbol` é KaTeX (ex.: `q_1`), `value` é texto com
   unidade e pode ter `$…$` (ex.: `2,0 μC = $2{,}0\times10^{-6}$ C`).
3. **Resolução por alínea.** Cada `part` tem:
   - `hint`: um empurrão que diz por onde começar, sem fazer a conta;
   - `steps`: 2 a 6 passos. Cada passo tem `title` curto (ex.: "Dados em SI", "Soma vetorial"),
     `text` a explicar o porquê em 1–3 frases e, quando há conta, `math` com a expressão literal,
     a substituição numérica e o resultado com unidade. Trabalha primeiro com letras e substitui no fim;
   - `answer`: resposta final com unidades e, se for vetor, direção e sentido;
   - `official`: a solução impressa na ficha ("R:"), transcrita tal e qual (omitir se não existir);
   - `check`: `{ value, unit }` com o valor numérico que o aluno deve obter (na unidade indicada).
     Usa o **teu** valor calculado. Omitir em alíneas sem resultado numérico ("mostre que…").
4. **Constantes** (formulário oficial): $k=8{,}99\times10^{9}$ N·m²/C², $\varepsilon_0=8{,}85\times10^{-12}$,
   $\mu_0=4\pi\times10^{-7}$ N/A², $c=3{,}0\times10^{8}$ m/s, $e=1{,}60217653\times10^{-19}$ C,
   $m_e=9{,}109\times10^{-31}$ kg, $m_p=1{,}673\times10^{-27}$ kg, $g=9{,}81$ m/s²,
   $\sigma=5{,}6697\times10^{-8}$ W·m⁻²·K⁻⁴, $G=6{,}67\times10^{-11}$. Se o enunciado dá outro valor, usa o do enunciado.
5. **Verifica todos os números.** Escreve um script Node sem dependências (ficheiro indicado no teu pedido)
   que calcula cada resposta e imprime `id alínea | calculado | ficha`. Corre-o com `node <ficheiro>`.
   Se o teu valor difere da ficha em mais de ~3%: relê o enunciado e a figura (ângulos, de onde se medem
   distâncias, sinais, unidades, o que é pedido), testa as leituras alternativas plausíveis e vê qual
   reproduz a resposta da ficha. Se uma leitura razoável reproduz a ficha, usa-a e explica-a num passo.
   Se nenhuma reproduz, mantém a física correta, guarda a resposta da ficha em `official` e explica a
   diferença em `note` (ex.: "a ficha usa g = 10 m/s²" ou "a solução impressa parece ter uma gralha").
   Nunca forces a conta para dar o número da ficha.
6. **Estratégia e armadilhas.** `strategy`: como reconhecer o tipo de problema e o plano em 1–3 frases.
   `pitfalls`: 1–3 erros típicos deste exercício (unidades, sinais, vetor vs escalar, ângulo com a normal…).
7. **Fórmulas.** `formulaIds`: todas as fórmulas do registo usadas na resolução, pela ordem em que aparecem.
8. **Laboratório.** `labs`: 1 ou 2 ligações a cenários do catálogo que ajudem a *ver* o setup.
   `coverage: 'direct'` só se os `params` reproduzem os dados do exercício; senão `'concept'`.
   Os valores dos `params` são strings; números com ponto decimal (ex.: `'1.6e-19'`).
9. **Dificuldade.** 1 = aplicação direta de uma fórmula; 2 = vários passos; 3 = exige estratégia, geometria ou sistema de equações.
10. **Tom.** Trata o aluno por "tu". Frases curtas. Sem floreados. Vírgula decimal no texto;
    em KaTeX escreve a vírgula decimal como `{,}` (ex.: `4{,}0\times10^{-15}`).

## Regras de formato (TypeScript)

- Todas as strings com LaTeX ou barras invertidas em `String.raw` (convenção: `const r = String.raw` no topo e depois ``r`…` ``).
- Matemática em linha dentro de texto: `$…$`. O campo `math` é KaTeX display **sem** cifrões.
- Não uses o carácter `$` para mais nada (preços: escreve "euros").
- Unidades em KaTeX com `\mathrm{…}` e espaço fino `\ ` antes da unidade.
- Ficheiros grandes: escreve no máximo ~6 exercícios por ficheiro. Usa ficheiros-parte
  (ex.: `src/data/sheets/folha2.a.ts`, `folha2.b.ts`, …, cada um a exportar um array) e junta-os no
  ficheiro principal (`folha2.ts` exporta `folha2 = [...parteA, ...parteB, …]`). Um `Write` por ficheiro.

## Exemplo de uma entrada

```ts
import type { StudyExercise } from '../../domain/study'

const r = String.raw

export const folha1a: StudyExercise[] = [
  {
    id: 'f1-01',
    source: { kind: 'sheet', sheet: 1, number: 1 },
    title: 'Dois protões no núcleo de ferro',
    familyIds: ['electrostatics'],
    difficulty: 1,
    statement: 'O núcleo de um átomo de ferro tem um raio de 4,0 fm e possui 26 protões.',
    data: [
      { symbol: 'r', value: r`4,0 fm = $4{,}0\times10^{-15}$ m` },
      { symbol: 'q_p', value: r`$e=1{,}60\times10^{-19}$ C` },
      { symbol: 'm_p', value: r`$1{,}67\times10^{-27}$ kg` },
    ],
    strategy: 'Duas partículas pontuais a uma distância conhecida: compara a força elétrica (Coulomb) com a gravítica (Newton) usando a mesma distância.',
    pitfalls: ['1 fm = 10⁻¹⁵ m, e a distância entra ao quadrado.'],
    formulaIds: ['coulomb-force', 'gravitation'],
    parts: [
      {
        label: 'a',
        question: 'Qual seria a intensidade da força repulsiva entre dois protões se estivessem separados de 4,0 fm?',
        hint: 'São duas cargas pontuais iguais: aplica a lei de Coulomb com as duas cargas iguais a e.',
        steps: [
          { title: 'Dados em SI', text: r`Cada protão tem carga $e=1{,}60\times10^{-19}$ C e a distância é $r=4{,}0\times10^{-15}$ m.` },
          { title: 'Lei de Coulomb', text: 'As cargas têm o mesmo sinal, por isso a força é repulsiva.', math: r`F=k\,\frac{e^2}{r^2}=8{,}99\times10^{9}\times\frac{(1{,}60\times10^{-19})^2}{(4{,}0\times10^{-15})^2}\approx 14\ \mathrm{N}` },
        ],
        answer: r`$F\approx14$ N, repulsiva`,
        official: '14 N',
        check: { value: 14.4, unit: 'N' },
      },
      // … alíneas b) e c)
    ],
    labs: [{ family: 'electrostatics', scenario: 'pair', label: 'Ver a força entre duas cargas', coverage: 'concept' }],
  },
]
```

## Antes de terminares

1. `node <o teu script de verificação>` — todos os valores conferidos.
2. `npx vitest run src/tests/library.test.ts -t "<prefixo dos teus ids>"` — a verde para os teus exercícios
   (ex.: `-t "f1-"`), e também `-t "sheet 1"` se for uma ficha.
3. `npx tsc --noEmit -p tsconfig.app.json` — sem erros nos teus ficheiros.
4. Relatório final (curto): quantos exercícios, lista das discrepâncias com a ficha e como as trataste,
   fórmulas que faltam no registo, parâmetros de laboratório que gostavas de ter e não existem.
