# FSIAP Prep

Aplicação web multiutilizador de estudo adaptativo orientada ao exame de FSIAP. Mede o ponto de partida, escolhe a família de maior retorno, ensina o método, gera variantes novas, atualiza domínio/revisão, regista erros e permite testar cobertura num simulado misto.

## Executar

```bash
pnpm install
pnpm dev
```

A autenticação e a sincronização são servidas pela API em `server/`, que usa PostgreSQL. As variáveis `PGHOST`, `PGDATABASE` e `PGUSER` selecionam a ligação; em desenvolvimento, `pnpm dev:api` inicia a API em `127.0.0.1:4180`.

Validação completa:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## Fonte dos dados

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
  auth/          sessão, login e cliente da API
  data/          análise dos exames e exercícios validados
  domain/
    analytics/   cobertura histórica
    exercises/   cálculos puros e motor parametrizado de exercícios
    mastery/     domínio, confiança atual e revisão
    study/       prioridade e próxima melhor ação
  storage/       estado adaptativo sincronizado por utilizador
  components/    navegação, fórmulas e estados visuais
  pages/         fluxos de produto
  tests/         testes de domínio e limites matemáticos
server/          API, sessões, passwords com scrypt e PostgreSQL
deploy/          configuração Nginx e unidade systemd
```

## Modelo de domínio

- `mastery`: evidência histórica acumulada;
- `currentConfidence`: domínio descontado pelo tempo desde a prática;
- uma resposta autónoma pesa mais que uma resposta com dicas;
- um erro com confiança alta é penalizado mais do que um erro com confiança baixa;
- “dominado” exige pelo menos três sucessos autónomos e retenção atual;
- o próximo intervalo depende de acerto, autonomia e confiança.

## Limites desta versão

- a cobertura /20 normaliza os 15 valores da parte prática observável; não é uma previsão de nota;
- a correção do simulado é objetiva e não atribui pontos parciais a raciocínio escrito;
- o banco contém 30 templates parametrizados — três por cada uma das 10 famílias — com combinações ilimitadas de dados e opções;
- existem 26 cenários interativos: paredes simples e compostas, rede térmica em Y, calorimetria, simetria vetorial de cargas, campos uniformes, lançamento transversal e trabalho A→B, circuitos em paralelo e malhas, carga/descarga RC, trajetórias magnéticas, campos de fios/espiras/solenoides, indução, ótica avançada, ondas EM e polarizadores;
- contas distintas mantêm diagnóstico, domínio, simulados e erros isolados e sincronizados no PostgreSQL;
- ainda não existem recuperação automática de password, OCR automático de novos materiais ou correção de desenvolvimento escrito.
