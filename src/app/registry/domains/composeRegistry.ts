import type { TemplateRegistryItem } from './contracts'

type UnionToIntersection<T> = (T extends unknown ? (value: T) => void : never) extends (value: infer I) => void
  ? I
  : never
type RegistryDomains = readonly Readonly<Record<string, object>>[]
type ComposedRegistry<Domains extends RegistryDomains> = {
  [Key in keyof UnionToIntersection<Domains[number]>]: UnionToIntersection<Domains[number]>[Key]
}

/** Preserve the published order and reject collisions before any value can be overwritten. */
export function composeRegistry<const Domains extends RegistryDomains>(
  label: string,
  domains: Domains,
  order: readonly (keyof ComposedRegistry<Domains> & string)[],
): ComposedRegistry<Domains> {
  const entries = new Map<string, object>()
  for (const domain of domains) {
    for (const [id, value] of Object.entries(domain)) {
      if (entries.has(id)) throw new Error(`${label}: duplicate id "${id}"`)
      if ('id' in value && value.id !== id)
        throw new Error(`${label}: key "${id}" does not match entry id "${String(value.id)}"`)
      entries.set(id, value)
    }
  }
  const ordered = order.map((id) => {
    const value = entries.get(id)
    if (!value) throw new Error(`${label}: unknown ordered id "${id}"`)
    entries.delete(id)
    return [id, value] as const
  })
  if (entries.size) throw new Error(`${label}: missing ordered ids ${[...entries.keys()].join(', ')}`)
  // Every domain key occurs exactly once in the validated order. The public mapped
  // type retains the concrete domain keys, so consumers still prove union coverage.
  return Object.fromEntries(ordered) as ComposedRegistry<Domains>
}

export function composeTemplateRegistry(
  domains: readonly (readonly TemplateRegistryItem[])[],
  order: readonly string[],
): readonly TemplateRegistryItem[] {
  const entries = new Map<string, TemplateRegistryItem>()
  for (const domain of domains) {
    for (const template of domain) {
      if (entries.has(template.id)) throw new Error(`TEMPLATE_REGISTRY: duplicate id "${template.id}"`)
      entries.set(template.id, template)
    }
  }
  const ordered = order.map((id) => {
    const template = entries.get(id)
    if (!template) throw new Error(`TEMPLATE_REGISTRY: unknown ordered id "${id}"`)
    entries.delete(id)
    return template
  })
  if (entries.size) throw new Error(`TEMPLATE_REGISTRY: missing ordered ids ${[...entries.keys()].join(', ')}`)
  return ordered
}
