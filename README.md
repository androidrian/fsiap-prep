# FSIAP Prep

Espaço de estudo para Física Aplicada (FSIAP, ISEP · LEI). Junta as fichas TP resolvidas passo a passo, a teoria das aulas com as fórmulas destacadas, um laboratório interativo que reproduz os setups dos exercícios e um treino adaptativo orientado ao exame.

## O que tens para estudar

- **Exercícios resolvidos** (`/exercises`): as 5 fichas TP de 2025/26 (99 exercícios) e 14 problemas de exame. Cada exercício tem enunciado e figura originais, dados organizados, dica, resolução revelada passo a passo, resposta calculada, solução impressa na ficha, armadilhas típicas e verificação da tua resposta numérica (reconhece sinal trocado e potência de 10 errada). Podes marcar o estado (feito, a rever, dúvida) e guardar notas.
- **Teoria e fórmulas** (`/theory`): resumo por tópico a partir das aulas teóricas, fórmulas destacadas nas aulas e do formulário oficial, com legenda, quando usar, armadilha e a lista de exercícios onde cada fórmula é aplicada.
- **Laboratório** (`/simulators`): cenários interativos por família (mapa de cargas, pêndulos carregados, placas, redutor série/paralelo, circuito de 3 ramos, comutador RC, órbitas em campo magnético, produto vetorial v×B, ciclotrão, gerador, transformador, fonte isotrópica, espetro, Brewster, fibra ótica, parede de N camadas, radiação, curva de aquecimento, …). Cada exercício abre o cenário com os dados do enunciado.
- **Ferramentas sempre à mão**: pesquisa global (`Ctrl+K`) por exercícios, fórmulas, cenários e páginas; calculadora científica com as constantes do formulário; tabela de constantes; conversor de prefixos e unidades.
- **Treino para o exame**: sessão adaptativa, banco de treino com variantes, simulado, diagnóstico, caderno de erros, mapa do exame e plano de estudo.

## Executar

```bash
pnpm install
pnpm dev
```

Requer pnpm 10 (com pnpm 9 usa `npx pnpm@10 install`). Abre `http://localhost:5173` e escolhe **Estudar neste computador**: não precisa de conta nem de servidor e o progresso fica guardado no browser.

Para contas sincronizadas, a API em `server/` usa PostgreSQL. As variáveis `PGHOST`, `PGDATABASE` e `PGUSER` selecionam a ligação; em desenvolvimento, `pnpm dev:api` inicia a API em `127.0.0.1:4180`.

Validação completa:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## Publicação

Cada alteração do `main` corre `.github/workflows/pages.yml`: typecheck, lint, testes, build e publicação no GitHub Pages. A versão publicada é estática (`VITE_LOCAL_ONLY=true`): não tem contas, só o modo local, e o progresso fica no browser de quem estuda.

O site com contas (API + PostgreSQL) é publicado à parte no servidor, com os ficheiros de `deploy/`.

## Conteúdo e como o manter

| O quê | Onde |
| --- | --- |
| Modelo de exercício resolvido | `src/domain/study.ts` |
| Fichas TP resolvidas | `src/data/sheets/folhaN*.ts` |
| Problemas de exame resolvidos | `src/data/exams*.ts` |
| Registo de fórmulas | `src/data/formulas.ts` |
| Tópicos de teoria | `src/data/theory.ts` |
| Catálogo de cenários e parâmetros | `src/labs/catalog.ts` |
| Cenários de laboratório | `src/labs/<domínio>.tsx` e `src/labs/<domínio>/` |
| Figuras das fichas | `public/figures/fN-EE.png` |
| Verificação numérica das respostas | `scripts/verify/*.mjs` (`node scripts/verify/folha1.mjs`) |

- As figuras são extraídas dos PDFs das fichas com `python -P scripts/extract_sheet_figures.py` (requer `pypdf` e `Pillow`; os PDFs ficam em `docs-class/`, fora do repositório).
- `src/tests/library.test.ts` garante a integridade da biblioteca: ids, numeração completa de cada ficha, fórmulas existentes, figuras presentes, KaTeX válido e ligações ao laboratório.
- Quando a resposta calculada difere da solução impressa na ficha, o exercício mostra as duas e explica a diferença numa nota.

## Fonte dos dados de exame

- 14 exames completos únicos, de 2014/15 a 2026;
- 2 testes/frequências únicos;
- 76 problemas principais e 227 subquestões;
- duplicados exatos removidos por hash;
- a cópia bilingue do mini-teste de 2025 corresponde ao teste intercalar e não é contada de novo;
- a parte teórica de escolha múltipla aparece em branco nos PDFs recentes, pelo que não foi reconstruída nem inventada.

A taxonomia e o índice de questões estão em `src/data/analysis.ts`. A análise explicada está em `analysis/FSIAP_EXAM_ANALYSIS.md`.

## Arquitetura

```text
src/
  auth/          sessão, login, modo local e cliente da API
  data/          fichas, exames, fórmulas, teoria e análise dos exames
  domain/
    analytics/   cobertura histórica
    exercises/   cálculos puros e motor parametrizado de exercícios
    mastery/     domínio, confiança atual e revisão
    study/       prioridade, próxima melhor ação e verificação de respostas
    tools/       calculadora científica
  labs/          cenários de laboratório por domínio, catálogo e registo
  storage/       progresso por utilizador (servidor ou browser)
  components/    navegação, pesquisa global, ferramentas, texto com matemática
  pages/         fluxos de produto
  tests/         testes de domínio, de conteúdo e de interface
server/          API, sessões, passwords com scrypt e PostgreSQL
deploy/          configuração Nginx e unidade systemd
scripts/         extração de figuras e verificação numérica das fichas
```

## Modelo de domínio do treino adaptativo

- `mastery`: evidência histórica acumulada;
- `currentConfidence`: domínio descontado pelo tempo desde a prática;
- uma resposta autónoma pesa mais que uma resposta com dicas;
- um erro com confiança alta é penalizado mais do que um erro com confiança baixa;
- “dominado” exige pelo menos três sucessos autónomos e retenção atual;
- o próximo intervalo depende de acerto, autonomia e confiança.

## Limites desta versão

- a cobertura /20 normaliza os 15 valores da parte prática observável; não é uma previsão de nota;
- a correção do simulado é objetiva e não atribui pontos parciais a raciocínio escrito;
- a verificação de respostas confere um valor numérico por alínea; alíneas com vários resultados conferem o principal;
- os problemas de exame cuja figura original não está disponível têm a resolução guiada pelo que o texto determina;
- no modo local o progresso fica apenas no browser onde estudas;
- ainda não existem modo escuro, recuperação automática de password nem correção de desenvolvimento escrito.
