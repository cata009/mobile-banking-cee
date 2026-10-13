import React, { useState, useSyncExternalStore } from 'react';
import { Linking, Share, View, Pressable, StyleSheet } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import {
  nextProfileToken,
  profileHubStore,
} from '@/features/profile/mobileFirstProfile';
import { PROFILE_PERSONAS } from '@/experiences/pi/it/mobile-first/profileContent';
import { profileAssets as a } from '@/experiences/pi/it/mobile-first/profileAssets';
import { copyDemoText } from '../../../../platform/nativeFiles';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import {
  Authorize,
  Button,
  ConfirmSheet,
  Copy,
  ErrorText,
  Fact,
  Page,
  Row,
  Title,
  s,
  type ScreenNavigation,
} from './Primitives';
export default function Extras({
  route,
  onBack,
  onClose,
  onNavigate,
  onChanged,
}: ScreenNavigation) {
  const state = useSyncExternalStore(
    profileHubStore.subscribe,
    profileHubStore.getSnapshot,
  );
  const [view, setView] = useState(
    route.id ?? (route.area === 'partner' ? 'partner' : 'list'),
  );
  const [tokenReady, setTokenReady] = useState(false);
  const [buddy, setBuddy] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [featuredPartner, setFeaturedPartner] = useState(0);
  const [partnerOffer, setPartnerOffer] = useState(0);
  const back = () =>
    view === (route.id ?? (route.area === 'partner' ? 'partner' : 'list'))
      ? onBack()
      : setView(route.id ?? 'list');
  if (route.area === 'persona')
    return (
      <Page
        title="Seleziona profilo"
        description="Scegli il profilo (cambio REB), con cui desideri accedere."
        onBack={onBack}
        onClose={onClose}
      >
        {[false, true].map(legal => (
          <View key={String(legal)}>
            <Title>{legal ? 'Persona Giuridica' : 'Persona Fisica'}</Title>
            {PROFILE_PERSONAS.filter(item => item.legal === legal).map(item => (
              <Row
                key={item.id}
                label={item.name}
                detail={`${item.code}  ${item.bank}`}
                value={state.persona === item.id ? '✓' : undefined}
                onPress={() => {
                  if (
                    item.id === 'buddy-personal' &&
                    item.id !== state.persona
                  ) {
                    setBuddy(true);
                    return;
                  }
                  profileHubStore.dispatch({ type: 'persona', id: item.id });
                  onChanged();
                  onNavigate({ area: 'hub' });
                }}
              />
            ))}
          </View>
        ))}
        <ConfirmSheet
          title="Attenzione"
          body="Gentile Cliente, proseguendo, entrerai nel tuo profilo buddy."
          visible={buddy}
          onClose={() => setBuddy(false)}
          onConfirm={() => {
            profileHubStore.dispatch({ type: 'persona', id: 'buddy-personal' });
            onChanged();
            setBuddy(false);
            onNavigate({ area: 'hub' });
          }}
          confirm="Continua"
        />
      </Page>
    );
  if (route.area === 'token')
    return tokenReady ? (
      <Page
        title="Mobile Token"
        onBack={onBack}
        onClose={onClose}
        footer={
          <>
            <Button onPress={() => setTokenReady(false)}>Altra password</Button>
            <Button secondary onPress={onClose}>
              Chiudi
            </Button>
          </>
        }
      >
        <AssetGlyph asset={a.token.imgVector} size={64} />
        <Title>
          {nextProfileToken(Math.max(0, state.tokenGeneration - 1))}
        </Title>
        <Copy>Password da inserire per confermare l’operazione</Copy>
      </Page>
    ) : (
      <Authorize
        onBack={onBack}
        onClose={onClose}
        onSuccess={() => {
          profileHubStore.dispatch({ type: 'new-token' });
          onChanged();
          setTokenReady(true);
        }}
        onForgot={() =>
          onNavigate({ area: 'settings', id: 'forgot-mobile-code' })
        }
      />
    );
  if (route.area === 'apps')
    return (
      <Page title="My Apps" onBack={onBack} onClose={onClose}>
        <View style={carousel.apps}>
          {[
            ['SafetyDrive', a.apps.imgScreenshot20250328100157GooglePlayStore],
            ['MyCare', a.apps.imgScreenshot20250328100150GooglePlayStore],
            [
              'MyCareSalute',
              a.apps.imgScreenshot20250328100157GooglePlayStore1,
            ],
            ['Leasing', a.apps.imgScreenshot20250328100150GooglePlayStore1],
          ].map(([name, image]) => (
            <Pressable
              key={name}
              style={carousel.app}
              accessibilityRole="button"
              accessibilityLabel={name}
              onPress={() => {
                Linking.openURL(
                  `https://play.google.com/store/search?q=${encodeURIComponent(
                    `UniCredit ${name}`,
                  )}&c=apps`,
                ).catch(() => setError('Store non disponibile.'));
              }}
            >
              <View style={carousel.appImage}>
                <AssetGlyph asset={image} width={72} height={72} />
              </View>
              <Text style={carousel.appName}>{name}</Text>
            </Pressable>
          ))}
        </View>
        <ErrorText error={error} />
      </Page>
    );
  const title =
    view === 'invite'
      ? 'Il tuo codice invito U2502MUP6H5IPV'
      : view === 'telepass'
      ? 'Salta la coda con Telepass'
      : view === 'loan'
      ? 'I tuoi sogni a portata di mano'
      : view === 'donation'
      ? 'Il Mio Dono'
      : view === 'partner'
      ? 'Tutti i partner'
      : 'Iniziative e promo';
  return (
    <Page
      title={title}
      onBack={back}
      onClose={onClose}
      showHelp={view !== 'partner'}
    >
      {view === 'list' ? (
        <>
          <Row
            label="Il tuo codice invito"
            detail={
              state.invitationActive
                ? 'Condividi il tuo codice invito con i tuoi amici.'
                : 'Hai rinunciato a questa iniziativa.'
            }
            onPress={() => setView('invite')}
          />
          <Title>Iniziative in corso</Title>
          <Copy>Iniziative in corso di cui puoi parlare ai tuoi amici</Copy>
          {[
            [
              'loan',
              'I tuoi sogni a portata di mano',
              'Scopri il prestito UniCredit comodo, flessibile e con un tasso in promo.',
              a.promos.imgImg,
            ],
            [
              'telepass',
              'Salta la coda con Telepass',
              'Accedi alle corsie riservate Telepass in tutte le autostrade d’Italia.',
              a.promos.imgImg1,
            ],
          ].map(([id, label, body, image]) => (
            <View key={id} style={s.card}>
              <AssetGlyph asset={image} width={160} height={112} fit="cover" />
              <Row label={label} detail={body} onPress={() => setView(id)} />
              <Copy muted>Pubblicità - dal 12/04/22 a 12/12/22</Copy>
            </View>
          ))}
          <Title>Iniziative concluse</Title>
          <Row
            label="Lorem ipsum dolor"
            detail="Sit amet consectetur. Tellus dictum arcu odio massa."
            onPress={() => setView('ended')}
          />
        </>
      ) : view === 'invite' ? (
        <>
          <AssetGlyph
            asset={a.invite.imgHeroBannerMobile}
            width={343}
            height={180}
            fit="cover"
          />
          <Fact label="Periodo di validità">05/12/2024 - 10/04/2025</Fact>
          <Fact label="Codice">U2502MUP6H5IPV</Fact>
          <Button
            secondary
            onPress={() => {
              Share.share({
                message: 'U2502MUP6H5IPV',
                title: 'Il tuo codice invito',
              }).catch(() => setError('Condivisione non disponibile.'));
            }}
          >
            CONDIVIDI
          </Button>
          <Button
            secondary
            onPress={() => {
              copyDemoText('U2502MUP6H5IPV')
                .then(() => setCopied(true))
                .catch(() => setError('Copia non disponibile.'));
            }}
          >
            Copia codice
          </Button>
          {copied && <Copy>Codice copiato</Copy>}
          <Fact label="Codici inseriti">0</Fact>
          <Fact label="Aperture completate">0</Fact>
          <Fact label="Bonus">0/3.000,00 €</Fact>
          <Title>Come funziona?</Title>
          <Copy>
            Condividi il tuo codice amico con tutti i tuoi amici non ancora
            clienti. Hai tempo fino al 28/02/2025, con scadenza prorogata al
            10/04/2025.
          </Copy>
          {state.invitationActive ? (
            <Button secondary onPress={() => setCancel(true)}>
              Non desidero partecipare a questa promo
            </Button>
          ) : (
            <Copy>Non partecipi a questa promo.</Copy>
          )}
        </>
      ) : view === 'telepass' ? (
        <>
          <AssetGlyph
            asset={a.telepass.imgHeroBannerMobile}
            width={343}
            height={180}
            fit="cover"
          />
          <Copy>
            Accedi alle corsie riservate Telepass in tutte le autostrade di
            Italia.
          </Copy>
          <Fact label="Ticket accumulati">2</Fact>
          <Fact label="Rate impiegate">Giovani</Fact>
          <Title>Canone zero</Title>
          <Copy>
            Il canone di locazione del primo dispositivo è azzerato per i primi
            6 mesi, che decorreranno dal primo giorno del mese in cui è stato
            sottoscritto il contratto in Filiale.
          </Copy>
          <Title>Cashback</Title>
          <Copy>
            2% di rimborso cashback sui pedaggi autostradali effettuati dal
            5/3/2025 al 31/12/2025. Vantaggio attivabile dal cliente tramite
            l’App Telepass entro 7 giorni dalla sottoscrizione del contratto
            relativo al Servizio Telepass Family ed utilizzando il codice
            SCONTOTLP2025.
          </Copy>
          <Button onPress={() => onNavigate({ area: 'appointments' })}>
            Scopri di più
          </Button>
        </>
      ) : view === 'loan' ? (
        <>
          <AssetGlyph
            asset={a.promos.imgImg}
            width={343}
            height={180}
            fit="cover"
          />
          <Copy>
            Scopri il prestito UniCredit comodo, flessibile e con un tasso in
            promo.
          </Copy>
          <Button onPress={() => onNavigate({ area: 'loans' })}>
            Scopri di più
          </Button>
        </>
      ) : view === 'donation' ? (
        <>
          <AssetGlyph
            asset={a.hub.imgImg}
            width={343}
            height={180}
            fit="cover"
          />
          <Copy>
            La piattaforma UniCredit per la raccolta fondi, ideata per sostenere
            le Organizzazioni del Terzo Settore
          </Copy>
          <Button
            onPress={() => {
              Linking.openURL('https://www.ilmiodono.it/').catch(() =>
                setError('Pagina non disponibile.'),
              );
            }}
          >
            Scopri Il Mio Dono
          </Button>
        </>
      ) : view === 'partner' ? (
        <>
          <PartnerCarousel
            title="In primo piano"
            index={featuredPartner}
            onChange={setFeaturedPartner}
            cards={[
              {
                image: a.partners.samsung,
                logo: a.partners.samsungLogo,
                title: 'Voglia di regali?',
                body: 'Per te uno sconto fino a 250€ su tutto il catalogo Samsung fino al 31/01/2026.',
              },
              {
                image: a.partners.papernest,
                logo: a.partners.papernestLogo,
                title: 'Caro bollette?',
                body: 'Prenota subito una consulenza gratuita con papernest, per risparmiare su luce, gas, internet e telefonia.',
              },
            ]}
          />
          <PartnerCarousel
            title="Tutte le nostre offerte"
            index={partnerOffer}
            onChange={setPartnerOffer}
            cards={[
              {
                image: a.partners.treedom,
                title: 'Un’idea originale a S. Valentino?',
                body: 'Scegli un albero come regalo!',
              },
              {
                image: a.partners.premium,
                title: 'Sei in cerca di promozioni?',
                body: 'Vai su Premium4U e scopri tutti i vantaggi sui prodotti e servizi a disposizione per te!',
              },
              {
                image: a.partners.sharewood,
                title: 'Voglia di vacanze?',
                body: 'Scopri lo sconto Sharewood!',
              },
            ]}
          />
          <Copy muted>
            UniCredit è responsabile unicamente dei propri prodotti e servizi,
            ai prodotti/servizi offerti dai partner si applicano le condizioni
            dei partner.
          </Copy>
        </>
      ) : (
        <>
          <AssetGlyph
            asset={a.promos.imgImg2}
            width={343}
            height={180}
            fit="cover"
          />
          <Copy>Questa iniziativa è conclusa.</Copy>
        </>
      )}
      <ErrorText error={error} />
      <ConfirmSheet
        title="Rinuncia iniziativa"
        body="Sei sicuro di non voler partecipare a questa iniziativa?"
        visible={cancel}
        onClose={() => setCancel(false)}
        onConfirm={() => {
          profileHubStore.dispatch({ type: 'leave-promotion' });
          onChanged();
          setCancel(false);
        }}
      />
    </Page>
  );
}
function PartnerCarousel({
  title,
  index,
  onChange,
  cards,
}: {
  title: string;
  index: number;
  onChange: (index: number) => void;
  cards: { image: string; logo?: string; title: string; body: string }[];
}) {
  const card = cards[index];
  return (
    <View style={carousel.section}>
      <Title>{title}</Title>
      <View style={carousel.image}>
        <AssetGlyph asset={card.image} width={343} height={248} fit="cover" />
        {card.logo && (
          <View style={carousel.logo}>
            <AssetGlyph asset={card.logo} size={40} />
          </View>
        )}
      </View>
      <Copy strong>{card.title}</Copy>
      <Copy muted>{card.body}</Copy>
      <View style={carousel.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title}: precedente`}
          accessibilityState={{ disabled: index === 0 }}
          disabled={index === 0}
          onPress={() => onChange(index - 1)}
          style={[s.headerControl, index === 0 && s.disabled]}
        >
          <AssetGlyph asset={a.hub.imgNavigationAndActionBackK4} size={24} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title}: successivo`}
          accessibilityState={{ disabled: index === cards.length - 1 }}
          disabled={index === cards.length - 1}
          onPress={() => onChange(index + 1)}
          style={[s.headerControl, index === cards.length - 1 && s.disabled]}
        >
          <AssetGlyph asset={a.hub.imgNavigationAndActionForthK10} size={24} />
        </Pressable>
        <View style={carousel.dots}>
          {cards.map((_, i) => (
            <View
              key={i}
              style={[carousel.dot, i === index && carousel.selected]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
const carousel = StyleSheet.create({
  apps: { flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingTop: 16 },
  app: { width: '26%', alignItems: 'center', gap: 12 },
  appImage: { width: 72, height: 72, borderRadius: 16, overflow: 'hidden' },
  appName: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
  },
  section: { gap: 16, marginBottom: 40 },
  image: { height: 248, borderRadius: 16, overflow: 'hidden' },
  logo: { position: 'absolute', top: 8, left: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dots: { flexDirection: 'row', flex: 1, justifyContent: 'flex-end', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ccc' },
  selected: { backgroundColor: '#007a91' },
});
