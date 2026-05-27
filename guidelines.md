# Project Development Guidelines

This document contains mandatory rules and best practices for developing this banking mobile application.

---

## 🌍 TRANSLATION SYSTEM - MANDATORY RULE

### **RULE #1: All User-Facing Text MUST Use Centralized Translations**

**When working with ANY component (new or existing), ALWAYS apply this workflow:**

#### 1️⃣ **IDENTIFY Hardcoded Text**

Before accepting ANY component as complete, scan for hardcoded user-facing text:

```typescript
// ❌ WRONG - Hardcoded text
<h1>Welcome to Homepage</h1>
<button>Save Changes</button>
<p>Please enter your code</p>
<span>Total: $1,234.56</span>
```

#### 2️⃣ **CREATE Translation Keys**

Add keys to the centralized translation system:

**Step A:** Update `/src/translations/types.ts`
```typescript
export interface TranslationKeys {
  // ... existing keys
  newFeature: {
    title: string;
    saveButton: string;
    instructions: string;
  };
}
```

**Step B:** Add translations to ALL 14 files (7 countries × 2 languages):
- `/src/translations/CZ/cs.ts`
- `/src/translations/CZ/en.ts`
- `/src/translations/SK/sk.ts`
- `/src/translations/SK/en.ts`
- `/src/translations/RO/ro.ts`
- `/src/translations/RO/en.ts`
- `/src/translations/RS/sr.ts`
- `/src/translations/RS/en.ts`
- `/src/translations/HU/hu.ts`
- `/src/translations/HU/en.ts`
- `/src/translations/BA/bs.ts`
- `/src/translations/BA/en.ts`
- `/src/translations/SI/sl.ts`
- `/src/translations/SI/en.ts`

#### 3️⃣ **UPDATE Component**

```typescript
// ✅ CORRECT - Uses translations
import { useLanguage } from '@/app/contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('newFeature.title')}</h1>
      <button>{t('newFeature.saveButton')}</button>
      <p>{t('newFeature.instructions')}</p>
    </div>
  );
}
```

---

### 📋 **AUTOMATIC CHECKLIST**

Apply this checklist to **EVERY** component you touch:

```
□ Does the component have user-facing text?
□ Is ALL text using t('key.path') notation?
□ If NO:
  □ Add interface to types.ts
  □ Add translations to ALL 14 files (7 countries × 2 languages)
  □ Update component to use t('key')
  □ Test across all countries
```

---

### 🚨 **EXCEPTIONS** (When NOT to apply this rule)

Only skip translations for:

❌ **Logos** - Brand assets remain unchanged
❌ **SVG paths** - Technical values without text content
❌ **Numbers/Dates/Currency symbols** - Use formatting, not translation
❌ **Console logs** - Debug messages for developers
❌ **Code comments** - Technical documentation

**Everything else MUST use the translation system.**

---

### 🎯 **THIS RULE APPLIES TO:**

✅ Creating new components
✅ Editing existing components
✅ Adding new features
✅ Modifying any text
✅ Bug fixes that touch UI text
✅ **EVEN IF not explicitly mentioned in the request**

---

### 🌍 **Country-Specific Considerations**

Remember that English text can differ between countries:

```typescript
// CZ/en.ts
preLogin: {
  activateApplication: 'Activate App',  // Czech-specific branding
}

// RO/en.ts
preLogin: {
  activateApplication: 'Activate mBank',  // Romania-specific branding
}
```

Features may be country-specific:

- **Co-Apping:** Only CZ, SK (include `coApping.*` keys)
- **Product Accordion:** Only RS (include `productAccordion.*` keys)
- Other countries: DO NOT include keys for unavailable features

---

### 📚 **RATIONALE**

Why this rule is mandatory:

1. **Consistency:** All text comes from a single source of truth
2. **Scalability:** Adding a new language = edit only `/translations`
3. **Country Differences:** Handles branding variations per market
4. **Type Safety:** TypeScript validates all keys at compile time
5. **Zero Regressions:** No text escapes untranslated
6. **Maintainability:** Text changes don't require component edits

---

## 🏗️ ARCHITECTURE RULES

### Project Structure

```
/src
├── app/
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts (Language, Demo)
│   ├── screens/             # Full-screen views
│   └── App.tsx             # Main entry point
├── translations/            # Centralized translation system
│   ├── types.ts            # TypeScript interfaces
│   ├── index.ts            # Master export
│   ├── CZ/, SK/, RO/, RS/, HU/, BA/, SI/  # Per-country translations
│   └── README.md           # Translation system documentation
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
└── styles/                  # Global styles, fonts, theme
```

---

## 🎨 STYLING RULES

### Tailwind CSS v4

- Use inline Tailwind classes for styling
- Custom tokens defined in `/src/styles/theme.css`
- Font imports ONLY in `/src/styles/fonts.css`
- DO NOT create `tailwind.config.js` (using Tailwind v4)

### Import Alias

```typescript
// ✅ CORRECT - Use @ alias
import { Button } from '@/app/components/Button';
import { useDemo } from '@/app/contexts/DemoContext';

// ❌ WRONG - No relative paths
import { Button } from '../components/Button';
import { useDemo } from '../../contexts/DemoContext';
```

---

## 🚀 COMPONENT CREATION

### Component Template

```typescript
import { useLanguage } from '@/app/contexts/LanguageContext';

interface MyComponentProps {
  // Props here
}

export default function MyComponent({ /* props */ }: MyComponentProps) {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('myFeature.title')}</h1>
      {/* Component content */}
    </div>
  );
}
```

### Key Requirements

✅ **Default export** for all components
✅ **TypeScript interfaces** for all props
✅ **useLanguage()** hook for any text
✅ **Responsive design** (mobile-first)
✅ **Unique keys** for list items

---

## 📦 PACKAGE MANAGEMENT

### Installing Packages

```bash
# Use install_package tool, not manual npm install
install_package(['package-name'])
```

### Check Before Installing

Always check `package.json` first - don't reinstall existing packages.

### Required Peer Dependencies

- **@mui/material** requires: `@emotion/react`, `@emotion/styled`, `@mui/icons-material`
- **antd** requires: `@ant-design/icons`, `@ant-design/colors`

---

## 🖼️ IMAGES AND ASSETS

### Raster Images (PNG, JPG)

```typescript
// Use figma:asset scheme (NO path prefix!)
import img from "figma:asset/abc123.png";
```

### SVG Vectors

```typescript
// Use @ alias with absolute path
import svgPaths from "@/imports/svg-abc123";
```

### New Images

```typescript
// Use ImageWithFallback component
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

<ImageWithFallback src={imageSrc} alt="Description" />
```

---

## 🔒 PROTECTED FILES

**NEVER create or modify these system files:**

- `/src/app/components/figma/ImageWithFallback.tsx`
- `/pnpm-lock.yaml`
- Any file in `/node_modules/`

---

## 🧪 TESTING CHECKLIST

Before considering ANY task complete:

```
□ All user-facing text uses t('key.path')
□ Tested in all 7 countries (CZ, SK, RO, RS, HU, BA, SI)
□ Tested in both languages (EN + local) per country
□ Feature flags respected (Co-Apping only CZ/SK, etc.)
□ No TypeScript errors
□ No hardcoded text visible to users
□ Responsive on mobile viewport (393×852px)
□ All translations added to ALL 14 files
```

---

## 📖 DOCUMENTATION

### Where to Find Information

- **Translation System:** `/src/translations/README.md`
- **Demo Engine:** Check `DemoContext` and `useDemo()` hook
- **Feature Flags:** See `DemoContext` for available flags
- **Country Configuration:** Check `/src/utils/config.ts` (if exists)

---

## 🎯 SUMMARY: THE GOLDEN RULE

**"No user-facing text without translations"**

If a user can see it on screen, it MUST come from the translation system using `t('key.path')` notation.

**This applies to:**
- Buttons
- Headings
- Labels
- Placeholders
- Error messages
- Success messages
- Instructions
- Tooltips
- Anything with text!

**No exceptions** (except logos, SVG paths, debug logs).

---

## 🔄 REVISION HISTORY

| Date | Change | Author |
|------|--------|--------|
| 2026-02-02 | Initial guidelines created with Translation System Rule #1 | AI Assistant |

---

**These guidelines are MANDATORY and must be followed for ALL development work on this project.**
