import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import { profileServicesStore } from '@/features/profile/mobileFirstProfileServices';
import {
  getProfileDataSnapshot,
  subscribeProfileData,
} from '@/features/profile/mobileFirstProfileData';
import { profileHubStore } from '@/features/profile/mobileFirstProfile';
import {
  PROFILE_ACTIVITIES,
  PROFILE_PERSONAS,
  PROFILE_PRACTICES,
} from '@/experiences/pi/it/mobile-first/profileContent';
import { profileAssets as a } from '@/experiences/pi/it/mobile-first/profileAssets';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import buddyLogo from '@/assets/mobile-first/it/investments/commercial/buddy.svg';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import {
  ConfirmSheet,
  Copy,
  ProfileActive,
  Tabs,
  Title,
  s,
  type ScreenNavigation,
} from './Primitives';

const shortcuts = [
  ['I tuoi dati', 'personal', a.hub.imgNavigationAndActionProfileK10],
  ['La tua banca', 'bank', a.hub.imgBuildingsBankK10],
  [
    'Supporto',
    'support',
    a.hub.imgBankTouchpointAndCustomerCareKnowledgeCenterK10,
  ],
  ['Rubrica', 'contacts', a.hub.imgNavigationAndActionAddressK10],
  ['Impostazioni', 'settings', a.hub.imgNavigationAndActionSettingsK10],
  ['Mobile Token', 'token', a.hub.imgValidationMobileTokenK10],
  ['Documenti', 'documents', a.hub.imgNavigationAndActionDocumentK10],
] as const;
export default function Hub({ onNavigate, onClose }: ScreenNavigation) {
  const [tab, setTab] = useState('Notifiche');
  const [offers, setOffers] = useState('Casa');
  const [logout, setLogout] = useState(false);
  const [carousel, setCarousel] = useState(0);
  const rail = useRef<React.ElementRef<typeof ScrollView>>(null);
  const scrollTo = (index: number) => {
    setCarousel(index);
    rail.current?.scrollTo({ x: index * 171, animated: true });
  };
  const data = useSyncExternalStore(
    subscribeProfileData,
    getProfileDataSnapshot,
  );
  const hub = useSyncExternalStore(
    profileHubStore.subscribe,
    profileHubStore.getSnapshot,
  );
  const services = useSyncExternalStore(
    profileServicesStore.subscribe,
    profileServicesStore.getSnapshot,
  );
  const active = useContext(ProfileActive);
  useEffect(() => {
    if (!active) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => handler.remove();
  }, [active, onClose]);
  const persona =
    PROFILE_PERSONAS.find(item => item.id === hub.persona) ??
    PROFILE_PERSONAS[0];
  const name = persona.legal
    ? persona.name
    : `${data.firstName} ${data.lastName}`;
  const documentUnread = services.documents.filter(
    item => !item.archived && !item.read,
  ).length;
  const unread = services.notices.filter(
    item => !item.archived && !item.read,
  ).length;
  const activities = (PROFILE_ACTIVITIES[tab] ?? []).flatMap(item => {
    const record = (
      tab === 'Notifiche' ? services.notices : services.messages
    ).find(candidate => candidate.id === item.id && !candidate.archived);
    return record ? [{ ...item, title: record.title, read: record.read }] : [];
  });
  return (
    <View style={h.page}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={h.scroll}
      >
        {/* Native sticky headers replace their direct child's style; keep the controls row nested. */}
        <View>
          <View style={h.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Seleziona profilo"
              onPress={() => onNavigate({ area: 'persona' })}
              style={h.name}
            >
              <Text numberOfLines={1} style={s.title}>
                {name}
              </Text>
              <View style={h.down}>
                <AssetGlyph
                  asset={a.hub.imgNavigationAndActionDownK10}
                  size={24}
                />
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Logout"
              onPress={() => setLogout(true)}
              style={s.headerControl}
            >
              <AssetGlyph asset={a.hub.imgHelp} size={40} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chiudi profilo"
              onPress={onClose}
              style={s.headerControl}
            >
              <AssetGlyph asset={a.hub.imgHelp1} size={40} />
            </Pressable>
          </View>
        </View>
        <View style={h.grid}>
          {shortcuts.map(([label, area, icon]) => (
            <Pressable
              key={area}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => onNavigate({ area })}
              style={[h.shortcut, area === 'documents' && h.wide]}
            >
              <AssetGlyph asset={icon} size={24} />
              <Text style={h.shortcutText}>{label}</Text>
              {area === 'documents' && documentUnread > 0 && (
                <Text
                  accessibilityLabel={`${documentUnread} documenti da leggere`}
                  style={h.badge}
                >
                  {documentUnread}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
        <View style={h.sections}>
          <View style={s.stack}>
            <Title>Comunicazioni e attività</Title>
            <View>
              <Tabs
                labels={['Notifiche', 'Messaggi', 'Pratiche']}
                value={tab}
                onChange={setTab}
                label="Comunicazioni e attività"
              />
              {unread > 0 && (
                <Text
                  accessibilityLabel={`${unread} notifiche da leggere`}
                  style={[h.badge, h.unread]}
                >
                  {unread}
                </Text>
              )}
            </View>
            <View style={h.activities}>
              {tab === 'Pratiche'
                ? PROFILE_PRACTICES.filter(item =>
                    services.practices.some(
                      record => record.id === item.id && !record.archived,
                    ),
                  ).map(item => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                      onPress={() =>
                        onNavigate({
                          area: 'communications',
                          tab: 'Pratiche',
                          id: item.id,
                        })
                      }
                      style={s.card}
                    >
                      <Copy strong>{item.name}</Copy>
                      <Copy muted>{item.date}</Copy>
                      <Copy>
                        {services.practices.find(
                          record => record.id === item.id,
                        )?.status ?? item.status}
                      </Copy>
                    </Pressable>
                  ))
                : activities.map(item => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={item.title}
                      onPress={() =>
                        onNavigate({
                          area:
                            tab === 'Notifiche'
                              ? 'notification'
                              : 'communications',
                          id: item.id,
                          tab: 'Messaggi',
                        })
                      }
                      style={[h.activity, item.read && h.read]}
                    >
                      <View style={h.date}>
                        <Text style={h.day}>{item.day}</Text>
                        <Text style={h.month}>{item.month}</Text>
                      </View>
                      <View style={h.activityCopy}>
                        <Text style={h.category}>{item.category}</Text>
                        <Copy strong>{item.title}</Copy>
                      </View>
                      <Text style={h.visualizza}>VISUALIZZA ›</Text>
                    </Pressable>
                  ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                tab === 'Pratiche'
                  ? 'VEDI TUTTE LE PRATICHE'
                  : tab === 'Messaggi'
                  ? 'VEDI TUTTI I MESSAGGI'
                  : 'VEDI TUTTE LE NOTIFICHE'
              }
              onPress={() => onNavigate({ area: 'communications', tab })}
            >
              <Text style={h.centerLink}>
                VEDI{' '}
                {tab === 'Pratiche'
                  ? 'TUTTE LE PRATICHE'
                  : tab === 'Messaggi'
                  ? 'TUTTI I MESSAGGI'
                  : 'TUTTE LE NOTIFICHE'}{' '}
                ›
              </Text>
            </Pressable>
          </View>
          <View style={s.stack}>
            <Title>In evidenza</Title>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Il Mio Dono"
              onPress={() => onNavigate({ area: 'partner', id: 'donation' })}
              style={h.donation}
            >
              <View style={h.bannerCopy}>
                <Copy strong>Il Mio Dono</Copy>
                <Text style={h.donationCopy}>
                  La piattaforma UniCredit per la raccolta fondi, ideata per
                  sostenere le Organizzazioni del Terzo Settore
                </Text>
              </View>
              <AssetGlyph
                asset={a.hub.imgImg}
                width={108}
                height={150}
                fit="cover"
              />
            </Pressable>
          </View>
          <View style={s.stack}>
            <Title>Altro</Title>
            <ScrollView
              ref={rail}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={h.rail}
            >
              {[
                ['Trova Filiali', a.hub.imgImage, 'branches'],
                ['My Apps', a.hub.imgImage1, 'apps'],
                ['Iniziative e promo', a.hub.imgImage2, 'promotions'],
              ].map(([label, image, area]) => (
                <Pressable
                  key={area}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  onPress={() => onNavigate({ area })}
                  style={h.other}
                >
                  <AssetGlyph
                    asset={image}
                    width={167}
                    height={226}
                    fit="cover"
                  />
                  <Text style={h.otherText}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={h.carouselControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Altro precedente"
                accessibilityState={{ disabled: carousel === 0 }}
                disabled={carousel === 0}
                onPress={() => scrollTo(carousel - 1)}
                style={[s.headerControl, carousel === 0 && s.disabled]}
              >
                <View style={h.controlCircle}>
                  <AssetGlyph
                    asset={a.hub.imgNavigationAndActionBackK4}
                    size={24}
                  />
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Altro successivo"
                accessibilityState={{ disabled: carousel === 2 }}
                disabled={carousel === 2}
                onPress={() => scrollTo(carousel + 1)}
                style={[s.headerControl, carousel === 2 && s.disabled]}
              >
                <View style={h.controlCircle}>
                  <AssetGlyph
                    asset={a.hub.imgNavigationAndActionForthK10}
                    size={24}
                  />
                </View>
              </Pressable>
              <View style={h.dots}>
                {[0, 1, 2].map(index => (
                  <View
                    key={index}
                    style={[h.dot, carousel === index && h.selectedDot]}
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={s.stack}>
            <Title>Vantaggi per te</Title>
            <Tabs
              labels={['Casa', 'Partner']}
              value={offers}
              onChange={setOffers}
              label="Vantaggi per te"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                offers === 'Casa'
                  ? 'Servizi immobiliari'
                  : 'Scopri tutte le offerte dei nostri partner'
              }
              onPress={() => onNavigate({ area: 'partner' })}
              style={h.offer}
            >
              <View style={h.bannerCopy}>
                <Text style={h.offerTitle}>
                  {offers === 'Casa'
                    ? 'Servizi immobiliari'
                    : 'Scopri tutte le offerte dei nostri partner'}
                </Text>
                <Text style={h.offerCopy}>
                  Scopri i numerosi servizi offerti per te dai nostri partner a
                  prezzi dedicati.
                </Text>
                <AssetGlyph
                  asset={buddyLogo}
                  width={57}
                  height={26}
                  tintColor="#fff"
                />
              </View>
              <AssetGlyph
                asset={a.hub.imgImg1}
                width={108}
                height={200}
                fit="cover"
              />
            </Pressable>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Logout"
          onPress={() => setLogout(true)}
          style={h.logout}
        >
          <AssetGlyph asset={a.hub.imgNavigationAndActionLogoutK10} size={24} />
          <Copy strong>Logout</Copy>
        </Pressable>
      </ScrollView>
      <ConfirmSheet
        title="Logout"
        body="Vuoi uscire dall’app?"
        visible={logout}
        onClose={() => setLogout(false)}
        onConfirm={() => {
          setLogout(false);
          onClose();
        }}
        confirm="Esci"
      />
    </View>
  );
}
const h = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  bannerCopy: { flex: 1, gap: 8, paddingVertical: 16 },
  down: { transform: [{ rotate: '180deg' }] },
  scroll: { paddingBottom: 32 },
  header: {
    minHeight: 66,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  grid: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  shortcut: {
    width: '24%',
    flexGrow: 1,
    minHeight: 124,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  wide: { width: '49%' },
  shortcutText: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 16,
    color: '#262626',
    textAlign: 'center',
  },
  sections: { padding: 16, paddingTop: 24, gap: 40 },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 16,
    height: 16,
    textAlign: 'center',
    borderRadius: 8,
    color: '#fff',
    backgroundColor: '#e2001a',
    fontFamily: tokens.strongFont,
    fontSize: 12,
    lineHeight: 16,
  },
  unread: { right: undefined, left: 74, top: -4 },
  activities: { gap: 4 },
  activity: {
    backgroundColor: '#f5f5f5',
    minHeight: 88,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007a91',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  read: { borderColor: '#ccc' },
  date: { width: 38, gap: 4, alignItems: 'center' },
  day: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    lineHeight: 34,
    color: '#262626',
  },
  month: {
    fontFamily: tokens.font,
    fontSize: 12,
    lineHeight: 14,
    color: '#262626',
  },
  activityCopy: { flex: 1, gap: 8, paddingTop: 8 },
  category: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 16,
    color: '#262626',
    paddingRight: 90,
  },
  visualizza: {
    position: 'absolute',
    top: 12,
    right: 8,
    color: '#007a91',
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 16,
  },
  centerLink: { ...s.link, textAlign: 'center', padding: 12 },
  offer: {
    backgroundColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    gap: 8,
    paddingLeft: 16,
  },
  donation: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 130,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    paddingLeft: 16,
    gap: 8,
  },
  donationCopy: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
  },
  offerTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: '#fff',
  },
  offerCopy: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
  },
  small: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  rail: { gap: 4 },
  other: {
    width: 167,
    gap: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  otherText: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: '#262626',
  },
  carouselControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
  },
  controlCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 2 },
  dot: { width: 12, height: 4, backgroundColor: '#ccc' },
  selectedDot: { width: 24, backgroundColor: tokens.accent },
  logout: {
    marginTop: 32,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
