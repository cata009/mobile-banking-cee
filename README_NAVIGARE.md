# 📱 Ghid de Navigare - Co-Apping Application

## 🗂️ Structura Paginilor

### 1️⃣ **Pre-Login Inactiv** (`InteractivePreLoginInactive`)
- **Fișier**: `/src/app/components/InteractivePreLoginInactive.tsx`
- **Descriere**: Prima pagină când deschizi app-ul
- **Butoane**:
  - ✅ **"OTHER"** → Deschide overlay-ul cu opțiuni

---

### 2️⃣ **Pre-Login Activ** (`InteractivePreLoginActive`)  
- **Fișier**: `/src/app/components/InteractivePreLoginActive.tsx`
- **Descriere**: Overlay întunecat cu meniu de opțiuni
- **Acțiuni**:
  - ✅ **"START CO-APPING SESSION"** → Deschide ecranul de co-apping
  - ✅ **Click pe fundal** → Închide overlay-ul (BACK)

---

### 3️⃣ **Co-Apping Session** (`CoAppingSessionScreen`)
- **Fișier**: `/src/app/components/CoAppingSessionScreen.tsx`
- **Descriere**: Ecran pentru introducerea codului
- **Acțiuni**:
  - ✅ **"Continue"** (după introducerea codului) → Deschide Homepage cu sesiune activă
  - ✅ **Butonul "X"** → Înapoi la pagina anterioară (BACK)

---

### 4️⃣ **Homepage** (`HomepageCeeLightRestyle`)
- **Fișier**: `/src/imports/HomepageCeeLightRestyle.tsx`
- **Descriere**: Homepage-ul aplicației bancare
- **Elemente suplimentare când sesiunea e activă**:
  - ✅ **Buton verde floating** → Click deschide popup de terminare

---

### 5️⃣ **Popup Terminare Sesiune** (`TerminateSessionPopup`)
- **Fișier**: `/src/app/components/TerminateSessionPopup.tsx`
- **Acțiuni**:
  - ✅ **"Cancel"** → Închide popup-ul, rămâi în sesiune
  - ✅ **"Terminate"** → Termină sesiunea, dispare butonul verde

---

## 🔄 Sistem de Navigare

### Hook-ul `useNavigation`
**Fișier**: `/src/app/hooks/useNavigation.ts`

**Funcții disponibile**:
```typescript
const {
  currentScreen,        // Ecranul curent
  isCoAppingActive,    // Dacă sesiunea de co-apping e activă
  navigateTo,          // Navighează la un ecran nou
  goBack,              // Înapoi la ecranul anterior
  setCoAppingActive,   // Setează starea sesiunii
  canGoBack,           // Verifică dacă poți merge înapoi
} = useNavigation();
```

**Exemple de utilizare**:
```typescript
// Navighează la un ecran nou
navigateTo("co-apping-session");

// Mergi înapoi
goBack();

// Activează sesiunea de co-apping
setCoAppingActive(true);
```

---

## 📋 Flow-ul Complet

```
START
  ↓
[Pre-Login Inactiv]
  ↓ (click "OTHER")
[Pre-Login Activ - Overlay]
  ↓ (click "START CO-APPING SESSION")
[Co-Apping Session]
  ↓ (introduci cod + "Continue")
[Homepage + Buton Verde Floating]
  ↓ (click pe butonul verde)
[Popup Terminare]
  ↓ (click "Terminate")
[Homepage fără buton verde]
```

---

## 🐛 Debugging

Toate componentele au `console.log()` pentru debugging:
- Deschide **Console** în DevTools
- Vei vedea mesaje când dai click pe butoane:
  - `"OTHER clicked - navigating to active screen"`
  - `"Starting co-apping session"`
  - `"Closing overlay"`
  - etc.

---

## ✅ Ce funcționează acum:

1. ✅ Click pe "OTHER" → Deschide overlay-ul
2. ✅ Click pe "START CO-APPING SESSION" → Deschide co-apping screen
3. ✅ Click pe fundal overlay → Închide overlay-ul (înapoi)
4. ✅ Introducere cod + Continue → Deschide homepage cu sesiune activă
5. ✅ Buton verde floating visible când sesiunea e activă
6. ✅ Click pe butonul verde → Popup de terminare
7. ✅ Terminate → Sesiunea se închide, butonul verde dispare
8. ✅ Istoric de navigare funcțional (poți merge înapoi)

---

## 🔧 Cum să modifici comportamentul:

### Pentru a adăuga un nou ecran:
1. Adaugă tipul în `/src/app/hooks/useNavigation.ts`:
   ```typescript
   export type Screen = "prelogin-inactive" | "prelogin-active" | "co-apping-session" | "homepage" | "new-screen";
   ```

2. Adaugă render în `/src/app/App.tsx`:
   ```typescript
   {currentScreen === "new-screen" && (
     <YourNewScreen />
   )}
   ```

3. Navighează cu:
   ```typescript
   navigateTo("new-screen");
   ```

---

**Note**: Toate paginile Figma (NewPreLoginInactive, NewPreLoginActive, HomepageCeeLightRestyle) sunt wrappate în componente interactive pentru a detecta click-urile corect!
