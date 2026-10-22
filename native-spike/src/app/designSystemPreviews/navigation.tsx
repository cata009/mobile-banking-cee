import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BaselineNavigationRow } from '../../universal/BaselineNavigationRow';
import { BaselineCardArtwork } from '../../universal/BaselineCardArtwork';
import { ToggleButton } from '../../universal/ToggleButton';
import { sourceColor } from '../../universal/sourceColor';
import { SourceCustomIcon } from '../../universal/SourceCustomIcon';

type RowProps = React.ComponentProps<typeof BaselineNavigationRow>;

const rowVariants = new Set([
  'icon-title',
  'icon-description',
  'icon-cta',
  'icon-readed',
  'icon-prelogin',
  'no-icon-title',
  'no-icon-description',
  'no-icon-cta',
  'toggle-title',
  'toggle-description',
  'toggle-cta',
  'toggle-title-light',
  'toggle-description-light',
  'toggle-icon-light',
  'special-card',
  'special-text-message',
  'special-cta',
  'special-payment-type',
]);

const title = 'TITLE LOREM IPSUM';
const longTitle = 'TITLE LOREM IPSUM TITLE LOREM IPSUM';
const description = 'Description Short';
const noop = () => undefined;

function PlaceholderIcon({ dark }: { dark: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.placeholder,
        {
          backgroundColor: sourceColor('var(--uc-neutral-700)', dark),
        },
      ]}
    />
  );
}

function FaqIcon({ dark }: { dark: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.faqIcon}
    >
      <SourceCustomIcon
        name="help-circle"
        size={16}
        color={sourceColor('var(--uc-text)', dark)}
      />
    </View>
  );
}

function rowProps(variantId: string, dark: boolean): RowProps {
  const props: RowProps = { title };
  if (variantId.startsWith('icon-')) {
    props.leadingVisual = <PlaceholderIcon dark={dark} />;
    if (variantId !== 'icon-prelogin') {
      props.trailingAccessory = 'chevron';
      props.onPress = noop;
    }
    if (
      variantId === 'icon-title' ||
      variantId === 'icon-description' ||
      variantId === 'icon-readed'
    ) {
      props.title = longTitle;
    }
    if (variantId === 'icon-description' || variantId === 'icon-readed') {
      props.description = description;
    }
    if (variantId === 'icon-cta') props.linkLabel = 'CTA';
  } else if (variantId.startsWith('no-icon-')) {
    props.trailingAccessory = 'chevron';
    props.onPress = noop;
    props.title = variantId === 'no-icon-cta' ? title : longTitle;
    if (variantId === 'no-icon-description') props.description = description;
    if (variantId === 'no-icon-cta') props.linkLabel = 'CTA';
  } else if (variantId.startsWith('toggle-')) {
    props.trailingAccessory = 'toggle';
    props.title = variantId === 'toggle-cta' ? title : longTitle;
    if (variantId === 'toggle-description') props.description = description;
    if (variantId === 'toggle-cta') props.linkLabel = 'CTA';
    if (
      variantId === 'toggle-title-light' ||
      variantId === 'toggle-description-light'
    ) {
      props.title = 'LOREM IPSUM';
      props.titleAccessory = <FaqIcon dark={dark} />;
      props.titleStyle = { maxWidth: 94 };
      if (variantId === 'toggle-description-light') {
        props.description = 'Lorem ipsum';
        props.descriptionStyle = { maxWidth: 94 };
        props.titleAccessoryStyle = { height: 48 };
      }
    }
    if (variantId === 'toggle-icon-light') {
      props.title = 'LOREM IPSUM';
      props.leadingVisual = <PlaceholderIcon dark={dark} />;
    }
  } else if (variantId === 'special-card') {
    props.description = description;
    props.trailingAccessory = 'chevron';
    props.onPress = noop;
    props.style = { paddingLeft: 24 };
    props.titleStyle = { maxWidth: 132 };
    props.descriptionStyle = { maxWidth: 132 };
    props.leadingVisual = (
      <View
        style={[
          styles.card,
          {
            boxShadow: [
              {
                offsetX: 0,
                offsetY: 3,
                blurRadius: 4,
                color: sourceColor('rgb(var(--uc-shadow-rgb)/0.22)', dark),
              },
            ],
          },
        ]}
      >
        <BaselineCardArtwork
          variant="mc-debit-standard"
          size="figma"
          ariaLabel="Card"
          clipGeometry
        />
      </View>
    );
  } else if (variantId === 'special-payment-type') {
    props.title = 'PAYMENT TYPE';
    props.rowHeight = 64;
    props.leadingIconName = 'transaction-transfer';
    props.trailingAccessory = 'toggle';
  } else {
    props.title =
      variantId === 'special-cta' ? 'SHOW MORE' : 'NO TRANSACTION YET 🧐';
    props.rowHeight = 64;
    props.centerContent = true;
    if (variantId === 'special-cta') {
      props.titleTone = 'action';
      props.onPress = noop;
    }
  }
  return props;
}

function RowSample({ variantId, dark }: { variantId: string; dark: boolean }) {
  const [checked, setChecked] = useState(
    variantId === 'toggle-title' || variantId === 'special-payment-type',
  );
  const props = rowProps(variantId, dark);
  return (
    <View
      style={[
        styles.canvas,
        {
          backgroundColor: sourceColor('var(--uc-neutral-200)', dark),
        },
      ]}
    >
      <BaselineNavigationRow
        {...props}
        dark={dark}
        toggleChecked={checked}
        onToggle={props.trailingAccessory === 'toggle' ? setChecked : undefined}
      />
    </View>
  );
}

function ToggleSample({
  checked: initialChecked,
  dark,
}: {
  checked: boolean;
  dark: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);
  return (
    <ToggleButton
      ariaLabel="Toggle specimen"
      checked={checked}
      onToggle={setChecked}
      dark={dark}
    />
  );
}

/** Preview composition only; customer screens and this catalog share the same RN leaves. */
export function NavigationDesignSystemPreview({
  componentId,
  variantId,
  dark,
}: {
  componentId: string;
  variantId?: string;
  dark: boolean;
}): React.ReactElement | null {
  if (componentId === 'ui.toggle-button') {
    const variant = variantId ?? 'checked';
    if (variant !== 'checked' && variant !== 'unchecked') return null;
    return (
      <ToggleSample key={variant} checked={variant === 'checked'} dark={dark} />
    );
  }
  if (componentId !== 'ui.navigation-row') return null;
  const variant = variantId ?? 'icon-title';
  if (!rowVariants.has(variant)) return null;
  return <RowSample key={variant} variantId={variant} dark={dark} />;
}

const styles = StyleSheet.create({
  placeholder: { width: 32, height: 32 },
  card: { width: 64, height: 40 },
  canvas: { width: '100%', maxWidth: 375 },
  faqIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
