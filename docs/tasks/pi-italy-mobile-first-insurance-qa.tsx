import { createRoot } from 'react-dom/client'
import { DemoProvider } from '../../src/app/state/demoStore'
import MobileFirstInsurance from '../../src/experiences/pi/it/mobile-first/MobileFirstInsurance'
import MobileFirstHome from '../../src/experiences/pi/it/mobile-first/MobileFirstHome'
import '../../src/styles/index.css'
const integrated = new URLSearchParams(window.location.search).get('entry') === 'home'
createRoot(document.getElementById('root')!).render(
  <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
    <div style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', padding: 16, background: '#ededed' }}>
      <div
        style={{
          position: 'relative',
          width: 393,
          height: 852,
          maxWidth: '100%',
          borderRadius: 40,
          overflow: 'hidden',
          background: 'white',
        }}
      >
        {integrated ? <MobileFirstHome /> : <MobileFirstInsurance initialPolicyId="famiglia-20" onClose={() => {}} />}
        <span
          style={{
            position: 'absolute',
            zIndex: 100,
            top: 18,
            left: 16,
            font: '600 15px sans-serif',
            pointerEvents: 'none',
          }}
        >
          9:41
        </span>
      </div>
    </div>
  </DemoProvider>,
)
