import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineBanner } from './src/universal/BaselineBanner';
import { BaselinePaymentHero } from './src/universal/BaselinePaymentHero';
import { BaselineCardComponent } from './src/universal/BaselineCardComponent';
import {
  BaselinePill,
  BaselinePillSorting,
} from './src/universal/BaselinePill';
import { BaselineToast } from './src/universal/BaselineToast';
import { sourceColor } from './src/universal/sourceColor';
import heroImage from '../screenshots/payments5.png';
import './web.css';
function Pilot() {
  const [dark, setDark] = useState(false),
    [events, setEvents] = useState(0);
  const activate = () => setEvents(value => value + 1);
  const pageStyle = {
    padding: 24,
    background: sourceColor('var(--uc-app-bg)', dark),
    color: sourceColor('var(--uc-text)', dark),
    fontFamily: 'UniCredit-regular, sans-serif',
  };
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(375px,1fr))',
    gap: 24,
  };
  const sampleStyle = { width: 375 };
  const pillStyle = { display: 'flex', gap: 12, flexWrap: 'wrap' as const };
  return (
    <main style={pageStyle}>
      <h1>Gallery and auxiliary · Native leaves</h1>
      <p>
        Isolated family views, with DS-only and conditional-runtime provenance.
        No components are inserted into application screens. Device fonts,
        crops, focus/accessibility and motion acceptance remain unverified.
      </p>
      <button onClick={() => setDark(value => !value)}>Light / Dark</button>
      <div style={gridStyle}>
        {(['helper', 'ghost', 'info', 'pending', 'user-event'] as const).map(
          variant => (
            <section key={variant} style={sampleStyle}>
              <h2>{variant}</h2>
              <BaselineBanner
                variant={variant}
                title="Service information"
                description="A useful message and details about your banking service."
                actionLabel={
                  variant === 'helper' ||
                  variant === 'info' ||
                  variant === 'user-event'
                    ? 'SEE DETAILS'
                    : undefined
                }
                onActionPress={activate}
                dismissible
                onClose={activate}
                showOptions
                onOptionsPress={activate}
                onPress={
                  variant === 'ghost' || variant === 'pending'
                    ? activate
                    : undefined
                }
                tagLabel={
                  variant === 'pending' ? 'EXPIRING ON 12.04.25' : undefined
                }
                dark={dark}
              />
            </section>
          ),
        )}
        <section style={sampleStyle} id="native-discover">
          <h2>Actual payment discovery</h2>
          <BaselineBanner
            variant="payment-discover"
            title="Discover payments"
            description="Transfer money and manage payments."
            dark={dark}
          />
        </section>
        <section style={sampleStyle}>
          <h2>Payment hero · original photo</h2>
          <BaselinePaymentHero
            item={{
              id: 'payment',
              title: 'Make a payment',
              description: 'Manage your payments.',
            }}
            imageVariant="payments-5"
            imageSrc={heroImage}
            onSelect={activate}
            dark={dark}
          />
        </section>
        <section style={sampleStyle}>
          <h2>Static DS card composition</h2>
          <BaselineCardComponent />
        </section>
        <section style={sampleStyle}>
          <h2>Pill states</h2>
          <div style={pillStyle}>
            {(
              [
                'primary',
                'secondary',
                'active-counter',
                'loading-counter',
                'activated',
              ] as const
            ).map(variant => (
              <BaselinePill
                key={variant}
                variant={variant}
                onPress={activate}
                dark={dark}
              />
            ))}
          </div>
          <h2>Controlled sorting</h2>
          <BaselinePillSorting onChange={activate} dark={dark} />
        </section>
        <section style={sampleStyle}>
          <h2>Toast modes</h2>
          {(['action-required', 'aware', 'google-pay'] as const).map(
            variant => (
              <BaselineToast key={variant} variant={variant} themeDark={dark} />
            ),
          )}
        </section>
      </div>
      <p>Events: {events}</p>
      <p>
        Original assets and vector artwork remain unchanged. CSS payment hero
        fallback illustrations require a supplied original artwork slot.
      </p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '1200px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
