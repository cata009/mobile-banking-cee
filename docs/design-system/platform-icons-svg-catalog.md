# Platform Icons SVG Catalog

Generated from the platform icon registries on 2026-06-28T18:57:35.030Z.

Sources:
- `src/app/components/icons/AppIcon.tsx`
- `src/app/components/pfm/PfmCategoryIcon.tsx`
- `src/data/pfmCategories.ts`

Scope:
- AppIcon registry: 100 icons.
- PFM category registry: 19 icons.
- Excluded by design: generated Figma imports, brand wordmarks, phone chrome, decorative textures, and shadcn internal lucide slots that are not owned by the platform icon registry.

To regenerate:

```bash
node scripts/export-platform-icon-catalog.mjs
```

## AppIcon Index

| Name | Label | Category | Source | Default size | ViewBox |
| --- | --- | --- | --- | --- | --- |
| header-profile | Header profile | Header | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| header-messages | Header messages | Header | custom | 32x32 slot / 20x20 glyph | 5 8 22 15 |
| help-circle | Help circle | Header | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| logout | Logout | Header | custom | 32x32 slot / 20x20 glyph | 0 0 20 19 |
| nav-home | Bottom nav home | Navigation | custom | 32x32 slot / 20x20 glyph | 6 5 20 21 |
| nav-analytics | Bottom nav analytics | Navigation | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| nav-payments | Bottom nav payments | Navigation | custom | 32x32 slot / 20x20 glyph | 4 8 24 16 |
| nav-products | Bottom nav products | Navigation | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| nav-more | Bottom nav more | Navigation | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| hu-kids-request-money | HU Kids request money | Actions | custom | 24x24 | 0 0 24 24 |
| hu-kids-account-details | HU Kids account details | Accounts | custom | 24x24 | 0 0 24 24 |
| hu-kids-learn | HU Kids Learn | Navigation | custom | 32x32 slot / 20x20 glyph | 0 0 24 24 |
| hu-kids-more-options | HU Kids more options | Actions | custom | 24x24 | 0 0 24 24 |
| hu-kids-saving | HU Kids saving piggy | Navigation | custom | 24x24 | 0 0 24 24 |
| amount-hide | Hide amounts | Accounts | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| amount-show | Show amounts | Accounts | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| search | Search | Actions | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| filters | Filters | Actions | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| demo-chevron-down | Demo topbar chevron down | System | custom | 32x32 slot / 20x20 glyph | 6 8 12 8 |
| demo-settings | Demo settings | System | custom | 32x32 slot / 20x20 glyph | 0 0 24 24 |
| demo-reset | Demo reset | System | custom | 32x32 slot / 20x20 glyph | 3 1 18 22 |
| clear-results | Clear results | Actions | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| payment-create-qr | Create QR code | Payments | custom | 32x32 slot / 20x20 glyph | 0 0 12 20 |
| payment-templates | Templates | Payments | custom | 32x32 slot / 20x20 glyph | 7 6 18 20 |
| payment-card-repayment | Card repayment | Payments | custom | 32x32 slot / 20x20 glyph | 6 7 20 18 |
| payment-exchange-rates | Exchange rates | Payments | custom | 32x32 slot / 20x20 glyph | 5.5 4 21 24 |
| new-payment-domestic | Domestic payment | Payments | custom | 32x32 slot / 20x20 glyph | 0 0 19 20 |
| new-payment-foreign | Foreign payment | Payments | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| chevron-link | Chevron link | Actions | custom | 32x32 | 0 0 32 32 |
| chevron-left | Chevron left | Actions | custom | 32x32 slot / 20x20 glyph | 12 9 7.25 14 |
| chevron-down | Chevron down | Actions | custom | 32x32 slot / 20x20 glyph | 10 12 12 8 |
| chevron-down-wide | Chevron down wide | Actions | custom | 32x32 slot / 20x20 glyph | 9 12 14 8 |
| chevron-up | Chevron up | Actions | custom | 32x32 slot / 20x20 glyph | 9 12 14 8 |
| back-heavy | Back heavy | Navigation | custom | 32x32 slot / 20x20 glyph | 6 1 12.5 22.1 |
| back-line | Back line | Navigation | custom | 32x32 slot / 20x20 glyph | 10 6 8 20 |
| info-circle | Info circle | System | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| warning-small | Warning small | System | custom | 15x15 | 0 0 11 11 |
| close-x | Close | System | custom | 32x32 | 0 0 32 32 |
| panel-smart-banking | Panel smart banking | Actions | custom | 32x32 slot / 20x20 glyph | 5 5 19 23 |
| panel-share-screen | Panel share screen | Actions | custom | 32x32 slot / 20x20 glyph | 6.5 8 19 17 |
| prime-check | Prime check | Prime | custom | 32x32 slot / 20x20 glyph | 6 9 20 14 |
| prime-direction | Prime direction | Prime | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| prime-email | Prime email | Prime | custom | 32x32 slot / 20x20 glyph | 1 5 22 14 |
| account-details | Account details | Accounts | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| account-options | Account options | Accounts | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| account-option-share-info | Share account info | Accounts | custom | 32x32 slot / 20x20 glyph | 0 0 17 20 |
| account-option-push-notifications | Push notifications | Accounts | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| account-option-statement | Account statement | Accounts | custom | 32x32 slot / 20x20 glyph | 8 6 16 20 |
| investment-history | Investment history | Actions | custom | 32x32 | 0 0 32 32 |
| investment-to-approve | Investment to approve | Actions | custom | 21x20 | 0 0 21 20 |
| investment-download-report | Investment download report | Actions | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| account-option-create-paycode | Create paycode | Accounts | custom | 32x32 slot / 20x20 glyph | 0 0 12 20 |
| account-option-change-name | Change account name | Accounts | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| add-money | Add money | Accounts | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| invest-action | Invest action | Actions | custom | 32x32 slot / 20x20 glyph | 0 0 32 32 |
| add-circle | Add circle | System | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| more-horizontal | More options (horizontal) | System | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| user-event-badge | User event badge | System | custom | 18x24 | 0 0 18 24 |
| user-event-refresh | User event refresh | System | custom | 24x24 | 0 0 24 24 |
| mcash | mCash | Accounts | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| copy-documents | Copy documents | Accounts | custom | 32x32 slot / 20x20 glyph | 7 6 18 20 |
| share-filled | Share filled | Actions | custom | 32x32 slot / 20x20 glyph | 3 2 18 20 |
| transaction-transfer | Transaction transfer | Accounts | custom | 32x32 slot / 20x20 glyph | 0 0 20 20 |
| contact-prime | Contact Prime | Contacts | custom | 32x32 slot / 20x20 glyph | 5 5 21.1 20.2 |
| contact-location | Contact location | Contacts | custom | 32x32 slot / 20x20 glyph | 8 6 17 20 |
| contact-time | Contact time | Contacts | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| contact-phone | Contact phone | Contacts | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| contact-block | Contact block | Contacts | custom | 32x32 slot / 20x20 glyph | 8 6 15 20 |
| contact-email | Contact email | Contacts | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| contact-website | Contact website | Contacts | custom | 32x32 slot / 20x20 glyph | 6 7 20 18 |
| contact-youtube | Contact YouTube | Contacts | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| contact-x | Contact X | Contacts | custom | 32x32 slot / 20x20 glyph | 6 6 20 20 |
| grid-2x2 | Change Category | Actions | custom | 32x32 slot / 20x20 glyph | 0 0 32 32 |
| wallet-cards | Wallet cards | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| shopping-bag | Shopping bag | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| arrow-right | Arrow right | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| camera | Camera | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| landmark | Landmark | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| repeat | Repeat | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| lock | Lock | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| alert-triangle | Alert triangle | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| credit-card | Credit card | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| download | Download | Actions | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| send | Send | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| bike | Bike | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| book-open | Book open | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| calendar-days | Calendar days | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| circle-dollar-sign | Circle dollar sign | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| clipboard-check | Clipboard check | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| eye | Eye | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| eye-off | Eye off | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| gift | Gift | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| palette | Palette | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| piggy-bank | Piggy bank | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| receipt-text | Receipt text | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| shield-check | Shield check | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| sliders-horizontal | Sliders horizontal | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| trophy | Trophy | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| user-round | User round | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |
| users | Users | External Lucide | lucide | 32x32 slot / 20x20 glyph | lucide-react |

## PFM Icon Index

| Name | Color var | Default size | ViewBox | Fallback |
| --- | --- | --- | --- | --- |
| Taxes and Penalties | --uc-pfm-taxes-penalties | 32x32 slot / 20x20 glyph | 0 0 20 20 | T |
| Income | --uc-pfm-income | 32x32 slot / 20x20 glyph | 0 0 20 20 | I |
| Utilities | --uc-pfm-utilities | 32x32 slot / 20x20 glyph | 0 0 20 20 | U |
| Exclude from budget | --uc-pfm-exclude-budget | 32x32 slot / 20x20 glyph | 0 0 21 20 | E |
| Shopping | --uc-pfm-shopping | 32x32 slot / 20x20 glyph | 0 0 20 20 | S |
| Insurance | --uc-pfm-insurance | 32x32 slot / 20x20 glyph | 0 0 20 20 | I |
| Groceries | --uc-pfm-groceries | 32x32 slot / 20x20 glyph | 0 0 20 20 | G |
| Home | --uc-pfm-home | 32x32 slot / 20x20 glyph | 0 0 20 20 | H |
| Education | --uc-pfm-education | 32x32 slot / 20x20 glyph | 0 0 20 20 | E |
| Lifestyle | --uc-pfm-lifestyle | 32x32 slot / 20x20 glyph | 0 0 20 20 | L |
| Transportation | --uc-pfm-transportation | 32x32 slot / 20x20 glyph | 0 0 20 20 | T |
| Leisure time | --uc-pfm-leisure-time | 32x32 slot / 20x20 glyph | 0 0 20 20 | L |
| Healthcare | --uc-pfm-healthcare | 32x32 slot / 20x20 glyph | 0 0 20 20 | H |
| Investments | --uc-pfm-investments | 32x32 slot / 20x20 glyph | 0 0 20 20 | I |
| Children | --uc-pfm-children | 32x32 slot / 20x20 glyph | 0 0 20 20 | C |
| Wallet | --uc-pfm-wallet | 32x32 slot / 20x20 glyph | 0 0 20 20 | W |
| Transfers | --uc-pfm-transfers | 32x32 slot / 20x20 glyph | 0 0 20 20 | T |
| Finance | --uc-pfm-finance | 32x32 slot / 20x20 glyph | 0 0 20 20 | F |
| Uncategorized | --uc-pfm-uncategorized | 32x32 slot / 20x20 glyph | 0 0 20 20 | ? |

## AppIcon / Header

### header-profile

- Label: Header profile
- Category: Header
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: HeaderActionIcons, Payments header, Products header, More header

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10 20C15.5229 20 20 15.5229 20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5229 4.47715 20 10 20ZM9.95831 5C11.2528 5 12.3021 6.04938 12.3021 7.34375C12.3021 8.63812 11.2528 9.6875 9.95831 9.6875C8.664 9.6875 7.61456 8.63812 7.61456 7.34375C7.61456 6.04938 8.664 5 9.95831 5ZM15 15H5.625C5.66906 12.7459 7.50719 10.9409 9.76188 10.9375H15V15Z" fill="currentColor">
</path>
</svg>
```

### header-messages

- Label: Header messages
- Category: Header
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 5 8 22 15
- Usage: HeaderActionIcons, Payments header, Products header, More header

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="5 8 22 15" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6 10.67V9.5H26V10.67L16 17.5413L6 10.67ZM6 12.3381L16 19.2094L26 12.3387V18.6669C26 20.5075 24.5075 22 22.6669 22H6V12.3381Z" fill="currentColor">
</path>
</svg>
```

### help-circle

- Label: Help circle
- Category: Header
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: HeaderActionIcons, PageHeader help, Products header, Payments header

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.125 7.03187C13.125 6.99563 13.1175 6.96438 13.1163 6.92875C13.0731 8.0425 12.58 8.92437 11.5631 9.6875L11.195 9.9675C10.7419 10.3181 10.5556 10.5344 10.4544 10.8381V11.0844C10.4544 11.9294 9.84188 12.6175 9.08875 12.6175H8.43625L8.45062 10.9981C8.46875 9.965 8.69063 9.68 9.71313 8.82375L10.1594 8.5C10.8806 7.97937 11.0825 7.50937 11.115 6.98562C11.0813 6.305 10.6894 6.00812 9.8125 6.00812C9.4625 6.00812 9.06312 6.08687 8.65 6.175C8.34062 6.24312 8.04625 6.20312 7.77313 6.05813C7.35687 5.88875 7.05062 5.5425 6.93375 5.09312L6.875 4.8675L8.62438 4.45125C9.04438 4.36188 9.53687 4.31187 9.99875 4.31187C11.9725 4.31187 13.0712 5.24375 13.1163 6.92875C13.1187 6.87562 13.125 6.82438 13.125 6.77V7.03187ZM9.4145 16.25C8.80138 16.25 8.302 15.7475 8.302 15.1306C8.302 14.5131 8.80138 14.0112 9.4145 14.0112C10.0289 14.0112 10.5289 14.5131 10.5289 15.1306C10.5289 15.7475 10.0289 16.25 9.4145 16.25ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5225 4.4775 20 10 20C15.5225 20 20 15.5225 20 10C20 4.4775 15.5225 0 10 0Z" fill="currentColor">
</path>
</svg>
```

### logout

- Label: Logout
- Category: Header
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 19
- Usage: More header

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 19" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.62504 9.0625C5.62504 9.92562 6.32444 10.625 7.18756 10.625C8.05069 10.625 8.75006 9.92562 8.75006 9.0625C8.75006 8.19938 8.05069 7.5 7.18756 7.5C6.32444 7.5 5.62504 8.19938 5.62504 9.0625ZM0 0H8.12506C9.16069 0 10.0001 0.839375 10.0001 1.875V18.125H1.87501C0.839381 18.125 0 17.2856 0 16.25V0ZM15.1887 6.65675C14.5243 5.99237 14.5243 4.91488 15.1887 4.25112L20 9.06238L15.1887 13.8736C14.5243 13.2099 14.5243 12.1324 15.1887 11.4686L16.7437 9.91362H10.6249V8.21175H16.7437L15.1887 6.65675Z" fill="currentColor">
</path>
</svg>
```

## AppIcon / Navigation

### nav-home

- Label: Bottom nav home
- Category: Navigation
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 5 20 21
- Usage: BottomNavigation

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 5 20 21" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.0787 5L7 12.2188V21.441C7 23.959 9.00688 26 11.4829 26H14.0641V20.0938C14.0641 19.3692 14.6417 18.7812 15.3547 18.7812H16.6453C17.3577 18.7812 17.9359 19.3692 17.9359 20.0938V26H20.5171C22.9932 26 25 23.959 25 21.441V12.2188L16.0787 5Z" fill="currentColor">
</path>
</svg>
```

### nav-analytics

- Label: Bottom nav analytics
- Category: Navigation
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: BottomNavigation

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.8399 17.112V8.27267C9.95559 8.28642 6 12.2489 6 17.1357C6 22.0313 9.96871 26 14.8643 26C19.7605 26 23.7286 22.0313 23.7286 17.1357C23.7286 17.127 23.728 17.1207 23.728 17.112H14.8399ZM17.136 6C17.1285 6 17.1198 6.00125 17.1116 6.00125V14.8399H25.9997C25.9866 9.95621 22.0235 6 17.136 6" fill="currentColor">
</path>
</svg>
```

### nav-payments

- Label: Bottom nav payments
- Category: Navigation
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 4 8 24 16
- Usage: BottomNavigation

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="4 8 24 16" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 10.9999V21.5H22.5623L21.4374 23H4V10.9999H5.5ZM23.5 8L28 14.0001L23.5 20.0001H7.00013V8H23.5ZM17.176 10C16.6343 10.5531 16.6343 11.448 17.176 12L18.4459 13.2933H11L11.0006 14.7072H18.4459L17.176 16C16.6343 16.552 16.6343 17.448 17.176 18L21.1053 14L17.176 10Z" fill="currentColor">
</path>
</svg>
```

### nav-products

- Label: Bottom nav products
- Category: Navigation
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: BottomNavigation

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M17 17H26V22.4C26 24.3882 24.3882 26 22.4 26H17V17ZM21.1415 6L26 15H19.1442C17.4959 15 16.4659 13.2232 17.2901 11.8007L21.1415 6ZM6 21.4996C6.00022 19.0145 8.01495 17 10.5001 17C12.9853 17 14.9999 19.0147 15 21.4998C15.0001 23.985 12.9856 25.9998 10.5005 26C8.01498 26 6.00009 23.9851 6 21.4996ZM9.6 6H15V15H6V9.6C6 7.61178 7.61178 6 9.6 6Z" fill="currentColor">
</path>
</svg>
```

### nav-more

- Label: Bottom nav more
- Category: Navigation
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: BottomNavigation

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10 6.875C9.31 6.875 8.75 6.315 8.75 5.625C8.75 4.935 9.31 4.375 10 4.375C10.69 4.375 11.25 4.935 11.25 5.625C11.25 6.315 10.69 6.875 10 6.875ZM10 11.25C9.31 11.25 8.75 10.69 8.75 10C8.75 9.31 9.31 8.75 10 8.75C10.69 8.75 11.25 9.31 11.25 10C11.25 10.69 10.69 11.25 10 11.25ZM10 15.625C9.31 15.625 8.75 15.065 8.75 14.375C8.75 13.685 9.31 13.125 10 13.125C10.69 13.125 11.25 13.685 11.25 14.375C11.25 15.065 10.69 15.625 10 15.625ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5225 4.4775 20 10 20C15.5225 20 20 15.5225 20 10C20 4.4775 15.5225 0 10 0Z" fill="currentColor">
</path>
</svg>
```

### hu-kids-learn

- Label: HU Kids Learn
- Category: Navigation
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 24 24
- Usage: KidsMarketHomeApp HU bottom nav, DesignSystemPage Icons inventory
- Notes: Supplied HU Kids CEE Light Restyle learn/education navigation book glyph.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.3172 16.9635C16.5382 16.6168 18.9713 15.9258 19.9578 15.6451C21.3947 15.2354 22.6012 15.4888 23 17.0272C23 17.0272 14.1058 21.6326 13.0532 22.1158C11.8371 22.6742 10.5927 23.1361 9.30637 22.9632C7.17444 22.6779 1 19.9644 1 19.9644V14.6544C4.11575 12.6555 6.36387 13.3663 7.31881 13.7441C7.3613 13.7612 7.48269 13.812 7.64073 13.8781C7.93791 14.0024 8.36464 14.1809 8.64019 14.2918C9.107 14.4792 9.69894 14.6476 10.2593 14.662C10.6449 14.6726 11.6446 14.6544 11.6446 14.6544C12.9164 14.6544 13.9477 15.7809 13.9477 17.1698H6.51375C6.51375 18.0074 7.13663 18.687 7.90319 18.687H13.9477C14.7129 18.687 15.3316 17.9998 15.3199 17.163C15.3196 17.1339 15.3193 17.1073 15.319 17.0837C15.3182 17.0168 15.3177 16.9736 15.3172 16.9635Z" fill="currentColor">
</path>
<path d="M12.8952 10.6553L12.9902 10.6197C13.6315 10.299 14.3322 10.0971 15.0923 10.0853C15.698 10.0853 16.3037 10.0853 16.9093 10.0971C17.2181 10.0971 17.515 10.0971 17.8238 10.109H18.0257V1H17.8119C17.5269 1 17.23 1 16.945 1C16.363 1 15.7811 1 15.1873 1C14.8666 1 14.5816 1.05938 14.3085 1.17814C13.3584 1.60568 12.9071 2.28263 12.9071 3.13771C12.9071 4.77662 12.9071 6.41553 12.9071 8.05445C12.9071 8.8739 12.9071 9.69336 12.9071 10.5128V10.6672L12.8952 10.6553Z" fill="currentColor">
</path>
<path d="M7.18275 10.109C7.72906 10.0971 8.27536 10.0853 8.82166 10.0853C9.67675 10.0853 10.4606 10.2634 11.1969 10.6316C11.2206 10.6316 11.2563 10.6553 11.2919 10.6672C11.2919 10.6435 11.2919 10.6197 11.2919 10.6078C11.2919 9.76462 11.2919 8.93328 11.2919 8.09008C11.2919 6.41553 11.2919 4.74099 11.2919 3.06645C11.2919 2.5439 11.0544 2.05698 10.615 1.66507C10.1755 1.23752 9.61737 1 8.9048 1C8.34662 1 7.78844 1 7.21838 1C6.93335 1 6.6602 1 6.37517 1H6.17328V10.1209H6.37517C6.64832 10.1209 6.92148 10.1209 7.19463 10.0971L7.18275 10.109Z" fill="currentColor">
</path>
<path d="M19.7953 2.17573C19.6052 2.17573 19.4152 2.17573 19.2133 2.17573C19.1183 2.17573 19.0114 2.17573 18.9164 2.17573V10.4891C18.9164 10.8335 18.7264 10.9997 18.2989 10.9997C17.8476 10.9997 18.2989 10.9997 16.945 10.9997C16.0424 10.9997 15.1398 10.9997 14.2372 10.9997C14.1185 10.9997 13.9997 11.0472 13.8928 11.0947L13.6553 11.2254C13.299 11.4273 12.4202 11.9142 12.1589 12.0567C12.1114 12.0805 12.0639 12.0805 12.0164 12.0567C11.7551 11.9142 10.8763 11.4273 10.5318 11.2254L10.2943 11.0947C10.1993 11.0472 10.0687 10.9997 9.94991 10.9997C9.04733 10.9997 8.14474 10.9997 7.24215 10.9997C5.88826 10.9997 6.33956 10.9997 5.88826 10.9997C5.46072 10.9997 5.2707 10.8453 5.2707 10.4891V2.17573C5.16382 2.17573 5.06881 2.17573 4.9738 2.17573C4.78378 2.17573 4.58189 2.17573 4.39187 2.17573C4.16622 2.18761 3.99995 2.3895 3.99995 2.57952V12.2111C3.99995 12.4724 4.20185 12.6386 4.51063 12.6505C4.60564 12.6505 4.70065 12.6505 4.79566 12.6505C4.84316 12.6505 4.89067 12.6505 4.93817 12.6505H10.0212C10.1281 12.6505 10.2587 12.6861 10.3537 12.7336C10.6506 12.8999 11.4463 13.3512 11.8501 13.5887C12.0045 13.6719 12.1708 13.6719 12.3251 13.5887C12.7289 13.3631 13.5246 12.8999 13.8215 12.7336C13.9166 12.6861 14.0353 12.6505 14.1541 12.6505H19.2371C19.2371 12.6505 19.3321 12.6505 19.3796 12.6505C19.4746 12.6505 19.5696 12.6505 19.6646 12.6505C19.9734 12.6386 20.1753 12.4605 20.1753 12.2111V2.57952C20.1753 2.3895 20.0209 2.19948 19.7834 2.17573H19.7953Z" fill="currentColor">
</path>
</svg>
```

### hu-kids-saving

- Label: HU Kids saving piggy
- Category: Navigation
- Source: custom
- Default size: 24x24
- ViewBox: 0 0 24 24
- Usage: HU Kids bottom navigation, HU Kids saving actions
- Notes: Supplied HU Kids saving piggy glyph.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.2137 9.09028L13.9319 9.65902C13.8714 9.79589 13.7909 9.80586 13.6693 9.73742C13.3468 9.55072 12.8731 9.38395 12.3788 9.38395C12.0461 9.38395 11.7944 9.46302 11.5827 9.66899C11.3909 9.85502 11.3001 10.1294 11.2493 10.5307H13.045C13.3166 10.5307 13.3166 10.6085 13.3166 10.8928V11.0789C13.3166 11.3533 13.3166 11.4217 13.045 11.4217H11.1991V12.019H13.045C13.3166 12.019 13.3166 12.0961 13.3166 12.3818V12.5479C13.3166 12.8216 13.3166 12.8907 13.045 12.8907H11.2898C11.34 13.1651 11.4314 13.3611 11.5524 13.498C11.7539 13.7332 12.0557 13.8608 12.6112 13.8608C13.0244 13.8608 13.4575 13.7625 13.8006 13.6263C13.9518 13.5665 13.9924 13.6263 14.0323 13.7924L14.1429 14.2621C14.1835 14.4368 14.1835 14.5259 14.0426 14.5857C13.6397 14.7611 12.9941 14.8793 12.5301 14.8793C11.5923 14.8793 10.9976 14.7219 10.5741 14.3106C10.2421 13.997 10.0496 13.5465 9.9595 12.8907H9.33388C9.06231 12.8907 9.06231 12.8216 9.06231 12.5479V12.3818C9.06231 12.0961 9.06231 12.019 9.33388 12.019H9.90794V11.4217H9.33388C9.06231 11.4217 9.06231 11.3533 9.06231 11.0789V10.8928C9.06231 10.6085 9.06231 10.5307 9.33388 10.5307H9.94919C10.0399 9.71683 10.2813 9.21785 10.7866 8.82584C11.1991 8.51357 11.7339 8.3654 12.4091 8.3654C13.0347 8.3654 13.6693 8.5521 14.1429 8.80658C14.2543 8.86571 14.2749 8.93414 14.2137 9.09028ZM21.086 10.0012C20.3332 7.18075 17.6918 5.09448 14.5389 5.09448H9.05681C8.93306 5.09448 8.81412 5.05727 8.71306 4.99083C8.21531 4.66394 6.55431 3.70319 4.74069 4.09055C4.69738 4.09786 4.65613 4.1138 4.61281 4.12377C4.58806 4.13108 4.55919 4.13706 4.53719 4.14503C4.33231 4.19951 4.13087 4.27393 3.94044 4.38754L5.00744 6.71831C4.11575 7.47309 3.431 8.44912 3.04669 9.56002C3.03638 9.58594 3.02606 9.60786 3.01575 9.63577C2.68094 10.546 1.8305 11.0862 1 11.324V14.1286C1.87313 15.6793 4.20031 16.9297 6.236 17.5483V20C7.41094 20 8.41813 19.1336 8.9035 18.1536C9.08775 18.1695 9.27338 18.1782 9.46175 18.1782H14.5389C14.6125 18.1782 14.684 18.1702 14.7569 18.1682V20C16.2068 20 17.4127 18.7874 17.6815 17.428C19.8361 16.3337 21.3074 14.1525 21.3074 11.6363H21.625C22.3847 11.6363 23 11.0417 23 10.3075V10.0012H21.086Z" fill="currentColor">
</path>
</svg>
```

### back-heavy

- Label: Back heavy
- Category: Navigation
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 1 12.5 22.1
- Usage: PageHeader, DomesticPaymentFlowScreens, PrimeScreen

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 1 12.5 22.1" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.8452 1.01411C18.3901 2.48329 18.3901 4.86754 16.8452 6.33811L11.2511 12.0141L16.8452 17.6901C18.3901 19.1607 18.3901 21.5435 16.8452 23.0141L6.00391 12.0141L16.8452 1.01411Z" fill="currentColor">
</path>
</svg>
```

### back-line

- Label: Back line
- Category: Navigation
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 10 6 8 20
- Usage: BackButton

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="10 6 8 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M20 24L12 16L20 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
</path>
</svg>
```

## AppIcon / Actions

### hu-kids-request-money

- Label: HU Kids request money
- Category: Actions
- Source: custom
- Default size: 24x24
- ViewBox: 0 0 24 24
- Usage: KidsMarketHomeApp HU quick action rail, DesignSystemPage Icons inventory
- Notes: Supplied HU Kids CEE Light Restyle request-money glyph.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path d="M19.0448 14.5947H13.8944C13.4211 14.5943 12.9671 14.7821 12.6317 15.1171C12.2963 15.4522 12.1069 15.9069 12.1053 16.3818V17.9111C12.1069 18.386 12.2963 18.8407 12.6317 19.1757C12.9671 19.5108 13.4211 19.6986 13.8944 19.6982H19.0448V20.5615C19.0446 22.137 17.951 23.4147 16.6073 23.415H3.41492V13.7236C3.41509 12.1557 4.5095 10.8701 5.8534 10.8701H19.0448V14.5947ZM19.5692 15.3779C20.0385 15.3779 20.4148 15.8252 20.4149 16.3818V17.9111C20.4148 18.4677 20.0383 18.915 19.5692 18.915H13.7391C13.27 18.9147 12.8867 18.4675 12.8866 17.9111V16.3818C12.8867 15.8253 13.2702 15.3781 13.7391 15.3779H19.5692ZM11.9354 0.415039C15.1662 0.415119 17.785 3.15357 17.785 6.53125C17.785 7.74366 17.4473 8.87358 16.8651 9.82422H7.00476C6.42265 8.87363 6.08485 7.74355 6.08484 6.53125C6.08484 3.15352 8.70456 0.415039 11.9354 0.415039ZM12.1952 3.74512C11.675 3.74512 11.2412 3.8357 10.8944 4.10742C10.5049 4.42494 10.3315 4.87777 10.245 5.55664H9.76844C9.55162 5.55664 9.55164 5.64742 9.55164 5.87402V6.00977C9.55164 6.23605 9.55157 6.32715 9.76844 6.32715H10.245V6.8252H9.76844C9.55157 6.8252 9.55164 6.91629 9.55164 7.14258V7.27832C9.55164 7.50461 9.55157 7.5957 9.76844 7.5957H10.2889C10.3754 8.18478 10.5052 8.54674 10.8085 8.86426C11.1118 9.22639 11.5884 9.36229 12.368 9.36231C12.7583 9.36231 13.2351 9.22668 13.5819 9.09082C13.7116 9.04582 13.7112 8.95499 13.6678 8.81934L13.5819 8.41113C13.5781 8.3991 13.5744 8.38757 13.5711 8.37695C13.5374 8.26763 13.5264 8.23402 13.4081 8.27539C13.1482 8.36623 12.8013 8.45606 12.455 8.45606C12.022 8.45603 11.7617 8.32074 11.6317 8.13965C11.5453 8.00385 11.458 7.82229 11.4149 7.5957H12.8016C13.0184 7.59566 13.0184 7.50456 13.0184 7.27832V7.14258C13.0184 6.91634 13.0184 6.82524 12.8016 6.8252H11.328V6.32715H12.8016C13.0184 6.32711 13.0184 6.236 13.0184 6.00977V5.87402C13.0184 5.64747 13.0183 5.55668 12.8016 5.55664H11.3719C11.4154 5.1943 11.5018 4.96784 11.6317 4.83203C11.7617 4.69632 11.9784 4.60548 12.2382 4.60547C12.6712 4.60547 13.0174 4.78608 13.2772 4.92188C13.3641 4.96731 13.4519 4.96789 13.495 4.83203L13.7118 4.33399C13.779 4.2166 13.6841 4.14155 13.5819 4.10742C13.2351 3.88114 12.715 3.74512 12.1952 3.74512Z" fill="currentColor">
</path>
</svg>
```

### hu-kids-more-options

- Label: HU Kids more options
- Category: Actions
- Source: custom
- Default size: 24x24
- ViewBox: 0 0 24 24
- Usage: KidsMarketHomeApp HU quick action rail, DesignSystemPage Icons inventory
- Notes: Supplied HU Kids CEE Light Restyle vertical more-options glyph.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path d="M14.9961 3.92969C14.9961 5.58654 13.6529 6.92969 11.9961 6.92969C10.3392 6.92969 8.99609 5.58654 8.99609 3.92969C8.99609 2.27283 10.3392 0.929688 11.9961 0.929688C13.6529 0.929688 14.9961 2.27283 14.9961 3.92969Z" fill="currentColor">
</path>
<path d="M14.9961 11.9297C14.9961 13.5865 13.6529 14.9297 11.9961 14.9297C10.3392 14.9297 8.99609 13.5865 8.99609 11.9297C8.99609 10.2728 10.3392 8.92969 11.9961 8.92969C13.6529 8.92969 14.9961 10.2728 14.9961 11.9297Z" fill="currentColor">
</path>
<path d="M14.9961 19.9297C14.9961 21.5865 13.6529 22.9297 11.9961 22.9297C10.3392 22.9297 8.99609 21.5865 8.99609 19.9297C8.99609 18.2728 10.3392 16.9297 11.9961 16.9297C13.6529 16.9297 14.9961 18.2728 14.9961 19.9297Z" fill="currentColor">
</path>
</svg>
```

### search

- Label: Search
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: AccountSearchBar

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M19.6751 13.5921C19.6751 16.3828 17.4006 18.6534 14.6051 18.6534C11.8097 18.6534 9.53524 16.3828 9.53524 13.5921C9.53524 10.8013 11.8097 8.53069 14.6051 8.53069C17.4006 8.53069 19.6751 10.8013 19.6751 13.5921ZM22.2098 13.5921C22.2098 9.39934 18.8046 6 14.6049 6C10.4051 6 7 9.39934 7 13.5921C7 17.7848 10.4051 21.1841 14.6049 21.1841C16.0631 21.1841 17.4199 20.7671 18.5771 20.0567L24.5971 26C25.8962 24.703 25.8962 22.5994 24.5971 21.3024L20.9917 17.7038C21.7591 16.5181 22.2098 15.1086 22.2098 13.5921ZM16.5064 13.5921C16.5064 12.5437 15.6553 11.694 14.6051 11.694C13.555 11.694 12.7039 12.5437 12.7039 13.5921C12.7039 14.6404 13.555 15.4901 14.6051 15.4901C15.6553 15.4901 16.5064 14.6404 16.5064 13.5921Z" fill="currentColor">
</path>
</svg>
```

### filters

- Label: Filters
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: AccountSearchBar

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.80974 6.5C9.87052 6.50579 10.8371 7.09886 11.3073 8.03237H25.9803V10.4842H11.326C10.8725 11.3814 9.95999 11.9677 8.94086 12.0165H8.80974C7.25796 12.0165 6 10.7816 6 9.25827C6 7.73492 7.25796 6.5 8.80974 6.5ZM23.1706 13.2424C24.5589 13.233 25.7461 14.2204 25.9647 15.5663C26.1833 16.9121 25.3678 18.213 24.0454 18.6279C22.723 19.0429 21.2901 18.4474 20.6731 17.2266H6V14.7748H20.6543C21.1275 13.8354 22.1031 13.2413 23.1706 13.2424ZM16.9267 21.5172C16.4566 20.5837 15.49 19.9906 14.4292 19.9849H14.2981C13.2785 20.0324 12.3654 20.619 11.9129 21.5172H6V23.969H11.9129C12.3876 24.9069 13.3624 25.5 14.4292 25.5C15.496 25.5 16.4708 24.9069 16.9455 23.969H25.9803V21.5172H16.9267Z" fill="currentColor">
</path>
</svg>
```

### clear-results

- Label: Clear results
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: AccountSearchBar

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M10 0C15.53 0 20 4.47 20 10C20 15.53 15.53 20 10 20C4.47 20 0 15.53 0 10C0 4.47 4.47 0 10 0ZM10 8.58984L6.41016 5L5 6.41016L8.58984 10L5 13.5898L6.41016 15L10 11.4102L13.5898 15L15 13.5898L11.4102 10L15 6.41016L13.5898 5L10 8.58984Z" fill="currentColor">
</path>
</svg>
```

### chevron-link

- Label: Chevron link
- Category: Actions
- Source: custom
- Default size: 32x32
- ViewBox: 0 0 32 32
- Usage: AccountDetailsInfoScreen, AccountOptionsScreen, ContactsNavigationCard, NavigationLink, NewPaymentActionListItem, PrimeIconLabelValue, ProductAccordion, RoKidsApp, TemplateCodePreviews

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
<path id="Icon" d="M13.2901 10.71V10.71C12.9001 11.1 12.9001 11.73 13.2901 12.12L17.1701 16L13.2901 19.88C12.9001 20.27 12.9001 20.9 13.2901 21.29V21.29C13.6801 21.68 14.3101 21.68 14.7001 21.29L19.2901 16.7C19.6801 16.31 19.6801 15.68 19.2901 15.29L14.7001 10.7C14.3201 10.32 13.6801 10.32 13.2901 10.71Z" fill="currentColor">
</path>
</svg>
```

### chevron-left

- Label: Chevron left
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 12 9 7.25 14
- Usage: Icon inventory

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="12 9 7.25 14" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6759 9C12.7747 9.93494 12.7747 11.4522 13.6759 12.388L16.9391 16L13.6759 19.612C12.7747 20.5478 12.7747 22.0642 13.6759 23L20 16L13.6759 9Z" fill="currentColor" transform="translate(32 0) scale(-1 1)">
</path>
</svg>
```

### chevron-down

- Label: Chevron down
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 10 12 12 8
- Usage: ProductAccordion

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="10 12 12 8" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M12.1207 13.2901L16.0007 17.1701L19.8807 13.2901C20.2707 12.9001 20.9007 12.9001 21.2907 13.2901C21.6807 13.6801 21.6807 14.3101 21.2907 14.7001L16.7007 19.2901C16.3107 19.6801 15.6807 19.6801 15.2907 19.2901L10.7007 14.7001C10.3107 14.3101 10.3107 13.6801 10.7007 13.2901C11.0907 12.9101 11.7307 12.9001 12.1207 13.2901Z" fill="currentColor">
</path>
</svg>
```

### chevron-down-wide

- Label: Chevron down wide
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 9 12 14 8
- Usage: AccordionSection

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="9 12 14 8" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M23 12.6759C22.0651 11.7747 20.5478 11.7747 19.612 12.6759L16 15.9391L12.388 12.6759C11.4522 11.7747 9.93578 11.7747 9 12.6759L16 19L23 12.6759Z" fill="currentColor">
</path>
</svg>
```

### chevron-up

- Label: Chevron up
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 9 12 14 8
- Usage: Icon inventory

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="9 12 14 8" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M23 12.6759C22.0651 11.7747 20.5478 11.7747 19.612 12.6759L16 15.9391L12.388 12.6759C11.4522 11.7747 9.93578 11.7747 9 12.6759L16 19L23 12.6759Z" fill="currentColor" transform="rotate(180 16 16)">
</path>
</svg>
```

### panel-smart-banking

- Label: Panel smart banking
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 5 5 19 23
- Usage: PanelWithTranslations, PanelWithoutCoAppingTranslations, PanelWithoutCoApping

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="5 5 19 23" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M15.6816 8.30957C16.06 8.3102 16.5033 8.65896 16.5039 9.06445L16.6025 16.4395C17.2881 16.3427 18.1534 16.3146 19.0908 16.374C20.068 16.4367 21.0973 16.6364 21.7793 16.8281C22.553 17.1008 23.1489 17.829 23.2461 18.752C23.2515 18.8029 23.332 22.6482 23.333 22.6982C23.333 22.9247 23.2976 23.1435 23.2441 23.3535C23.0705 24.332 22.5848 25.2615 21.8027 25.9688C20.1095 27.5003 17.5519 27.2828 15.9844 25.6045L9.58301 18.7832C10.194 18.1298 11.1094 18.3171 11.7793 18.832L14.6279 20.9727V20.8604L14.8906 9.06445C14.8906 8.65963 15.3033 8.31027 15.6816 8.30957ZM7.3916 10.5C8.71215 10.5002 9.78223 11.571 9.78223 12.8916C9.78207 14.212 8.71205 15.2821 7.3916 15.2822C6.07102 15.2822 5.00016 14.2121 5 12.8916C5 11.5709 6.07092 10.5 7.3916 10.5ZM24.708 10.5C25.9737 10.5 27 11.5263 27 12.792C26.9998 14.0575 25.9736 15.083 24.708 15.083C23.4426 15.0828 22.4172 14.0574 22.417 12.792C22.417 11.5264 23.4425 10.5002 24.708 10.5ZM15.5859 5C17.8888 5.00019 19.7547 6.83767 19.7549 9.10547C19.7549 10.7184 18.8029 12.1016 17.4277 12.7725L17.3281 8.84668C17.3274 8.01446 16.5478 7.28204 15.6592 7.28125C14.8631 7.28221 13.9777 7.92571 13.9785 8.82031L13.8164 12.8115C12.4021 12.1548 11.417 10.7484 11.417 9.10547C11.4171 6.83755 13.2837 5 15.5859 5Z" fill="currentColor">
</path>
</svg>
```

### panel-share-screen

- Label: Panel share screen
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6.5 8 19 17
- Usage: PanelWithTranslations

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6.5 8 19 17" width="20" xmlns="http://www.w3.org/2000/svg">
<path clip-rule="evenodd" fill-rule="evenodd" d="M14.9286 10.2134V11.8977L8.5176 11.8977V21.4427H23.1393V18.7476H24.8264V22.0041C24.8264 23.1948 23.8982 24.1692 22.7248 24.2452L22.5769 24.25H6.83048V12.4592C6.83048 11.268 7.75873 10.2941 8.93208 10.2181L9.07997 10.2134H14.9286ZM25.1638 8.41667V16.8386C23.9007 16.8386 22.8766 15.8162 22.8766 14.5557V12.3143L18.3456 16.8386L16.7282 15.2239L21.2598 10.6996H19.0154C17.7523 10.6996 16.7282 9.67771 16.7282 8.41667L25.1638 8.41667Z" fill="currentColor">
</path>
</svg>
```

### investment-history

- Label: Investment history
- Category: Actions
- Source: custom
- Default size: 32x32
- ViewBox: 0 0 32 32
- Usage: InvestmentActionBar
- Notes: Investment History glyph from supplied SVG.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.0693 16.6101C17.574 16.1443 17.574 15.3899 18.0693 14.9249L19.2293 13.835L11.402 13.8356V12.6437H19.2293L18.0693 11.5545C17.574 11.0887 17.574 10.3344 18.0693 9.86929L21.6587 13.2397L18.0693 16.6101ZM14.3567 22.4368C14.852 22.9019 14.852 23.6562 14.3567 24.122L10.7673 20.751L14.3567 17.3806C14.852 17.847 14.852 18.6013 14.3567 19.0664L13.196 20.1557H21.024L21.0247 21.3469H13.196L14.3567 22.4368ZM22.662 7.29581L21.3333 6.0482L20.0053 7.29581L18.6773 6.0482L17.3487 7.29581L16.0207 6.0482L14.6927 7.29581L13.364 6.0482L12.036 7.29581L10.708 6.0482L9.37933 7.29581L8 6V26H24V6.03944L22.662 7.29581Z" fill="currentColor">
</path>
</svg>
```

### investment-to-approve

- Label: Investment to approve
- Category: Actions
- Source: custom
- Default size: 21x20
- ViewBox: 0 0 21 20
- Usage: InvestmentActionBar
- Notes: Investment To approve glyph from supplied SVG.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 21 20" width="21" xmlns="http://www.w3.org/2000/svg">
<path d="M20.6895 8.27539V17.6729C20.6892 18.9581 19.6372 19.9998 18.3389 20H4.82715V13.0215C5.16646 13.0698 5.51057 13.1035 5.8623 13.1035C9.01387 13.1033 11.6843 11.0856 12.6787 8.27539H20.6895ZM7.91113 16.416C8.38281 16.8867 9.1465 16.8867 9.61816 16.416L10.7217 15.3115V18.5879H11.9287V15.3115L13.0322 16.416C13.504 16.887 14.2685 16.887 14.7402 16.416L11.3252 13.001L7.91113 16.416ZM14.9277 10.0605V13.3369L13.8232 12.2334C13.3522 11.7624 12.5873 11.7624 12.1162 12.2334L15.5312 15.6484L18.9453 12.2334C18.4743 11.7624 17.7093 11.7624 17.2383 12.2334L16.1348 13.3369V10.0605H14.9277ZM5.8623 0C7.7809 4.42561e-05 9.47889 0.925778 10.5479 2.35059L6.09082 6.80664L4.32227 5.03711C3.73543 4.451 2.78516 4.45114 2.19824 5.03711L6.09082 8.93066L11.3115 3.70996C11.575 4.37686 11.7246 5.10161 11.7246 5.8623C11.7245 9.09945 9.09948 11.7245 5.8623 11.7246C2.62507 11.7246 9.4653e-05 9.0995 0 5.8623C0 2.62434 2.62501 0 5.8623 0Z" fill="currentColor">
</path>
</svg>
```

### investment-download-report

- Label: Investment download report
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: InvestmentActionBar
- Notes: Investment Download Report glyph from supplied SVG.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 18.125C2.5 19.1606 3.33938 20 4.375 20H2.5C1.46438 20 0.625 19.1606 0.625 18.125V0H2.5V18.125ZM17.5 0C18.5356 0 19.375 0.839375 19.375 1.875V20H6.25C5.21438 20 4.375 19.1606 4.375 18.125V0H17.5ZM9.6875 10C8.47937 10 7.5 10.9794 7.5 12.1875V14.375C8.70813 14.375 9.6875 13.3956 9.6875 12.1875V10ZM12.9688 7.26562C11.7606 7.26562 10.7812 8.245 10.7812 9.45312V14.375C11.9894 14.375 12.9688 13.3956 12.9688 12.1875V7.26562ZM16.25 5.625C15.0419 5.625 14.0625 6.60437 14.0625 7.8125V14.375C15.2706 14.375 16.25 13.3956 16.25 12.1875V5.625Z" fill="currentColor">
</path>
</svg>
```

### invest-action

- Label: Invest action
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 32 32
- Usage: InvestmentActionBar
- Notes: Investments CTA glyph from supplied Figma JSON: growth line, arrow head, and three vertical bars.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M5 20C8.2 16.8 11.2 15.35 14 15.35C16.72 15.35 18.78 12.44 21.05 8.55" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
</path>
<path d="M22.2 3.4L30.7 4.7L24.2 11.9L22.2 3.4Z" fill="currentColor">
</path>
<path d="M9 21H11V28H9V21Z" fill="currentColor">
</path>
<path d="M15 18H17V28H15V18Z" fill="currentColor">
</path>
<path d="M21 16H23V28H21V16Z" fill="currentColor">
</path>
</svg>
```

### share-filled

- Label: Share filled
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 3 2 18 20
- Usage: AccountDetailsInfoScreen

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="3 2 18 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.97 12.48 9 12.24 9 12C9 11.76 8.97 11.52 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.03 5.48 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="currentColor">
</path>
</svg>
```

### grid-2x2

- Label: Change Category
- Category: Actions
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 32 32
- Usage: TransactionDetailScreen

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M17 17H26V22.4C26 24.3882 24.3882 26 22.4 26H17V17ZM21.1415 6L26 15H19.1442C17.4959 15 16.4659 13.2232 17.2901 11.8007L21.1415 6ZM6 21.4996C6.00022 19.0145 8.01495 17 10.5001 17C12.9853 17 14.9999 19.0147 15 21.4998C15.0001 23.985 12.9856 25.9998 10.5005 26C8.01498 26 6.00009 23.9851 6 21.4996ZM9.6 6H15V15H6V9.6C6 7.61178 7.61178 6 9.6 6Z" fill="currentColor">
</path>
</svg>
```

### download

- Label: Download
- Category: Actions
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: DesignSystemPage Icons inventory

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download" aria-hidden="true">
<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4">
</path>
<polyline points="7 10 12 15 17 10">
</polyline>
<line x1="12" x2="12" y1="15" y2="3">
</line>
</svg>
```

## AppIcon / Accounts

### hu-kids-account-details

- Label: HU Kids account details
- Category: Accounts
- Source: custom
- Default size: 24x24
- ViewBox: 0 0 24 24
- Usage: KidsMarketHomeApp HU quick action rail, DesignSystemPage Icons inventory
- Notes: Supplied HU Kids CEE Light Restyle account-details building glyph, 24×24 variant.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.125 8.80645H4.5C3.11937 8.80645 2 7.53542 2 5.96774L12 1L22 5.96774C22 7.53542 20.8806 8.80645 19.5 8.80645H18.875V18.7419H16.375V8.80645H13.25V18.7419H10.75V8.80645H7.625V18.7419H5.125V8.80645ZM13.25 5.25806C13.25 4.47458 12.69 3.83871 12 3.83871C11.31 3.83871 10.75 4.47458 10.75 5.25806C10.75 6.04155 11.31 6.67742 12 6.67742C12.69 6.67742 13.25 6.04155 13.25 5.25806Z" fill="currentColor">
</path>
<path d="M21.375 20.1613V23H2.625V20.1613H21.375Z" fill="currentColor">
</path>
</svg>
```

### amount-hide

- Label: Hide amounts
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: AmountVisibilityButton

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.7776 18.3322C11.8595 17.8334 10.9707 17.0822 10.0638 16.0002C11.2794 14.5483 12.4613 13.6827 13.7276 13.2414C13.2032 13.8008 12.8757 14.5477 12.8757 15.3752C12.8757 16.1702 13.1813 16.8872 13.6707 17.439L15.4514 15.6583C15.4064 15.5721 15.3745 15.479 15.3745 15.3752C15.3745 15.0296 15.6552 14.7502 15.9995 14.7502C16.1038 14.7502 16.1976 14.7815 16.2832 14.8265L22.6046 8.50505C20.8421 6.95065 18.5345 6 16.0002 6C10.4776 6 6 10.477 6 16.0002C6 18.5347 6.95064 20.8422 8.50503 22.6048L12.7776 18.3322ZM15.9997 18.4999C17.7254 18.4999 19.1242 17.1005 19.1242 15.3749C19.1242 14.9018 19.0072 14.4612 18.8166 14.0605L14.6797 18.1981C15.0822 18.3862 15.5259 18.4999 15.9997 18.4999ZM19.2024 13.6748L23.4887 9.38845C25.0468 11.1516 26 13.4623 26 15.9998C26 21.5231 21.5225 26.0001 15.9998 26.0001C13.4623 26.0001 11.1517 25.0469 9.38853 23.4894L14.0305 18.8468C14.6586 19.0299 15.3068 19.1249 15.9942 19.1249C18.1955 19.1249 19.9981 18.2368 21.9387 15.9998C21.0149 14.9348 20.1218 14.1773 19.2024 13.6748Z" fill="currentColor">
</path>
</svg>
```

### amount-show

- Label: Show amounts
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: AmountVisibilityButton

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.99181 12.8646C7.97457 12.8646 6.30395 12.0872 4.55541 10C5.66973 8.66972 6.75311 7.87566 7.91384 7.47118C7.43317 7.98394 7.13296 8.66857 7.13296 9.42711C7.13296 11.0089 8.41514 12.2917 9.99639 12.2917C11.5782 12.2917 12.8604 11.0089 12.8604 9.42711C12.8604 8.67659 12.5659 7.99998 12.0938 7.48894C13.2414 7.90373 14.3162 8.70352 15.4408 10C13.6619 12.0505 12.0091 12.8646 9.99181 12.8646ZM9.99634 8.85421C10.313 8.85421 10.5689 9.11074 10.5689 9.42682C10.5689 9.74289 10.313 9.99942 9.99634 9.99942C9.68083 9.99942 9.42373 9.74289 9.42373 9.42682C9.42373 9.11074 9.68083 8.85421 9.99634 8.85421ZM9.99723 0.833374C4.93494 0.833374 0.830566 4.93775 0.830566 10C0.830566 15.0629 4.93494 19.1667 9.99723 19.1667C15.0595 19.1667 19.1639 15.0629 19.1639 10C19.1639 4.93775 15.0595 0.833374 9.99723 0.833374Z" fill="currentColor">
</path>
</svg>
```

### account-details

- Label: Account details
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: AccountActionBar

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.0002 12.5546C14.9617 12.5546 14.1202 11.7131 14.1202 10.6746C14.1202 9.63692 14.9617 8.79462 16.0002 8.79462C17.0386 8.79462 17.8802 9.63692 17.8802 10.6746C17.8802 11.7131 17.0386 12.5546 16.0002 12.5546ZM17.5492 20.2177C17.5492 21.7846 17.0369 23.2062 14.4723 23.2062V14.8623H17.5492V20.2177ZM16 6C10.4769 6 6 10.4777 6 16C6 21.5231 10.4769 26 16 26C21.5231 26 26 21.5231 26 16C26 10.4777 21.5231 6 16 6Z" fill="currentColor">
</path>
</svg>
```

### account-options

- Label: Account options
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: AccountActionBar

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M17.0212 18.5281C15.6247 19.0923 14.0369 18.4188 13.4712 17.0222C12.9071 15.6255 13.5821 14.036 14.9786 13.4719C16.3752 12.9077 17.963 13.5828 18.527 14.9794C19.0911 16.3761 18.4162 17.964 17.0212 18.5281ZM24.9875 21.1543L25.9807 18.7805L23.7196 16.8052V15.2527L26 13.2887L25.0229 10.9084L22.0161 11.1109L20.9297 10.0228L21.1531 7.01093L18.7794 6.01929L16.7947 8.29187H15.2616L13.2881 6L10.908 6.97718L11.1105 9.98264L10.0241 11.0707L7.01085 10.8457L6.01768 13.2195L8.28043 15.1948V16.749L6 18.7113L6.9771 21.0932L9.95982 20.8907L11.0687 21.9997L10.8453 24.9891L13.2206 25.9823L15.1828 23.7322H16.7577L18.7119 26L21.0904 25.0244L20.8895 22.0399L21.9984 20.9325L24.9875 21.1543Z" fill="currentColor">
</path>
</svg>
```

### account-option-share-info

- Label: Share account info
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 17 20
- Usage: AccountOptionsScreen

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 17 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.9625 14.6625C16.525 15.2313 16.875 16.0125 16.875 16.875C16.875 17.7375 16.525 18.5187 15.9625 19.0875C15.3937 19.65 14.6125 20 13.75 20C12.025 20 10.625 18.6 10.625 16.875C10.625 16.625 10.6562 16.3812 10.7125 16.1437L5.1625 12.9937C4.6125 13.4688 3.9 13.75 3.125 13.75C1.4 13.75 0 12.35 0 10.625C0 9.7625 0.35 8.98125 0.9125 8.4125C1.48125 7.85 2.2625 7.5 3.125 7.5C3.83125 7.5 4.48125 7.73125 5 8.125L10.8125 4.2C10.6938 3.8625 10.625 3.5 10.625 3.125C10.625 2.2625 10.975 1.48125 11.5375 0.9125C12.1063 0.35 12.8875 0 13.75 0C14.6125 0 15.3937 0.35 15.9625 0.9125C16.525 1.48125 16.875 2.2625 16.875 3.125C16.875 3.9875 16.525 4.76875 15.9625 5.3375C15.3937 5.9 14.6125 6.25 13.75 6.25C13.0813 6.25 12.4625 6.04375 11.9563 5.6875L6.09375 9.64375C6.19375 9.95625 6.25 10.2812 6.25 10.625C6.25 10.8938 6.21875 11.15 6.15 11.4L11.675 14.5375C12.2312 14.0506 12.9563 13.75 13.75 13.75C14.6125 13.75 15.3937 14.1 15.9625 14.6625Z" fill="currentColor">
</path>
</svg>
```

### account-option-push-notifications

- Label: Push notifications
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: AccountOptionsScreen

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M11.1249 2.67687V0.833252H8.86863V2.67688C7.11467 3.07275 5.71747 4.37185 5.21679 6.04321H5.21454L3.33057 15.7289H16.6639L14.7794 6.04321H14.7765C14.2763 4.37183 12.8792 3.07272 11.1249 2.67687Z" fill="currentColor">
</path>
<path d="M7.7406 16.8749C7.76259 18.1439 8.76211 19.1666 9.99685 19.1666C11.231 19.1666 12.2311 18.1439 12.2531 16.8749H7.7406Z" fill="currentColor">
</path>
</svg>
```

### account-option-statement

- Label: Account statement
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 8 6 16 20
- Usage: AccountOptionsScreen

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="8 6 16 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M19.5944 6H8V22.875C8 24.6009 9.39911 26 11.125 26H23.625V10.0312L19.5944 6ZM11.125 19.125H20.5V17.875H11.125V19.125ZM20.5 22.25H11.125V21H20.5V22.25ZM11.125 16H16.125V14.75H11.125V16ZM18.625 7.25V11H22.375L18.625 7.25Z" fill="currentColor">
</path>
</svg>
```

### account-option-create-paycode

- Label: Create paycode
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 12 20
- Usage: AccountOptionsScreen

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 12 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.3704 15.5556H1.48148V2.22222H10.3704V15.5556ZM4.81482 17.4074C4.81482 18.0207 5.31259 18.5185 5.92593 18.5185C6.53926 18.5185 7.03704 18.0207 7.03704 17.4074C7.03704 16.7941 6.53926 16.2963 5.92593 16.2963C5.31259 16.2963 4.81482 16.7941 4.81482 17.4074ZM0 2.22222C0 0.994815 0.994815 0 2.22222 0H11.8519V17.7778C11.8519 19.0052 10.857 20 9.62963 20H0V2.22222ZM5.18519 6.66667V5.18518H2.22222V8.14815H3.7037V9.62963H2.22222V12.5926H5.18519V11.1111H6.66667V12.5926H8.14815V11.1111H9.62963V9.62963H8.14815V8.14815H9.62963V5.18518H6.66667V6.66667H8.14815V8.14815H6.66667V9.62963H5.18519V8.14815H3.7037V6.66667H5.18519ZM6.66667 9.62963H8.14815V11.1111H6.66667V9.62963ZM5.18518 9.62963V11.1111H3.7037V9.62963H5.18518Z" fill="currentColor">
</path>
</svg>
```

### account-option-change-name

- Label: Change account name
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: AccountOptionsScreen

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M24.1367 11.6553C25.1886 11.8046 25.9999 12.6993 26 13.791V26H11.2949C10.1975 25.9998 9.30008 25.1817 9.15625 24.125H24.1367V11.6553ZM12.2539 8.5H20.7051C21.902 8.5 22.8729 9.46987 22.873 10.666V22.875H8.16797C6.97046 22.8748 6 21.9048 6 20.708V6H10.7949L12.2539 8.5ZM14.4375 11C11.8487 11 9.75 13.098 9.75 15.6875C9.75 18.2763 11.8487 20.375 14.4375 20.375C17.0263 20.375 19.125 18.2763 19.125 15.6875C19.125 13.098 17.0263 11 14.4375 11ZM17.0547 18.29H11.7812C11.8062 17.0223 12.8402 16.0068 14.1084 16.0049H17.0547V18.29ZM14.2188 12.665C14.9467 12.665 15.537 13.2554 15.5371 13.9834C15.5371 14.7115 14.9468 15.3018 14.2188 15.3018C13.4907 15.3018 12.9004 14.7115 12.9004 13.9834C12.9005 13.2554 13.4908 12.665 14.2188 12.665Z" fill="currentColor">
</path>
</svg>
```

### add-money

- Label: Add money
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: AccountActionBar

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M10 0C15.5225 0 20 4.4775 20 10C20 15.5225 15.5225 20 10 20C4.47688 20 0 15.5225 0 10C0 4.4775 4.47688 0 10 0ZM9.0625 4.375V9.0625H4.375V10.9375H9.0625V15.625H10.9375V10.9375H15.625V9.0625H10.9375V4.375H9.0625Z" fill="currentColor">
</path>
</svg>
```

### mcash

- Label: mCash
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: AccountActionBar

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 5H1.25V3.125H7.5V5ZM6.25 7.5C6.25 7.845 6.53 8.125 6.875 8.125C7.22 8.125 7.5 7.845 7.5 7.5C7.5 7.155 7.22 6.875 6.875 6.875C6.53 6.875 6.25 7.155 6.25 7.5ZM6.25 10C6.25 10.345 6.53 10.625 6.875 10.625C7.22 10.625 7.5 10.345 7.5 10C7.5 9.655 7.22 9.375 6.875 9.375C6.53 9.375 6.25 9.655 6.25 10ZM6.25 12.5C6.25 12.845 6.53 13.125 6.875 13.125C7.22 13.125 7.5 12.845 7.5 12.5C7.5 12.155 7.22 11.875 6.875 11.875C6.53 11.875 6.25 12.155 6.25 12.5ZM3.75 7.5C3.75 7.845 4.03 8.125 4.375 8.125C4.72 8.125 5 7.845 5 7.5C5 7.155 4.72 6.875 4.375 6.875C4.03 6.875 3.75 7.155 3.75 7.5ZM3.75 10C3.75 10.345 4.03 10.625 4.375 10.625C4.72 10.625 5 10.345 5 10C5 9.655 4.72 9.375 4.375 9.375C4.03 9.375 3.75 9.655 3.75 10ZM3.75 12.5C3.75 12.845 4.03 13.125 4.375 13.125C4.72 13.125 5 12.845 5 12.5C5 12.155 4.72 11.875 4.375 11.875C4.03 11.875 3.75 12.155 3.75 12.5ZM1.25 7.5C1.25 7.845 1.53 8.125 1.875 8.125C2.22 8.125 2.5 7.845 2.5 7.5C2.5 7.155 2.22 6.875 1.875 6.875C1.53 6.875 1.25 7.155 1.25 7.5ZM1.25 10C1.25 10.345 1.53 10.625 1.875 10.625C2.22 10.625 2.5 10.345 2.5 10C2.5 9.655 2.22 9.375 1.875 9.375C1.53 9.375 1.25 9.655 1.25 10ZM1.25 12.5C1.25 12.845 1.53 13.125 1.875 13.125C2.22 13.125 2.5 12.845 2.5 12.5C2.5 12.155 2.22 11.875 1.875 11.875C1.53 11.875 1.25 12.155 1.25 12.5ZM16.25 0V1.875H11.875C10.1494 1.875 8.75 3.27437 8.75 5V15H0V3.75C0 1.67937 1.67937 0 3.75 0H16.25ZM18.75 16.25H11.25V5H18.75V16.25ZM14.0625 17.8125C14.0625 18.33 14.4825 18.75 15 18.75C15.5175 18.75 15.9375 18.33 15.9375 17.8125C15.9375 17.295 15.5175 16.875 15 16.875C14.4825 16.875 14.0625 17.295 14.0625 17.8125ZM10 5C10 3.96438 10.8394 3.125 11.875 3.125H20V18.125C20 19.1606 19.1606 20 18.125 20H10V5ZM14.375 8.75V7.5H11.875V10H13.125V11.25H11.875V13.75H14.375V12.5H15.625V13.75H16.875V12.5H18.125V11.25H16.875V10H18.125V7.5H15.625V8.75H16.875V10H15.625V11.25H14.375V10H13.125V8.75H14.375ZM15.625 11.25H16.875V12.5H15.625V11.25ZM14.375 11.25V12.5H13.125V11.25H14.375Z" fill="currentColor">
</path>
</svg>
```

### copy-documents

- Label: Copy documents
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 7 6 18 20
- Usage: AccountBalanceCard, AccountDetailsInfoScreen
- Notes: Deduplicated exact account copy icon.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="7 6 18 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M22 10.375C23.3806 10.375 24.5 11.4944 24.5 12.875V26H14.5C13.1194 26 12 24.8806 12 23.5V10.375H22ZM17 6C18.3806 6 19.5 7.11937 19.5 8.5V9.125H10.75V21.625H9.5C8.11937 21.625 7 20.5056 7 19.125V6H17Z" fill="currentColor">
</path>
</svg>
```

### transaction-transfer

- Label: Transaction transfer
- Category: Accounts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: AccountTransactionRow

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16.4844 13.75H10.1137L11.2562 14.8925C11.7444 15.3806 11.7444 16.1719 11.2562 16.66L7.72125 13.125L11.2562 9.58938C11.7444 10.0781 11.7444 10.8694 11.2562 11.3575L10.1137 12.5H16.4844V13.75ZM7.27187 10.41L3.73688 6.875L7.27187 3.33938C7.76 3.82812 7.76 4.61938 7.27187 5.1075L6.12937 6.25H12.5V7.5H6.12937L7.27187 8.6425C7.76 9.13062 7.76 9.92188 7.27187 10.41ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5231 4.4775 20 10 20C15.5231 20 20 15.5231 20 10C20 4.4775 15.5231 0 10 0Z" fill="currentColor">
</path>
</svg>
```

## AppIcon / System

### demo-chevron-down

- Label: Demo topbar chevron down
- Category: System
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 8 12 8
- Usage: DemoTopBar
- Notes: Deduplicated from product, country and release dropdown triggers.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 8 12 8" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M18 9.27483C17.8177 9.07048 17.5943 8.90697 17.3444 8.79501C17.0946 8.68305 16.8238 8.62517 16.55 8.62517C16.2762 8.62517 16.0054 8.68305 15.7556 8.79501C15.5057 8.90697 15.2823 9.07048 15.1 9.27483L12 12.4228L8.9 9.27483C8.71773 9.07048 8.49433 8.90697 8.24444 8.79501C7.99455 8.68305 7.72382 8.62517 7.45 8.62517C7.17618 8.62517 6.90545 8.68305 6.65556 8.79501C6.40567 8.90697 6.18227 9.07048 6 9.27483L12 15.3748L18 9.27483Z" fill="currentColor">
</path>
</svg>
```

### demo-settings

- Label: Demo settings
- Category: System
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 24 24
- Usage: DemoTopBar

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
<path clip-rule="evenodd" fill-rule="evenodd" d="M10.6628 14.7471C12.3527 15.4297 14.274 14.6148 14.9585 12.9248C15.6411 11.2347 14.8244 9.31128 13.1344 8.62865C11.4445 7.94602 9.52319 8.76284 8.84061 10.4529C8.15804 12.1429 8.9748 14.0644 10.6628 14.7471ZM2.1137 17.6697L1.02121 15.0585L3.50848 12.8857V11.1779L1 9.01752L2.07481 6.39923L5.38232 6.62199L6.57734 5.4251L6.33162 2.11202L8.94263 1.02122L11.1258 3.52105H12.8123L14.9831 1L17.6012 2.0749L17.3785 5.38091L18.5735 6.57779L21.8881 6.33028L22.9806 8.9415L20.4915 11.1143V12.8239L23 14.9825L21.9252 17.6025L18.6442 17.3798L17.4244 18.5996L17.6701 21.888L15.0574 22.9806L12.8989 20.5055H11.1665L9.01687 23L6.40056 21.9269L6.62154 18.6438L5.40177 17.4257L2.1137 17.6697Z" fill="currentColor">
</path>
</svg>
```

### demo-reset

- Label: Demo reset
- Category: System
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 3 1 18 22
- Usage: DemoTopBar

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="3 1 18 22" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M11.4114 6.04748C11.511 6.03553 11.6104 6.02359 11.7107 6.01866C14.9887 5.85847 17.7858 8.41112 17.9449 11.7097C18.0303 13.4717 17.341 15.0907 16.1857 16.2457L17.7304 17.6014C19.2205 16.0567 20.1025 13.9248 19.9905 11.61C19.7766 7.17639 16.0176 3.74445 11.6109 3.96032C11.5286 3.96442 11.4471 3.97395 11.3653 3.98351C11.3237 3.98839 11.2819 3.99327 11.24 3.99745L12.1336 3.04528C12.6877 2.45679 12.3399 1.36506 11.9266 1L7.94008 5.23011L12.3461 9.11785C12.7273 8.71361 12.9726 7.52426 12.3707 6.99352L11.3356 6.05647C11.3609 6.05355 11.3862 6.05052 11.4114 6.04748Z" fill="currentColor">
</path>
<path d="M6.26959 6.39924C4.77951 7.94402 3.8975 10.0752 4.00954 12.39C4.22339 16.8229 7.9817 20.2549 12.3884 20.0397C12.4669 20.0358 12.5448 20.0267 12.6229 20.0175C12.6685 20.0122 12.7142 20.0069 12.76 20.0026L11.8664 20.954C11.3116 21.5425 11.6594 22.6343 12.0734 23L16.0599 18.7699L11.6532 14.8815C11.2727 15.2864 11.0267 16.4751 11.6286 17.0065L12.6644 17.9435C12.6391 17.9464 12.6138 17.9495 12.5886 17.9525C12.489 17.9645 12.3896 17.9764 12.2893 17.9813C9.01061 18.1415 6.21425 15.5882 6.05506 12.2896C5.96966 10.5283 6.65901 8.90926 7.81363 7.75428L6.26959 6.39924Z" fill="currentColor">
</path>
</svg>
```

### info-circle

- Label: Info circle
- Category: System
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: NewPaymentDiscoverBanner, DesignSystemPage, InfoBanner

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.0001 7.20062C9.15635 7.20062 8.4726 6.51687 8.4726 5.67312C8.4726 4.83 9.15635 4.14562 10.0001 4.14562C10.8438 4.14562 11.5276 4.83 11.5276 5.67312C11.5276 6.51687 10.8438 7.20062 10.0001 7.20062ZM11.2587 13.4269C11.2587 14.7 10.8425 15.855 8.75874 15.855V9.07563H11.2587V13.4269ZM10 1.875C5.5125 1.875 1.875 5.51312 1.875 10C1.875 14.4875 5.5125 18.125 10 18.125C14.4875 18.125 18.125 14.4875 18.125 10C18.125 5.51312 14.4875 1.875 10 1.875Z" fill="currentColor">
</path>
</svg>
```

### warning-small

- Label: Warning small
- Category: System
- Source: custom
- Default size: 15x15
- ViewBox: 0 0 11 11
- Usage: PendingActionCard
- Notes: Small warning/alert glyph. Figma source ic_navigation_restyle_Warning_Small.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="15" viewBox="0 0 11 11" width="15" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.51172 4.12502C3.79983 4.12502 3.22266 4.74068 3.22266 5.50002V7.56252C3.93454 7.56252 4.51172 6.94687 4.51172 6.18752V4.12502ZM8.05664 5.84376V8.59376H2.25586V5.84376C2.25586 4.13498 3.55427 2.75002 5.15625 2.75002C6.75823 2.75002 8.05664 4.13498 8.05664 5.84376V5.84376ZM1.28906 10.3125H9.02344V9.28127H1.28906V10.3125ZM4.83398 1.375H5.47852V0H4.83398V1.375ZM9.02344 5.49997H10.3125V4.81247H9.02344V5.49997ZM2.70828 2.30662L1.89262 1.24203L1.39343 1.67721L2.20941 2.74181L2.70828 2.30662ZM8.10305 2.74181L8.91903 1.67721L8.42016 1.24203L7.60419 2.30662L8.10305 2.74181ZM0 5.5H1.28906V4.8125H0V5.5Z" fill="currentColor">
</path>
</svg>
```

### close-x

- Label: Close
- Category: System
- Source: custom
- Default size: 32x32
- ViewBox: 0 0 32 32
- Usage: BottomSheet, DemoFeatureSidePanel, HelperCard, NewPaymentDiscoverBanner, RoKidsApp, TemplateCodePreviews
- Notes: Custom close icon replacing the old lucide X wrapper.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
<path id="Icon" d="M22.3 9.70997V9.70997C21.91 9.31997 21.28 9.31997 20.89 9.70997L16 14.59L11.11 9.69997C10.72 9.30997 10.09 9.30997 9.69997 9.69997V9.69997C9.30997 10.09 9.30997 10.72 9.69997 11.11L14.59 16L9.69997 20.89C9.30997 21.28 9.30997 21.91 9.69997 22.3V22.3C10.09 22.69 10.72 22.69 11.11 22.3L16 17.41L20.89 22.3C21.28 22.69 21.91 22.69 22.3 22.3V22.3C22.69 21.91 22.69 21.28 22.3 20.89L17.41 16L22.3 11.11C22.68 10.73 22.68 10.09 22.3 9.70997Z" fill="currentColor">
</path>
</svg>
```

### add-circle

- Label: Add circle
- Category: System
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: GhostBanner
- Notes: System add glyph (plus inside a circle). Figma source ic_system_add_active.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M10 0C15.5225 0 20 4.4775 20 10C20 15.5225 15.5225 20 10 20C4.47688 20 0 15.5225 0 10C0 4.4775 4.47688 0 10 0ZM9.0625 4.375V9.0625H4.375V10.9375H9.0625V15.625H10.9375V10.9375H15.625V9.0625H10.9375V4.375H9.0625Z" fill="currentColor">
</path>
</svg>
```

### more-horizontal

- Label: More options (horizontal)
- Category: System
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Usage: UserEventCard
- Notes: Three horizontal dots for inline options/overflow. Figma source ic_navigation_tabbar_more_black (rotated).

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M5 8.25C4.0335 8.25 3.25 9.0335 3.25 10C3.25 10.9665 4.0335 11.75 5 11.75C5.9665 11.75 6.75 10.9665 6.75 10C6.75 9.0335 5.9665 8.25 5 8.25ZM10 8.25C9.0335 8.25 8.25 9.0335 8.25 10C8.25 10.9665 9.0335 11.75 10 11.75C10.9665 11.75 11.75 10.9665 11.75 10C11.75 9.0335 10.9665 8.25 10 8.25ZM15 8.25C14.0335 8.25 13.25 9.0335 13.25 10C13.25 10.9665 14.0335 11.75 15 11.75C15.9665 11.75 16.75 10.9665 16.75 10C16.75 9.0335 15.9665 8.25 15 8.25Z" fill="currentColor">
</path>
</svg>
```

### user-event-badge

- Label: User event badge
- Category: System
- Source: custom
- Default size: 18x24
- ViewBox: 0 0 18 24
- Usage: UserEventCard
- Notes: User-event avatar glyph (seal/badge). Figma source ic UserEvents node 9104:14465.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="24" viewBox="0 0 18 24" width="18" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9 14.2803C6.1005 14.2803 3.75 11.9248 3.75 9.01912C3.75 6.11347 6.1005 3.75797 9 3.75797C11.8995 3.75797 14.25 6.11347 14.25 9.01912C14.25 11.9248 11.8995 14.2803 9 14.2803ZM16.023 7.03793C15.6015 6.61478 15.3638 6.04132 15.3638 5.4438V2.64185H12.5685C11.9715 2.64185 11.3985 2.40435 10.977 1.98121L9 0L7.023 1.98121C6.60075 2.40435 6.0285 2.64185 5.43225 2.64185H2.63625V5.4438C2.63625 6.04132 2.39925 6.61478 1.977 7.03793L0 9.01912L1.977 11.0003C2.39925 11.4235 2.63625 11.9969 2.63625 12.5944V15.3965H5.43225C6.0285 15.3965 6.60075 15.6347 7.023 16.0571L9 18.0382L10.977 16.0571C11.3985 15.6347 11.9715 15.3965 12.5685 15.3965H15.3638V12.5944C15.3638 11.9969 15.6015 11.4235 16.023 11.0003L18 9.01912L16.023 7.03793ZM4.53982 16.9907C5.28607 16.9907 6.00157 17.2883 6.52882 17.8166L8.09032 19.3814L6.55433 24L4.15132 21.8798L0.861825 22.0977L2.56132 16.9907H4.53982ZM11.4715 17.8169C11.9987 17.2885 12.7142 16.9909 13.4597 16.9909H15.439L17.1377 22.098L13.849 21.88L11.446 23.9995L9.90998 19.3817L11.4715 17.8169ZM7.34932 12.2509H10.9921C11.1488 12.2509 11.2478 12.2298 11.2898 12.1862C11.3333 12.1426 11.3551 12.0472 11.3551 11.8984V11.4767C11.3551 11.3362 11.3296 11.2384 11.2793 11.1835C11.2283 11.1295 11.1323 11.1016 10.9921 11.1016H9.93607C9.93607 11.1016 9.93607 9.65712 9.93607 8.93485C9.93607 7.92119 9.93607 5.89385 9.93607 5.89385C9.93607 5.74429 9.90682 5.64508 9.84907 5.59472C9.78907 5.54286 9.67957 5.51806 9.51532 5.51806H8.92957C8.70382 5.51806 8.51257 5.5609 8.35582 5.64733L6.72907 6.51467C6.55807 6.60787 6.52657 6.74917 6.63607 6.93782L6.91732 7.46394C7.00282 7.60522 7.13182 7.6293 7.30282 7.53532L8.39107 6.97164H8.46157V11.1016H7.34932C7.19332 11.1016 7.09282 11.1227 7.05007 11.1655C7.00732 11.2084 6.98632 11.3054 6.98632 11.4527V11.8758C6.98632 12.0163 7.01107 12.1141 7.06282 12.1689C7.11307 12.2231 7.20832 12.2509 7.34932 12.2509Z" fill="currentColor">
</path>
</svg>
```

### user-event-refresh

- Label: User event refresh
- Category: System
- Source: custom
- Default size: 24x24
- ViewBox: 0 0 24 24
- Usage: UserEventCard
- Notes: User-event avatar glyph (refresh/cashback). Figma source img_userevents_merchant_first_purchase node 9104:14432.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
<path d="M24 0V7.6084C23.2523 7.6084 21.8939 6.77867 21.8936 5.66211L21.9072 3.94531L12.5312 13.6484L8.83008 9.85059L3.56445 15.2734C4.79351 16.9281 6.75956 17.9999 8.97559 18C12.4773 18 15.355 15.3232 15.6865 11.8994L17.8105 9.70117C17.8975 10.2059 17.9521 10.7213 17.9521 11.25C17.9521 12.843 17.5353 14.3373 16.8115 15.6348C16.8093 15.6391 16.8075 15.644 16.8047 15.6484L20.4668 19.3379C21.7155 20.5994 21.5464 22.8098 20.3682 24L14.6611 18.2529C13.156 19.5001 11.2428 20.2499 9.15723 20.25L9.17676 20.2402C9.10934 20.2417 9.04375 20.25 8.97559 20.25C4.01828 20.2498 0 16.2208 0 11.25C2.17182e-05 6.27992 4.01829 2.25022 8.97559 2.25C11.7318 2.25 14.1955 3.49777 15.8418 5.45898L14.2764 7.06738C13.0419 5.49239 11.1288 4.47656 8.97559 4.47656C5.25128 4.47679 2.23242 7.50441 2.23242 11.2393C2.23249 12.1937 2.43123 13.1015 2.78711 13.9248C2.67241 13.6555 2.57362 13.3775 2.49414 13.0918L2.49707 13.0938L8.83008 6.58105L12.5312 10.3652L20.4287 2.25098L18.6836 2.24512C17.5963 2.24474 16.8301 0.749904 16.8301 0H24Z" fill="currentColor">
</path>
</svg>
```

## AppIcon / Payments

### payment-create-qr

- Label: Create QR code
- Category: Payments
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 12 20
- Usage: PaymentOtherShortcut, PanelWithTranslations, PanelWithoutCoAppingTranslations, PanelWithoutCoApping

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 12 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.3704 15.5556H1.48148V2.22222H10.3704V15.5556ZM4.81482 17.4074C4.81482 18.0207 5.31259 18.5185 5.92593 18.5185C6.53926 18.5185 7.03704 18.0207 7.03704 17.4074C7.03704 16.7941 6.53926 16.2963 5.92593 16.2963C5.31259 16.2963 4.81482 16.7941 4.81482 17.4074ZM0 2.22222C0 0.994815 0.994815 0 2.22222 0H11.8519V17.7778C11.8519 19.0052 10.857 20 9.62963 20H0V2.22222ZM5.18519 6.66667V5.18518H2.22222V8.14815H3.7037V9.62963H2.22222V12.5926H5.18519V11.1111H6.66667V12.5926H8.14815V11.1111H9.62963V9.62963H8.14815V8.14815H9.62963V5.18518H6.66667V6.66667H8.14815V8.14815H6.66667V9.62963H5.18519V8.14815H3.7037V6.66667H5.18519ZM6.66667 9.62963H8.14815V11.1111H6.66667V9.62963ZM5.18518 9.62963V11.1111H3.7037V9.62963H5.18518Z" fill="currentColor">
</path>
</svg>
```

### payment-templates

- Label: Templates
- Category: Payments
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 7 6 18 20
- Usage: PaymentOtherShortcut, NewPaymentActionListItem
- Notes: Single canonical template icon shared by Payments OTHER and New payment sheet.

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="7 6 18 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M20 8.5V9.125H12.5H11.25V10.375V21.625H10C8.61937 21.625 7.5 20.5056 7.5 19.125V6H17.5C18.8806 6 20 7.11937 20 8.5ZM12.5 23.5V10.375H22.5C23.8806 10.375 25 11.4944 25 12.875V26H15C13.6194 26 12.5 24.8806 12.5 23.5Z" fill="currentColor">
</path>
</svg>
```

### payment-card-repayment

- Label: Card repayment
- Category: Payments
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 7 20 18
- Usage: PaymentOtherShortcut

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 7 20 18" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M21.625 7C19.2087 7 17.25 8.95876 17.25 11.375C17.25 13.7913 19.2087 15.75 21.625 15.75C24.0419 15.75 26 13.7913 26 11.375C26 8.95876 24.0419 7 21.625 7ZM23.2983 9.76025C22.8891 9.33294 22.3209 9.08333 21.7122 9.08333C20.4991 9.08333 19.5156 10.0668 19.5156 11.2799C19.5156 12.4931 20.4991 13.4765 21.7122 13.4765C22.6982 13.4765 23.5554 12.8212 23.8237 11.8871L22.9685 11.6416C22.8091 12.1967 22.2988 12.5867 21.7122 12.5867C20.9905 12.5867 20.4054 12.0017 20.4054 11.2799C20.4054 10.5582 20.9905 9.97309 21.7122 9.97309C22.0812 9.97309 22.4241 10.1265 22.6688 10.3895L22.0951 10.964H23.8646V9.19455L23.2983 9.76025ZM24.125 22.625H21V20.75H24.125V22.625ZM16.625 22.625H19.75V20.75H16.625V22.625ZM15.375 22.625H12.25V20.75H15.375V22.625ZM8.61687 18.0156C8.20688 18.0156 7.875 17.6838 7.875 17.2731V15.2418C7.875 14.8324 8.20688 14.4999 8.61687 14.4999H12.0244C12.4344 14.4999 12.7663 14.8324 12.7663 15.2418V17.2731C12.7663 17.6838 12.4344 18.0156 12.0244 18.0156H8.61687ZM11 22.625H7.875V20.75H11V22.625ZM21.625 17C18.5181 17 16 14.4818 16 11.3749H7.875C6.84375 11.3749 6 12.2187 6 13.2499V23.25C6 24.2812 6.84375 25.125 7.875 25.125H24.125C25.1562 25.125 26 24.2812 26 23.25V14.9068C24.9688 16.1825 23.3931 17 21.625 17Z" fill="currentColor">
</path>
</svg>
```

### payment-exchange-rates

- Label: Exchange rates
- Category: Payments
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 5.5 4 21 24
- Usage: PaymentOtherShortcut, PanelWithTranslations, PanelWithoutCoAppingTranslations, PanelWithoutCoApping

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="5.5 4 21 24" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M9.38672 18.6084C10.062 18.6084 10.8198 18.7521 11.3848 18.9668C11.619 19.0527 11.6744 19.167 11.5918 19.4531L11.4121 20.1123C11.3432 20.3696 11.2466 20.4267 11.04 20.3408C10.5991 20.1691 10.1028 20.04 9.68945 20.04C8.75259 20.0401 8.5186 20.3982 8.51855 21.3857V22.6172H10.627C10.999 22.6172 10.999 22.7034 10.999 23.1328V23.5479C10.999 23.9915 10.999 24.0488 10.627 24.0488H8.50488V24.6074C8.50482 25.3516 8.28414 25.9815 7.77441 26.5684H11.3711C11.688 26.5684 11.7431 26.6399 11.7432 27.0547V27.585C11.7432 27.9427 11.6879 28 11.3848 28H5.87207C5.55518 28 5.50002 27.8855 5.5 27.6279V27.1699C5.5 26.8979 5.54174 26.8404 5.81738 26.6543C6.49251 26.1819 6.78125 25.6661 6.78125 24.75V24.0488H6.12012C5.78942 24.0488 5.76172 23.991 5.76172 23.6904V23.2471C5.76172 22.8892 5.83103 22.8177 6.0791 22.7891L6.78125 22.6748V21.3291C6.78125 19.4537 7.55371 18.6084 9.38672 18.6084ZM26.5 26.5293H18.9326V24.6328H26.5V26.5293ZM26.5 22.7354H18.9326V20.8379H26.5V22.7354ZM22.9336 4C23.0676 4.00001 23.1538 4.01607 23.1924 4.04785C23.2307 4.07976 23.2499 4.1459 23.25 4.24609V5.24609C23.8936 5.28262 24.4896 5.37895 25.0371 5.53418C25.258 5.5981 25.3399 5.73075 25.2822 5.93164L25.0664 6.79395C25.028 6.98571 24.8785 7.04117 24.6191 6.95898C24.1485 6.82202 23.6919 6.73023 23.25 6.68457V9.0127L23.5391 9.06836C24.3935 9.24182 24.9839 9.52003 25.3105 9.90332C25.5987 10.2503 25.7431 10.7755 25.7432 11.4785V11.6846C25.7431 12.5884 25.4835 13.259 24.9648 13.6973C24.5518 14.0534 23.9183 14.2596 23.0635 14.3145V15.2314C23.0635 15.3319 23.0443 15.3987 23.0059 15.4307C22.9674 15.4626 22.8806 15.4785 22.7461 15.4785H22.3428C22.2083 15.4785 22.1214 15.4626 22.083 15.4307C22.0446 15.3987 22.0254 15.3319 22.0254 15.2314V14.3281C21.2186 14.2916 20.4739 14.1498 19.792 13.9033C19.6576 13.8577 19.5716 13.8044 19.5332 13.7451C19.4949 13.6858 19.4898 13.5925 19.5186 13.4648L19.6768 12.6562C19.696 12.5469 19.7516 12.474 19.8428 12.4375C19.934 12.401 20.028 12.4055 20.124 12.4512C20.777 12.7067 21.4108 12.8622 22.0254 12.917V10.3145L21.8242 10.2734C20.9693 10.0908 20.3834 9.83005 20.0664 9.49219C19.7014 9.1178 19.5186 8.56092 19.5186 7.82129V7.64355C19.5186 6.78519 19.7973 6.15472 20.3545 5.75293C20.7771 5.46087 21.3966 5.29175 22.2129 5.24609V4.24609C22.2129 4.14594 22.2322 4.07978 22.2705 4.04785C22.3089 4.01589 22.3958 4 22.5303 4H22.9336ZM10.207 5.04395C11.067 5.044 11.8801 5.2551 12.6455 5.67871C12.7871 5.75405 12.8197 5.89125 12.7441 6.08887L12.3477 6.90723C12.272 7.08611 12.1486 7.12407 11.9785 7.02051C11.4021 6.68167 10.7972 6.51172 10.1641 6.51172C9.69155 6.51174 9.31801 6.64886 9.04395 6.92188C8.80783 7.15723 8.65178 7.5713 8.57617 8.16406H11.0996C11.2788 8.16406 11.3878 8.1949 11.4258 8.25586C11.4636 8.31706 11.4824 8.46154 11.4824 8.6875V8.95508C11.4824 9.17162 11.4636 9.30874 11.4258 9.36523C11.3878 9.42153 11.2789 9.44922 11.0996 9.44922H8.50586V10.3115H11.0996C11.2792 10.3115 11.388 10.3421 11.4258 10.4033C11.4635 10.4647 11.4824 10.6084 11.4824 10.834V11.0732C11.4824 11.2898 11.4636 11.4269 11.4258 11.4834C11.3879 11.5398 11.279 11.5684 11.0996 11.5684H8.63281C8.69899 11.9448 8.82243 12.2363 9.00195 12.4434C9.29495 12.7917 9.79087 12.9658 10.4902 12.9658C11.0573 12.9658 11.6149 12.8529 12.1631 12.627C12.267 12.5893 12.3403 12.5872 12.3828 12.6201C12.4253 12.6531 12.4609 12.7354 12.4893 12.8672L12.6455 13.5449C12.7022 13.7897 12.6541 13.9448 12.5029 14.0107C11.8698 14.2931 11.1613 14.4346 10.377 14.4346C9.09159 14.4346 8.17512 14.1613 7.62695 13.6152C7.17336 13.1822 6.88461 12.5002 6.76172 11.5684H5.88281C5.70333 11.5684 5.5945 11.5398 5.55664 11.4834C5.51884 11.4269 5.5 11.2898 5.5 11.0732V10.834C5.5 10.6085 5.51898 10.4647 5.55664 10.4033C5.59445 10.3421 5.70324 10.3115 5.88281 10.3115H6.69043V9.44922H5.88281C5.70346 9.44922 5.59457 9.42159 5.55664 9.36523C5.51884 9.30874 5.5 9.17162 5.5 8.95508V8.6875C5.5 8.46154 5.51884 8.31706 5.55664 8.25586C5.59461 8.19485 5.70352 8.16406 5.88281 8.16406H6.74707C6.86997 7.05338 7.26241 6.23421 7.92383 5.70703C8.4909 5.26453 9.25246 5.04395 10.207 5.04395ZM23.0635 12.876C23.3227 12.8394 23.529 12.7567 23.6826 12.6289C23.8746 12.4828 23.9707 12.1865 23.9707 11.7393V11.6289C23.9707 11.2821 23.9131 11.0402 23.7979 10.9033C23.673 10.7573 23.4283 10.6336 23.0635 10.5332V12.876ZM22.2129 6.68457C21.944 6.72109 21.7469 6.78015 21.6221 6.8623C21.4011 6.99928 21.291 7.27365 21.291 7.68457V7.79395C21.291 8.11355 21.3678 8.34706 21.5215 8.49316C21.656 8.62086 21.8866 8.7255 22.2129 8.80762V6.68457Z" fill="currentColor">
</path>
</svg>
```

### new-payment-domestic

- Label: Domestic payment
- Category: Payments
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 19 20
- Usage: NewPaymentActionListItem

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="0 0 19 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.12475 3.125C8.12475 4.85063 6.726 6.25 4.99972 6.25C3.27408 6.25 1.8747 4.85063 1.8747 3.125C1.8747 1.39875 3.27408 0 4.99972 0C6.726 0 8.12475 1.39875 8.12475 3.125ZM18.4734 4.41856C18.4734 5.82356 17.3347 6.96231 15.9297 6.96231C14.5247 6.96231 13.3859 5.82356 13.3859 4.41856C13.3859 3.01356 14.5247 1.87481 15.9297 1.87481C17.3347 1.87481 18.4734 3.01356 18.4734 4.41856ZM0.625631 7.5H0V20H9.56506V16.4394C9.56506 11.5019 5.56254 7.5 0.625631 7.5ZM11.8749 15.0612C11.8749 11.5131 14.7512 8.63619 18.3 8.63619H18.75V17.7231H11.8749V15.0612Z" fill="currentColor">
</path>
</svg>
```

### new-payment-foreign

- Label: Foreign payment
- Category: Payments
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: NewPaymentActionListItem

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M19.5819 23.5163C19.42 22.9419 19.3581 22.3912 19.4375 22.0794C19.5656 21.5831 19.9969 20.915 20.3969 20.595C20.7969 20.2744 21.2281 19.6069 21.3556 19.11C21.4856 18.6144 21.8113 18.3531 22.0831 18.5281C22.3569 18.7044 22.7213 18.625 22.8988 18.3531C23.0506 18.1188 23.5875 17.8331 24.1631 17.6663C23.6444 20.1981 21.9613 22.3856 19.5819 23.5163ZM17.6125 15.5781C17.5506 15.3575 17.8075 14.895 18.185 14.5481C18.5625 14.2019 18.5887 13.6088 18.2419 13.2319C17.895 12.8544 17.6888 12.1331 17.785 11.6287C17.8787 11.1256 18.0837 10.4819 18.2419 10.1987C18.3994 9.91563 18.7069 9.63188 18.9288 9.56937C19.1488 9.50563 19.4062 9.04188 19.5 8.53875C19.505 8.51125 19.5144 8.48188 19.5181 8.45437C21.5731 9.41437 23.2238 11.1987 23.9481 13.5194C23.8062 13.6319 23.685 13.7481 23.6213 13.8606C23.465 14.1437 22.8206 13.9375 22.1912 13.4025C21.5619 12.8669 21.1481 12.79 21.2744 13.2312C21.4012 13.6719 21.3244 14.0831 21.1044 14.1463C20.8831 14.2094 20.6769 14.8531 20.6462 15.5781C20.6156 16.3025 20.2281 16.9969 19.7881 17.1231C19.3475 17.2488 18.7044 17.0431 18.3562 16.6656C18.0106 16.2881 17.6756 15.7981 17.6125 15.5781ZM10.3513 20.5806C10.58 20.81 11.3294 20.9981 12.0169 20.9981C12.7056 20.9981 13.4537 21.3731 13.6837 21.8306C13.8969 22.2575 13.5844 23.0944 12.9881 23.7631C9.87625 22.5537 7.66688 19.5394 7.66688 16C7.66688 13.8475 8.49 11.8919 9.82937 10.4131C10.3762 10.4219 10.8675 10.4763 11.1838 10.5806C11.8713 10.81 12.4337 11.3731 12.4337 11.8306C12.4337 12.2894 12.8088 12.665 13.2669 12.665C13.725 12.665 14.1012 13.2269 14.1012 13.915C14.1012 14.6025 13.725 15.7269 13.2669 16.4144C12.8088 17.1025 12.0588 17.8519 11.6013 18.0806C11.1431 18.31 10.58 18.8731 10.3513 19.3306C10.1213 19.7894 10.1213 20.3519 10.3513 20.5806ZM16 6C10.4769 6 6 10.4775 6 16C6 21.5225 10.4769 26 16 26C21.5225 26 26 21.5225 26 16C26 10.4775 21.5225 6 16 6Z" fill="currentColor">
</path>
</svg>
```

## AppIcon / Prime

### prime-check

- Label: Prime check
- Category: Prime
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 9 20 14
- Usage: YourBenefitsTab

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 9 20 14" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M20.847 11.0925C22.2483 9.63583 24.5196 9.63583 25.921 11.0925L14.4528 23L6.07886 14.311C7.47959 12.855 9.75151 12.855 11.1529 14.311L14.4528 17.7251L20.847 11.0925Z" fill="currentColor">
</path>
</svg>
```

### prime-direction

- Label: Prime direction
- Category: Prime
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: YourAdvisorTab

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.0141 19.5769C17.3866 18.9494 17.3866 17.9313 18.0141 17.3038L18.6929 16.625H15.6873C14.826 16.625 14.1248 17.3256 14.1248 18.1875V20.3751H12.2498V18.1875C12.2498 16.2925 13.7923 14.75 15.6873 14.75H18.6929L18.0141 14.0712C17.3866 13.4437 17.3866 12.4262 18.0141 11.7981L21.9041 15.6875L18.0141 19.5769ZM25.4422 14.6544L17.3466 6.55735C16.6029 5.81422 15.3973 5.81422 14.6542 6.55735L6.55734 14.6544C5.81422 15.3975 5.81422 16.6031 6.55734 17.3469L14.6542 25.4426C15.3973 26.1858 16.6029 26.1858 17.3466 25.4426L25.4422 17.3469C26.1859 16.6031 26.1859 15.3975 25.4422 14.6544Z" fill="currentColor">
</path>
</svg>
```

### prime-email

- Label: Prime email
- Category: Prime
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 1 5 22 14
- Usage: YourAdvisorTab

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="1 5 22 14" width="20" xmlns="http://www.w3.org/2000/svg">
<path d="M0.996582 6.3104V5H22.9966V6.3104L11.9966 14.0062L0.996582 6.3104Z" fill="currentColor">
</path>
<path d="M0.996582 8.17869L11.9966 15.8745L22.9966 8.17939V15.2669C22.9966 17.3284 21.3548 19 19.3301 19H0.996582V8.17869Z" fill="currentColor">
</path>
</svg>
```

## AppIcon / Contacts

### contact-prime

- Label: Contact Prime
- Category: Contacts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 5 5 21.1 20.2
- Usage: ContactsNavigationCard, HeaderActionIcons, BA/BA_BL More/Products/Payments headers

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="5 5 21.1 20.2" width="20" xmlns="http://www.w3.org/2000/svg">
<g transform="translate(5, 5)">
<path d="M0.916351 7.26543L4.52766 2.75H7.51211L5.58436 7.26543H0.916351Z" fill="currentColor">
</path>
<path d="M8.78562 17.8612L0.916016 8.55556H5.49403L8.78562 17.8612Z" fill="currentColor">
</path>
<path d="M10.9862 20.1667L6.83238 8.55556H15.1356L10.9862 20.1667Z" fill="currentColor">
</path>
<path d="M16.477 8.55556L13.1445 17.8619L21.0827 8.55556H16.477Z" fill="currentColor">
</path>
<path d="M14.4599 2.75L16.387 7.26543H21.0557L17.4444 2.75H14.4599Z" fill="currentColor">
</path>
<path d="M6.95794 7.26543L8.88569 2.75H13.0861L15.0132 7.26543H6.95794Z" fill="currentColor">
</path>
</g>
</svg>
```

### contact-location

- Label: Contact location
- Category: Contacts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 8 6 17 20
- Usage: ContactsNavigationCard, PanelWithTranslations, PanelWithoutCoAppingTranslations, PanelWithoutCoApping

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="8 6 17 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.375 13.5019C13.375 11.7756 14.7739 10.3762 16.4997 10.3762C18.2261 10.3762 19.625 11.7756 19.625 13.5019C19.625 15.2281 18.2261 16.6275 16.4997 16.6275C14.7739 16.6275 13.375 15.2281 13.375 13.5019ZM22.3068 18.2494C23.3652 16.9563 24 15.3037 24 13.5019C24 9.35875 20.6423 6 16.4997 6C12.3578 6 9 9.35875 9 13.5019C9 15.2587 9.60483 16.8725 10.6158 18.1512L16.4953 26L22.3068 18.2494Z" fill="currentColor">
</path>
</svg>
```

### contact-time

- Label: Contact time
- Category: Contacts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: ContactsNavigationCard, HeaderActionIcons, Products/Payments/More headers, YourAdvisorTab

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<g transform="translate(6, 6)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.25 10.6055H7.265C6.3025 10.6055 5.5225 10 5.5225 8.78906H9.375V5.06604C9.375 4.13422 10 3.37859 11.25 3.37859V10.6055ZM10 0.3125C4.4775 0.3125 0 4.65008 0 10C0 15.3505 4.4775 19.6875 10 19.6875C15.5231 19.6875 20 15.3505 20 10C20 4.65008 15.5231 0.3125 10 0.3125Z" fill="currentColor">
</path>
</g>
</svg>
```

### contact-phone

- Label: Contact phone
- Category: Contacts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: ContactsNavigationCard

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<g transform="translate(6, 6)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.66577 10.7775C5.21335 11.8943 5.82352 12.9457 6.47904 13.9263C7.88062 13.3943 9.48869 13.9825 10.1255 15.2831L12.0621 19.24L11.6177 19.4312L10.2988 20C7.87993 19.26 5.49312 17.5594 3.60992 15.1575C2.88048 14.2275 2.22499 13.1925 1.67408 12.0675C1.12384 10.9425 0.714153 9.80186 0.437035 8.67814C-0.280413 5.77 -0.10122 2.965 0.876697 0.761876L2.19435 0.191248L2.64133 0L4.57984 3.95875C5.21734 5.25812 4.64179 6.78628 3.30215 7.43814C3.66587 8.54124 4.11952 9.66062 4.66577 10.7775ZM16.5925 9.69172C16.5925 9.00172 17.2012 8.44172 17.9514 8.44172C18.7015 8.44172 19.3103 9.00172 19.3103 9.69172C19.3103 10.3817 18.7015 10.9417 17.9514 10.9417C17.2012 10.9417 16.5925 10.3817 16.5925 9.69172ZM8.27352 10.9417C9.00897 10.9417 9.60579 10.3817 9.60579 9.69166C9.60579 9.00166 9.00897 8.44166 8.27352 8.44166C7.53738 8.44166 6.94124 9.00166 6.94124 9.69166C6.94124 10.3817 7.53738 10.9417 8.27352 10.9417ZM11.6043 9.69166C11.6043 9.00166 12.2012 8.44166 12.9366 8.44166C13.672 8.44166 14.2689 9.00166 14.2689 9.69166C14.2689 10.3817 13.672 10.9417 12.9366 10.9417C12.2012 10.9417 11.6043 10.3817 11.6043 9.69166Z" fill="currentColor">
</path>
</g>
</svg>
```

### contact-block

- Label: Contact block
- Category: Contacts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 8 6 15 20
- Usage: ContactsNavigationCard

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="8 6 15 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M22.375 9.37875L22.3731 14.125H20.4987L20.5 9.37875C20.5 8.54938 19.8256 7.875 18.9963 7.875H12.0037C11.1744 7.875 10.5 8.54938 10.5 9.37875V14.125H8.625V9.37875C8.625 7.51563 10.1406 6 12.0037 6H18.9963C20.8594 6 22.375 7.51563 22.375 9.37875ZM16.3526 20.7294V22.2313C16.3526 22.6638 16.0026 23.0131 15.5713 23.0131C15.1394 23.0131 14.7894 22.6638 14.7894 22.2313V20.7294C14.3701 20.4681 14.0907 20.0031 14.0907 19.4719C14.0907 18.655 14.7538 17.9919 15.5713 17.9919C16.3888 17.9919 17.0513 18.655 17.0513 19.4719C17.0513 20.0031 16.7719 20.4681 16.3526 20.7294ZM8 15.375V26H21.1075C22.1531 26 23 25.0837 23 23.9544V15.375H8Z" fill="currentColor">
</path>
</svg>
```

### contact-email

- Label: Contact email
- Category: Contacts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: ContactsNavigationCard

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.6174 19.0256C19.5293 19.0256 20.2724 18.68 20.8493 17.9888C21.4256 17.2969 21.7137 16.3538 21.7137 15.1594C21.7137 13.6606 21.2312 12.495 20.2674 11.6619C19.3031 10.8287 18.0724 10.4125 16.5737 10.4125C14.7087 10.4125 13.1943 10.9625 12.0312 12.0631C10.8681 13.1631 10.2868 14.6825 10.2868 16.6213C10.2868 18.235 10.7737 19.4656 11.7481 20.315C12.7231 21.1637 14.1531 21.5881 16.0393 21.5881C17.2656 21.5881 18.4181 21.3731 19.4974 20.9438C19.7174 20.87 19.8062 20.7238 19.7649 20.5031L19.6231 19.8587C19.5812 19.6494 19.4506 19.5869 19.2299 19.67C18.2868 20.0062 17.2756 20.1731 16.1968 20.1731C13.5243 20.1731 12.1887 18.9525 12.1887 16.5112C12.1887 15.0231 12.5706 13.8756 13.3362 13.0687C14.1012 12.2619 15.1331 11.8581 16.4324 11.8581C17.5431 11.8581 18.4256 12.1594 19.0812 12.7625C19.7362 13.365 20.0631 14.2375 20.0631 15.3794C20.0631 16.1444 19.9374 16.7519 19.6862 17.2025C19.4343 17.6531 19.1249 17.8781 18.7587 17.8781C18.4024 17.8781 18.2243 17.7319 18.2243 17.4381C18.2243 17.3544 18.2506 17.1031 18.3031 16.6838L18.6799 13.7444C18.6906 13.6294 18.6749 13.5531 18.6331 13.5169C18.5912 13.48 18.5074 13.4619 18.3818 13.4619H17.6743C17.5062 13.4619 17.3912 13.53 17.3281 13.6656L17.2181 13.9019C16.9249 13.4931 16.4481 13.2887 15.7881 13.2887H15.6937C14.5831 13.2887 13.9068 13.9544 13.6656 15.285C13.5399 16.0188 13.4774 16.6056 13.4774 17.045C13.4774 18.1875 14.0587 18.7587 15.2218 18.7587H15.3318C15.9293 18.7587 16.3693 18.575 16.6524 18.2087H16.6993C17.0243 18.7537 17.6637 19.0256 18.6174 19.0256ZM6 16C6 10.4775 10.4775 6 16 6C21.5231 6 26 10.4775 26 16C26 21.5231 21.5231 26 16 26C10.4775 26 6 21.5231 6 16ZM16.0709 14.5149H16.1652C16.6159 14.5149 16.8046 14.7924 16.7315 15.3481L16.5577 16.6056C16.5059 16.9512 16.4221 17.2024 16.3065 17.3599C16.1915 17.5168 16.0184 17.5956 15.7878 17.5956H15.7096C15.5209 17.5956 15.3871 17.5487 15.3084 17.4543C15.2296 17.3599 15.1909 17.1974 15.1909 16.9668C15.1909 16.5687 15.2534 16.0449 15.379 15.3949C15.4315 15.0706 15.5103 14.8424 15.6152 14.7112C15.7203 14.5799 15.8715 14.5149 16.0709 14.5149Z" fill="currentColor">
</path>
</svg>
```

### contact-website

- Label: Contact website
- Category: Contacts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 7 20 18
- Usage: ContactsNavigationCard

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 7 20 18" width="20" xmlns="http://www.w3.org/2000/svg">
<g transform="translate(6, 7)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.1252 8.75C18.1252 9.18937 18.044 9.60812 17.9052 10H2.09473C1.95536 9.60875 1.87536 9.18937 1.87536 8.75V0H18.1252V8.75ZM7.50006 13.75L6.25006 16.25H13.7501L12.5001 13.75H7.50006ZM17.9581 11.25L19.8181 15.7625C20.2356 16.7188 19.9094 17.5 19.095 17.5H0.905113C0.0901164 17.5 -0.235507 16.7188 0.181991 15.7625L2.01073 11.25H17.9581Z" fill="currentColor">
</path>
</g>
</svg>
```

### contact-youtube

- Label: Contact YouTube
- Category: Contacts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: ContactsNavigationCard

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<g transform="translate(6, 6)">
<path d="M10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0ZM10.0059 5.97656C9.96935 5.97657 6.40783 5.97749 5.51562 6.21582C5.0183 6.35098 4.63199 6.73833 4.50293 7.22949C4.26337 8.1263 4.2627 10 4.2627 10C4.2627 10.001 4.26343 11.8739 4.50293 12.7705C4.63813 13.2678 5.02444 13.6552 5.51562 13.7842C6.40783 14.0225 9.96935 14.0234 10.0059 14.0234C10.0059 14.0234 13.5988 14.0237 14.4961 13.7842C14.9936 13.6491 15.3807 13.2618 15.5098 12.7705C15.7493 11.8739 15.749 10.001 15.749 10C15.749 10 15.7493 8.1263 15.5098 7.22949C15.3746 6.73206 14.9874 6.34479 14.4961 6.21582C13.5988 5.97634 10.0059 5.97656 10.0059 5.97656ZM11.8369 9.99414L8.85156 11.7197V8.26758L11.8369 9.99414Z" fill="currentColor">
</path>
</g>
</svg>
```

### contact-x

- Label: Contact X
- Category: Contacts
- Source: custom
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 6 6 20 20
- Usage: ContactsNavigationCard

```svg
<svg aria-hidden="true" color="currentColor" fill="none" height="20" viewBox="6 6 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
<g transform="translate(6, 6)">
<path d="M10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0ZM8.77832 10.4102L5.19531 14.375H6.73145L9.49609 11.3164L11.9141 14.375H15L11.0586 9.33105L14.4092 5.625H12.875L10.3477 8.41992L8.16406 5.625H5L8.77832 10.4102ZM13.1855 13.4873H12.3359L6.78809 6.4668H7.70117L13.1855 13.4873Z" fill="currentColor">
</path>
</g>
</svg>
```

## AppIcon / External Lucide

### wallet-cards

- Label: Wallet cards
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: Payments wallet illustration, AccountOptionsScreen, RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet-cards" aria-hidden="true">
<rect width="18" height="18" x="3" y="3" rx="2">
</rect>
<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2">
</path>
<path d="M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21">
</path>
</svg>
```

### shopping-bag

- Label: Shopping bag
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: ProductMenuCard, RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag" aria-hidden="true">
<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z">
</path>
<path d="M3 6h18">
</path>
<path d="M16 10a4 4 0 0 1-8 0">
</path>
</svg>
```

### arrow-right

- Label: Arrow right
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: ProductMenuCard, QuickActions

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right" aria-hidden="true">
<path d="M5 12h14">
</path>
<path d="m12 5 7 7-7 7">
</path>
</svg>
```

### camera

- Label: Camera
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: DomesticPaymentFlowScreens

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera" aria-hidden="true">
<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z">
</path>
<circle cx="12" cy="13" r="3">
</circle>
</svg>
```

### landmark

- Label: Landmark
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: TransactionDetailScreen

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-landmark" aria-hidden="true">
<line x1="3" x2="21" y1="22" y2="22">
</line>
<line x1="6" x2="6" y1="18" y2="11">
</line>
<line x1="10" x2="10" y1="18" y2="11">
</line>
<line x1="14" x2="14" y1="18" y2="11">
</line>
<line x1="18" x2="18" y1="18" y2="11">
</line>
<polygon points="12 2 20 7 4 7">
</polygon>
</svg>
```

### repeat

- Label: Repeat
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: TransactionDetailScreen

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat2 lucide-repeat-2" aria-hidden="true">
<path d="m2 9 3-3 3 3">
</path>
<path d="M13 18H7a2 2 0 0 1-2-2V6">
</path>
<path d="m22 15-3 3-3-3">
</path>
<path d="M11 6h6a2 2 0 0 1 2 2v10">
</path>
</svg>
```

### lock

- Label: Lock
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: InactiveState

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock" aria-hidden="true">
<rect width="18" height="11" x="3" y="11" rx="2" ry="2">
</rect>
<path d="M7 11V7a5 5 0 0 1 10 0v4">
</path>
</svg>
```

### alert-triangle

- Label: Alert triangle
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: UnplannedBanner

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert" aria-hidden="true">
<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3">
</path>
<path d="M12 9v4">
</path>
<path d="M12 17h.01">
</path>
</svg>
```

### credit-card

- Label: Credit card
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: QuickActions

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card" aria-hidden="true">
<rect width="20" height="14" x="2" y="5" rx="2">
</rect>
<line x1="2" x2="22" y1="10" y2="10">
</line>
</svg>
```

### send

- Label: Send
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: QuickActions, RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send" aria-hidden="true">
<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z">
</path>
<path d="m21.854 2.147-10.94 10.939">
</path>
</svg>
```

### bike

- Label: Bike
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bike" aria-hidden="true">
<circle cx="18.5" cy="17.5" r="3.5">
</circle>
<circle cx="5.5" cy="17.5" r="3.5">
</circle>
<circle cx="15" cy="5" r="1">
</circle>
<path d="M12 17.5V14l-3-3 4-3 2 3h2">
</path>
</svg>
```

### book-open

- Label: Book open
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open" aria-hidden="true">
<path d="M12 7v14">
</path>
<path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z">
</path>
</svg>
```

### calendar-days

- Label: Calendar days
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days" aria-hidden="true">
<path d="M8 2v4">
</path>
<path d="M16 2v4">
</path>
<rect width="18" height="18" x="3" y="4" rx="2">
</rect>
<path d="M3 10h18">
</path>
<path d="M8 14h.01">
</path>
<path d="M12 14h.01">
</path>
<path d="M16 14h.01">
</path>
<path d="M8 18h.01">
</path>
<path d="M12 18h.01">
</path>
<path d="M16 18h.01">
</path>
</svg>
```

### circle-dollar-sign

- Label: Circle dollar sign
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dollar-sign" aria-hidden="true">
<circle cx="12" cy="12" r="10">
</circle>
<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8">
</path>
<path d="M12 18V6">
</path>
</svg>
```

### clipboard-check

- Label: Clipboard check
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check" aria-hidden="true">
<rect width="8" height="4" x="8" y="2" rx="1" ry="1">
</rect>
<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2">
</path>
<path d="m9 14 2 2 4-4">
</path>
</svg>
```

### eye

- Label: Eye
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye" aria-hidden="true">
<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0">
</path>
<circle cx="12" cy="12" r="3">
</circle>
</svg>
```

### eye-off

- Label: Eye off
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off" aria-hidden="true">
<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49">
</path>
<path d="M14.084 14.158a3 3 0 0 1-4.242-4.242">
</path>
<path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143">
</path>
<path d="m2 2 20 20">
</path>
</svg>
```

### gift

- Label: Gift
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift" aria-hidden="true">
<rect x="3" y="8" width="18" height="4" rx="1">
</rect>
<path d="M12 8v13">
</path>
<path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7">
</path>
<path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5">
</path>
</svg>
```

### palette

- Label: Palette
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette" aria-hidden="true">
<circle cx="13.5" cy="6.5" r=".5" fill="currentColor">
</circle>
<circle cx="17.5" cy="10.5" r=".5" fill="currentColor">
</circle>
<circle cx="8.5" cy="7.5" r=".5" fill="currentColor">
</circle>
<circle cx="6.5" cy="12.5" r=".5" fill="currentColor">
</circle>
<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z">
</path>
</svg>
```

### piggy-bank

- Label: Piggy bank
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-piggy-bank" aria-hidden="true">
<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z">
</path>
<path d="M2 9v1c0 1.1.9 2 2 2h1">
</path>
<path d="M16 11h.01">
</path>
</svg>
```

### receipt-text

- Label: Receipt text
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-receipt-text" aria-hidden="true">
<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z">
</path>
<path d="M14 8H8">
</path>
<path d="M16 12H8">
</path>
<path d="M13 16H8">
</path>
</svg>
```

### shield-check

- Label: Shield check
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check" aria-hidden="true">
<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z">
</path>
<path d="m9 12 2 2 4-4">
</path>
</svg>
```

### sliders-horizontal

- Label: Sliders horizontal
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders-horizontal" aria-hidden="true">
<line x1="21" x2="14" y1="4" y2="4">
</line>
<line x1="10" x2="3" y1="4" y2="4">
</line>
<line x1="21" x2="12" y1="12" y2="12">
</line>
<line x1="8" x2="3" y1="12" y2="12">
</line>
<line x1="21" x2="16" y1="20" y2="20">
</line>
<line x1="12" x2="3" y1="20" y2="20">
</line>
<line x1="14" x2="14" y1="2" y2="6">
</line>
<line x1="8" x2="8" y1="10" y2="14">
</line>
<line x1="16" x2="16" y1="18" y2="22">
</line>
</svg>
```

### trophy

- Label: Trophy
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy" aria-hidden="true">
<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6">
</path>
<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18">
</path>
<path d="M4 22h16">
</path>
<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22">
</path>
<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22">
</path>
<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z">
</path>
</svg>
```

### user-round

- Label: User round
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round" aria-hidden="true">
<circle cx="12" cy="8" r="5">
</circle>
<path d="M20 21a8 8 0 0 0-16 0">
</path>
</svg>
```

### users

- Label: Users
- Category: External Lucide
- Source: lucide
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: lucide-react
- Usage: RoKidsApp

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users" aria-hidden="true">
<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2">
</path>
<circle cx="9" cy="7" r="4">
</circle>
<path d="M22 21v-2a4 4 0 0 0-3-3.87">
</path>
<path d="M16 3.13a4 4 0 0 1 0 7.75">
</path>
</svg>
```

## PFM Category Icons

### Taxes and Penalties

- Source: PfmCategoryIcon
- Color var: --uc-pfm-taxes-penalties
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: T

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M17.3307 7.12281C17.6738 7.82407 18.3864 8.26865 19.1666 8.26865L16.6461 3.12099H18.0198V1.97745H11.6131C11.3765 1.31229 10.7475 0.833336 9.99998 0.833336C9.25299 0.833336 8.62343 1.31229 8.38685 1.97745H1.98015V3.12099H3.35383L0.833313 8.26865C1.61353 8.26865 2.32615 7.82407 2.66928 7.12281L4.27153 3.85146L5.87378 7.12281C6.21691 7.82407 6.92953 8.26865 7.70975 8.26865L5.18923 3.12099H8.38685C8.48366 3.39255 8.64406 3.63089 8.85429 3.81938V16.2757H8.63833C7.24116 16.4854 5.95398 17.0102 4.84437 17.7659V19.1667H15.1556V17.7659C14.0466 17.0102 12.7588 16.4854 11.3616 16.2757H11.1457V3.81938C11.3559 3.63089 11.5169 3.39255 11.6131 3.12099H14.8107L12.2902 8.26865C13.0704 8.26865 13.7836 7.82407 14.1262 7.12281L15.7284 3.85146L17.3307 7.12281Z" fill="var(--uc-pfm-taxes-penalties)">
</path>
<path d="M0.834516 9.41253C0.834516 11.3077 2.37375 12.8437 4.27159 12.8437C6.16942 12.8437 7.70866 11.3077 7.70866 9.41253H0.834516Z" fill="var(--uc-pfm-taxes-penalties)">
</path>
<path d="M12.2914 9.41253C12.2914 11.3077 13.8307 12.8437 15.7285 12.8437C17.6263 12.8437 19.1656 11.3077 19.1656 9.41253H12.2914Z" fill="var(--uc-pfm-taxes-penalties)">
</path>
</svg>
```

### Income

- Source: PfmCategoryIcon
- Color var: --uc-pfm-income
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: I

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M4.88067 6C6.53727 6 7.88067 4.6566 7.88067 3C7.88067 1.3434 6.53727 0 4.88067 0C3.22407 0 1.88067 1.3434 1.88067 3C1.88067 4.6566 3.22407 6 4.88067 6ZM18.807 12.0745V9.6771H5.01544V17.419H18.807V15.1248C19.4885 14.9713 20 14.3474 20 13.5997C20 12.8519 19.4885 12.2281 18.807 12.0745ZM2.49189 13.5994C2.49189 14.3749 3.04167 15.0142 3.76134 15.1368V18.7097H9.59393V20H0V7.74201H0.627517C1.7321 7.74201 2.78465 7.95685 3.76134 8.33298V12.0626C3.04167 12.1852 2.49189 12.8246 2.49189 13.5994ZM12.3382 16.424C12.5374 16.2175 12.6377 15.968 12.6377 15.6755C12.6377 15.3825 12.5374 15.133 12.3382 14.926L11.399 13.924H14.8484V12.924H11.3995L12.3382 11.922C12.5374 11.716 12.6377 11.4655 12.6377 11.1735C12.6377 10.88 12.5374 10.631 12.3382 10.424L9.57598 13.424L12.3382 16.424Z" fill="var(--uc-pfm-income)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Utilities

- Source: PfmCategoryIcon
- Color var: --uc-pfm-utilities
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: U

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M5.6248 4.27084V0.833344C5.6248 0.833344 8.7496 0.833344 8.7496 3.12501V4.27084H10C15.625 4.27084 17.5 5.98959 17.5 11.1458H12.4996C12.4996 9.42709 11.875 8.85418 10 8.85418H2.5V4.27084H5.6248ZM12.4996 16.871C12.4996 15.1563 14.9998 12.2917 14.9998 12.2917C14.9998 12.2917 17.5 15.1563 17.5 16.871C17.5 18.0208 16.2496 19.1667 14.9998 19.1667C13.6168 19.1667 12.4996 18.0208 12.4996 16.871Z" fill="var(--uc-pfm-utilities)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Exclude from budget

- Source: PfmCategoryIcon
- Color var: --uc-pfm-exclude-budget
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 21 20
- Fallback initial: E

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M20.6455 4.94531L20.4834 5.11133C20.139 5.46306 19.6803 5.6571 19.1934 5.65723C18.7058 5.65723 18.2468 5.46299 17.9023 5.11133L16.7744 4.0332V11.5918C16.7742 16.2357 13.0182 20 8.38672 20C3.75474 19.9998 0.000173668 16.2356 0 11.5918C0 6.94848 3.75463 3.18282 8.38672 3.18262C9.1493 3.18262 9.88629 3.2939 10.5889 3.48535L10.0469 4.04004L9.16016 4.94531L10.0469 5.85059L10.208 6.0166C10.7977 6.61876 11.5832 6.95115 12.4199 6.95117C12.8122 6.95117 13.194 6.87799 13.5488 6.73828V9.58203L14.8389 10.9443V3.94141L13.7109 5.11133C13.3664 5.46311 12.9076 5.65723 12.4199 5.65723C11.933 5.65721 11.4744 5.46303 11.1299 5.11133L10.9678 4.94531L15.8066 0L20.6455 4.94531ZM8.11914 13.3301C7.55782 13.8165 6.69467 14.124 5.72949 14.124C4.76453 14.124 3.90209 13.8164 3.34082 13.3301C3.33522 13.3557 3.33289 13.382 3.33398 13.4082C3.33398 14.0879 4.31952 14.8388 5.72949 14.8389C7.13961 14.8389 8.12598 14.0879 8.12598 13.4082C8.12708 13.382 8.12472 13.3557 8.11914 13.3301ZM13.499 13.4082C13.402 13.4897 13.2967 13.5598 13.1846 13.6162C13.0709 13.6881 12.9514 13.7499 12.8281 13.8018C12.3121 14.0167 11.7615 14.1263 11.2061 14.124C10.6506 14.1263 10.1 14.0167 9.58398 13.8018C9.46075 13.7499 9.34119 13.6881 9.22754 13.6162C9.11542 13.5598 9.0101 13.4897 8.91309 13.4082C8.87843 13.3861 8.84616 13.36 8.81738 13.3301C8.81178 13.3557 8.80944 13.3819 8.81055 13.4082C8.80943 13.4346 8.81172 13.4615 8.81738 13.4873C8.83204 13.6157 8.87656 13.7386 8.94727 13.8447C9.00185 13.9519 9.07605 14.0472 9.16602 14.124C9.56987 14.5318 10.3026 14.8389 11.2061 14.8389C12.1096 14.8389 12.8422 14.5317 13.2461 14.124C13.3361 14.0471 13.4103 13.952 13.4648 13.8447C13.5356 13.7386 13.5801 13.6157 13.5947 13.4873C13.6004 13.4615 13.6027 13.4346 13.6016 13.4082C13.6027 13.3819 13.6003 13.3557 13.5947 13.3301C13.566 13.36 13.5337 13.3861 13.499 13.4082ZM8.02246 11.9775C7.92547 12.059 7.8201 12.1291 7.70801 12.1855C7.59453 12.2573 7.47558 12.3193 7.35254 12.3711C6.83651 12.5861 6.28501 12.6956 5.72949 12.6934C5.17407 12.6956 4.62337 12.586 4.10742 12.3711C3.98437 12.3193 3.86545 12.2573 3.75195 12.1855C3.63975 12.1291 3.53359 12.0591 3.43652 11.9775C3.40185 11.9555 3.36961 11.9293 3.34082 11.8994C3.33522 11.925 3.33289 11.9513 3.33398 11.9775C3.33285 12.004 3.33514 12.0308 3.34082 12.0566C3.35547 12.1851 3.39999 12.3079 3.4707 12.4141C3.52528 12.5213 3.59949 12.6165 3.68945 12.6934C4.09325 13.1012 4.82604 13.4081 5.72949 13.4082C6.63293 13.4082 7.36563 13.101 7.76953 12.6934C7.85948 12.6165 7.93371 12.5213 7.98828 12.4141C8.05901 12.3079 8.10449 12.1851 8.11914 12.0566C8.12481 12.0309 8.1271 12.004 8.12598 11.9775C8.12707 11.9513 8.12472 11.925 8.11914 11.8994C8.09027 11.9295 8.05726 11.9554 8.02246 11.9775ZM11.2061 10.5469C9.796 10.5469 8.81062 11.298 8.81055 11.9775C8.80943 12.004 8.81172 12.0309 8.81738 12.0566C8.83204 12.1851 8.87656 12.3079 8.94727 12.4141C9.00178 12.5211 9.07621 12.6156 9.16602 12.6924C9.29124 12.8182 9.43201 12.9267 9.58398 13.0146C9.73724 13.0991 9.89794 13.1692 10.0635 13.2227C10.4324 13.3478 10.8182 13.4102 11.2061 13.4082C11.5941 13.4102 11.9805 13.3479 12.3496 13.2227C12.515 13.1692 12.675 13.0991 12.8281 13.0146C12.9801 12.9267 13.1209 12.8182 13.2461 12.6924C13.3359 12.6156 13.4103 12.5211 13.4648 12.4141C13.5355 12.3079 13.5801 12.185 13.5947 12.0566C13.6004 12.0309 13.6027 12.004 13.6016 11.9775C13.6015 11.298 12.6162 10.5469 11.2061 10.5469ZM5.72949 9.11621C4.3195 9.11626 3.33406 9.86733 3.33398 10.5469C3.33287 10.5733 3.33515 10.6002 3.34082 10.626C3.35548 10.7544 3.39999 10.8772 3.4707 10.9834C3.52521 11.0904 3.59967 11.1849 3.68945 11.2617C3.81467 11.3875 3.95545 11.496 4.10742 11.584C4.2607 11.6685 4.42135 11.7385 4.58691 11.792C4.95585 11.9171 5.34162 11.9796 5.72949 11.9775C6.11759 11.9796 6.50392 11.9172 6.87305 11.792C7.03845 11.7385 7.19844 11.6684 7.35156 11.584C7.50355 11.496 7.6443 11.3876 7.76953 11.2617C7.85936 11.1849 7.93375 11.0904 7.98828 10.9834C8.05899 10.8772 8.10448 10.7544 8.11914 10.626C8.12481 10.6002 8.12709 10.5733 8.12598 10.5469C8.12589 9.86738 7.13961 9.11621 5.72949 9.11621Z" fill="var(--uc-pfm-exclude-budget)">
</path>
</svg>
```

### Shopping

- Source: PfmCategoryIcon
- Color var: --uc-pfm-shopping
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: S

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M4.88452 3.67409L7.9044 13.9133C6.98257 13.8691 5.91807 13.5558 5.58349 12.4181L3.00475 3.6753H2.99788C2.02849 3.6753 1.32895 3.41462 0.963997 2.17411L0.830505 1.66847L2.71715 1.66666C3.68653 1.66666 4.38607 1.92734 4.75103 3.16845L4.88452 3.67409Z" fill="var(--uc-pfm-shopping)">
</path>
<path d="M7.90458 15.8075C8.56516 15.8075 9.10084 16.3731 9.10084 17.0704C9.10084 17.7678 8.56516 18.3333 7.90458 18.3333C7.24399 18.3333 6.70831 17.7678 6.70831 17.0704C6.70831 16.3731 7.24399 15.8075 7.90458 15.8075Z" fill="var(--uc-pfm-shopping)">
</path>
<path d="M14.4166 15.8075C15.0771 15.8075 15.6128 16.3731 15.6128 17.0704C15.6128 17.7678 15.0771 18.3333 14.4166 18.3333C13.756 18.3333 13.2203 17.7678 13.2203 17.0704C13.2203 16.3731 13.756 15.8075 14.4166 15.8075Z" fill="var(--uc-pfm-shopping)">
</path>
<path d="M9.34691 13.9129L6.67823 5.07391L6.67938 5.0727H17.5432C18.7274 5.0727 19.4745 6.06886 19.0379 7.33659L16.5245 13.9129H9.34691Z" fill="var(--uc-pfm-shopping)">
</path>
</svg>
```

### Insurance

- Source: PfmCategoryIcon
- Color var: --uc-pfm-insurance
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: I

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M10.8671 8.98148V15.9656C10.8671 17.7303 9.44084 19.1667 7.68859 19.1667C6.77952 19.1667 5.91149 18.7703 5.30583 18.0801L5.30988 18.076C5.1758 17.9223 5.092 17.7239 5.092 17.5027C5.092 17.0208 5.47978 16.6308 5.9583 16.6308C6.21663 16.6308 6.44549 16.7467 6.60442 16.9265L6.60615 16.9248C6.88182 17.2396 7.27653 17.4206 7.68801 17.4206C8.48496 17.4206 9.13339 16.7682 9.13339 15.9656V8.98148H0.833313C1.40314 4.38883 5.2856 0.833332 10.0003 0.833332C14.7144 0.833332 18.5968 4.38883 19.1666 8.98148H10.8671Z" fill="var(--uc-pfm-insurance)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Groceries

- Source: PfmCategoryIcon
- Color var: --uc-pfm-groceries
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: G

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M10.5001 1.97917C10.112 1.97917 9.72336 2.18485 9.49625 2.59621L7.93751 5.41668H6.60646L8.46665 2.05136C8.8875 1.28881 9.64785 0.833336 10.5001 0.833336C11.3518 0.833336 12.1121 1.28881 12.5335 2.05136L14.3931 5.41668H13.0621L11.5039 2.59621C11.2762 2.18485 10.8882 1.97917 10.5001 1.97917Z" fill="var(--uc-pfm-groceries)">
</path>
<path d="M17.524 6.56246L18.4043 16.0425C18.5606 17.7206 17.2108 19.1667 15.4894 19.1667H5.51001C3.78913 19.1667 2.43936 17.7206 2.59564 16.0425L3.47598 6.56246H17.524ZM13.4266 8.28122C13.4266 8.59747 13.6883 8.85414 14.012 8.85414C14.3357 8.85414 14.5973 8.59747 14.5973 8.28122C14.5973 7.96497 14.3357 7.7083 14.012 7.7083C13.6883 7.7083 13.4266 7.96497 13.4266 8.28122ZM6.40265 8.28122C6.40265 8.59747 6.66488 8.85414 6.98798 8.85414C7.31108 8.85414 7.57331 8.59747 7.57331 8.28122C7.57331 7.96497 7.31108 7.7083 6.98798 7.7083C6.66488 7.7083 6.40265 7.96497 6.40265 8.28122Z" fill="var(--uc-pfm-groceries)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Home

- Source: PfmCategoryIcon
- Color var: --uc-pfm-home
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: H

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M10.0656 1.66669L2.5 7.39585V14.7151C2.5 16.7136 4.1724 18.3334 6.23575 18.3334H8.38675V13.6459C8.38675 13.0709 8.86804 12.6042 9.46225 12.6042H10.5377C11.1314 12.6042 11.6132 13.0709 11.6132 13.6459V18.3334H13.7642C15.8276 18.3334 17.5 16.7136 17.5 14.7151V7.39585L10.0656 1.66669Z" fill="var(--uc-pfm-home)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Education

- Source: PfmCategoryIcon
- Color var: --uc-pfm-education
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: E

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M16.875 12.7778V9.79778L18.0208 9.38111V11.6667C18.0208 12.19 17.83 12.7778 16.875 12.7778ZM9.99998 12.2894L15.7291 10.2144V12.7778C15.7291 13.8889 12.8646 15 9.99998 15C7.1354 15 4.27081 13.8889 4.27081 12.7778V10.2144L9.99998 12.2894ZM19.1666 7.77778L9.99998 11.1111L0.833313 7.77778L9.99998 5L19.1666 7.77778Z" fill="var(--uc-pfm-education)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Lifestyle

- Source: PfmCategoryIcon
- Color var: --uc-pfm-lifestyle
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: L

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M17.2344 13.9406C16.3375 14.1718 14.1256 14.7412 13.0156 15.0268C13.0163 15.038 13.0169 15.0993 13.0181 15.1911C13.0288 15.8805 12.4663 16.4467 11.7706 16.4467H6.27563C5.57875 16.4467 5.0125 15.8867 5.0125 15.1968H11.7706C11.7706 14.0524 10.8331 13.1244 9.67687 13.1244C9.67687 13.1244 8.76813 13.1394 8.4175 13.1306C7.90813 13.1187 7.37 12.98 6.94562 12.8256C6.56187 12.6856 5.85562 12.415 5.74437 12.3744C4.87625 12.0632 2.8325 11.4776 0 13.1244V17.4992C0 17.4992 5.61312 19.7347 7.55125 19.9697C8.72062 20.1122 9.85187 19.7315 10.9575 19.2716C11.9144 18.8735 20 15.0793 20 15.0793C19.6375 13.8118 18.5406 13.6031 17.2344 13.9406M10.1019 6.43156C10.9044 5.42286 11.9312 4.61165 13.1012 4.0348C12.5212 1.73554 10.1019 0 10.1019 0C10.1019 0 7.6825 1.73617 7.1025 4.0348C8.27375 4.61228 9.29937 5.42349 10.1019 6.43156M16.3519 4.37479C16.3975 7.33214 14.8594 10.1658 11.9794 11.4219C11.625 11.5763 11.2656 11.6951 10.9038 11.7919L10.8863 11.7957C10.6275 11.8482 10.3644 11.8744 10.1019 11.8744C9.83875 11.8744 9.57625 11.8482 9.31687 11.7957L9.3 11.7919C8.9375 11.6951 8.57812 11.5763 8.22437 11.4219C5.34375 10.1658 3.80688 7.33214 3.85188 4.37479C4.70688 4.42854 5.40313 4.62978 6.23438 4.99288C8.025 5.77347 9.35875 7.16528 10.1019 8.81645C10.8444 7.16528 12.1788 5.77347 13.9688 4.99288C14.8 4.62978 15.4963 4.42854 16.3519 4.37479" fill="var(--uc-pfm-lifestyle)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Transportation

- Source: PfmCategoryIcon
- Color var: --uc-pfm-transportation
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: T

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M17.3012 8.69744L15.63 5.57125C15.0548 4.43908 14.196 3.94929 12.4738 3.76583C12.1278 3.72868 10.7299 3.72354 9.92779 3.72354C8.59691 3.72354 7.78852 3.73783 7.52498 3.76583C5.80738 3.94986 4.95029 4.43965 4.37508 5.57011L2.69357 8.70144L2.6456 8.74016C2.07398 9.20125 1.40623 9.7399 1.40623 10.6143V16.901H3.6979V15.1864H16.3021V16.901H18.5937V10.6143C18.5937 9.74019 17.926 9.20153 17.3542 8.74024L17.3012 8.69744ZM14.5833 11.1858C14.5833 10.8703 14.8394 10.6143 15.1562 10.6143H16.875V11.1858C16.875 11.5019 16.6189 11.7573 16.3021 11.7573H14.5833V11.1858ZM12.4234 13.4719H7.57597C7.33248 13.4719 7.1354 13.2164 7.1354 12.9004H12.8646C12.8646 13.2164 12.6669 13.4719 12.4234 13.4719ZM5.41665 11.7573H3.6979C3.38165 11.7573 3.12498 11.5019 3.12498 11.1858V10.6143H4.84373C5.15998 10.6143 5.41665 10.8703 5.41665 11.1858V11.7573ZM5.90019 6.36051C6.10243 5.95645 6.28003 5.62383 7.70831 5.47066C7.91743 5.44838 8.91373 5.43809 9.92779 5.43809C11.0009 5.43809 12.0928 5.44952 12.2916 5.47066C13.7199 5.62269 13.9021 5.95645 14.1044 6.36051L15.1562 8.32824H4.84373L5.90019 6.36051Z" fill="var(--uc-pfm-transportation)" fill-rule="evenodd" clip-rule="evenodd">
</path>
<path d="M18.0208 7.18521C17.704 7.18521 17.4479 7.44125 17.4479 7.75673V8.32824H18.5937C18.9106 8.32824 19.1666 8.0722 19.1666 7.75673V7.18521H18.0208Z" fill="var(--uc-pfm-transportation)">
</path>
<path d="M2.55206 7.75673V8.32824H1.40623C1.08998 8.32824 0.833313 8.0722 0.833313 7.75673V7.18521H1.97915C2.2954 7.18521 2.55206 7.44125 2.55206 7.75673Z" fill="var(--uc-pfm-transportation)">
</path>
</svg>
```

### Leisure time

- Source: PfmCategoryIcon
- Color var: --uc-pfm-leisure-time
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: L

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M18.1606 0.943552C17.1689 1.20079 16.2677 1.72958 15.5435 2.45374L12.7918 5.20543H3.28253C2.61967 5.20543 1.98373 5.46839 1.51508 5.93703L0.833313 6.61879L6.9744 8.07685L8.4468 9.5498L7.423 10.5742C7.09586 10.9013 6.80883 11.2668 6.56763 11.6615L5.8257 12.8778L3.42633 12.8658C3.11753 12.8641 2.81446 12.9483 2.55034 13.1093L1.74654 13.5997L4.97149 15.028L6.40034 18.2534L6.89076 17.4497C7.05117 17.1855 7.13539 16.8819 7.13367 16.5731L7.12164 14.1743L8.33794 13.4324C8.73325 13.1912 9.09877 12.9042 9.42591 12.5771L10.4503 11.5527L11.9227 13.0256L13.3808 19.1667L14.0625 18.4843C14.5312 18.0163 14.7947 17.3798 14.7947 16.7175V7.20832L17.5459 4.45663C18.2706 3.7319 18.7988 2.83129 19.0561 1.83901C19.1683 1.40589 19.2176 1.0272 19.095 0.905167C18.9724 0.782564 18.5943 0.831261 18.1606 0.943552" fill="var(--uc-pfm-leisure-time)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Healthcare

- Source: PfmCategoryIcon
- Color var: --uc-pfm-healthcare
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: H

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M9.99998 5.62615C10.4423 3.36921 12.3816 1.66666 14.5833 1.66666C17.1156 1.66666 19.1666 3.90423 19.1666 6.66681C19.1666 7.96685 18.4293 9.22939 18.4293 9.22939C18.2265 9.5719 17.7641 10.1869 17.4049 10.6251H11.756L10.6119 7.32558L9.26092 11.1719L7.60748 5.5249L6.25597 10.3338L5.29633 8.23748L4.14019 10.6251H2.56753C2.22837 10.2382 1.78321 9.60502 1.53514 9.17814C1.53514 9.17814 0.833313 7.9481 0.833313 6.66681C0.833313 3.90423 2.88435 1.66666 5.41378 1.66666C7.61894 1.66666 9.5617 3.36171 9.99998 5.62615Z" fill="var(--uc-pfm-healthcare)">
</path>
<path d="M10.6053 10.8389L10.9651 11.8752H16.2812L10.6231 18.0535C10.2748 18.4266 9.71329 18.4266 9.37241 18.0535L3.70798 11.8752H4.8309L5.26746 10.9733L6.51126 13.6896L7.63017 9.70947L9.16329 14.944L10.6053 10.8389Z" fill="var(--uc-pfm-healthcare)">
</path>
</svg>
```

### Investments

- Source: PfmCategoryIcon
- Color var: --uc-pfm-investments
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: I

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M14.5833 5.41666V19.1667C17.1145 19.1667 19.1666 17.1145 19.1666 14.5833V0.833328C16.6355 0.833328 14.5833 2.88552 14.5833 5.41666Z" fill="var(--uc-pfm-investments)">
</path>
<path d="M0.833313 14.5833V19.1667C3.36446 19.1667 5.41665 17.1145 5.41665 14.5833V9.99999C2.8855 9.99999 0.833313 12.0522 0.833313 14.5833Z" fill="var(--uc-pfm-investments)">
</path>
<path d="M7.70831 19.1667V8.85416C7.70831 6.32302 9.7605 4.27083 12.2916 4.27083V14.5833C12.2916 17.1145 10.2395 19.1667 7.70831 19.1667Z" fill="var(--uc-pfm-investments)">
</path>
</svg>
```

### Children

- Source: PfmCategoryIcon
- Color var: --uc-pfm-children
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: C

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M14.9038 9.42709C14.4712 9.42709 14.0742 9.56688 13.7454 9.7972L13.4471 10C12.4842 10.7162 11.2929 11.1458 10 11.1458C8.70712 11.1458 7.51635 10.7162 6.55288 10L6.24942 9.79319C5.92173 9.56459 5.52654 9.42709 5.09615 9.42709C3.98096 9.42709 3.07692 10.3249 3.07692 11.4323C3.07692 12.2659 3.59385 12.9683 4.32365 13.2685C4.65077 13.3854 4.94962 13.4249 5.23519 13.4679C5.27558 13.473 5.31423 13.4811 5.35462 13.4879C5.39962 13.4954 5.44519 13.5028 5.49019 13.512C5.53981 13.5212 5.58885 13.5315 5.63731 13.5435C5.67308 13.5515 5.70769 13.563 5.74288 13.5727C7.19788 13.9789 8.26923 15.3024 8.26923 16.875V19.1667H11.7308V16.875C11.7308 15.3608 12.7225 14.0746 14.0944 13.618C14.1844 13.5859 14.2756 13.563 14.3667 13.5424C14.4112 13.5309 14.4567 13.5223 14.5012 13.5131L14.5398 13.5063C14.6229 13.4908 14.706 13.4753 14.7908 13.4662C15.1288 13.4152 15.4865 13.3625 15.8887 13.1734C16.5048 12.8325 16.9231 12.184 16.9231 11.4323C16.9231 10.3249 16.019 9.42709 14.9038 9.42709ZM5.44981 4.67876C5.41058 4.91938 5.38462 5.16517 5.38462 5.41668C5.38462 7.94782 7.45115 10 10 10C12.5488 10 14.6154 7.94782 14.6154 5.41668C14.6154 5.16517 14.5894 4.91938 14.5502 4.67876C15.2667 4.37053 15.7692 3.66355 15.7692 2.83855C15.7692 1.7311 14.8652 0.833344 13.75 0.833344C13.18 0.833344 12.6677 1.06996 12.3002 1.44694C11.6229 1.05907 10.8383 0.833344 10 0.833344C9.16115 0.833344 8.37712 1.05907 7.69981 1.44694C7.33231 1.06996 6.82 0.833344 6.25 0.833344C5.13481 0.833344 4.23077 1.7311 4.23077 2.83855C4.23077 3.66355 4.73327 4.37053 5.44981 4.67876ZM15.1923 14.5833C13.9179 14.5833 12.8846 15.6094 12.8846 16.875V19.1667H15.1923C16.4667 19.1667 17.5 18.1406 17.5 16.875C17.5 15.6094 16.4667 14.5833 15.1923 14.5833ZM7.11538 16.875V19.1667H4.80769C3.53327 19.1667 2.5 18.1406 2.5 16.875C2.5 15.6094 3.53327 14.5833 4.80769 14.5833C6.08212 14.5833 7.11538 15.6094 7.11538 16.875Z" fill="var(--uc-pfm-children)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Wallet

- Source: PfmCategoryIcon
- Color var: --uc-pfm-wallet
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: W

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M2.5522 1.66666H17.4479C18.3932 1.66666 19.1666 2.47024 19.1666 3.45238V12.9762C19.1666 13.9584 18.3932 14.7619 17.4479 14.7619H2.5522C1.6069 14.7619 0.833466 13.9584 0.833466 12.9762V3.45238C0.833466 2.47024 1.6069 1.66666 2.5522 1.66666ZM17.4479 12.381H14.5833V10.5953H17.4479V12.381ZM13.4375 12.381H10.5729V10.5953H13.4375V12.381ZM9.42711 12.381H6.56255V10.5953H9.42711V12.381ZM2.55216 7.28454C2.55216 7.67502 2.85695 7.99109 3.23221 7.99109H6.35573C6.73098 7.99109 7.03577 7.67502 7.03577 7.28454V5.34942C7.03577 4.95953 6.73098 4.64287 6.35573 4.64287H3.23221C2.85695 4.64287 2.55216 4.95953 2.55216 5.34942V7.28454ZM5.41672 12.381H2.55216V10.5953H5.41672V12.381Z" fill="var(--uc-pfm-wallet)" fill-rule="evenodd" clip-rule="evenodd">
</path>
<path d="M2.55205 16.5476H17.4478C18.3931 16.5476 19.1665 15.744 19.1665 14.7619V16.5476C19.1665 17.5298 18.3931 18.3333 17.4478 18.3333H2.55205C1.60674 18.3333 0.833313 17.5298 0.833313 16.5476V14.7619C0.833313 15.744 1.60674 16.5476 2.55205 16.5476Z" fill="var(--uc-pfm-wallet)">
</path>
</svg>
```

### Transfers

- Source: PfmCategoryIcon
- Color var: --uc-pfm-transfers
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: T

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M16.4844 13.75H10.1137L11.2562 14.8925C11.7444 15.3806 11.7444 16.1719 11.2562 16.66L7.72125 13.125L11.2562 9.58938C11.7444 10.0781 11.7444 10.8694 11.2562 11.3575L10.1137 12.5H16.4844V13.75ZM7.27187 10.41L3.73688 6.875L7.27187 3.33938C7.76 3.82813 7.76 4.61938 7.27187 5.1075L6.12937 6.25H12.5V7.5H6.12937L7.27187 8.6425C7.76 9.13062 7.76 9.92187 7.27187 10.41V10.41ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5231 4.4775 20 10 20C15.5231 20 20 15.5231 20 10C20 4.4775 15.5231 0 10 0V0Z" fill="var(--uc-pfm-transfers)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```

### Finance

- Source: PfmCategoryIcon
- Color var: --uc-pfm-finance
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: F

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M4.27085 7.33871H3.75002C2.5995 7.33871 1.66669 6.27952 1.66669 4.97312L10 0.833333L18.3334 4.97312C18.3334 6.27952 17.4005 7.33871 16.25 7.33871H15.7292V15.6183H13.6459V7.33871H11.0417V15.6183H8.95835V7.33871H6.35419V15.6183H4.27085V7.33871ZM11.0417 4.38172C11.0417 3.72882 10.575 3.19892 10 3.19892C9.42502 3.19892 8.95835 3.72882 8.95835 4.38172C8.95835 5.03462 9.42502 5.56452 10 5.56452C10.575 5.56452 11.0417 5.03462 11.0417 4.38172Z" fill="var(--uc-pfm-finance)" fill-rule="evenodd" clip-rule="evenodd">
</path>
<path d="M17.8125 16.8011V19.1667H2.18752V16.8011H17.8125Z" fill="var(--uc-pfm-finance)">
</path>
</svg>
```

### Uncategorized

- Source: PfmCategoryIcon
- Color var: --uc-pfm-uncategorized
- Default size: 32x32 slot / 20x20 glyph
- ViewBox: 0 0 20 20
- Fallback initial: ?

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style="width:20px;height:20px;aspect-ratio:1 / 1" aria-hidden="true">
<path d="M13.125 7.03193C13.125 6.99568 13.1175 6.96443 13.1163 6.9288C13.0731 8.04255 12.58 8.92443 11.5631 9.68755L11.195 9.96755C10.7419 10.3182 10.5556 10.5344 10.4544 10.8382V11.0844C10.4544 11.9294 9.84188 12.6176 9.08875 12.6176H8.43625L8.45062 10.9982C8.46875 9.96505 8.69062 9.68005 9.71312 8.8238L10.1594 8.50005C10.8806 7.97943 11.0825 7.50943 11.115 6.98568C11.0812 6.30505 10.6894 6.00818 9.8125 6.00818C9.4625 6.00818 9.06312 6.08693 8.65 6.17505C8.34062 6.24318 8.04625 6.20318 7.77313 6.05818C7.35688 5.8888 7.05063 5.54256 6.93375 5.09318L6.875 4.86756L8.62438 4.45131C9.04438 4.36193 9.53688 4.31193 9.99875 4.31193C11.9725 4.31193 13.0713 5.2438 13.1163 6.9288C13.1188 6.87568 13.125 6.82443 13.125 6.77006V7.03193ZM9.4145 16.25C8.80138 16.25 8.302 15.7475 8.302 15.1306C8.302 14.5131 8.80138 14.0112 9.4145 14.0112C10.0289 14.0112 10.5289 14.5131 10.5289 15.1306C10.5289 15.7475 10.0289 16.25 9.4145 16.25V16.25ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5225 4.4775 20 10 20C15.5225 20 20 15.5225 20 10C20 4.4775 15.5225 0 10 0V0Z" fill="var(--uc-pfm-uncategorized)" fill-rule="evenodd" clip-rule="evenodd">
</path>
</svg>
```
