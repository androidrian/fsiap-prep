# Brief — cenários de laboratório

Estás a construir cenários interativos para o laboratório do FSIAP Prep (React 19 + TypeScript + SVG).
Cada cenário existe para o aluno **ver o setup de um exercício** e perceber o que acontece quando
mexe nos dados. Abre a partir de um exercício com os valores do enunciado no URL.

Vários agentes trabalham em paralelo neste repositório. Só podes criar/alterar os ficheiros que
o teu pedido te atribui. Se o typecheck mostrar erros em ficheiros de outros, ignora-os.

## Lê primeiro

- `src/labs/ui.tsx` — componentes partilhados: `Control` (cursor), `NumberField` (valor livre, aceita 1.6e-19),
  `ResultStrip` (resultado principal + fórmula KaTeX), `Metrics` (resultados secundários), `LabNote`,
  `Choice` (botões de opção), `numberParam`, `textParam`, `sig` (3 algarismos significativos em PT).
  Tipos `LabProps` (`{ params }`) e `LabScenario`.
- O ficheiro do teu grupo (ex.: `src/labs/electro.tsx`) — cenários existentes e o mapa exportado onde registas os novos.
- `src/labs/catalog.ts` — o **contrato**: id, etiqueta, resumo e nomes/unidades dos parâmetros de cada cenário.
  Não o edites. Implementa exatamente estes ids e aceita exatamente estes parâmetros.
- `src/pages/SimulatorsPage.tsx` e `src/labs/registry.ts` — como os cenários são montados (separadores, URL).
- `src/tests/simulators.test.tsx` — exemplos de testes; têm de continuar a passar.
- Para estilos existentes: procura em `src/styles.css` por `.sim-`, `.vector-stage`, `.exam-metrics`, `.source-kind`.
- As fichas em `docs-class/Folha_N_2025_26.pdf` e as figuras em `public/figures/` para veres os setups a reproduzir.

## Como construir um cenário

- Um componente por cenário em `src/labs/<grupo>/<Nome>.tsx`, com `export function Nome({ params }: LabProps)`.
- Física em funções puras em `src/labs/<grupo>/physics.ts` (unidades SI; sem React).
- Regista no mapa exportado do ficheiro do grupo: `{ id: '<id do catálogo>', label: '<etiqueta>', component: Nome }`
  dentro da família certa.
- Valores iniciais: lê de `params` com `numberParam`/`textParam`; os valores por omissão são os do exercício
  de referência indicado no teu pedido.
- Estrutura visual, por esta ordem:
  1. palco SVG (`viewBox="0 0 480 240"`, `width: 100%`, `role="img"` e `aria-label` que descreve o estado atual);
  2. `ResultStrip` com o resultado principal e a fórmula;
  3. `Metrics` com 2–4 resultados secundários;
  4. controlos (`Control` para valores à escala humana, `NumberField` para notação científica, `Choice` para opções);
  5. `LabNote` com a leitura do diagrama ou a armadilha típica.
- O desenho tem de **mudar** quando os valores mudam (comprimentos, ângulos, posições, sentidos), não só os números.
  Quando a escala real não cabe, usa escala visual saturada/logarítmica e diz-o na legenda.
- Vetores: seta com `marker` (ids únicos, prefixados com o id do cenário), cor por grandeza, etiqueta junto à ponta.
  Ângulos: arco + etiqueta. Linhas auxiliares a tracejado. Nunca sobreponhas etiquetas.
- Texto dentro do SVG com `font-size` ≥ 11. Nada de `NaN`/`Infinity` em nenhum extremo dos controlos:
  protege divisões e raízes.

## Estilo

- CSS num ficheiro próprio `src/labs/<grupo>.css`, importado no ficheiro do grupo. Classes com prefixo `lab-<grupo>-`.
- Cores **só** por variáveis CSS (o site vai ter modo escuro): `--ink`, `--muted`, `--line`, `--paper`, `--surface`,
  `--surface-2`, `--blue`, `--green`, `--amber`, `--red`, `--positive`, `--negative`, `--vec-e`, `--vec-b`,
  `--vec-f`, `--vec-v`, `--hot`, `--cold`, `--ray`, `--glass`. Para transparências usa
  `color-mix(in srgb, var(--blue) 15%, transparent)`. Nada de hex/rgb fixos.
- Convenção de cores: carga positiva `--positive`, negativa `--negative`; campo elétrico `--vec-e`; campo magnético
  `--vec-b`; força `--vec-f`; velocidade `--vec-v`; quente `--hot`; frio `--cold`; raio de luz `--ray`.

## Testes

- `src/tests/labs.<grupo>.test.tsx`: para cada cenário novo, renderiza
  `<MemoryRouter initialEntries={['/simulators?family=…&scenario=…&<params do exercício>']}><SimulatorsPage /></MemoryRouter>`
  e verifica (a) que o separador está ativo, (b) que aparece a resposta da ficha, (c) que mexer num controlo
  altera um atributo do SVG, (d) que o texto não contém `NaN` nem `Infinity`.
- Testes unitários das funções de `physics.ts` com os valores das fichas.

## Antes de terminares

1. `npx vitest run src/tests/labs.<grupo>.test.tsx src/tests/simulators.test.tsx`
2. `npx tsc --noEmit -p tsconfig.app.json` — sem erros nos teus ficheiros.
3. `npx eslint src/labs/<grupo>.tsx src/labs/<grupo> src/tests/labs.<grupo>.test.tsx`
4. Relatório final (curto): cenários construídos, parâmetros aceites, o que ficou por fazer ou simplificado.
