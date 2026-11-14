/**
 * Calculadora científica sem `eval`: analisador de expressões por descida recursiva.
 *
 * Aceita: + − × ÷ ^, parêntesis, vírgula ou ponto decimal, notação científica (1,6e-19 ou 1,6×10^-19),
 * multiplicação implícita ("2pi", "3(4+1)"), funções e as constantes do formulário oficial.
 */

export interface CalculatorConstant {
  symbol: string
  label: string
  value: number
  unit: string
}

export const calculatorConstants: CalculatorConstant[] = [
  { symbol: 'k', label: 'Constante de Coulomb', value: 8.99e9, unit: 'N·m²/C²' },
  { symbol: 'eps0', label: 'Permissividade do vazio ε₀', value: 8.85e-12, unit: 'C²/(N·m²)' },
  { symbol: 'mu0', label: 'Permeabilidade do vazio μ₀', value: 4 * Math.PI * 1e-7, unit: 'N/A²' },
  { symbol: 'c', label: 'Velocidade da luz', value: 3.0e8, unit: 'm/s' },
  { symbol: 'qe', label: 'Carga elementar', value: 1.60217653e-19, unit: 'C' },
  { symbol: 'me', label: 'Massa do eletrão', value: 9.109e-31, unit: 'kg' },
  { symbol: 'mp', label: 'Massa do protão', value: 1.673e-27, unit: 'kg' },
  { symbol: 'g', label: 'Aceleração da gravidade', value: 9.81, unit: 'm/s²' },
  { symbol: 'sigma', label: 'Stefan–Boltzmann σ', value: 5.6697e-8, unit: 'W/(m²·K⁴)' },
  { symbol: 'G', label: 'Gravitação universal', value: 6.67e-11, unit: 'N·m²/kg²' },
  { symbol: 'kB', label: 'Constante de Boltzmann', value: 1.380649e-23, unit: 'J/K' },
  { symbol: 'NA', label: 'Número de Avogadro', value: 6.022e23, unit: 'mol⁻¹' },
  { symbol: 'R', label: 'Constante dos gases', value: 8.32, unit: 'J/(mol·K)' },
  { symbol: 'wien', label: 'Constante de Wien', value: 2.898e-3, unit: 'm·K' },
  { symbol: 'cal', label: 'Caloria', value: 4.186, unit: 'J' },
  { symbol: 'uma', label: 'Unidade de massa atómica', value: 1.6605e-27, unit: 'kg' },
]

const constantValues: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  ...Object.fromEntries(calculatorConstants.map((constant) => [constant.symbol, constant.value])),
}

export type AngleMode = 'deg' | 'rad'

export class CalculatorError extends Error {}

const functionNames = ['asin', 'acos', 'atan', 'sqrt', 'sin', 'cos', 'tan', 'sen', 'tg', 'ln', 'log', 'exp', 'abs', 'raiz'] as const

type Token =
  | { kind: 'number'; value: number }
  | { kind: 'name'; value: string }
  | { kind: 'operator'; value: '+' | '-' | '*' | '/' | '^' | '(' | ')' }

function tokenize(input: string): Token[] {
  const text = input
    .replace(/[−–]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi')
    .replace(/μ0|μ₀/g, 'mu0').replace(/ε0|ε₀/g, 'eps0').replace(/σ/g, 'sigma').replace(/√/g, 'sqrt')
    .replace(/²/g, '^2').replace(/³/g, '^3')
  const tokens: Token[] = []
  let index = 0
  while (index < text.length) {
    const character = text[index]
    if (/\s/.test(character)) { index += 1; continue }
    if (/[0-9.,]/.test(character)) {
      const match = text.slice(index).match(/^(\d+[.,]?\d*|[.,]\d+)(e[+-]?\d+)?/i)
      if (!match) throw new CalculatorError(`Número inválido perto de "${text.slice(index, index + 6)}"`)
      tokens.push({ kind: 'number', value: Number(match[0].replace(',', '.')) })
      index += match[0].length
      continue
    }
    if (/[a-zA-Z]/.test(character)) {
      const match = text.slice(index).match(/^[a-zA-Z][a-zA-Z0-9]*/)!
      tokens.push({ kind: 'name', value: match[0] })
      index += match[0].length
      continue
    }
    if ('+-*/^()'.includes(character)) {
      tokens.push({ kind: 'operator', value: character as '+' })
      index += 1
      continue
    }
    throw new CalculatorError(`Símbolo não reconhecido: "${character}"`)
  }
  return tokens
}

/** Calcula o valor de uma expressão. Lança CalculatorError com mensagem em português se for inválida. */
export function evaluateExpression(input: string, angleMode: AngleMode = 'deg', variables: Record<string, number> = {}): number {
  const tokens = tokenize(input)
  if (tokens.length === 0) throw new CalculatorError('Escreve uma expressão.')
  let position = 0
  const toRadians = (value: number) => angleMode === 'deg' ? value * Math.PI / 180 : value
  const fromRadians = (value: number) => angleMode === 'deg' ? value * 180 / Math.PI : value

  const peek = () => tokens[position]
  const isOperator = (value: string) => peek()?.kind === 'operator' && peek().value === value
  const next = () => tokens[position++]

  const applyFunction = (name: string, argument: number): number => {
    switch (name) {
      case 'sin': case 'sen': return Math.sin(toRadians(argument))
      case 'cos': return Math.cos(toRadians(argument))
      case 'tan': case 'tg': return Math.tan(toRadians(argument))
      case 'asin': return fromRadians(Math.asin(argument))
      case 'acos': return fromRadians(Math.acos(argument))
      case 'atan': return fromRadians(Math.atan(argument))
      case 'sqrt': case 'raiz': return Math.sqrt(argument)
      case 'ln': return Math.log(argument)
      case 'log': return Math.log10(argument)
      case 'exp': return Math.exp(argument)
      case 'abs': return Math.abs(argument)
      default: throw new CalculatorError(`Função desconhecida: ${name}`)
    }
  }

  const primary = (): number => {
    const token = next()
    if (!token) throw new CalculatorError('A expressão está incompleta.')
    if (token.kind === 'number') return token.value
    if (token.kind === 'name') {
      const lower = token.value.toLowerCase()
      if ((functionNames as readonly string[]).includes(lower)) {
        if (!isOperator('(')) throw new CalculatorError(`Falta "(" depois de ${token.value}.`)
        next()
        const argument = expression()
        if (!isOperator(')')) throw new CalculatorError('Falta fechar um parêntesis.')
        next()
        return applyFunction(lower, argument)
      }
      const value = variables[token.value] ?? constantValues[token.value] ?? constantValues[lower]
      if (value === undefined) throw new CalculatorError(`Não conheço "${token.value}".`)
      return value
    }
    if (token.value === '(') {
      const value = expression()
      if (!isOperator(')')) throw new CalculatorError('Falta fechar um parêntesis.')
      next()
      return value
    }
    throw new CalculatorError(`Operador inesperado: "${token.value}"`)
  }

  const unary = (): number => {
    if (isOperator('-')) { next(); return -unary() }
    if (isOperator('+')) { next(); return unary() }
    return power()
  }

  function power(): number {
    const base = primary()
    if (isOperator('^')) { next(); return base ** unary() }
    return base
  }

  const startsOperand = () => {
    const token = peek()
    return !!token && (token.kind === 'number' || token.kind === 'name' || (token.kind === 'operator' && token.value === '('))
  }

  const term = (): number => {
    let value = unary()
    for (;;) {
      if (isOperator('*')) { next(); value *= unary() }
      else if (isOperator('/')) { next(); value /= unary() }
      else if (startsOperand()) value *= power()
      else return value
    }
  }

  function expression(): number {
    let value = term()
    for (;;) {
      if (isOperator('+')) { next(); value += term() }
      else if (isOperator('-')) { next(); value -= term() }
      else return value
    }
  }

  const result = expression()
  if (position < tokens.length) throw new CalculatorError('Há um parêntesis ou operador a mais.')
  if (Number.isNaN(result)) throw new CalculatorError('Resultado indefinido (raiz ou logaritmo de número inválido?).')
  if (!Number.isFinite(result)) throw new CalculatorError('Divisão por zero ou número demasiado grande.')
  return result
}

/** Formata um resultado com 4 algarismos significativos e vírgula decimal. */
export function formatResult(value: number, digits = 4): string {
  if (value === 0) return '0'
  const magnitude = Math.abs(value)
  if (magnitude >= 1e5 || magnitude < 1e-3) {
    const [mantissa, exponent] = value.toExponential(digits - 1).split('e')
    return `${Number(mantissa).toString().replace('.', ',')} × 10^${Number(exponent)}`
  }
  return Number(value.toPrecision(digits)).toString().replace('.', ',')
}
