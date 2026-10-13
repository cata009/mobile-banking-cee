import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DemoProvider } from '@/app/state/demoStore';
import { DevicePreviewProvider } from '@/app/components/demo/DevicePreview';
import MobileFrame from '@/app/components/MobileFrame';
import Home from '@/experiences/pi/it/mobile-first/MobileFirstHome';
import { Tabs } from './src/universal/controls';
import { mobileFirstTokens } from './src/universal/tokens';
import { SearchRendererContext } from './src/experiences/pi/it/rendererContext';
import './web.css';
import '@/styles/index.css';
import './italy-migration.css';

function Preview() {
  const [renderer, setRenderer] = useState('shared'),
    [chrome, setChrome] = useState('light');
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'IT',
        designSystem: 'mobile-first',
        release: 'release-current',
        scenario: 'active',
        bankingScenario: 'retail-single-account',
      }}
    >
      <DevicePreviewProvider>
        <SearchRendererContext.Provider value={renderer}>
          <div className="migration-workspace">
            <div className="migration-toolbar">
              <strong>PI Italy · Home reference + Search candidate</strong>
              <Tabs
                tokens={mobileFirstTokens}
                label="Search renderer"
                value={renderer}
                items={[
                  { value: 'reference', label: 'Reference Search' },
                  { value: 'shared', label: 'Shared Search' },
                ]}
                onChange={setRenderer}
              />
              <span>
                Destination screens retain their current web implementation.
              </span>
            </div>
            <div className="migration-phone">
              <MobileFrame authoringWidth={393} statusBarVariant={chrome}>
                <Home onPhoneChromeChange={setChrome} />
              </MobileFrame>
            </div>
          </div>
        </SearchRendererContext.Provider>
      </DevicePreviewProvider>
    </DemoProvider>
  );
}
createRoot(document.getElementById('root')).render(<Preview />);
