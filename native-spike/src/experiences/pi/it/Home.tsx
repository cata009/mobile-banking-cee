import { MainHeader } from './MainHeader';
import React, {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentRef,
} from 'react';
import {
  Image,
  PixelRatio,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ImageStyle,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Text } from '../../../universal/Typography';
import Svg, {
  Defs,
  FeGaussianBlur,
  Filter,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import type { ItalyNativeHomeProps } from './contracts';
import { ModalPortal as Modal } from '../../../universal/ModalPortal';
import type { ItalyCard } from '@/experiences/pi/it/mobile-first/cardsContent';
import {
  MOBILE_FIRST_COMMERCIAL_PRODUCTS,
  MOBILE_FIRST_PRODUCT_CATEGORIES,
} from '@/experiences/pi/it/mobile-first/content';
import {
  MOBILE_FIRST_TAB_CONTENT,
  type MobileFirstProductCategory,
} from '@/experiences/pi/it/mobile-first/productTabContent';
import { AssetGlyph } from '../../../universal/AssetGlyph';
import { SoftShadow } from '../../../universal/SoftShadow';
import { VectorArtworkLayer } from '../../../universal/VectorArtworkLayer';
import { homeAssets as a } from './homeAssets';
import { homeStyles as s } from './homeStyles';
import { homeAmountParts, useItalyHomeModel } from './homeModel';

type Category = (typeof MOBILE_FIRST_PRODUCT_CATEGORIES)[number];
type Sheet = {
  title: string;
  description?: string;
  operation?: string;
  products?: readonly HomeProduct[];
  loanSimulation?: boolean;
};
type HomeProduct = {
  title: string;
  description: string;
  image: string | number;
  crop?: {
    left?: string;
    width?: string;
    top?: string;
    height?: string;
    objectFit?: string;
  };
};
const operations = [
  { name: 'Bonifico', icon: a.transfer },
  { name: 'Gestione conto', icon: a.settings },
  { name: 'Pagamenti frequenti', icon: a.frequent },
  { name: 'Condividi IBAN', icon: a.share },
];

function Icon({ asset, size = 24 }: { asset: string | number; size?: number }) {
  return <AssetGlyph asset={asset} size={size} />;
}
function Amount({
  value,
  hidden,
  small = false,
  inverse = false,
  accountMask = false,
  loan = false,
}: {
  value: number;
  hidden: boolean;
  small?: boolean;
  inverse?: boolean;
  accountMask?: boolean;
  loan?: boolean;
}) {
  const parts =
    loan && hidden
      ? { integer: '••••', decimals: '' }
      : homeAmountParts(
          value,
          hidden,
          small && !accountMask,
          accountMask || loan ? 'always' : 'auto',
        );
  return (
    <View
      style={s.amount}
      accessibilityLabel={`${parts.integer}${parts.decimals}`}
    >
      <Text
        style={[
          s.amountInteger,
          small && s.amountSmallInteger,
          inverse && s.inverse,
        ]}
      >
        {parts.integer}
      </Text>
      <Text
        style={[
          s.amountDecimal,
          loan && s.loanAmountDecimal,
          small && s.amountSmallDecimal,
          inverse && s.inverse,
        ]}
      >
        {parts.decimals}
      </Text>
    </View>
  );
}
function Link({
  label,
  onPress,
  dark = false,
  start = false,
}: {
  label: string;
  onPress: () => void;
  dark?: boolean;
  start?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[s.link, start && s.linkStart]}
    >
      <Text style={[s.linkText, dark && s.linkDark]}>{label}</Text>
      <Icon asset={dark ? a.forwardSmall : a.forwardTeal} size={16} />
    </Pressable>
  );
}
function Controls({
  index,
  count,
  label,
  onChange,
  inset = true,
}: {
  index: number;
  count: number;
  label: string;
  onChange: (index: number) => void;
  inset?: boolean;
}) {
  return (
    <View style={[s.controls, !inset && s.noHorizontalMargin]}>
      <View style={s.arrows}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} precedente`}
          accessibilityState={{ disabled: index === 0 }}
          disabled={index === 0}
          onPress={() => onChange(index - 1)}
          style={s.arrow}
        >
          <Icon asset={index === 0 ? a.backDisabled : a.back} size={16} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} successivo`}
          accessibilityState={{ disabled: index === count - 1 }}
          disabled={index === count - 1}
          onPress={() => onChange(index + 1)}
          style={s.arrow}
        >
          <Icon asset={a.forth} size={16} />
        </Pressable>
      </View>
      <View style={s.progress} accessibilityLabel={`${index + 1} di ${count}`}>
        {Array.from({ length: count }, (_, step) => (
          <Pressable
            key={step}
            accessibilityRole="button"
            accessibilityLabel={`${label} ${step + 1}`}
            accessibilityState={{ selected: step === index }}
            onPress={() => onChange(step)}
            style={[s.progressButton, index === step && s.progressActive]}
          >
            <View
              style={[s.progressBar, step === index && s.progressBarActive]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Original vector layers retain the source brand geometry. */

function BuddyLogo() {
  // x / y / width / height percentages from LogosBuddyHorizontal.
  const boxes = [
    [21.15, 22.64, 16.89, 43.22],
    [41.14, 6.44, 17.67, 59.42],
    [61.91, 6.44, 17.68, 59.42],
    [81.56, 22.63, 18.44, 59.77],
    [0, 78.16, 8.18, 17.89],
    [0.88, 81.55, 9.03, 18.45],
    [11.66, 80.13, 5.56, 18.95],
    [17.84, 84.95, 4.87, 13.94],
    [23.29, 80.13, 1.64, 18.76],
    [25.42, 79.85, 5.67, 19.23],
    [31.6, 84.95, 4.79, 13.94],
    [34.59, 84.96, 5.25, 14.13],
    [40.28, 80.13, 4.98, 18.95],
    [45.89, 80.13, 1.63, 18.76],
    [47.94, 80.13, 3.12, 18.96],
    [0.02, 0, 20.04, 66.28],
  ];
  return (
    <View style={s.buddy} accessibilityLabel="buddy">
      <>
        {boxes.map(([x, y, w, h], i) => (
          <View key={i} style={[s.absolute, { left: x * 0.57, top: y * 0.26 }]}>
            <AssetGlyph
              asset={a.buddy[i]}
              width={w * 0.57}
              height={h * 0.26}
              fit="stretch"
            />
          </View>
        ))}
      </>
    </View>
  );
}
function Photo({
  asset,
  crop,
}: {
  asset: string | number;
  crop?: HomeProduct['crop'];
}) {
  const percent = (value: string | undefined, fallback: number) =>
    value ? parseFloat(value) / 100 : fallback;
  const style: ImageStyle = {
    position: 'absolute',
    left: 167 * percent(crop?.left, 0),
    top: 226 * percent(crop?.top, 0),
    width: 167 * percent(crop?.width, 1),
    height: 226 * percent(crop?.height, 1),
  };
  return (
    <Image
      source={typeof asset === 'number' ? asset : { uri: asset }}
      style={style}
      resizeMode="cover"
    />
  );
}
function ProductCarousel({
  category,
  onOpen,
  onIntent,
}: {
  category: Category;
  onOpen: (sheet: Sheet) => void;
  onIntent: ItalyNativeHomeProps['onIntent'];
}) {
  const isAccounts = category === 'Conti';
  const isInsurance = category === 'Polizze assicurative';
  const content = isAccounts
    ? null
    : MOBILE_FIRST_TAB_CONTENT[category as MobileFirstProductCategory];
  const products: readonly HomeProduct[] = isAccounts
    ? MOBILE_FIRST_COMMERCIAL_PRODUCTS.map((product, i) => ({
        ...product,
        image: a.products[i],
        crop:
          i === 0
            ? {
                height: '117.26%',
                width: '238.02%',
                top: '-14.27%',
                left: '-67.96%',
              }
            : i === 1
            ? {
                height: '210.55%',
                width: '177.61%',
                top: '-72.41%',
                left: '-74.29%',
              }
            : undefined,
      }))
    : content!.products;
  const rail = useRef<ComponentRef<typeof ScrollView>>(null);
  const [index, setIndex] = useState(0);
  const [railWidth, setRailWidth] = useState(377);
  const range = Math.max(0, products.length * 179 + 4 - railWidth);
  const change = (next: number) => {
    setIndex(next);
    rail.current?.scrollTo({ x: next * range, animated: true });
  };
  const openProduct = (product: HomeProduct) =>
    isInsurance
      ? onIntent?.({ kind: 'insurance-action', view: 'catalogue' })
      : onOpen({
          title: product.title,
          description: product.description,
          loanSimulation: category === 'Mutui e Prestiti',
        });
  return (
    <View style={[s.section, isInsurance && s.insuranceCommercial]}>
      <Text accessibilityRole="header" style={s.sectionHeading}>
        {isAccounts ? 'I nostri prodotti' : content!.heading}
      </Text>
      <ScrollView
        ref={rail}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.commercialRail}
        contentContainerStyle={s.commercialContent}
        accessibilityLabel={isAccounts ? 'I nostri prodotti' : content!.heading}
        onLayout={event => setRailWidth(event.nativeEvent.layout.width)}
        onScroll={event =>
          setIndex(
            range
              ? Math.min(
                  1,
                  Math.round(event.nativeEvent.contentOffset.x / range),
                )
              : 0,
          )
        }
        scrollEventThrottle={16}
      >
        {products.map((product, productIndex) => (
          <Pressable
            key={product.title}
            accessibilityRole="button"
            accessibilityLabel={product.title}
            onPress={() => openProduct(product)}
            style={s.commercialCard}
          >
            {isInsurance ? (
              <Image
                source={
                  typeof product.image === 'number'
                    ? product.image
                    : { uri: product.image }
                }
                style={[
                  s.insurancePromoImage,
                  { height: 167 / a.insurancePromoAspectRatios[productIndex] },
                ]}
              />
            ) : (
              <View style={s.commercialImage}>
                <Photo asset={product.image} crop={product.crop} />
                {isAccounts && (
                  <View style={s.productLogo}>
                    <Icon asset={a.appLogo} size={32} />
                  </View>
                )}
              </View>
            )}
            <Text
              style={isInsurance ? s.insurancePromoTitle : s.commercialTitle}
            >
              {product.title}
            </Text>
            <Text
              style={
                isInsurance
                  ? s.insurancePromoDescription
                  : s.commercialDescription
              }
            >
              {product.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {isAccounts ? (
        <Controls
          index={index}
          count={2}
          label="Prodotti"
          onChange={change}
          inset={false}
        />
      ) : (
        <View
          style={[
            s.allProducts,
            s.centeredProducts,
            isInsurance && s.insuranceProducts,
          ]}
        >
          <Link
            label={
              isInsurance
                ? 'SCOPRI I NOSTRI PRODOTTI'
                : 'SCOPRI TUTTI I NOSTRI PRODOTTI'
            }
            onPress={() =>
              isInsurance
                ? onIntent?.({ kind: 'insurance-action', view: 'catalogue' })
                : onOpen({
                    title:
                      category === 'Carte'
                        ? 'I nostri prodotti'
                        : content!.heading,
                    products,
                    loanSimulation: category === 'Mutui e Prestiti',
                  })
            }
          />
        </View>
      )}
    </View>
  );
}
function CardArtwork({ debit }: { debit: boolean }) {
  const shadeId = `home-card-shade-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const blurId = `${shadeId}-blur`;
  // Android's installed SVG filter reads stdDeviation in bitmap pixels rather
  // than scaling it with the logical SVG geometry. CSS blur(2px) uses sigma 2.
  const shadeBlur = Platform.OS === 'android' ? 2 * PixelRatio.get() : 2;
  const angle = ((debit ? 234.558 : 248.402) * Math.PI) / 180;
  const dx = Math.sin(angle),
    dy = -Math.cos(angle);
  const extent = (361 * Math.abs(dx) + 227 * Math.abs(dy)) / 2;
  return (
    <>
      <VectorArtworkLayer
        asset={debit ? a.myOne : a.flexia}
        width={361}
        height={227}
      />
      <VectorArtworkLayer
        asset={a.pattern}
        x={-109.998}
        y={-136.115}
        width={643.939}
        height={622.738}
      />
      <VectorArtworkLayer
        asset={debit ? a.debitArrow : a.creditArrow}
        x={-50.855}
        y={-0.59}
        width={226.188}
        height={229.165}
        opacity={debit ? 0.8 : 1}
      />
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox="0 0 361 227"
        preserveAspectRatio="none"
      >
        <Defs>
          <Filter
            id={blurId}
            x={-6}
            y={-6}
            width={373}
            height={239}
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
          >
            <FeGaussianBlur in="SourceGraphic" stdDeviation={shadeBlur} />
          </Filter>
          <LinearGradient
            id={shadeId}
            gradientUnits="userSpaceOnUse"
            x1={180.5 - dx * extent}
            y1={113.5 - dy * extent}
            x2={180.5 + dx * extent}
            y2={113.5 + dy * extent}
          >
            <Stop
              offset={debit ? '23.536%' : '41.581%'}
              stopColor={debit ? '#fff' : '#000'}
              stopOpacity={0}
            />
            <Stop
              offset={debit ? '97.055%' : '97.639%'}
              stopColor={debit ? '#fff' : '#000'}
              stopOpacity={debit ? 0.7 : 0.5}
            />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={361}
          height={227}
          fill={`url(#${shadeId})`}
          filter={`url(#${blurId})`}
        />
      </Svg>
    </>
  );
}
function PaymentCard({
  card,
  hidden,
  onOpen,
  onPin,
}: {
  card: ItalyCard;
  hidden: boolean;
  onOpen: () => void;
  onPin: () => void;
}) {
  const debit = card.kind === 'debit';
  return (
    <View style={[s.card, s.ownedProduct, debit && s.whiteBackground]}>
      <View style={s.cardArt} pointerEvents="none">
        <CardArtwork debit={debit} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Apri carta ${card.name}`}
        onPress={onOpen}
        style={s.flex}
      >
        <View style={[s.cardHolder, debit && s.debitHolder]}>
          <Text style={[s.cardHolderText, debit && s.dark]}>
            {card.nickname ?? card.holder}
          </Text>
          <Text style={[s.cardNumber, debit && s.dark, debit && s.debitNumber]}>
            {hidden ? '•••• ••••' : `**** ${card.lastFour}`}
          </Text>
        </View>
        <View style={[s.cardSpend, debit && s.debitSpend]}>
          <Amount
            value={card.spending}
            hidden={hidden}
            small
            inverse={!debit}
            accountMask
          />
          <Text style={[s.cardSpendLabel, debit && s.dark]}>
            Spese del mese
          </Text>
        </View>
        <View style={s.cardBrand}>
          <AssetGlyph
            asset={debit ? a.debitLogo : a.creditLogo}
            width={70}
            height={13.5484}
          />
          <View style={s.mastercard}>
            <View style={s.mastercardImage}>
              <AssetGlyph
                asset={a.mastercard}
                width={88.4666}
                height={61.2499}
              />
            </View>
          </View>
          <Text style={[s.cardBrandLabel, debit && s.dark]}>
            {debit ? 'Debit' : 'Credit'}
          </Text>
        </View>
        <Text style={[s.cardTitle, debit && s.dark]}>{card.name}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`PIN ${card.name}`}
        onPress={onPin}
        style={s.cardPin}
      >
        <Text style={[s.cardPinText, debit && s.dark]}>PIN</Text>
        <Icon asset={debit ? a.blackEye : a.whiteEye} />
      </Pressable>
    </View>
  );
}

export default function Home({
  productCounts,
  amountsHidden,
  onNavigate,
  onSearch,
  onProfile,
  onAmountsToggle,
  onIntent,
  initialCategory = 'Conti',
}: ItalyNativeHomeProps) {
  const model = useItalyHomeModel(productCounts);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [offer, setOffer] = useState('Casa');
  const [widget, setWidget] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [headerGap, setHeaderGap] = useState(16);
  const widgetRail = useRef<ComponentRef<typeof ScrollView>>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const categoryRail = useRef<ComponentRef<typeof ScrollView>>(null);
  const categoryPositions = useRef<
    Record<string, { x: number; width: number }>
  >({});
  const [width, setWidth] = useState(393);
  const [categoryWidth, setCategoryWidth] = useState(377);
  const widgetWidth = Math.min(346, Math.max(180, width - 47));
  const widgetRange = Math.max(0, 3 * widgetWidth + 71 - width);
  const chooseWidget = (next: number) => {
    setWidget(next);
    widgetRail.current?.scrollTo({
      x: (next * widgetRange) / 2,
      animated: true,
    });
  };
  const selectCategory = (name: Category) => {
    setCategory(name);
    const position = categoryPositions.current[name];
    if (position)
      categoryRail.current?.scrollTo({
        x: Math.max(0, position.x - (categoryWidth - position.width) / 2),
        animated: true,
      });
  };
  useEffect(() => {
    setCategory(initialCategory);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [initialCategory]);
  useEffect(() => {
    const position = categoryPositions.current[category];
    if (position)
      categoryRail.current?.scrollTo({
        x: Math.max(0, position.x - (categoryWidth - position.width) / 2),
        animated: false,
      });
  }, [category, categoryWidth]);
  const onWidgetScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (widgetRange)
      setWidget(
        Math.max(
          0,
          Math.min(
            2,
            Math.round((event.nativeEvent.contentOffset.x * 2) / widgetRange),
          ),
        ),
      );
  };
  const layout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth <= 0) return;
    setWidth(nextWidth);
    const nextCardWidth = Math.min(346, Math.max(180, nextWidth - 47));
    widgetRail.current?.scrollTo({
      x: (widget * Math.max(0, 3 * nextCardWidth + 71 - nextWidth)) / 2,
      animated: false,
    });
  };
  return (
    <View style={s.root} onLayout={layout}>
      <ScrollView
        ref={scroll}
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Homepage Mobile First"
        stickyHeaderIndices={[0]}
        onScroll={event =>
          setHeaderGap(Math.max(0, 16 - event.nativeEvent.contentOffset.y))
        }
        scrollEventThrottle={16}
      >
        <View style={s.chromePlaceholder}>
          <MainHeader
            tabsGap={headerGap}
            preferredProfile={model.preferredProfile}
            amountsHidden={amountsHidden}
            onSearch={onSearch}
            onPfm={() => onNavigate({ kind: 'pfm', tab: 'Bilancio familiare' })}
            onProfile={onProfile}
            onPrivacy={onAmountsToggle}
            onBrand={() =>
              setSheet({
                title: 'UniCredit e buddy',
                description:
                  'I tuoi prodotti UniCredit e le offerte buddy, in un’unica app.',
              })
            }
            selectedTab="home"
            onMainTab={tab =>
              tab === 'home'
                ? scroll.current?.scrollTo({ y: 0, animated: false })
                : onNavigate({ kind: 'investments' })
            }
          />
        </View>
        <View style={s.widgets}>
          <ScrollView
            ref={widgetRail}
            horizontal
            showsHorizontalScrollIndicator={false}
            accessibilityLabel="Riepiloghi"
            contentContainerStyle={s.widgetRail}
            snapToOffsets={[0, widgetRange / 2, widgetRange]}
            decelerationRate="fast"
            onScroll={onWidgetScroll}
            scrollEventThrottle={16}
          >
            {model.widgets.map((item, i) => (
              <View
                key={item.tab}
                style={[s.widget, { width: widgetWidth }]}
                accessibilityLabel={`Riepilogo ${i + 1}`}
              >
                <View>
                  <Text style={s.widgetTitle}>{item.title}</Text>
                  <Amount value={item.amount} hidden={amountsHidden} small />
                </View>
                <Link
                  label={item.action}
                  onPress={() => onNavigate({ kind: 'pfm', tab: item.tab })}
                  dark
                  start
                />
              </View>
            ))}
            <View style={s.railEnd} />
          </ScrollView>
          <Controls
            index={widget}
            count={3}
            label="Riepilogo"
            onChange={chooseWidget}
          />
        </View>
        <View style={s.section}>
          <Text accessibilityRole="header" style={s.sectionHeading}>
            I tuoi prodotti
          </Text>
          <ScrollView
            ref={categoryRail}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.categoryRail}
            contentContainerStyle={s.categoryContent}
            accessibilityRole="tablist"
            accessibilityLabel="Categorie prodotti"
            onLayout={event => setCategoryWidth(event.nativeEvent.layout.width)}
          >
            {MOBILE_FIRST_PRODUCT_CATEGORIES.map(name => (
              <Pressable
                key={name}
                accessibilityRole="tab"
                accessibilityLabel={name}
                accessibilityState={{ selected: category === name }}
                aria-selected={category === name}
                onPress={() => selectCategory(name)}
                onLayout={event => {
                  categoryPositions.current[name] = event.nativeEvent.layout;
                }}
                style={[s.category, category === name && s.categoryActive]}
              >
                <Text
                  style={[
                    s.categoryText,
                    category === name && s.categoryActiveText,
                  ]}
                >
                  {name}
                </Text>
                <View style={[s.categoryDot, category !== name && s.invisible]}>
                  <Icon asset={a.selected} size={4} />
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View
            style={[
              s.productList,
              category === 'Conti' && width >= 500 && s.row,
              category !== 'Conti' && width >= 650 && s.ownedGridWide,
              category !== 'Conti' && width >= 766 && s.ownedGrid,
            ]}
            accessibilityLabel={category}
          >
            {category === 'Conti' &&
              model.accounts.map(account => (
                <View
                  key={account.number}
                  style={[s.account, width >= 500 && s.flex]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Apri conto ${account.name}`}
                    onPress={() =>
                      onNavigate({
                        kind: 'account',
                        accountNumber: account.number,
                      })
                    }
                    style={s.accountContent}
                  >
                    <View style={s.accountHeading}>
                      <View style={s.accountNameColumn}>
                        <Text style={s.accountName}>{account.name}</Text>
                        <Text style={s.accountNumber}>
                          {account.number} - UniCredit
                        </Text>
                      </View>
                      <View style={s.accountChevron}>
                        <View style={{ transform: [{ scaleY: -1 }] }}>
                          <AssetGlyph
                            asset={a.accountChevron}
                            width={12}
                            height={22}
                          />
                        </View>
                      </View>
                    </View>
                    <View>
                      <Amount value={account.balance} hidden={amountsHidden} />
                      <Text style={s.balanceCaption}>
                        Saldo disponibile al {model.date}
                      </Text>
                    </View>
                  </Pressable>
                  <View style={s.quickActions}>
                    {operations.map(operation => (
                      <Pressable
                        key={operation.name}
                        accessibilityRole="button"
                        accessibilityLabel={`${operation.name} ${account.number}`}
                        onPress={() =>
                          setSheet({
                            title: operation.name,
                            operation: operation.name,
                          })
                        }
                        style={s.quickAction}
                      >
                        <View
                          style={[
                            s.quickCircle,
                            width >= 500 && s.quickCompact,
                          ]}
                        >
                          <Icon asset={operation.icon} />
                        </View>
                        <Text style={s.quickLabel}>{operation.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            {category === 'Carte' &&
              model.cards.map(card => (
                <PaymentCard
                  key={card.id}
                  card={card}
                  hidden={amountsHidden}
                  onOpen={() => onNavigate({ kind: 'card', cardId: card.id })}
                  onPin={() =>
                    onIntent?.({
                      kind: 'card-action',
                      cardId: card.id,
                      action: 'pin',
                    })
                  }
                />
              ))}
            {category === 'Mutui e Prestiti' &&
              model.homeLoans.map(loan => (
                <Pressable
                  key={loan.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Apri ${loan.name}`}
                  onPress={() => onNavigate({ kind: 'loan', loanId: loan.id })}
                  style={[s.account, s.ownedProduct]}
                >
                  <View style={s.accountHeading}>
                    <View style={s.accountNameColumn}>
                      <Text style={s.accountName}>{loan.name}</Text>
                      <Text style={s.accountNumber}>
                        Andrea Rossini - Unicredit
                      </Text>
                    </View>
                    <Icon asset={a.forwardSmall} size={16} />
                  </View>
                  <View>
                    <Amount
                      value={loan.outstanding}
                      hidden={amountsHidden}
                      loan
                    />
                    <Text style={s.balanceCaption}>
                      Capitale residuo al 31/01/2026
                    </Text>
                  </View>
                </Pressable>
              ))}
            {category === 'Polizze assicurative' &&
              model.policies.map(policy => (
                <Pressable
                  key={policy.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Apri polizza ${policy.name}`}
                  onPress={() =>
                    onNavigate({ kind: 'insurance', policyId: policy.id })
                  }
                  style={[s.policy, s.ownedProduct]}
                >
                  <View style={s.accountHeading}>
                    <View style={s.accountNameColumn}>
                      <Text style={s.accountName}>{policy.name}</Text>
                      <Text style={s.accountNumber}>
                        Numero polizza {policy.number}
                      </Text>
                      <Text style={s.policyDate}>
                        Attiva dal {policy.start.split('-').reverse().join('/')}
                      </Text>
                    </View>
                    <View style={s.accountChevron}>
                      <Icon asset={a.insuranceChevron} size={16} />
                    </View>
                  </View>
                </Pressable>
              ))}
          </View>
          {(category === 'Conti' ||
            category === 'Carte' ||
            (category === 'Mutui e Prestiti' && model.loans.length > 2) ||
            (category === 'Polizze assicurative' &&
              model.activePolicyCount > 2)) && (
            <View
              style={[
                s.allProducts,
                category !== 'Conti' && s.centeredProducts,
                category === 'Polizze assicurative' && s.insuranceProducts,
              ]}
            >
              <Link
                label={
                  category === 'Conti'
                    ? 'TUTTI I CONTI'
                    : MOBILE_FIRST_TAB_CONTENT[
                        category as MobileFirstProductCategory
                      ].allLabel
                }
                onPress={() => onIntent?.({ kind: 'category-hub', category })}
              />
            </View>
          )}
          {category === 'Mutui e Prestiti' && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Simulazione mutuo"
              style={s.simulation}
              onPress={() =>
                onIntent?.({ kind: 'loan-action', view: 'simulations' })
              }
            >
              <View style={[s.quickCircle, s.simulationCircle]}>
                <Icon asset={a.simulation} />
              </View>
              <Text style={s.simulationLabel}>{'Simulazione\nmutuo'}</Text>
            </Pressable>
          )}
        </View>
        <ProductCarousel
          key={category}
          category={category}
          onOpen={setSheet}
          onIntent={onIntent}
        />
        <View style={s.section}>
          <Text accessibilityRole="header" style={s.sectionHeading}>
            Offerte per te
          </Text>
          <View
            style={[s.categoryContent, s.offerTabs]}
            accessibilityRole="tablist"
            accessibilityLabel="Categorie offerte"
          >
            {['Casa', 'Partner'].map(name => (
              <Pressable
                key={name}
                accessibilityRole="tab"
                accessibilityLabel={name}
                accessibilityState={{ selected: offer === name }}
                aria-selected={offer === name}
                onPress={() => setOffer(name)}
                style={[s.category, offer === name && s.categoryActive]}
              >
                <Text
                  style={[
                    s.categoryText,
                    offer === name && s.categoryActiveText,
                  ]}
                >
                  {name}
                </Text>
                {offer === name && <Icon asset={a.selected} size={4} />}
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              offer === 'Casa'
                ? 'Servizi immobiliari'
                : 'Offerte dei nostri partner'
            }
            onPress={() =>
              setSheet({
                title: 'Servizi immobiliari',
                description:
                  'Scopri i numerosi servizi offerti per te dai nostri partner a prezzi dedicati.',
              })
            }
            style={s.offer}
          >
            <View style={s.offerCopy}>
              <Text style={s.offerTitle}>
                {offer === 'Casa'
                  ? 'Servizi immobiliari'
                  : 'Offerte dei nostri partner'}
              </Text>
              <Text style={s.offerDescription}>
                Scopri i numerosi servizi offerti per te dai nostri partner a
                prezzi dedicati.
              </Text>
              <BuddyLogo />
            </View>
            <Image
              source={
                typeof a.partner === 'number' ? a.partner : { uri: a.partner }
              }
              style={s.offerImage}
              resizeMode="cover"
            />
          </Pressable>
        </View>
        <View style={s.section}>
          <Text accessibilityRole="header" style={s.sectionHeading}>
            In evidenza
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={wallet === 0 ? 'Google Pay' : 'Samsung Pay'}
            onPress={() =>
              setSheet({
                title: wallet === 0 ? 'Google Pay' : 'Samsung Pay',
                description:
                  'Fai acquisti nei negozi, nella app e sul web, in tutta sicurezza.',
              })
            }
            style={[s.wallet, { width: Math.min(width - 47, 500) }]}
          >
            {wallet === 0 ? (
              <AssetGlyph asset={a.googlePay} width={52} height={24} />
            ) : (
              <View style={s.samsung}>
                <AssetGlyph asset={a.samsung} width={106.344} height={20} />
                <View style={s.samsungPay}>
                  <AssetGlyph
                    asset={a.samsungPay}
                    width={33.656}
                    height={19.024}
                  />
                </View>
              </View>
            )}
            <Text style={s.walletText}>
              <Text style={s.bold}>
                Attiva {wallet === 0 ? 'Google Pay' : 'Samsung Pay'}.
              </Text>{' '}
              Fai acquisti nei negozi, nella app e sul web, in tutta sicurezza.
            </Text>
          </Pressable>
          <Controls
            index={wallet}
            count={2}
            label="In evidenza"
            onChange={setWallet}
            inset={false}
          />
        </View>
      </ScrollView>
      <View style={s.floating}>
        <SoftShadow
          width={172}
          height={72}
          radius={120}
          offsetY={11}
          blur={17}
          color="#262626"
          opacity={0.36}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Operazioni"
          onPress={() => onIntent?.({ kind: 'operations' })}
          style={s.floatingButton}
        >
          <Text style={s.floatingText}>Operazioni</Text>
        </Pressable>
      </View>
      {sheet && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setSheet(null)}
        >
          <View style={s.sheetBackdrop}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chiudi pannello"
              onPress={() => setSheet(null)}
              style={s.sheetOverlay}
            />
            <View style={s.sheet} accessibilityViewIsModal>
              <View style={[s.accountHeading, s.sheetHeader]}>
                <Text
                  accessibilityRole="header"
                  style={[s.sectionHeading, s.sheetHeading]}
                >
                  {sheet.title}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Chiudi"
                  onPress={() => setSheet(null)}
                  style={s.sheetCloseButton}
                >
                  <Icon asset={a.panelClose} size={32} />
                </Pressable>
              </View>
              <ScrollView>
                {sheet.operation ? (
                  <>
                    <Text style={s.sheetBodyText}>Seleziona un conto</Text>
                    {model.accounts.map(account => (
                      <Pressable
                        key={account.number}
                        accessibilityRole="button"
                        accessibilityLabel={`Seleziona ${account.name}`}
                        style={s.chooserRow}
                        onPress={() => {
                          const action = sheet.operation!;
                          setSheet(null);
                          onIntent?.({
                            kind: 'account-action',
                            accountNumber: account.number,
                            action:
                              action === 'Gestione conto'
                                ? 'settings'
                                : action === 'Condividi IBAN'
                                ? 'share'
                                : action === 'Pagamenti frequenti'
                                ? 'frequent'
                                : 'transfer',
                          });
                        }}
                      >
                        <Text style={[s.sheetBodyText, s.flex]}>
                          {account.name}
                        </Text>
                        <Icon asset={a.forth} size={16} />
                      </Pressable>
                    ))}
                  </>
                ) : sheet.products ? (
                  <View style={s.sheetProducts}>
                    {sheet.products.map(product => (
                      <Pressable
                        key={product.title}
                        accessibilityRole="button"
                        accessibilityLabel={product.title}
                        style={s.sheetProductRow}
                        onPress={() =>
                          setSheet({
                            title: product.title,
                            description: product.description,
                            loanSimulation: sheet.loanSimulation,
                          })
                        }
                      >
                        <Text style={[s.sheetBodyText, s.flex]}>
                          {product.title}
                        </Text>
                        <Icon asset={a.forwardTeal} size={16} />
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <>
                    <Text
                      style={
                        sheet.loanSimulation ? s.sheetLoanText : s.sheetBodyText
                      }
                    >
                      {sheet.description}
                    </Text>
                    {sheet.loanSimulation && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Avvia simulazione mutuo"
                        style={s.loanPrimary}
                        onPress={() => {
                          setSheet(null);
                          onIntent?.({
                            kind: 'loan-action',
                            view: 'simulations',
                          });
                        }}
                      >
                        <Text style={s.loanPrimaryText}>Simulazione mutuo</Text>
                      </Pressable>
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
