# Fichas TP resolvidas, laboratórios novos e revisão do site

Objetivo: transformar o FSIAP Prep num espaço de estudo completo — as 5 fichas TP (99 exercícios)
com figura original, resolução passo a passo e resposta da ficha; laboratórios interativos que
reproduzem os setups dos exercícios; fórmulas das teóricas destacadas e ligadas aos exercícios
que as usam; navegação e UX revistas.

## Decisões

- Um único modelo de exercício resolvido (`src/domain/study.ts`) para fichas e exames.
- Figuras: extraídas dos PDFs das fichas para `public/figures/fN-EE.png` (`scripts/extract_sheet_figures.py`).
- Registo único de fórmulas (`src/data/formulas.ts`); exercícios referenciam fórmulas por id.
- Laboratórios por domínio em `src/labs/`, com catálogo declarativo (`src/labs/catalog.ts`) e parâmetros no URL.
- Modo local (sem API) para estudar offline no próprio computador.
- `docs-class/` (PDFs das aulas e fichas) fica fora do repositório.
- Quando a resposta calculada difere da solução impressa, mostram-se as duas e explica-se a diferença numa nota.
- Modo escuro adiado: o CSS original tem ~100 cores fixas e um tema parcial ficaria ilegível.

## Phasing

| Phase | Deliverable | Estimate |
| --- | --- | --- |
| F1 | Alicerces: modelo, fórmulas, catálogo de laboratórios, figuras | 1 h |
| F2 | Conteúdo: 5 fichas + exames resolvidos + teoria das aulas | 2 h |
| F3 | Laboratórios novos por domínio | 2 h |
| F4 | Páginas, navegação, ferramentas de estudo e UX | 2 h |
| F5 | Verificação: testes, build, revisão no browser | 1 h |

Total estimate: 1 day

### Task 1: Alicerces

- [x] Extrair as figuras das fichas para `public/figures/`
- [x] Modelo `StudyExercise` com passos, resposta oficial e verificação numérica
- [x] Registo de fórmulas com legenda, quando usar e armadilhas
- [x] Dividir os simuladores por domínio e criar registo/catálogo com parâmetros
- [x] Teste de integridade da biblioteca (ids, fórmulas, figuras, KaTeX, ligações ao laboratório)

### Task 2: Fichas TP resolvidas

- [x] Ficha 1 — Cargas, forças, campos e potencial (19 exercícios)
- [x] Ficha 2 — Circuitos em corrente contínua (24 exercícios)
- [x] Ficha 3 — Força eletromagnética e indução (16 exercícios)
- [x] Ficha 4 — Radiação, ótica e fibra ótica (18 exercícios)
- [x] Ficha 5 — Térmica e transferência de calor (22 exercícios)
- [x] Scripts de verificação numérica em `scripts/verify/`

### Task 3: Exames e teoria

- [x] Converter os 14 exercícios de exame para o modelo novo, com resolução
- [x] Resumos teóricos por tópico a partir das aulas, com fórmulas destacadas
- [x] Referência da aula em cada fórmula do registo

### Task 4: Laboratórios novos

- [x] Eletrostática e campo uniforme (mapa de cargas, pêndulos, placas, carga abandonada)
- [x] Circuitos DC e RC (redutor série/paralelo e ponte, 3 ramos, fonte real, voltímetro, comutador RC, condensadores)
- [x] Magnetismo e indução (órbita, vetores v×B, seletor, ciclotrão, gerador, transformador)
- [x] Ondas e ótica (onda EM, fonte isotrópica, espetro, Brewster, fibra, bloco)
- [x] Térmica (parede N camadas, série+paralelo, radiação, convecção, curva de aquecimento, dilatação, Joule)

### Task 5: Páginas e UX

- [x] Biblioteca de exercícios com filtros (ficha, família, estado, dificuldade, pesquisa)
- [x] Página de exercício: figura, dados, dica, resolução por passos, verificação da resposta, fórmulas, laboratório
- [x] Página de teoria e fórmulas ligada aos exercícios
- [x] Progresso por exercício (feito, a rever, dúvida) e notas pessoais
- [x] Navegação agrupada, tipografia legível, acessibilidade e mobile
- [x] Ferramentas: pesquisa global, calculadora científica com constantes e conversor de unidades
- [x] Modo local sem servidor
- [ ] Modo escuro (adiado)

### Task 6: Verificação

- [x] Testes, lint, typecheck e build a verde
- [x] Revisão visual no browser (páginas novas em desktop e telemóvel; 42 cenários de laboratório)
- [x] README atualizado
