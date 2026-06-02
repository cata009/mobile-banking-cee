# Translation System - Strategy 2: Per-Country Implementation

## Overview

This translation system implements **Strategy 2** - per-country translations where each country has its own set of translations in **English + Local Language**. This approach handles country-specific variations even in English text (e.g., "Activate App" in CZ vs "Activate mBank" in RO).

---

## Architecture

### Structure

```
/src/translations/
├── types.ts                 # TypeScript interfaces for type-safety
├── index.ts                 # Master export and utility functions
├── README.md               # This file
├── CZ/                     # Czech Republic
│   ├── cs.ts              # Czech translations
│   ├── en.ts              # English translations (CZ-specific)
│   └── index.ts           # Export for CZ
├── SK/                     # Slovakia
│   ├── sk.ts              # Slovak translations
│   ├── en.ts              # English translations (SK-specific)
│   └── index.ts           # Export for SK
├── RO/                     # Romania
│   ├── ro.ts              # Romanian translations
│   ├── en.ts              # English translations (RO-specific)
│   └── index.ts           # Export for RO
├── RS/                     # Serbia
│   ├── sr.ts              # Serbian translations
│   ├── en.ts              # English translations (RS-specific)
│   └── index.ts           # Export for RS
├── HU/                     # Hungary
│   ├── hu.ts              # Hungarian translations
│   ├── en.ts              # English translations (HU-specific)
│   └── index.ts           # Export for HU
├── BA/                     # Bosnia and Herzegovina; BA_BL reuses this translation package
│   ├── bs.ts              # Bosnian translations
│   ├── en.ts              # English translations (BA-specific)
│   └── index.ts           # Export for BA
└── SI/                     # Slovenia
    ├── sl.ts              # Slovenian translations
    ├── en.ts              # English translations (SI-specific)
    └── index.ts           # Export for SI
```

---

## Key Features

### 1. **Per-Country English Variations**

English text can differ between countries based on local branding:

```typescript
// CZ/en.ts
preLogin: {
  activateApplication: 'Activate App',  // Czech-specific
}

// RO/en.ts
preLogin: {
  activateApplication: 'Activate mBank',  // Romania-specific
}
```

### 2. **Feature-Specific Translations**

Features like Co-Apping are only available in CZ/SK:

```typescript
// CZ/cs.ts
coApping: {
  title: 'Co-apping relace',
  // ... all co-apping keys
}

// RO/ro.ts
// NO coApping object - feature doesn't exist in Romania
```

### 3. **Type-Safe Keys**

All translation keys are typed via `TranslationKeys` interface:

```typescript
interface TranslationKeys {
  preLogin: {
    welcome: string;
    activateApplication: string;
    // ...
  };
  coApping?: {  // Optional - only CZ/SK
    title: string;
    // ...
  };
}
```

---

## Usage

### In Components

```typescript
import { useLanguage } from '@/app/contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('preLogin.welcome')}</h1>
      <button>{t('preLogin.activateApplication')}</button>
      
      {/* Co-Apping only in CZ/SK */}
      {t('coApping.title')}  {/* Returns key if not available */}
    </div>
  );
}
```

### Key Notation

Use dot notation to access nested keys:

```typescript
t('preLogin.welcome')                    // "Welcome" / "Vítejte" / etc.
t('panel.aboutSmartBanking')            // "ABOUT SMART BANKING"
t('home.quickActions.title')            // "Quick Actions"
t('home.transactions.filter.all')       // "All"
t('coApping.continue')                  // "Continue" (only CZ/SK)
```

---

## Country-Language Matrix

| Country | Code | Local Language | English |
|---------|------|----------------|---------|
| Czech Republic | CZ | `cs` (Čeština) | `en` |
| Slovakia | SK | `sk` (Slovenčina) | `en` |
| Romania | RO | `ro` (Română) | `en` |
| Serbia | RS | `sr` (Srpski) | `en` |
| Hungary | HU | `hu` (Magyar) | `en` |
| Bosnia | BA | `bs` (Bosanski) | `en` |
| Bosnia Banja Luka | BA_BL | `bs` (Bosanski) | `en` |
| Slovenia | SI | `sl` (Slovenščina) | `en` |

---

## Feature Availability by Country

### Co-Apping

✅ **Available:** CZ, SK
❌ **Not Available:** RO, RS, HU, BA, BA_BL, SI

Translation keys under `coApping.*` are only present in CZ and SK files.

### Product Accordion

✅ **Available:** RS (currently)
❌ **Not Available:** Other countries

Translation keys under `productAccordion.*` are country-specific.

---

## Adding New Translations

### 1. Add to Interface

Update `/src/translations/types.ts`:

```typescript
export interface TranslationKeys {
  // ... existing keys
  newFeature: {
    title: string;
    description: string;
  };
}
```

### 2. Add to All Countries

Add translations to each country's files:

```typescript
// CZ/cs.ts
newFeature: {
  title: 'Nová funkce',
  description: 'Popis nové funkce',
}

// CZ/en.ts
newFeature: {
  title: 'New Feature',
  description: 'Description of new feature',
}

// Repeat for RO, RS, HU, BA, BA_BL, SI...
```

### 3. Use in Component

```typescript
<h1>{t('newFeature.title')}</h1>
<p>{t('newFeature.description')}</p>
```

---

## Why Strategy 2?

Banking applications have subtle but critical differences between countries:

- **Branding variations:** "Activate App" vs "Activate mBank"
- **Product names:** Different product offerings per country
- **Legal requirements:** Country-specific terminology
- **Feature availability:** Co-Apping only in CZ/SK, Product Accordion in RS
- **UI copy differences:** Even English text varies based on local market

Strategy 2 provides **complete isolation** - each country manages its own translations independently, avoiding conflicts and confusion.

---

## Migration Status

✅ **Completed:**
- PreLogin screen
- Language selector
- Panel menu (inactive app)
- Co-Apping screens (CZ/SK only)
- Bottom navigation
- HomePage components (AccountSummary, QuickActions, Transactions)
- TerminateSessionPopup

All components now use the centralized translation system with `t('key.path')` notation.

---

## Auto-Detection

The system automatically selects translations based on:
1. **Country** from `useDemo().country`
2. **Language** from `useLanguage().language`

When country changes, language resets to English automatically to prevent mismatches.

---

## Fallback Behavior

If a translation key is not found:
1. Returns the key itself as fallback
2. Logs a warning in console (development only)
3. Application continues to work (no crashes)

Example:
```typescript
// If 'coApping.title' doesn't exist in RO
t('coApping.title')  // Returns: 'coApping.title'
// Console: [LanguageContext] Translation key not found: coApping.title for RO/ro
```

---

## Best Practices

### ✅ DO:
- Always use `t('key.path')` for all user-facing text
- Add new keys to `types.ts` first for type-safety
- Keep translation keys organized by feature/screen
- Use optional (`?`) for country-specific features

### ❌ DON'T:
- Hardcode text in components
- Duplicate translation keys across features
- Mix old and new translation systems
- Forget to add translations for all countries

---

## Support

For questions or issues with the translation system:
1. Check this README
2. Review `/src/translations/types.ts` for available keys
3. Look at existing components for usage examples
4. Verify country-language combinations in the matrix above
