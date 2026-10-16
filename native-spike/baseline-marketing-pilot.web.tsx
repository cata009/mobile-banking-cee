import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BaselineProductMenuCard } from './src/universal/BaselineProductMenuCard';
import { BaselineProductOfferCard } from './src/universal/BaselineProductOfferCard';
import { BaselineShopsmartOfferCard } from './src/universal/BaselineShopsmartOfferCard';
import { BaselineMoreCard } from './src/universal/BaselineMoreCard';
import { BaselinePreloginAccordion } from './src/universal/BaselinePreloginAccordion';
import { sourceColor } from './src/universal/sourceColor';
import { getProductBannerTone } from '@/app/config/productBannerVariants';
import accountImage from '../screenshots/account.png';
import shopPhoto from '@/assets/shopsmart/shopsmart-lentiamo.png';
import './web.css';
function Pilot() {
  const [dark, setDark] = useState(false),
    [activations, setActivations] = useState(0);
  const activate = () => setActivations(value => value + 1);
  const pageStyle = {
    padding: 24,
    background: sourceColor('var(--uc-app-bg)', dark),
    color: sourceColor('var(--uc-text)', dark),
    fontFamily: 'UniCredit-regular, sans-serif',
  };
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(327px,1fr))',
    gap: 24,
  };
  const cardStyle = { width: 327 };
  const shopStyle = { width: 327, height: 360 };
  const accordionStyle = { width: 327, background: '#262626', padding: 24 };
  const menu = {
    id: 'account',
    title: 'Current\naccount',
    background: 'var(--uc-product-blue)',
    imageSrc: accountImage,
  };
  const products = [
    { id: 'a', title: 'Product A', description: 'A useful banking product.' },
    { id: 'b', title: 'Product B', description: 'Another banking service.' },
    { id: 'c', title: 'Product C', description: 'Explore more options.' },
  ];
  return (
    <main style={pageStyle}>
      <h1>Baseline marketing · Native leaves</h1>
      <p>
        Original Source raster references, vector paths and existing More
        artwork. Native device crops, theme filters, fonts and animation timing
        remain unverified.
      </p>
      <button onClick={() => setDark(value => !value)}>Light / Dark</button>
      <div style={gridStyle}>
        <section style={cardStyle}>
          <h2>Product menu</h2>
          <BaselineProductMenuCard
            card={menu}
            onPress={activate}
            badgeCount={100}
            dark={dark}
          />
          <h2>Compact</h2>
          <BaselineProductMenuCard
            card={menu}
            variant="compact"
            onPress={activate}
            dark={dark}
          />
        </section>
        <section style={cardStyle}>
          <h2>Product offer</h2>
          <BaselineProductOfferCard
            offer={{
              id: 'offer',
              title: 'Discover our offer',
              description: 'Exclusive banking benefits.',
              caption: 'A short caption',
            }}
            tone={getProductBannerTone('green', false)}
            variant="compact"
            onPress={activate}
            dark={dark}
          />
        </section>
        <section style={cardStyle}>
          <h2>ShopSmart · partner</h2>
          <div style={shopStyle}>
            <BaselineShopsmartOfferCard
              merchant="LENTIAMO"
              title="Save on your next order"
              statusText="Ends in 7 days"
              imageSrc={shopPhoto}
              variant="partner"
              imageHeight={143}
              pillLabel="Activated"
              pillTone="white"
              tagLabel="GIFT"
              distance="3 km"
              trailingIcon="partners"
              onPress={activate}
              dark={dark}
            />
          </div>
        </section>
        <section>
          <h2>More · original crops</h2>
          <div style={gridStyle}>
            {(
              [
                'contacts',
                'documents',
                'settings',
                'gdpr-consent',
                'third-party-consent',
                'digital-activities',
                'my-requests',
                'tutorial',
              ] as const
            ).map(variant => (
              <BaselineMoreCard
                key={variant}
                variant={variant}
                title={variant.replace(/-/g, ' ')}
                badgeCount={100}
                onPress={activate}
                dark={dark}
              />
            ))}
          </div>
        </section>
        <section style={accordionStyle}>
          <h2>Prelogin · static</h2>
          <BaselinePreloginAccordion products={products} dark={dark} />
        </section>
        <section style={accordionStyle} id="native-animated">
          <h2>Prelogin · animated</h2>
          <BaselinePreloginAccordion
            products={products}
            variant="animated"
            welcomeText="Welcome"
            dark={dark}
          />
        </section>
      </div>
      <p>Activations: {activations}</p>
      <p>
        Menu CSS fallback illustrations require a supplied original artwork
        slot. This preview uses original account images; no illustrations were
        redrawn or converted.
      </p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = '1100px';
root.style.display = 'block';
createRoot(root).render(<Pilot />);
