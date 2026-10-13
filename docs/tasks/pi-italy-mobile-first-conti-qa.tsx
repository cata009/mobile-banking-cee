/** Isolated visual QA surface: unaffected by other agents' in-progress Home imports. */
import { createRoot } from 'react-dom/client'
import { DemoProvider, DEFAULT_DEMO_STATE } from '../../src/app/state/demoStore'
import MobileFirstAccount from '../../src/experiences/pi/it/mobile-first/MobileFirstAccount'
import '../../src/styles/index.css'

createRoot(document.getElementById('root')!).render(
  <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first', productCounts: { ...DEFAULT_DEMO_STATE.productCounts, accounts: 3 } }}>
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#ededed', padding: 16 }}>
      <div style={{ width: 393, height: 852, maxWidth: '100%', position: 'relative', borderRadius: 40, overflow: 'hidden', background: 'white' }}>
        <MobileFirstAccount account={{ name: 'Andrea Rossini', number: '000012345', balance: 53550.27 }} onClose={() => {}} />
        <span style={{ position: 'absolute', zIndex: 100, top: 18, left: 16, font: '600 15px sans-serif', pointerEvents: 'none' }}>9:41</span>
      </div>
    </div>
  </DemoProvider>,
)
