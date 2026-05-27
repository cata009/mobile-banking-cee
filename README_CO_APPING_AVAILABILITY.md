# Co-Apping Feature - Country Availability

## 🌍 Overview

Co-Apping is a **LOCAL feature** available only in specific countries. This document explains how the feature is implemented and how it's cleanly removed for unsupported countries.

---

## ✅ Supported Countries

Co-Apping is **ONLY** available for:

- 🇨🇿 **CZ** (Czech Republic / Cehia)
- 🇸🇰 **SK** (Slovakia / Slovacia)

---

## ❌ Unsupported Countries

Co-Apping is **COMPLETELY REMOVED** for:

- 🇷🇴 **RO** (Romania)
- 🇭🇺 **HU** (Hungary)
- 🇷🇸 **RS** (Serbia)
- 🇧🇦 **BA** (Bosnia)
- 🇸🇮 **SI** (Slovenia)

---

## 🏗️ Implementation

### 1. **Availability Check Utility**

**File:** `/src/app/utils/coAppingAvailability.ts`

```typescript
export function isCoAppingAvailable(country: Country): boolean {
  return ["CZ", "SK"].includes(country);
}
```

This utility function is used throughout the app to determine if Co-Apping should be available.

---

### 2. **Clean Code Removal Strategy**

Instead of **hiding** elements with CSS or JavaScript, we **completely remove** them from the render tree:

#### ❌ BAD (Hiding):
```tsx
<div style={{ display: coAppingAvailable ? 'block' : 'none' }}>
  <CoAppingButton />
</div>
```

#### ✅ GOOD (Removing):
```tsx
{coAppingAvailable && <CoAppingButton />}
```

---

## 📦 Components Affected

### 1. **Other Menu - "START CO-APPING SESSION" Button**

**Files:**
- `/src/app/components/InteractivePreLoginActive.tsx`
- `/src/app/components/PanelWithoutCoApping.tsx`

**Implementation:**
- For **CZ/SK**: Renders `Panel.tsx` (original Figma import with Co-Apping button)
- For **RO/HU/RS/BA/SI**: Renders `PanelWithoutCoApping.tsx` (clean version without Co-Apping button)

```tsx
{coAppingAvailable ? <Panel /> : <PanelWithoutCoApping />}
```

**Result:**
- ✅ CZ/SK: Shows 4 menu items (including "START CO-APPING SESSION")
- ✅ RO/HU/RS/BA/SI: Shows only 3 menu items (ABOUT, EXCHANGE RATES, FIND ATM)

---

### 2. **Co-Apping Session Screen**

**File:** `/src/app/App.tsx`

**Implementation:**
```tsx
{currentScreen === "co-apping-session" && coAppingAvailable && (
  <CoAppingSessionScreen
    onContinue={handleContinueCoApping}
    onBack={handleCloseCoAppingScreen}
  />
)}
```

**Result:**
- ✅ CZ/SK: Screen is rendered when navigating to it
- ✅ RO/HU/RS/BA/SI: Screen is **never rendered** (component doesn't mount)

---

### 3. **Floating Co-Apping Button (Green Button)**

**File:** `/src/app/App.tsx`

**Implementation:**
```tsx
{isCoAppingActive && coAppingAvailable && (
  <FloatingCoAppingButton onClick={handleFloatingButtonClick} />
)}
```

**Result:**
- ✅ CZ/SK: Button appears when session is active
- ✅ RO/HU/RS/BA/SI: Button is **never rendered**

---

### 4. **ShareScreenGlow (Green Border Effect)**

**File:** `/src/app/App.tsx` → `MobileFrame`

**Implementation:**
```tsx
<MobileFrame 
  statusBarVariant={getStatusBarVariant()}
  isCoAppingActive={isCoAppingActive && coAppingAvailable}
  // ...
>
```

**Result:**
- ✅ CZ/SK: Green border appears when session is active
- ✅ RO/HU/RS/BA/SI: Border is **never shown** (isCoAppingActive is false)

---

### 5. **Terminate Session Popup**

**File:** `/src/app/App.tsx`

**Implementation:**
- Popup is triggered by `FloatingCoAppingButton`
- Since button doesn't exist for unsupported countries, popup is **never shown**

**Result:**
- ✅ CZ/SK: Popup appears when clicking floating button
- ✅ RO/HU/RS/BA/SI: Popup is **never triggered** (button doesn't exist)

---

## 🧪 Testing

### Test Case 1: CZ/SK Countries
1. Select **CZ** or **SK** from country dropdown
2. Navigate to Pre-Login → Click "OTHER"
3. ✅ **EXPECTED:** Menu shows 4 items including "START CO-APPING SESSION"
4. Click "START CO-APPING SESSION"
5. ✅ **EXPECTED:** Co-Apping Session screen appears
6. Enter code → Continue
7. ✅ **EXPECTED:** Homepage shows green border + floating button

### Test Case 2: RO/HU/RS/BA/SI Countries
1. Select **RO**, **HU**, **RS**, **BA**, or **SI** from country dropdown
2. Navigate to Pre-Login → Click "OTHER"
3. ✅ **EXPECTED:** Menu shows only 3 items (NO Co-Apping button)
4. Navigate to Homepage (via demo scenario "ACTIVE")
5. ✅ **EXPECTED:** NO green border, NO floating button

---

## 🎯 Benefits of This Approach

### ✅ Clean Code
- No "dead code" rendered for unsupported countries
- No CSS hiding tricks (`display: none`, `visibility: hidden`)
- No JavaScript DOM manipulation to hide elements

### ✅ Performance
- Components are not mounted at all for unsupported countries
- Smaller render tree
- Faster initial load

### ✅ Maintainability
- Clear separation: `Panel.tsx` vs `PanelWithoutCoApping.tsx`
- Easy to understand which countries have which features
- Centralized country check in `coAppingAvailability.ts`

### ✅ Type Safety
- TypeScript ensures `Country` type is used correctly
- No magic strings for country codes
- IDE autocomplete for country values

---

## 📝 Summary

| Element | CZ/SK | RO/HU/RS/BA/SI |
|---------|-------|----------------|
| "START CO-APPING SESSION" button | ✅ Visible | ❌ **Not rendered** |
| Co-Apping Session Screen | ✅ Available | ❌ **Not rendered** |
| Floating Co-Apping Button | ✅ Shows when active | ❌ **Not rendered** |
| Green Border (ShareScreenGlow) | ✅ Shows when active | ❌ **Not rendered** |
| Terminate Session Popup | ✅ Available | ❌ **Not rendered** |

---

## 🔧 How to Add/Remove Countries

### To Add a Country:
1. Open `/src/app/utils/coAppingAvailability.ts`
2. Add country code to `CO_APPING_COUNTRIES` array:
   ```typescript
   const CO_APPING_COUNTRIES: Country[] = ["CZ", "SK", "NEW_COUNTRY"];
   ```

### To Remove a Country:
1. Open `/src/app/utils/coAppingAvailability.ts`
2. Remove country code from `CO_APPING_COUNTRIES` array

**That's it!** The entire app will automatically adjust based on this single configuration. ✨
