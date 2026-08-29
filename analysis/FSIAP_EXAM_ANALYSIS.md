# Análise das provas de FSIAP

## Âmbito e método

Foram inspecionados todos os ficheiros com estrutura de exame, recurso, frequência, mini-teste ou teste intercalar dentro da pasta `FSIAP`. Cópias idênticas em pastas diferentes foram removidas por SHA-256. A cópia bilingue `mini-teste-2025.pdf` e o `teste-intercalar-2025.pdf` têm os mesmos três problemas, pelo que contam como uma única avaliação.

O conjunto final tem:

- 14 exames completos únicos;
- 2 testes/frequências únicos;
- 76 problemas principais;
- 227 subquestões;
- 10 famílias de raciocínio.

Os exames completos disponibilizam 15 valores de parte prática. Para tornar a cobertura comparável com a escala pedida de 0-20, cada contribuição média foi multiplicada por `20/15`. Os testes intercalares não entram nessa soma: apenas reforçam o sinal de atualidade. A componente teórica de escolha múltipla aparece vazia nos PDFs e não foi inferida.

## Famílias encontradas

| Família | Presença nos 14 exames | Contribuição média normalizada | Sinal recente |
|---|---:|---:|---:|
| Transferência térmica e resistências | 13/14 | 3,43 valores | 5/5 provas recentes |
| Refração, reflexão total e fibras | 13/14 | 3,14 valores | 5/5 provas recentes |
| Cargas, campo, potencial e trabalho | 11/14 | 3,14 valores | 5/5 provas recentes |
| Força magnética e trajetórias | 9/14 | 2,57 valores | 5/5 provas recentes |
| Condensadores e transitórios RC | 11/14 | 2,43 valores | 5/5 provas recentes |
| Circuitos DC e leis de Kirchhoff | 8/14 | 1,57 valores | 3/5 provas recentes |
| Ondas EM, intensidade e polarização | 8/14 | 1,43 valores | 3/5 provas recentes |
| Partículas em campo elétrico uniforme | 3/14 | 0,86 valores | 1/5 provas recentes |
| Indução e fontes de campo magnético | 3/14 | 0,86 valores | 0/5 provas recentes |
| Calorimetria e equilíbrio térmico | 3/14 | 0,57 valores | 1/5 provas recentes |

As contribuições médias somam 20,00 valores. Quando uma questão mistura métodos (por exemplo circuito DC e transitório RC, ou ótica e intensidade EM), o peso foi dividido pelas subquestões para não contar os mesmos valores duas vezes.

## Prioridade inicial antes do diagnóstico

1. Transferência térmica e resistências;
2. Ótica geométrica;
3. Eletrostática de cargas pontuais;
4. Circuitos RC;
5. Movimento de partículas em campos magnéticos.

Esta ordem é apenas histórica. Depois do diagnóstico, o motor combina importância com fraqueza, esquecimento e pré-requisitos. Por exemplo, Circuitos DC pode ultrapassar RC se for o pré-requisito frágil que impede a resolução de transitórios.

## Cobertura para aprovação

Não existe uma combinação garantida. Historicamente, as cinco famílias principais acima representam em média cerca de 14,7 valores normalizados da componente prática observável. Isto sugere uma margem útil para uma meta de preparação de 13/20, mas não substitui treino intercalado, retenção nem simulados, e não cobre as perguntas teóricas ausentes.

## Pré-requisitos principais

- Circuitos DC → Circuitos RC;
- Campo elétrico e vetores → Partículas em campo elétrico uniforme;
- Campo elétrico uniforme → Força de Lorentz e seletores de velocidade;
- Ótica/refração → Ondas EM em meios e polarização;
- Circuitos DC → Indução, solenóides e transformadores.

## Fórmula de prioridade implementada

```text
examImportance = 0.48·frequência + 0.34·valor histórico + 0.18·atualidade

studyScore = examImportance
           · (0.50 + 0.50·fraqueza)
           · (1 + risco de esquecimento)
           · fator de pré-requisito
           + reforço por dependências
```

O motor expõe ao utilizador as razões concretas da recomendação: frequência, contribuição média, confiança atual e presença recente.

## Limitações dos materiais

- Várias provas antigas são folhas de “exercícios que saíram” e não mostram duração/peso por subquestão;
- nesses casos, os 15 valores práticos distribuídos por cinco problemas suportam a normalização de 3 valores por problema, mas a aplicação marca a origem como inferida;
- as imagens/figuras dos circuitos são necessárias para resolver alguns enunciados e não foram convertidas em novos exercícios automáticos nesta versão;
- as escolhas múltiplas teóricas não aparecem visualmente nos PDFs mais recentes, portanto não há estatística histórica segura para essa componente.
