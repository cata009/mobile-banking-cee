/** Source references intentionally kept outside executable app-component entries. */
export interface FigmaLibraryReference {
  kind: 'foundation' | 'composition' | 'platform'
  reason: string
}
const references: Readonly<Record<string, FigmaLibraryReference>> = {
  '10178:68': {
    kind: 'foundation',
    reason: 'Documentation layout grid, not a shipped interactive control.',
  },
  '1514:2069': {
    kind: 'composition',
    reason:
      'Header composition with period controls, title/supporting copy and trend; not the ordinary PageHeader leaf.',
  },
  '1208:7612': {
    kind: 'composition',
    reason: 'Full inactive-prelogin screen composition, not a drawer primitive.',
  },
  '162:12132': {
    kind: 'foundation',
    reason: 'Authoring placeholder/reference slot; do not ship an IMG/GIF label as a new production component.',
  },
  '402:7759': {
    kind: 'composition',
    reason: 'Prelogin decorative overlay composition tied to a screen background.',
  },
  '303:23332': {
    kind: 'composition',
    reason:
      'Transaction details header/summary composition; keep feature-owned account/order/security values and policies.',
  },
  '7936:13268': {
    kind: 'composition',
    reason: 'Order details header/summary composition; keep feature-owned account/order/security values and policies.',
  },
  '303:23333': {
    kind: 'composition',
    reason:
      'Security details header/summary composition; keep feature-owned account/order/security values and policies.',
  },
  '290:13075': {
    kind: 'composition',
    reason: 'Terms-and-conditions feature-row composition around existing ToggleButton and divider.',
  },
  '280:11495': {
    kind: 'platform',
    reason: 'Explicit legacy/not-in-use source; preserve reference, do not reactivate or alias to a current control.',
  },
  '282:12172': {
    kind: 'platform',
    reason: 'Explicit legacy/not-in-use source; preserve reference, do not reactivate or alias to a current control.',
  },
  '70:4845': {
    kind: 'platform',
    reason: 'Explicit legacy/not-in-use source; preserve reference, do not reactivate or alias to a current control.',
  },
  '81:11410': {
    kind: 'platform',
    reason: 'Native sheet/status-container handle40x16; platform/chrome reference, not page-header runtime.',
  },
  '245:10031': {
    kind: 'platform',
    reason:
      'OS action-sheet anatomy with Bottom/Center/icon/header choices304px wide; ModalPanel is not exact native action-sheet coverage.',
  },
  '251:10279': {
    kind: 'platform',
    reason:
      'OS alert/pop-up variants270px wide; use real platform dialog semantics rather than label a generic modal as exact.',
  },
  '303:26674': {
    kind: 'platform',
    reason: 'Explicit legacy/not-in-use source; preserve reference, do not reactivate or alias to a current control.',
  },
  '297:19453': {
    kind: 'platform',
    reason: 'Legacy iOS keyboard layouts375x216; real text input/IME owns keyboard behavior.',
  },
  '0:8726': {
    kind: 'platform',
    reason: '320x568 modal backdrop reference; host modal/safe-area composition owns live scrim geometry.',
  },
  '7136:3892': {
    kind: 'platform',
    reason: '375x812 browser/WebView host reference, not a reusable app card/control implementation.',
  },
  '0:8859': {
    kind: 'platform',
    reason: '359x82 system push-notification reference; runtime notifications need real platform integration.',
  },
  '297:20210': {
    kind: 'platform',
    reason: '343x176 expanded iOS system-widget reference; not an in-app shared card.',
  },
  '10135:17102': {
    kind: 'platform',
    reason: '393x34 iOS home indicator reference, light/dark; host safe area/system chrome owns live behavior.',
  },
  '10135:17107': {
    kind: 'platform',
    reason: '393x48 Android home indicator reference, light/dark; host safe area/system chrome owns live behavior.',
  },
  '10135:7462': {
    kind: 'platform',
    reason: 'iOS alphabetic IME reference,12capitalization/symbol/predictive/theme variants393x290/336.',
  },
  '10135:7978': {
    kind: 'platform',
    reason: 'iOS numeric IME reference,4predictive/theme variants393x290/336.',
  },
  '10135:8054': {
    kind: 'platform',
    reason: 'Android IME reference70input-method/theme/action variants360x206/244; not70app controls.',
  },
  '10135:15629': {
    kind: 'platform',
    reason:
      'Keyboard IME action-key subcomponent28Enter/Send/Go/Done/Next/Search/Previous/theme/size variants; returnKeyType/inputMode belong to native TextInput.',
  },
  '9134:17132': {
    kind: 'composition',
    reason: 'Full Cards template screen, not a missing shared Card primitive.',
  },
}
export function getFigmaLibraryReference(familyId: string): FigmaLibraryReference | undefined {
  return Object.prototype.hasOwnProperty.call(references, familyId) ? references[familyId] : undefined
}
