export const DEFAULT_EXAM_DATE = '2026-09-02'

export function daysUntilExam(examDate: string, now = new Date()) {
  const [year, month, day] = examDate.split('-').map(Number)
  if (!year || !month || !day) return 0

  const examDay = Date.UTC(year, month - 1, day)
  const currentDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.round((examDay - currentDay) / 86_400_000))
}
