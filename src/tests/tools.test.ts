import { describe, expect, it } from 'vitest'
import { checkAnswer, parseStudentNumber } from '../domain/study/answer'
import { CalculatorError, evaluateExpression, formatResult } from '../domain/tools/calculator'

describe('student number parsing', () => {
  it.each([
    ['0,0012', 0.0012], ['1,2e-3', 1.2e-3], ['1.2×10^-3', 1.2e-3], ['1,2 x 10⁻³', 1.2e-3], ['−4,5', -4.5],
    ['3/5', 0.6], ['10^4', 1e4], ['2,4*10^(3)', 2400], ['+7', 7],
  ])('reads %s', (text, expected) => {
    expect(parseStudentNumber(text)).toBeCloseTo(expected, 12)
  })

  it.each(['', 'abc', '1,2,3', '4/0', '1e'])('rejects %s', (text) => {
    expect(parseStudentNumber(text)).toBeNull()
  })
})

describe('answer checking', () => {
  const target = { value: 1.2e-3, unit: 'N' }
  it('accepts values within tolerance and the rounded sheet value', () => {
    expect(checkAnswer('1,2e-3', target).verdict).toBe('correct')
    expect(checkAnswer('0,00124', target).verdict).toBe('correct')
    expect(checkAnswer('14', { value: 14.4, unit: 'N' }).verdict).toBe('correct')
  })
  it('recognises a swapped sign, a wrong power of ten and a near miss', () => {
    expect(checkAnswer('-1,2e-3', target).verdict).toBe('sign')
    expect(checkAnswer('1,2', target).verdict).toBe('power')
    expect(checkAnswer('1,2e-6', target).verdict).toBe('power')
    expect(checkAnswer('1,32e-3', target).verdict).toBe('close')
    expect(checkAnswer('5e-3', target).verdict).toBe('wrong')
    expect(checkAnswer('doze', target).verdict).toBe('invalid')
  })
  it('handles an expected value of zero', () => {
    expect(checkAnswer('0', { value: 0, unit: 'J' }).verdict).toBe('correct')
    expect(checkAnswer('3', { value: 0, unit: 'J' }).verdict).toBe('wrong')
  })
})

describe('scientific calculator', () => {
  it('respects precedence, powers and implicit multiplication', () => {
    expect(evaluateExpression('2+3*4')).toBe(14)
    expect(evaluateExpression('-2^2')).toBe(-4)
    expect(evaluateExpression('2^-3')).toBe(0.125)
    expect(evaluateExpression('2(3+1)')).toBe(8)
    expect(evaluateExpression('2pi')).toBeCloseTo(2 * Math.PI, 12)
    expect(evaluateExpression('1,5 × 10^3 ÷ 3')).toBeCloseTo(500, 9)
  })
  it('uses the official constants and scientific notation', () => {
    expect(evaluateExpression('k*(1,6e-19)^2/(4e-15)^2')).toBeCloseTo(14.384, 2)
    expect(evaluateExpression('mu0*5/(2*pi*0,004)')).toBeCloseTo(2.5e-4, 9)
    expect(evaluateExpression('sqrt(1,58^2-1,53^2)')).toBeCloseTo(0.3943, 4)
  })
  it('switches between degrees and radians', () => {
    expect(evaluateExpression('sin(30)', 'deg')).toBeCloseTo(0.5, 12)
    expect(evaluateExpression('sen(pi/6)', 'rad')).toBeCloseTo(0.5, 12)
    expect(evaluateExpression('asin(0,5)', 'deg')).toBeCloseTo(30, 9)
    expect(evaluateExpression('atan(1,5)', 'deg')).toBeCloseTo(56.31, 2)
  })
  it('explains invalid input instead of returning NaN', () => {
    expect(() => evaluateExpression('2+')).toThrow(CalculatorError)
    expect(() => evaluateExpression('1/0')).toThrow(/zero/)
    expect(() => evaluateExpression('sqrt(-1)')).toThrow(/indefinido/)
    expect(() => evaluateExpression('(2+3')).toThrow(/parêntesis/)
    expect(() => evaluateExpression('foo*2')).toThrow(/foo/)
  })
  it('formats results with a decimal comma and powers of ten', () => {
    expect(formatResult(14.384)).toBe('14,38')
    expect(formatResult(1.2e-3)).toBe('0,0012')
    expect(formatResult(6.4e-15)).toBe('6,4 × 10^-15')
    expect(formatResult(0)).toBe('0')
  })
})
