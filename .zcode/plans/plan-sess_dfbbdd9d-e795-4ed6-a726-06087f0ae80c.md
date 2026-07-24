## Obiectiv
Refactor al layout-ului `HuKidsAddMoneyPage` ca să arate ca Revolut (poza de referință). Problema actuală: operators sunt în grid-ul 4×4 (colț dreapta), iar CTA/presets sunt jos de tot. Trebuie reorganizat.

## Noua ordine a rândurilor (top → bottom)
1. **Header** "Add money" (back) — neschimbat
2. **Amount display** + goal context + HUF — neschimbat
3. **Account selector** — neschimbat
4. **CTA row**: calendar (icon `calendar-days`, no-op) + `Add X HUF` (submit button) — **MUTAT AICI de jos**
5. **Operators/presets row** (condițional):
   - Când `amount === 0` (default, expresie goală): afișează **presets** (+1000 +2500 +5000) — 3 coloane
   - Când `amount > 0` sau există operator: afișează **operators** (+ − × ÷ =) + clear — rând orizontal deasupra keypad-ului
6. **Keypad numeric** (3 coloane): `1 2 3 / 4 5 6 / 7 8 9 / . 0 ⌫` — **fără operators în grid** (era 4×4 cu operators în colț, devine 3×4 curat)

## Decizii (din clarificări)
- **Layout**: CTA sus sub account selector, keypad jos (varianta "CTA sus sub amount, keypad jos").
- **Calendar**: no-op placeholder cu icon `calendar-days` (existent lucide), lângă CTA.

## Implementare — doar `src/app/screens/kids/hu/goals.tsx`

Refactor JSX-ul `HuKidsAddMoneyPage` (liniile ~580-688):

### 1. Keypad devine 3 coloane (fără operators)
```
grid grid-cols-3 gap-[8px]
[1] [2] [3]
[4] [5] [6]
[7] [8] [9]
[.] [0] [⌫]
```

### 2. Rând operators/presets (deasupra keypad, condițional)
- Variabilă `hasAmount = expression.length > 0` (orice digit tastat).
- Dacă `!hasAmount`: randează presets (`grid grid-cols-3`).
- Dacă `hasAmount`: randează operators row (`flex gap-[8px]`) cu `[+ − × ÷ = C]` — `=` evaluează, `C` clear. Operators ca pills/chips orizontale.

### 3. CTA row (deasupra operators/presets, sub account selector)
```
flex gap-[8px]
[📅 calendar no-op] [Add X HUF → PrimaryButton flex-1]
```
Mutat de la linia 659-687 în sus, după account selector.

### 4. Elimin duplicarea
Scot `KEYPAD_PRESETS` randarea veche de jos și `Action row` veche (clear/= /submit) — logica lor se mută în rândurile noi de operators și CTA.

## Ce rămâne neschimbat
- `evaluateExpression`, `OPERATOR_RE`, `TRAILING_OPERATOR_RE`, state-ul (`expression`, `selectedAccount`, `isAccountSheetOpen`), `appendToken`/`backspace`/`clear`.
- Account bottom sheet (liniile 690+).
- Wiring-ul din KidsMarketHomeApp (deja funcțional).

## Verificare
- `npm run build`.
- Browser smoke: deschide Add money → keypad 3×4 curat jos, operators apar deasupra când tastezi, presets default când gol, CTA + calendar sus sub account selector.

## Safe to resume: yes