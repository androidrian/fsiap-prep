import type { FamilyId } from '../domain/types'
import { labCatalog } from './catalog'
import { circuitLabs } from './circuits'
import { electroLabs } from './electro'
import { magnetismLabs } from './magnetism'
import { thermalLabs } from './thermal'
import type { LabScenario } from './ui'
import { waveLabs } from './waves'

const groups: Array<Partial<Record<FamilyId, LabScenario[]>>> = [thermalLabs, electroLabs, circuitLabs, magnetismLabs, waveLabs]

const implemented = Object.fromEntries(
  (Object.keys(labCatalog) as FamilyId[]).map((family) => [family, groups.flatMap((group) => group[family] ?? [])]),
) as Record<FamilyId, LabScenario[]>

/** Cenários disponíveis por família, na ordem do catálogo (os que ainda não têm componente ficam de fora). */
export const labRegistry = Object.fromEntries(
  (Object.keys(labCatalog) as FamilyId[]).map((family) => {
    const byId = new Map(implemented[family].map((scenario) => [scenario.id, scenario]))
    const ordered = labCatalog[family].flatMap((entry) => {
      const scenario = byId.get(entry.id)
      return scenario ? [{ ...scenario, label: entry.label }] : []
    })
    const extras = implemented[family].filter((scenario) => !labCatalog[family].some((entry) => entry.id === scenario.id))
    return [family, [...ordered, ...extras]]
  }),
) as Record<FamilyId, LabScenario[]>

export const labScenarioCount = Object.values(labRegistry).reduce((sum, scenarios) => sum + scenarios.length, 0)

export function hasLabScenario(family: FamilyId, scenario: string): boolean {
  return labRegistry[family].some((entry) => entry.id === scenario)
}

export function labHref(family: FamilyId, scenario: string, params?: Record<string, string>): string {
  const query = new URLSearchParams({ family, scenario, ...params })
  return `/simulators?${query.toString()}`
}
