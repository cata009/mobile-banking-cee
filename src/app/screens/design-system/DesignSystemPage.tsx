import { useEffect, useRef, useState } from 'react'
import { DESIGN_SYSTEM_FIGMA_URL } from './documentationLinks'
import {
  getDefaultSectionForInventoryTab,
  getInventoryTabForHash,
  inventoryTabLabels,
  inventoryTabs,
  parseComponentDetailHash,
  type InventoryTab,
} from './inventoryNav'
import FigmaLibraryInventory from './FigmaLibraryInventory'
import { ColorInventory, IconInventory, TypographyInventory } from './inventories'
import ComponentDetailScreen from './ComponentDetailScreen'
import './DesignSystem.css'

/** One catalog. Figma aliases and existing runtime components meet in the same entries. */
export default function DesignSystemPage() {
  const scrollContainer = useRef<HTMLDivElement>(null)
  const initialHash = typeof window === 'undefined' ? '' : window.location.hash
  const lastGalleryHash = useRef(parseComponentDetailHash(initialHash) ? '#figma-library' : initialHash)
  const [inventoryTab, setInventoryTab] = useState<InventoryTab>(() => getInventoryTabForHash(initialHash))
  const [detailComponentId, setDetailComponentId] = useState<string | null>(() => parseComponentDetailHash(initialHash))
  useEffect(() => {
    const sync = () => {
      const detail = parseComponentDetailHash(window.location.hash)
      setDetailComponentId(detail)
      if (!detail) {
        lastGalleryHash.current = window.location.hash
        setInventoryTab(getInventoryTabForHash(window.location.hash))
      }
      scrollContainer.current?.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  const handleInventoryTabChange = (tab: InventoryTab) => {
    setDetailComponentId(null)
    setInventoryTab(tab)
    const hash = tab === 'components' ? '#figma-library' : '#' + getDefaultSectionForInventoryTab(tab)
    lastGalleryHash.current = hash
    window.history.replaceState(null, '', hash)
    window.dispatchEvent(new Event('hashchange'))
  }
  return (
    <div ref={scrollContainer} className="ds-workspace h-full w-full self-stretch overflow-y-auto">
      <div className="ds-page-shell">
        {!detailComponentId ? (
          <header className="ds-library-heading">
            <div>
              <span className="ds-eyebrow">UniCredit / Mobile banking CEE</span>
              <h1>Design system</h1>
              <p>Explore the shared components, their variants and the source behind every interface.</p>
            </div>
            <a className="ds-text-link" href={DESIGN_SYSTEM_FIGMA_URL} target="_blank" rel="noreferrer">
              Design documentation ↗
            </a>
          </header>
        ) : null}
        <div className="ds-inventory-tabs" role="tablist" aria-label="Design system inventory tabs">
          {inventoryTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={inventoryTab === tab}
              onClick={() => handleInventoryTabChange(tab)}
              className="ds-inventory-tab"
            >
              {inventoryTabLabels[tab]}
            </button>
          ))}
        </div>
        <main className="min-w-0 flex-1">
          {detailComponentId ? (
            <ComponentDetailScreen
              key={detailComponentId}
              componentId={detailComponentId}
              onBack={() => {
                window.history.replaceState(null, '', lastGalleryHash.current || '#figma-library')
                window.dispatchEvent(new Event('hashchange'))
              }}
            />
          ) : inventoryTab === 'components' ? (
            <FigmaLibraryInventory />
          ) : inventoryTab === 'icons' ? (
            <IconInventory />
          ) : inventoryTab === 'colors' ? (
            <ColorInventory />
          ) : (
            <TypographyInventory />
          )}
        </main>
      </div>
    </div>
  )
}
