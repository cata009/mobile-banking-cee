import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoProvider } from '@/app/state/demoStore';
import { DevicePreviewProvider } from '@/app/components/demo/DevicePreview';
import MobileFrame from '@/app/components/MobileFrame';
import NativeItalyApp from './src/experiences/pi/it/NativeItalyApp';
import './web.css';
import '@/styles/index.css';
import './italy-native.css';

function Preview() {
  const [chrome, setChrome] = useState({
    backgroundColor: '#fff',
    barStyle: 'dark-content',
  });
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
        <div className="native-workspace">
          <div className="native-toolbar">
            <strong>PI Italy · React Native</strong>
            <span>
              Preview al aceleiași interfețe care se compilează în APK · migrare
              în curs
            </span>
          </div>
          <div className="native-phone">
            <MobileFrame
              authoringWidth={393}
              statusBarVariant={
                chrome.barStyle === 'light-content' ? 'dark' : 'light'
              }
            >
              <div className="native-demo-root">
                <SafeAreaProvider
                  initialMetrics={{
                    frame: { x: 0, y: 0, width: 393, height: 852 },
                    insets: { top: 0, bottom: 0, left: 0, right: 0 },
                  }}
                >
                  <NativeItalyApp
                    previewInsetTop={70}
                    onScreenChromeChange={setChrome}
                  />
                </SafeAreaProvider>
              </div>
            </MobileFrame>
          </div>
        </div>
      </DevicePreviewProvider>
    </DemoProvider>
  );
}
createRoot(document.getElementById('root')).render(<Preview />);
