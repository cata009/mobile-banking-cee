export interface ImplementationSpecification {
  label: string;
  value: string;
  detail?: string;
}

export interface ImplementationState {
  id: string;
  label: string;
  description: string;
}

export interface ComponentImplementationPackage {
  summary: string;
  visualSpecifications: readonly ImplementationSpecification[];
  states: readonly ImplementationState[];
  motionSpecifications: readonly ImplementationSpecification[];
  accessibilitySpecifications: readonly string[];
  assets: {
    required: boolean;
    summary: string;
  };
}

export const COMPONENT_IMPLEMENTATION_PACKAGES: Record<string, ComponentImplementationPackage> = {
  "ui.primary-button": {
    summary:
      "Portable reference implementation for a primary action. The package documents the rendered component, native reference ports, visual values, supported states, motion, and accessibility behavior.",
    visualSpecifications: [
      { label: "Reference width", value: "327 px", detail: "May expand to the width supplied by its container." },
      { label: "Height", value: "48 px" },
      { label: "Corner radius", value: "4 px" },
      { label: "Content", value: "Centered", detail: "Single-line label with end truncation." },
      { label: "Label", value: "16 px / 18 px", detail: "Bold semantic typography variants." },
      { label: "Action background", value: "--uc-action" },
      { label: "Action foreground", value: "--uc-text-inverse" },
      { label: "Surface background", value: "--uc-surface" },
    ],
    states: [
      { id: "action", label: "Action", description: "Default high-emphasis action." },
      { id: "surface", label: "Surface", description: "Neutral surface treatment." },
      { id: "pressed", label: "Pressed", description: "Scale feedback while the pointer is active." },
      { id: "disabled", label: "Disabled", description: "Native disabled state at 30% opacity." },
      { id: "focus", label: "Keyboard focus", description: "Two-pixel action-color focus ring with offset." },
      { id: "large-label", label: "18 px label", description: "Large semantic label option." },
      { id: "loading", label: "Loading", description: "Not part of the current public component contract." },
    ],
    motionSpecifications: [
      { label: "Transition", value: "200 ms", detail: "Applies to visual state changes." },
      { label: "Pressed transform", value: "scale(0.98)" },
      { label: "Release", value: "scale(1)" },
      { label: "Disabled motion", value: "None", detail: "The disabled control does not react to pointer input." },
    ],
    accessibilitySpecifications: [
      "Render with native button semantics and type=button.",
      "Expose the disabled state through the platform control, not appearance alone.",
      "Keep a visible keyboard focus indicator with sufficient contrast.",
      "Require a meaningful action label from the consuming screen.",
      "Keep the label on one line and truncate only when the available width is exhausted.",
    ],
    assets: {
      required: false,
      summary: "No image or icon assets are required. The component uses semantic color and typography tokens.",
    },
  },

  "shell.status-bar": {
    summary:
      "Portable reference for the simulated iOS status bar overlay shown at the top of every phone-frame screen. Documents layout values, light/dark/theme foreground variants, and the Co-Apping active tone.",
    visualSpecifications: [
      { label: "Position", value: "absolute, inset-x-0 top-0", detail: "z-index 50, pointer-events: none, layered above phone content." },
      { label: "Container padding", value: "24px sides, 14px top, 16px bottom" },
      { label: "Time-to-levels gap", value: "154px" },
      { label: "Time", value: "22px height", detail: "SF Pro Semibold 17px, live-updating clock (setInterval)." },
      { label: "Levels", value: "22px height", detail: "Cellular, Wi-Fi, and battery glyphs with a 7px internal gap." },
      { label: "Foreground color", value: "--uc-text (light) / --uc-static-white (dark)", detail: "The 'theme' variant reads --uc-phone-status-fg with a --uc-text fallback." },
    ],
    states: [
      { id: "light", label: "Light", description: "Default light-surface foreground." },
      { id: "dark", label: "Dark", description: "White foreground for dark/photo surfaces." },
      { id: "co-apping", label: "Co-Apping active", description: "Dark foreground while a Co-Apping session is active." },
    ],
    motionSpecifications: [
      { label: "Motion", value: "None", detail: "The clock re-renders every second; the glyphs themselves have no transition or animation." },
    ],
    accessibilitySpecifications: [
      "Purely decorative system-chrome simulation: pointer-events: none means it never intercepts taps.",
      "No ARIA role is applied because it mirrors OS chrome, not app content.",
    ],
    assets: {
      required: true,
      summary: "Uses local inline SVG path data (src/imports/svg-2hn0mpby87) for the battery frame, cellular, and Wi-Fi glyphs — decorative, do not replace.",
    },
  },

  "shell.home-header": {
    summary:
      "Portable reference for the Home screen top bar: Prime entry pill, amount-visibility/profile/messages action rail, and an optional large title.",
    visualSpecifications: [
      { label: "Actions row height", value: "56px", detail: "Only rendered when showActions is true." },
      { label: "Container padding", value: "24px sides, 24px bottom" },
      { label: "Prime pill padding", value: "8px 12px", detail: "16px corner radius, layered gradient background, 6px icon-to-label gap." },
      { label: "Prime label", value: "uc-type-n5-strong / 16px line-height" },
      { label: "Title row", value: "uc-type-h1", detail: "24px side/bottom padding, only rendered when showTitle is true." },
      { label: "Background", value: "transparent", detail: "The component is background-transparent; the owning screen/preview supplies the surface color." },
    ],
    states: [
      { id: "default", label: "Default", description: "Prime pill plus amount-visibility, profile, and messages actions." },
      { id: "with-title", label: "With title", description: "Adds the large uc-type-h1 title row below the actions." },
    ],
    motionSpecifications: [
      { label: "Motion", value: "None", detail: "Actions only use a CSS opacity hover transition; there is no enter/exit animation." },
    ],
    accessibilitySpecifications: [
      "Prime, profile, and messages controls are native <button> elements reachable by keyboard.",
      "AmountVisibilityButton exposes its own accessible toggle label and state.",
      "Every action requires a real onClick handler from the consuming screen; none is optional in practice.",
    ],
    assets: {
      required: true,
      summary: "Uses the shared PrimeDiamondMark glyph and AppIcon-driven profile/messages icons from HeaderActionIcons; no static image assets.",
    },
  },

  "shell.more-header": {
    summary:
      "Portable reference for the More screen top bar: page title plus a profile/messages/logout action rail, with a Bosnia-specific contact-phone/messages variant.",
    visualSpecifications: [
      { label: "Container padding", value: "24px sides, 24px bottom" },
      { label: "Row", value: "min-height 32px, 8px gap", detail: "Title flexes to fill remaining width; actions sit in a trailing rail." },
      { label: "Title", value: "uc-type-h1" },
      { label: "Messages badge", value: "messageCount prop", detail: "Renders the unread-count badge on the Messages icon when greater than 0." },
    ],
    states: [
      { id: "default", label: "Default", description: "Profile, Messages, and Logout actions with no unread badge." },
      { id: "unread", label: "Unread messages", description: "Messages icon shows a non-zero unread badge." },
      { id: "contact-messages", label: "Contact + Messages (BA)", description: "Bosnia / Bosnia Banja Luka variant swaps Profile+Logout for a Contact phone action and hides Logout." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Profile, Messages, Logout, and Contact phone are native <button> elements with icon+label pairs from HeaderActionIcons.",
      "The unread-messages badge is a visual cue only; the underlying action label communicates its purpose regardless of count.",
      "Title uses the translated 'more.title' key so it announces correctly per active language.",
    ],
    assets: {
      required: false,
      summary: "Uses AppIcon-driven glyphs from HeaderActionIcons only; no static image assets.",
    },
  },

  "shell.page-header": {
    summary:
      "Portable reference for the shared page header used across detail/list screens: a sticky compact bar with back/help actions plus an expanded large title that collapses on scroll.",
    visualSpecifications: [
      { label: "Sticky bar height", value: "48px", detail: "grid-cols [40px title 40px], 8px horizontal / 8px top padding." },
      { label: "Back / help / action targets", value: "40x40px" },
      { label: "Compact title", value: "uc-type-n4-strong, centered, truncated", detail: "Opacity and a 6px translateY are driven directly by collapsedTitleProgress (0=hidden, 1=visible)." },
      { label: "Large title row", value: "375px wide, 8px/16px padding", detail: "uc-type-h1, 2-line clamp, fades out inversely to collapsedTitleProgress." },
      { label: "Variant backgrounds", value: "light: --uc-surface / dark: transparent / transparent: transparent / gray: --uc-app-bg" },
    ],
    states: [
      { id: "level-1-page", label: "Level 1 page", description: "Default light expanded title, back + help actions." },
      { id: "level-1-center", label: "Level 1 center", description: "Large title centered via largeTitleAlign." },
      { id: "level-1-categorized", label: "Level 1 categorized", description: "Large title tinted with a PFM category color override." },
      { id: "collapsed", label: "Collapsed", description: "collapsedTitleProgress=1: compact title visible, large title hidden." },
      { id: "dark", label: "Dark variant", description: "variant=\"dark\" for photo/hero surfaces with a translucent sticky background." },
    ],
    motionSpecifications: [
      { label: "Sticky shadow", value: "200ms", detail: "transition-shadow duration-200 on the sticky bar." },
      { label: "Compact title", value: "opacity + translateY(6px→0)", detail: "Scroll-driven via collapsedTitleProgress, not a CSS transition." },
      { label: "Large title", value: "opacity 1→0", detail: "Inverse of collapsedTitleProgress, same scroll-driven mechanism." },
    ],
    accessibilitySpecifications: [
      "Back and Help are native <button> elements with explicit aria-label ('Back', 'Help') independent of icon-only rendering.",
      "The compact title stays in the accessibility tree as a heading even while visually faded; the large <h1> title provides the same page context.",
      "The component never renders a back action without a real onBack handler when showBack is true.",
    ],
    assets: {
      required: true,
      summary: "Uses the back-heavy and help-circle AppIcon glyphs; no static images.",
    },
  },

  "shell.bottom-navigation": {
    summary:
      "Portable reference for the fixed bottom tab bar: five tabs with 32px icons, a 24x2 active indicator bar, and 14px labels.",
    visualSpecifications: [
      { label: "Container", value: "375 x 54px", detail: "24px side padding, 8px inter-tab gap." },
      { label: "Icon slot", value: "32x32px" },
      { label: "Active indicator", value: "24x2px", detail: "Sits directly above the icon with 0 gap." },
      { label: "Label", value: "uc-type-p2, 14px / 15px line-height" },
      { label: "Focus ring", value: "2px action-color ring, 2px offset" },
    ],
    states: [
      { id: "home", label: "Home active", description: "Home tab selected." },
      { id: "analytics", label: "Spending active", description: "Analytics/Spending tab selected." },
      { id: "products", label: "Products active", description: "Products tab selected." },
    ],
    motionSpecifications: [
      { label: "Motion", value: "None", detail: "Tab switches are instant color/indicator swaps; no transition classes are applied." },
    ],
    accessibilitySpecifications: [
      "Each tab is a native <button> with aria-current=\"page\" set on the active tab.",
      "Focus-visible ring uses a 2px action-color ring with a 2px offset against the bottom-bar background.",
      "Labels come from the translation registry (t(item.labelKey)) so they read correctly per active language.",
    ],
    assets: {
      required: true,
      summary: "Uses the nav-home/nav-analytics/nav-payments/nav-products/nav-more AppIcon glyphs; no static images.",
    },
  },

  "ui.section-heading-divider": {
    summary:
      "Portable reference for the shared section/divider family: 13 Meniga-mapped states covering small/medium/large titles, counters, action/date rows, and Light Restyle variants, behind one legacy runtime API.",
    visualSpecifications: [
      { label: "Standard width", value: "375px" },
      { label: "Light Restyle width", value: "343px" },
      { label: "Title typography", value: "uc-type-n5-strong, 14px", detail: "Uppercase; large-title variants use uc-type-n2-strong at 20px instead." },
      { label: "Divider line", value: "1px, --uc-border", detail: "Omitted on the large-title variants." },
      { label: "Row padding", value: "8px vertical, 24px horizontal", detail: "16px horizontal for the with-counter variant." },
    ],
    states: [
      { id: "small-title-data", label: "Small title + data", description: "375px row, muted 14px title plus right-aligned secondary text, thin bottom divider." },
      { id: "medium-title", label: "Medium title", description: "Standard 14px bold title row with a bottom divider and no secondary text." },
      { id: "with-counter", label: "With counter", description: "16px-padded row pairing the title with a numeric counter instead of free text." },
      { id: "large-title", label: "Large title", description: "20px large title row with no divider line, used for month/section headers." },
      { id: "action-date", label: "Action + date", description: "Teal-tinted action title (e.g. SELECT ALL) with a right-aligned date range." },
      { id: "name-action", label: "Name + action", description: "Row pairing a name/title with a right-aligned text action (e.g. REMOVE)." },
      { id: "light-title", label: "Light Restyle / Title", description: "343px Light Restyle row with a bottom divider, used for HU Light Restyle surfaces." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "The counter and secondary-text spans carry an aria-label combining the title and count/value for screen readers.",
      "Purely presentational otherwise — no interactive controls are rendered by this component.",
    ],
    assets: {
      required: false,
      summary: "Text and a CSS divider line only; no icon or image assets.",
    },
  },

  "ui.bar": {
    summary:
      "Portable reference for the Bar progress/status primitive: six mapped statuses with a 24px left-inset teal fill, plus a static thin divider state.",
    visualSpecifications: [
      { label: "Standard size", value: "375 x 8px", detail: "role=\"meter\" with aria-valuemin 0 / aria-valuemax 327 / aria-valuenow tracking the active width." },
      { label: "Thin size", value: "279 x 1px", detail: "role=\"presentation\"; a static 109px --uc-neutral-700 segment over a --uc-neutral-300 track." },
      { label: "Left inset", value: "24px", detail: "Active fill starts 24px from the left edge on standard sizes." },
      { label: "Active fill", value: "--uc-action, 4px radius" },
      { label: "Fill widths", value: "full 327px / mid-1 176px / mid-2 64px / small 16px / empty 0px" },
    ],
    states: [
      { id: "empty", label: "Empty", description: "No active fill." },
      { id: "full", label: "Full", description: "327px active fill." },
      { id: "mid-1", label: "Mid 1", description: "176px active fill." },
      { id: "mid-2", label: "Mid 2", description: "64px active fill." },
      { id: "small", label: "Small", description: "16px active fill." },
      { id: "thin", label: "Thin", description: "279x1px static divider variant." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Standard states expose role=\"meter\" with aria-valuemin/aria-valuemax/aria-valuenow so assistive tech can read the fill amount.",
      "The thin state is role=\"presentation\" since it is a static decorative divider, not a live meter.",
    ],
    assets: {
      required: false,
      summary: "Pure CSS bar; no icon or image assets.",
    },
  },

  "ui.language-selector-button": {
    summary:
      "Portable reference for the compact top-bar language toggle: a right-aligned uppercase language code over a 1px underline, used on pre-login surfaces.",
    visualSpecifications: [
      { label: "Layout", value: "flex-col, items-end, 1px gap" },
      { label: "Label typography", value: "uc-type-n5-strong, --uc-static-white", detail: "Renders the language code in uppercase via text-transform." },
      { label: "Underline", value: "1px, --uc-surface" },
      { label: "Hit target", value: "content-hugging", detail: "No explicit padding; the consuming header supplies spacing." },
    ],
    states: [
      { id: "default", label: "Default", description: "Right-aligned language code over its underline." },
    ],
    motionSpecifications: [{ label: "Transition", value: "150ms", detail: "hover:opacity-80 transition-opacity on the button." }],
    accessibilitySpecifications: [
      "Rendered as a native <button>, so it is keyboard-focusable and activatable via Enter/Space.",
      "The visible label is the literal language code; pair it with adjacent context in the consuming header rather than relying on a separate aria-label.",
    ],
    assets: {
      required: false,
      summary: "Text and a CSS underline only; no icon or image assets.",
    },
  },

  "ui.navigation-link": {
    summary:
      "Portable reference for the dark-surface text link with a trailing chevron accessory, used for pre-login find-out-more actions.",
    visualSpecifications: [
      { label: "Layout", value: "flex, items-center, 1px gap" },
      { label: "Label typography", value: "uc-type-n5-strong, whitespace-nowrap, --uc-static-white" },
      { label: "Chevron", value: "fixed trailing glyph", detail: "Rendered via the shared ChevronIcon component." },
    ],
    states: [
      { id: "default", label: "Default", description: "Label with trailing chevron." },
    ],
    motionSpecifications: [{ label: "Transition", value: "150ms", detail: "hover:opacity-80 transition-opacity." }],
    accessibilitySpecifications: [
      "Rendered as a native type=\"button\" element.",
      "The visible label text communicates the action; no separate aria-label is set.",
    ],
    assets: {
      required: true,
      summary: "Uses the ChevronIcon glyph (src/app/components/ui/ChevronIcon.tsx); no other assets.",
    },
  },

  "ui.prelogin-heading": {
    summary:
      "Portable reference for the three-line white pre-login hero heading: 38px bold H1, 24px bold H2, and 18px regular H3.",
    visualSpecifications: [
      { label: "Layout", value: "flex-col, 16px gap", detail: "The H1/H2 group uses an inner 32px gap." },
      { label: "H1", value: "38px bold / 40px line-height / 0.335px tracking" },
      { label: "H2", value: "24px bold / normal line-height / 0.267px tracking" },
      { label: "H3", value: "18px regular / normal line-height" },
      { label: "Color", value: "--uc-static-white", detail: "Intended for dark hero surfaces." },
    ],
    states: [
      { id: "default", label: "Default", description: "Stacked H1/H2/H3 hero heading." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Renders semantic <h1>/<h2>/<h3> elements in document order, giving the pre-login hero a correct heading hierarchy.",
      "All three lines are required text supplied by the consuming screen; there is no placeholder/empty-state fallback.",
    ],
    assets: {
      required: false,
      summary: "Text only; no icon or image assets.",
    },
  },

  "ui.radio-button": {
    summary:
      "Portable reference for the radio-style selection row: a 32px selected/unselected glyph plus a bold label, used for language selection.",
    visualSpecifications: [
      { label: "Row padding", value: "24px horizontal, 20px vertical" },
      { label: "Icon slot", value: "32x32px", detail: "radio-selected / radio-unselected AppIcon glyphs." },
      { label: "Label typography", value: "uc-type-n4-strong, --uc-primary-k1" },
      { label: "Row gap", value: "8px" },
    ],
    states: [
      { id: "selected", label: "Selected", description: "radio-selected glyph." },
      { id: "unselected", label: "Unselected", description: "radio-unselected glyph." },
    ],
    motionSpecifications: [{ label: "Transition", value: "150ms", detail: "hover:opacity-80 transition-opacity on the row." }],
    accessibilitySpecifications: [
      "Rendered with role=\"radio\" and aria-checked reflecting the selected prop.",
      "aria-label mirrors the visible label text for a redundant accessible name.",
      "The whole row is a native <button>, reachable and activatable via keyboard.",
    ],
    assets: {
      required: true,
      summary: "Uses the radio-selected/radio-unselected AppIcon glyphs; no other assets.",
    },
  },

  "ui.link-button": {
    summary:
      "Portable reference for the reusable text action with a chevron-link accessory: a centered, content-hugging button using the current action color.",
    visualSpecifications: [
      { label: "Layout", value: "flex w-fit, centered, 0 gap", detail: "Label and chevron sit directly adjacent." },
      { label: "Label typography", value: "13px bold uppercase / 16px line-height" },
      { label: "Chevron", value: "24px, name=\"chevron-link\" by default", detail: "iconName/iconSize are overridable props." },
      { label: "Color", value: "--uc-action", detail: "Inherits the current design-system action color." },
      { label: "Disabled", value: "50% opacity, pointer-events: none" },
    ],
    states: [
      { id: "default", label: "Default", description: "Enabled text link with trailing chevron." },
      { id: "disabled", label: "Disabled", description: "Native disabled attribute at 50% opacity, non-interactive." },
    ],
    motionSpecifications: [{ label: "Transition", value: "150ms", detail: "hover:opacity-80 transition-opacity." }],
    accessibilitySpecifications: [
      "Rendered as a native type=\"button\" element by default, so it is keyboard-reachable.",
      "Exposes a 2px action-color focus-visible ring with a 2px offset.",
      "The disabled state is expressed through the native disabled attribute, not appearance alone.",
    ],
    assets: {
      required: true,
      summary: "Uses the chevron-link AppIcon glyph (overridable via iconName); no other assets.",
    },
  },

  "ui.button-registry": {
    summary:
      "Portable reference for the shared shadcn/Radix Button primitive used for generic, non-branded call-to-action rows across default, secondary, outline, ghost, and destructive variants.",
    visualSpecifications: [
      { label: "Height", value: "36px (default size)", detail: "sm=32px, lg=40px, icon=36x36px are also available via the size prop." },
      { label: "Corner radius", value: "6px (rounded-md)" },
      { label: "Padding", value: "16px horizontal, 8px vertical (default size)" },
      { label: "Typography", value: "14px medium" },
      { label: "Focus ring", value: "3px ring, offset via focus-visible:ring-ring/50" },
    ],
    states: [
      { id: "default", label: "Default", description: "Primary filled action." },
      { id: "secondary", label: "Secondary", description: "Muted filled action." },
      { id: "outline", label: "Outline", description: "Bordered, transparent-background action." },
      { id: "ghost", label: "Ghost", description: "No border or fill until hovered." },
      { id: "destructive", label: "Destructive", description: "Filled action for destructive/delete intents." },
    ],
    motionSpecifications: [
      { label: "Transition", value: "CSS transition-all", detail: "Background/border/ring transition on hover and focus-visible state changes." },
    ],
    accessibilitySpecifications: [
      "Renders a native <button> (or the child element via asChild/Slot) so it inherits standard button semantics.",
      "Disabled state uses the native disabled attribute with disabled:opacity-50 and disabled:pointer-events-none.",
      "Exposes a visible focus-visible ring; aria-invalid styling is built in for form-validation use.",
    ],
    assets: {
      required: false,
      summary: "Pure CSS/Tailwind styling via class-variance-authority; no icon or image assets required (icons are optional children).",
    },
  },

  "ui.generic-controls": {
    summary:
      "Portable reference for the vendored shadcn/Radix generic UI kit (Button, Badge, Input, Checkbox, Toggle, Toggle group, Slider, Progress, Separator, Skeleton, Alert, Tabs), kept deliberately generic and separate from bespoke UniCredit components.",
    visualSpecifications: [
      { label: "Family selector", value: "12 primitives", detail: "Button, Badge, Input, Checkbox, Toggle, Toggle group, Slider, Progress, Separator, Skeleton, Alert, Tabs." },
      { label: "Styling", value: "Tailwind + class-variance-authority", detail: "Each primitive is a thin Radix/vendored wrapper; no bespoke UniCredit tokens beyond color-scheme integration." },
    ],
    states: [
      { id: "button", label: "Button", description: "Filled call-to-action primitive." },
      { id: "badge", label: "Badge", description: "Small status/label pill." },
      { id: "input", label: "Input", description: "Single-line text input." },
      { id: "checkbox", label: "Checkbox", description: "Boolean selection control." },
      { id: "alert", label: "Alert", description: "Inline informational banner." },
      { id: "tabs", label: "Tabs", description: "Segmented content switcher." },
    ],
    motionSpecifications: [
      { label: "Motion", value: "CSS transitions only", detail: "Each primitive uses its own short hover/press CSS transition (e.g. Button's transition-all); Tabs/Toggle have no enter/exit animation." },
    ],
    accessibilitySpecifications: [
      "Every primitive follows standard Radix accessibility semantics (native button/checkbox/tab roles, keyboard navigation, focus management) rather than custom ARIA.",
      "Checkbox/Toggle/Tabs expose their state (checked, pressed, selected) through native attributes, not appearance alone.",
    ],
    assets: {
      required: false,
      summary: "Pure CSS/Tailwind styling; AppIcon glyphs are supplied by the consumer where needed (e.g. inside Alert), not by the primitives themselves.",
    },
  },

  "co-apping.floating-button": {
    summary:
      "Portable reference for the floating action button shown while a Co-Apping session is active, with an optional one-time slide-in entrance.",
    visualSpecifications: [
      { label: "Size", value: "44 x 113px", detail: "Absolute positioned at top:432px, right:0, z-index 100." },
      { label: "Shape", value: "Custom Figma-patch SVG background", detail: "Fill --uc-green-bright." },
      { label: "Icon", value: "panel-share-screen glyph", detail: "Centered within the visible (non-tapered) portion of the shape via percentage insets." },
    ],
    states: [
      { id: "default", label: "Default", description: "Static, no entrance animation (showSlideIn=false)." },
      { id: "slide-in", label: "Slide-in", description: "Plays the one-time entrance animation (showSlideIn=true)." },
    ],
    motionSpecifications: [
      { label: "Slide-in", value: "300ms ease-out, 1.8s delay", detail: "fabSlideIn keyframes: translateX(100%)→0 with opacity 0→1, played once when showSlideIn is true." },
    ],
    accessibilitySpecifications: [
      "Rendered as a native <button> with a fixed aria-label ('Co-apping session active') describing its purpose regardless of the icon.",
      "Purely icon-based with no visible text label, so the aria-label is the only accessible name — keep it in sync if the feature copy changes.",
    ],
    assets: {
      required: true,
      summary: "Uses local inline SVG path data (src/imports/svg-18ehkdpg9k) for the background shape, plus the panel-share-screen AppIcon glyph.",
    },
  },

  "ui.text-field": {
    summary:
      "Portable reference for the shared text input primitive with a floating label, helper/error messaging, and an optional trailing icon (used for the Dropdown variant).",
    visualSpecifications: [
      { label: "Divider", value: "0.5px bottom border", detail: "Color follows the focus/error/disabled state." },
      { label: "Label", value: "uc-type-n5", detail: "Floats above the value once focused or filled." },
      { label: "Value", value: "uc-type-p1" },
      { label: "Trailing icon slot", value: "32x32px", detail: "Optional; e.g. chevron-down-wide for the Dropdown variant." },
      { label: "Helper / error text", value: "uc-type-n5, up to 2 lines", detail: "6px gap below the divider." },
      { label: "Multiple-filled", value: "content-driven width", detail: "Shows a semicolon-joined value list plus a bold (count) suffix." },
    ],
    states: [
      { id: "empty", label: "Empty", description: "No value, resting label." },
      { id: "on-focus", label: "On focus", description: "Label floated, active-color divider." },
      { id: "filled", label: "Filled", description: "Value present, resting (non-focused) state." },
      { id: "error-filled", label: "Error (filled)", description: "Filled value with error divider and message." },
      { id: "disabled-filled", label: "Disabled (filled)", description: "Native disabled attribute, muted colors." },
      { id: "multiple-filled", label: "Multiple filled", description: "Several values summarized with a bold count suffix." },
    ],
    motionSpecifications: [
      { label: "Motion", value: "None", detail: "State changes (focus/error/disabled) are instant color swaps; there is no transition class on the divider or label." },
    ],
    accessibilitySpecifications: [
      "The floated label is a real <label htmlFor> pairing; the resting state falls back to aria-label on the input.",
      "Disabled uses the native disabled attribute, not styling alone.",
      "Supports onActivate for Enter/Space keyboard activation when the field is used as a navigation trigger (e.g. the Dropdown variant).",
      "The multiple-filled state summarizes multiple values in one accessible, semicolon-joined string.",
    ],
    assets: {
      required: true,
      summary: "Uses the optional trailingIconName AppIcon glyph (e.g. chevron-down-wide for Dropdown); no static images.",
    },
  },

  "ui.amount-field": {
    summary:
      "Portable reference for the amount input variant: reuses Text field's states plus a 24px-spaced currency column with an optional chevron selector.",
    visualSpecifications: [
      { label: "Layout", value: "flex, 24px gap", detail: "The text field flexes to fill remaining width; the currency column is content-width." },
      { label: "Currency label", value: "uc-type-n5, 14px" },
      { label: "Currency value", value: "uc-type-p1, 18px", detail: "4px top gap under the label." },
      { label: "Chevron", value: "32x32px", detail: "Hidden via hideCurrencySelector for fixed-currency contexts like domestic payments." },
    ],
    states: [
      { id: "empty", label: "Empty", description: "No value, resting label." },
      { id: "on-focus", label: "On focus", description: "Label floated, active-color divider." },
      { id: "filled", label: "Filled", description: "Value present, resting (non-focused) state." },
      { id: "error-filled", label: "Error (filled)", description: "Filled value with error divider and message." },
      { id: "disabled-filled", label: "Disabled (filled)", description: "Native disabled attribute on both the input and the currency selector." },
      { id: "multiple-filled", label: "Multiple filled", description: "Several values summarized with a bold count suffix." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Delegates its text input to the shared TextField component, inheriting the same label/disabled/error semantics.",
      "The currency selector is a native <button disabled=...>; disabling the field also disables currency selection.",
    ],
    assets: {
      required: true,
      summary: "Uses the currencyIconName AppIcon glyph (chevron-down-wide by default); no static images.",
    },
  },

  "ui.code-field": {
    summary:
      "Portable reference for the one-time-code field: four 44x64 numeric slots with paste distribution, arrow-key navigation, and accessible error messaging.",
    visualSpecifications: [
      { label: "Wrapper", value: "327px max-width, centered slot row", detail: "role=\"group\" with an aria-label." },
      { label: "Slot", value: "44x64px", detail: "8px radius, 1px border, N1 30px bold digits." },
      { label: "Slot gap", value: "16px" },
      { label: "Error message", value: "224px wide, 3px line gap" },
    ],
    states: [
      { id: "filled", label: "Filled", description: "All slots populated." },
      { id: "error", label: "Error", description: "Error border color plus error message(s)." },
      { id: "empty", label: "Empty", description: "No digits entered yet." },
      { id: "disabled", label: "Disabled", description: "Native disabled attribute on every slot." },
    ],
    motionSpecifications: [
      { label: "Transition", value: "CSS transition-colors", detail: "Border/focus-ring color transition only; no layout animation." },
      { label: "Focus ring", value: "2px action-color ring, 2px offset" },
    ],
    accessibilitySpecifications: [
      "Each slot has its own aria-label ('<ariaLabel> digit N of length') plus aria-invalid and aria-describedby pointing at the error message.",
      "The wrapper uses role=\"group\" with the overall ariaLabel so screen readers announce it as one field.",
      "Backspace, ArrowLeft, and ArrowRight are handled explicitly so keyboard-only users can move between slots.",
      "The first slot sets autoComplete=\"one-time-code\" so platform SMS autofill can target it.",
    ],
    assets: {
      required: false,
      summary: "Pure CSS/typography slots; no icon or image assets.",
    },
  },

  "ui.date-filter": {
    summary:
      "Portable reference for the Date filter chip row: five-item and four-item states with a teal selected chip.",
    visualSpecifications: [
      { label: "Wrapper", value: "286x24px max, centered" },
      { label: "Chip", value: "35x22px content-driven, 42px min-width", detail: "4px radius, 8px horizontal padding, 14px bold label." },
      { label: "Chip gap", value: "8px" },
      { label: "Selected", value: "teal (--uc-action) border+fill, white label" },
    ],
    states: [
      { id: "five-item", label: "5 items", description: "1 M / 3 M / 1 Y / 3 Y / MAX chip set." },
      { id: "four-item", label: "4 items", description: "Compact 4-chip set." },
    ],
    motionSpecifications: [
      { label: "Motion", value: "None", detail: "Selection is an instant border/fill/color swap; no transition classes are applied." },
    ],
    accessibilitySpecifications: [
      "Each chip is a native <button type=\"button\"> with aria-pressed reflecting selection.",
      "Focus-visible ring uses a 2px action-color ring with a 2px offset.",
    ],
    assets: {
      required: false,
      summary: "Text-only chips; no icon or image assets.",
    },
  },

  "ui.pill-sorting": {
    summary:
      "Portable reference for the Pill sorting rail: four sort chips with a black selected/bold-white-label state.",
    visualSpecifications: [
      { label: "Row", value: "375x40px, centered, 8px gap" },
      { label: "Chip", value: "24px height, 14.5px radius", detail: "8px/4px padding, 14px label." },
      { label: "Selected", value: "black border+fill, bold white label" },
      { label: "Idle", value: "text-color border, regular label" },
    ],
    states: [
      { id: "selected", label: "Selected / MAX %", description: "One chip active." },
      { id: "none", label: "Rest / no selection", description: "No chip active." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Each chip is a native <button> with aria-pressed reflecting selection.",
      "Focus-visible ring uses a 2px action-color ring with a 2px offset.",
    ],
    assets: {
      required: false,
      summary: "Text-only chips; no icon or image assets.",
    },
  },

  "ui.toggle-button": {
    summary:
      "Portable reference for the 60x30 switch control: an animated 22px knob sliding between an unchecked gray track and a checked teal-bordered track.",
    visualSpecifications: [
      { label: "Track", value: "60x30px", detail: "2px border; unchecked = --uc-text-muted border, checked = --uc-action border with white fill." },
      { label: "Knob", value: "22x22px", detail: "4px inset from the track edge; teal fill when checked, gray circle when unchecked." },
      { label: "Focus ring", value: "3px ring at 30% action-color opacity" },
    ],
    states: [
      { id: "checked", label: "Checked", description: "Knob at the right, teal track." },
      { id: "unchecked", label: "Unchecked", description: "Knob at the left, gray track." },
    ],
    motionSpecifications: [
      { label: "Knob slide", value: "200ms ease-out", detail: "transition-[left] duration-200 ease-out moves the knob between left:4px and left:34px." },
    ],
    accessibilitySpecifications: [
      "Rendered with role=\"switch\" and aria-checked reflecting the checked prop.",
      "Requires an explicit ariaLabel prop since the control carries no visible text.",
      "Disabled uses the native disabled attribute at 50% opacity, not appearance alone.",
      "When rendered without an onToggle handler it becomes a purely decorative aria-hidden frame (read-only display use).",
    ],
    assets: {
      required: true,
      summary: "Uses inline SVG track/knob artwork defined in the component itself; no external assets.",
    },
  },

  "ui.navigation-row": {
    summary:
      "Portable reference for the 18-case Navigation row family: icon/no-icon/toggle/special layouts sharing one 64-or-80px row contract.",
    visualSpecifications: [
      { label: "Width", value: "375px" },
      { label: "Row height", value: "64px or 80px", detail: "Controlled by the rowHeight prop." },
      { label: "Padding", value: "16-24px left / 12px right (icon-dependent)", detail: "24px all sides when centerContent is set." },
      { label: "Leading visual", value: "32x32px icon slot or custom leadingVisual node" },
      { label: "Title", value: "uc-type-n4-strong, 2-line clamp" },
      { label: "Description", value: "uc-type-n4, 4px top gap, 2-line clamp" },
      { label: "CTA link", value: "uc-type-n5-strong, teal (--uc-action), 4px top gap" },
      { label: "Trailing accessory", value: "chevron (32x32) or the shared ToggleButton" },
    ],
    states: [
      { id: "icon-title", label: "Icon / Title", description: "Leading icon plus title and chevron." },
      { id: "icon-description", label: "Icon / Description", description: "Adds a description line under the title." },
      { id: "icon-cta", label: "Icon / CTA", description: "Adds a teal text-link CTA instead of a chevron." },
      { id: "toggle-title", label: "Toggle / Title", description: "Trailing ToggleButton accessory instead of a chevron." },
      { id: "special-card", label: "Special / Card", description: "64x40 NavigationCardArt leading visual." },
      { id: "special-cta", label: "Special / CTA", description: "Centered 64px row acting as a text-only action (e.g. SHOW MORE)." },
      { id: "special-payment-type", label: "Special / Payment type", description: "Leading payment icon with a trailing toggle." },
    ],
    motionSpecifications: [
      { label: "Motion", value: "None", detail: "The row itself has no transition; its ToggleButton accessory carries its own 200ms knob-slide motion." },
    ],
    accessibilitySpecifications: [
      "When onClick is supplied without a toggle/trailing-link, the whole row renders as a native <button> with an aria-label defaulting to the title.",
      "A toggle accessory reuses the shared ToggleButton's role=\"switch\" semantics with the row title as its aria-label.",
      "A text CTA renders as its own nested <button> only when onLinkClick is supplied, avoiding a broken nested-button structure when the whole row is also clickable.",
      "Focus-visible ring uses a 2px action-color ring with a 2px offset on clickable rows.",
    ],
    assets: {
      required: true,
      summary: "Uses AppIcon leading/chevron glyphs and the shared ToggleButton artwork; the special-card variant also uses the NavigationCardArt asset.",
    },
  },

  "ui.profile-avatar": {
    summary:
      "Portable reference for the 40px avatar family: full/inset photo, optional notification dot, initials fallback, and a gradient AI glyph.",
    visualSpecifications: [
      { label: "Base size", value: "40x40px", detail: "Fully controlled via the size prop; all inner ratios scale proportionally." },
      { label: "Photo full", value: "fills the circle", detail: "object-cover, no inset." },
      { label: "Photo profile", value: "10% inset, 80% image size", detail: "Same circle, smaller inset photo." },
      { label: "Notification dot", value: "20% of size, top-right", detail: "--uc-red-main fill." },
      { label: "Initials", value: "--uc-primary-k1 background, white bold label", detail: "Font size scales at 40% of avatar size (minimum 14px)." },
      { label: "AI glyph", value: "60% of size on --uc-neutral-100", detail: "Two-tone blue gradient sparkle glyph." },
    ],
    states: [
      { id: "photo-full", label: "Photo full", description: "Full-bleed photo, no inset." },
      { id: "photo-profile", label: "Photo + dot", description: "Inset profile photo with a notification dot." },
      { id: "initials", label: "Initials", description: "Two-letter initials on a solid k1 background." },
      { id: "ai", label: "AI avatar", description: "Gradient sparkle glyph on a neutral background." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Renders aria-hidden=\"true\" unless an explicit ariaLabel is supplied, so decorative avatars don't clutter the accessibility tree.",
      "Photo variants set alt text via imageAlt; supply a meaningful value when the photo is informative rather than decorative.",
      "The notification dot is purely visual (aria-hidden) — surface unread/notification state to assistive tech via surrounding context.",
    ],
    assets: {
      required: false,
      summary: "Photo variants accept a real imageSrc (e.g. from screenshots/assets); initials/AI variants use inline SVG/text only, no required external asset.",
    },
  },

  "cards.ghost-banner": {
    summary:
      "Portable reference for the dashed-border Ghost Banner: a leading icon, bold title, and optional multiline description, extracted from the Figma Banner component.",
    visualSpecifications: [
      { label: "Size", value: "327px wide, 92px Figma height", detail: "8px corner radius, dashed 1px --uc-text border, 16px padding." },
      { label: "Icon", value: "32x32px", detail: "add-circle by default, teal (--uc-action)." },
      { label: "Title", value: "uc-type-h2, 20px line-height, 2-line clamp" },
      { label: "Description", value: "uc-type-n4, 18px line-height, 4-line clamp, preserves newlines" },
      { label: "Gaps", value: "8px icon-to-text, 4px title-to-description, 10px vertical stack" },
    ],
    states: [
      { id: "title-and-description", label: "Title and description", description: "Both lines present." },
      { id: "title-only", label: "Title only", description: "No description supplied." },
      { id: "long-description", label: "Long description", description: "Multi-line description with the 4-line clamp." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Renders as a native <button> only when onClick is supplied (aria-label falls back to the title); otherwise it is a static, non-interactive <div>.",
      "The icon is purely decorative and does not carry its own accessible name.",
    ],
    assets: {
      required: true,
      summary: "Uses the add-circle AppIcon glyph by default (overridable via iconName); no static images.",
    },
  },

  "cards.info-banner": {
    summary:
      "Portable reference for the solid-border Info Banner: informational messaging with an optional inline teal text action, extracted from the Figma Banner component.",
    visualSpecifications: [
      { label: "Size", value: "327px wide, 153px Figma height", detail: "8px corner radius, solid 1px --uc-text border, 16px padding." },
      { label: "Icon", value: "32x32px", detail: "info-circle by default, --uc-text." },
      { label: "Title", value: "uc-type-h2, 20px line-height, 2-line clamp" },
      { label: "Description", value: "uc-type-n4, 18px line-height, 4-line clamp, preserves newlines" },
      { label: "Action", value: "uc-type-n5-strong, teal (--uc-action)", detail: "Optional inline text button (e.g. EDIT), 8px below the text block." },
    ],
    states: [
      { id: "with-action", label: "Title, description and action", description: "Full composition with a teal text action." },
      { id: "no-action", label: "Title and description", description: "No inline action." },
      { id: "title-only", label: "Title and action", description: "Action present without a description." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Always renders as a static <div> — only the optional inline action is a native <button>, so the banner itself never intercepts taps.",
      "The icon is purely decorative and does not carry its own accessible name.",
    ],
    assets: {
      required: true,
      summary: "Uses the info-circle AppIcon glyph by default (overridable via iconName); no static images.",
    },
  },

  "cards.user-event-card": {
    summary:
      "Portable reference for the User Event Card: a teal avatar circle with a bold title, multiline description, and optional text-link plus overflow control.",
    visualSpecifications: [
      { label: "Size", value: "343px wide", detail: "8px corner radius, 0 4px 16px rgba(0,0,0,0.08) shadow, 16px padding." },
      { label: "Avatar", value: "48x48px circle, teal (--uc-action)", detail: "White 24px glyph centered inside." },
      { label: "Title", value: "uc-type-n5-strong, 15px line-height" },
      { label: "Description", value: "uc-type-n5, 15px line-height, preserves newlines" },
      { label: "Action link", value: "uc-type-n5-strong, teal (--uc-action)" },
      { label: "Options control", value: "32x32px", detail: "more-horizontal glyph, trailing." },
      { label: "Gaps", value: "8px avatar-to-text, 8px text-block-to-action", detail: "Row aligns items-center without a link, items-start with one." },
    ],
    states: [
      { id: "link-and-options", label: "With link and options", description: "Action link plus the trailing overflow control." },
      { id: "plain", label: "Without link and options", description: "Avatar, title, and description only." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "The card root is a static <div>; the action link and options control are their own native <button> elements.",
      "The options control requires an aria-label (defaults to 'More options').",
      "The avatar glyph is decorative; the title/description text carries the card's meaning.",
    ],
    assets: {
      required: true,
      summary: "Uses the user-event-badge / user-event-refresh AppIcon glyphs by default (overridable via iconName or a custom iconNode); no static images.",
    },
  },

  "cards.helper-card": {
    summary:
      "Portable reference for the solid teal Helper Card: a white icon, bold white title, and regular white body with an optional text link and close control.",
    visualSpecifications: [
      { label: "Size", value: "343px wide", detail: "4px corner radius, solid teal (--uc-action) background, 16px padding." },
      { label: "Icon", value: "32x32px", detail: "info-circle by default, white." },
      { label: "Title", value: "uc-type-h2, 20px line-height, white" },
      { label: "Description", value: "uc-type-p1, 20px line-height, white, preserves newlines" },
      { label: "Action link", value: "uc-type-n5-strong, white" },
      { label: "Close control", value: "24x24px, absolute top-right (12px/9px inset)" },
      { label: "Text column", value: "24px right padding", detail: "Reserves space for the close control." },
    ],
    states: [
      { id: "with-link", label: "With link", description: "Adds a white text action (e.g. SEE DETAILS)." },
      { id: "plain", label: "Without link", description: "Icon, title, and description only." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "The card root is a static <div>; the action link and close control are their own native <button> elements, each independently focusable.",
      "The close control requires an aria-label (defaults to 'Close').",
      "The icon is decorative; white-on-teal text meets contrast requirements at the documented 18-20px sizes.",
    ],
    assets: {
      required: true,
      summary: "Uses the info-circle and close-x AppIcon glyphs; no static images.",
    },
  },

  "cards.pending-action-card": {
    summary:
      "Portable reference for the Pending Action Card: a teal-gradient promo card with a bold white title/body and an optional expiring-tag pill.",
    visualSpecifications: [
      { label: "Size", value: "327 x 157px", detail: "8px corner radius, 24px padding." },
      { label: "Background", value: "linear-gradient(90deg, #007A91 0%, #44909E 100%)" },
      { label: "Title", value: "uc-type-l1, 26px line-height, white" },
      { label: "Body", value: "uc-type-p1, 22px line-height, white, preserves newlines, fills remaining height" },
      { label: "Tag pill", value: "white background, 4px radius", detail: "Teal warning-small glyph (15px) plus a 12px bold uppercase teal label; pinned to the bottom via margin-top:auto." },
      { label: "Content gap", value: "8px" },
    ],
    states: [
      { id: "with-tag", label: "With expiring tag", description: "Adds the white tag pill (e.g. EXPIRING ON 12.04.25)." },
      { id: "no-tag", label: "Without tag", description: "Title and body only." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Renders as a native <button> only when onClick is supplied (aria-label falls back to the title); otherwise it is a static <div>.",
      "The warning glyph inside the tag pill is decorative; the tag's own text carries the meaning.",
    ],
    assets: {
      required: true,
      summary: "Uses the warning-small AppIcon glyph inside the optional tag pill; no static images.",
    },
  },

  "cards.card": {
    summary:
      "Portable reference for the Mastercard card artwork family: a single SVG-rendered component covering six debit/credit/virtual palettes at three controlled sizes.",
    visualSpecifications: [
      { label: "Figma base size", value: "64 x 40px", detail: "medium=96x60, large=160x100; corner radius scales proportionally (4px at figma size)." },
      { label: "Rendering", value: "Single inline SVG per instance", detail: "viewBox 0 0 64 40, preserveAspectRatio=none so the artwork stretches cleanly to the chosen size." },
      { label: "Variants", value: "6 palettes", detail: "mc-debit-gold, mc-credit-premium-gold, mc-credit-partner-standard, mc-debit-standard, mc-virtual-standard-violet, mc-virtual-standard-orange — each with its own background/pattern/logo/label colors." },
      { label: "Type label", value: "'debit' or 'credit'", detail: "2.55px SVG text, bottom-right, per-variant labelColor." },
    ],
    states: [
      { id: "mc-debit-gold", label: "MC Debit Gold", description: "Light background, gold pattern." },
      { id: "mc-credit-premium-gold", label: "MC Credit Premium Gold", description: "Deep red gradient background." },
      { id: "mc-credit-partner-standard", label: "MC Credit Partner Standard", description: "Deep red gradient with a red pattern." },
      { id: "mc-debit-standard", label: "MC Debit Standard", description: "Light background, red pattern." },
      { id: "mc-virtual-standard-violet", label: "MC Virtual Standard Electric Violet", description: "Violet background." },
      { id: "mc-virtual-standard-orange", label: "MC Virtual Standard Vibrant Orange", description: "Orange background." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Decorative by default (aria-hidden) unless an ariaLabel is supplied, in which case it exposes role=\"img\" with that label.",
      "All artwork is vector (inline SVG), so it stays crisp at medium/large sizes without a raster asset.",
    ],
    assets: {
      required: true,
      summary: "Uses the inline UniCredit card-logo SVG path data (src/imports/svg-pn3y56bdut); no external image files.",
    },
  },

  "investments.fund-banner": {
    summary:
      "Portable reference for the Investments fund CTA banner: a generic discovery variant plus six Figma-backed collection variants sharing one component.",
    visualSpecifications: [
      { label: "Discovery size", value: "calc(100% - 32px) x 157px", detail: "16px side margins, 24px top margin." },
      { label: "Collection size", value: "full width, 126px minimum", detail: "Hugs multiline title/subtitle content instead of clipping it; never flex-shrinks." },
      { label: "Padding", value: "16px", detail: "8px corner radius." },
      { label: "Title", value: "22px bold, 26px line-height, 0.2px tracking" },
      { label: "Subtitle", value: "18px regular, normal line-height, 8px top gap" },
      { label: "Action", value: "14px bold uppercase + 12px arrow-right icon", detail: "18px top gap on the discovery variant; collection variants instead use a min-height 94px content column with an 8px gap." },
      { label: "Text column", value: "max-width 223px" },
    ],
    states: [
      { id: "discovery", label: "Fund discovery", description: "Generic portfolio-level CTA with a right-aligned faded plant photo." },
      { id: "balanced", label: "Balanced funds collection", description: "Full-bleed Figma collection artwork." },
      { id: "equity", label: "Equity funds collection", description: "Full-bleed Figma collection artwork." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Rendered as a native <button> with a visible 2px focus-visible ring using --uc-focus-ring.",
      "All illustration images are decorative (alt=\"\", aria-hidden) since the title/description/action text carries the full meaning.",
    ],
    assets: {
      required: true,
      summary: "Uses the discovery plant photo (src/assets/investments/fund-banner-plant-unsplash.jpg) and six exact Figma collection images (src/assets/investments/funds/*.png); do not substitute or regenerate these images.",
    },
  },

  "products.offer-card": {
    summary:
      "Portable reference for the Products offer carousel card: a chevron-background banner with a fixed right image column and standard/compact title-density variants.",
    visualSpecifications: [
      { label: "Size", value: "327 x 157px", detail: "8px corner radius, config-driven background/text color per tone." },
      { label: "Chevron background", value: "decorative SVG", detail: "161x157px, positioned left of center, tone-colored." },
      { label: "Image column", value: "100px wide", detail: "Right-aligned, object-cover, full height." },
      { label: "Content padding", value: "20px left, 116px right", detail: "Clears the fixed image column." },
      { label: "Standard title / description", value: "22px bold (2-line clamp) / uc-type-p1 (3-line clamp)" },
      { label: "Compact title / description", value: "20px bold (2-line clamp) / uc-type-n4 (3-line clamp)", detail: "plus an optional 1-line 14px caption." },
      { label: "Content gap", value: "8px" },
    ],
    states: [
      { id: "standard-normal", label: "Standard / normal tone", description: "Full title/description density." },
      { id: "compact-normal", label: "Compact / normal tone", description: "Reduced title/description density, optional caption." },
      { id: "standard-light", label: "Standard / light tone", description: "Standard density with a light-version color tone." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Rendered as a native <button type=\"button\"> so the whole card is one activatable target.",
      "The chevron background and right-hand image are aria-hidden decorative elements; the title/description text carries the meaning.",
    ],
    assets: {
      required: true,
      summary: "Uses a tone-driven background image resolved by getProductBannerTone(colorFamily, lightVersion); no fixed file path — the image source depends on the selected color family/tone.",
    },
  },

  "products.product-card": {
    summary:
      "Portable reference for the Products menu card: a 164-wide entry tile with a config-driven background, per-card illustration placement, and standard/compact heights.",
    visualSpecifications: [
      { label: "Standard size", value: "164 x 120px", detail: "16px padding." },
      { label: "Compact size", value: "164 x 72px", detail: "12px padding." },
      { label: "Corner radius", value: "8px" },
      { label: "Title", value: "uc-type-h2 (standard) / uc-type-n4-strong (compact)", detail: "Inverse text color, preserves supplied line breaks." },
      { label: "Illustration", value: "absolute, per-card placement", detail: "A real imageSrc (object-contain) positioned per card id, or a built-in vector illustration (flowers/bag/pillow/umbrella/branch/arrow) when no image is supplied." },
      { label: "Background", value: "config-driven", detail: "Card.background token, overridable via the --pi-product-card-bg CSS variable." },
    ],
    states: [
      { id: "account-standard", label: "Current accounts / standard", description: "164x120 tile with flowers illustration." },
      { id: "cards-standard", label: "Cards / standard", description: "164x120 tile with bag illustration." },
      { id: "account-compact", label: "Current accounts / compact", description: "164x72 tile, reduced padding and title size." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Rendered as a native <button> with an aria-label derived from the card title (newlines flattened to spaces).",
      "Exposes a 2px action-color focus-visible ring with a 2px offset.",
      "All illustrations are decorative (alt=\"\" images or aria-hidden vector icons); the accessible name comes entirely from the title.",
    ],
    assets: {
      required: true,
      summary: "Uses per-card imageSrc artwork where supplied (e.g. account/cards/insurance PNGs) with built-in vector fallbacks (flowers/bag/pillow/umbrella/branch/arrow) otherwise; do not substitute the supplied images.",
    },
  },

  "products.shopsmart-offer-card": {
    summary:
      "Portable reference for the Shopsmart offer card: a bordered image-top card with an optional Activate pill (Offers 1) or free-shipping tag (Offers 2).",
    visualSpecifications: [
      { label: "Size", value: "327px wide", detail: "8px radius, 1px #666666 border." },
      { label: "Image", value: "full width, 130px (runtime) or 143px (Design System) height", detail: "Optional 20% black overlay via imageOverlay." },
      { label: "Merchant", value: "14px bold, teal (--uc-action), 0.3px tracking" },
      { label: "Title", value: "18px bold, 23px line-height, 0.42px tracking" },
      { label: "Footer", value: "14px status text plus optional distance and a 32x32 trailing icon (website or partners glyph)" },
      { label: "Tag pill (Offers 2)", value: "24px tall, orange (#F0871D), top-left", detail: "Gift icon plus uppercase label." },
      { label: "Activate pill (Offers 1)", value: "36x120px, rounded-full, teal or white tone" },
    ],
    states: [
      { id: "offers1-pill", label: "Offers 1 / Activate pill", description: "Teal rounded Activate pill over the image." },
      { id: "offers2-tag", label: "Offers 2 / free-shipping tag", description: "Orange top-left FREE SHIPPING tag, no pill." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Renders as a native <button> only when onClick is supplied; otherwise it is a static <article>.",
      "The card image's alt text falls back to the merchant name when imageAlt is not supplied.",
      "The trailing website/partners icon and its 32x32 hit area are aria-hidden decorative; the status/distance text is what's announced.",
    ],
    assets: {
      required: true,
      summary: "Requires a real imageSrc photo per offer (e.g. src/assets/shopsmart/*.png); the merchant name is used as the a11y alt-text fallback when imageAlt is omitted.",
    },
  },

  "home.account-balance-card": {
    summary:
      "Portable reference for the primary account balance card: title, masked IBAN with copy action, an available/current-balance pair, and an optional progress bar for loan/deposit products.",
    visualSpecifications: [
      { label: "Size", value: "311 x 197px", detail: "6px corner radius, 16px padding, layered soft shadow." },
      { label: "Title", value: "uc-type-n2-strong, 20px, teal (--uc-action)" },
      { label: "IBAN row", value: "32px height", detail: "uc-type-n4-strong muted IBAN, truncated at 235px, plus an optional 32x32 copy icon." },
      { label: "Available amount", value: "uc-type-n1 integer + uc-type-n2 decimals/currency", detail: "8px label-to-amount gap." },
      { label: "Progress bar", value: "279 x 4px, full-rounded", detail: "Falls back to a static 1px divider line when no progress prop is supplied." },
      { label: "Current balance row", value: "uc-type-n5-strong, 4px label-to-value gap", detail: "Hidden entirely for saving accounts." },
    ],
    states: [
      { id: "current-account", label: "Current account", description: "Available balance plus current balance, no progress bar." },
      { id: "saving-account", label: "Saving account", description: "Available funds only; current-balance row hidden." },
      { id: "with-progress", label: "Loan / deposit (with progress)", description: "Adds the 4px progress bar with an accessible progressbar role." },
    ],
    motionSpecifications: [
      { label: "Interaction", value: "300ms ease-out", detail: "transition-[box-shadow,opacity] duration-300 ease-out on hover/press when the card is clickable." },
    ],
    accessibilitySpecifications: [
      "Exposes role=\"button\" and tabIndex=0 with Enter/Space activation only when onClick is supplied; otherwise it is a static, non-focusable card.",
      "The progress bar uses role=\"progressbar\" with aria-valuemin/max/now and an aria-label from progressLabel.",
      "The copy action is its own native <button aria-label=\"Copy account number\"> that stops event propagation so it doesn't also trigger the card's onClick.",
    ],
    assets: {
      required: true,
      summary: "Uses the copy-documents AppIcon glyph for the optional copy action; no static images.",
    },
  },

  "accounts.action-bar": {
    summary:
      "Portable reference for the reusable 1-4 item account action bar: icon-over-label buttons with configurable alignment and per-item visibility.",
    visualSpecifications: [
      { label: "Container padding", value: "16px horizontal, 8px vertical" },
      { label: "Alignment", value: "start / center / end / between", detail: "'between' stretches each item to flex:1; other alignments use a fixed 82px item width with an 8px gap." },
      { label: "Icon slot", value: "32x32px" },
      { label: "Label", value: "uc-type-p2, 15px line-height, centered, preserves newlines" },
      { label: "Item gap", value: "4px (icon to label)" },
    ],
    states: [
      { id: "4-elements", label: "4 elements", description: "Details, Options, Add money, mCash." },
      { id: "3-elements", label: "3 elements", description: "Add money hidden." },
      { id: "2-elements", label: "2 elements", description: "Options and Add money hidden." },
      { id: "1-element", label: "1 element", description: "Only mCash visible." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Each item is a native <button> with an aria-label derived from its (whitespace-normalized) label.",
      "Hidden items are disabled, tabIndex=-1, and aria-hidden, so they are fully removed from tab order and the accessibility tree rather than just visually hidden.",
      "Default action labels come from the translation registry (t('runtime.accounts.actions.*')).",
    ],
    assets: {
      required: true,
      summary: "Uses per-item AppIcon glyphs (account-details, account-options, add-money, mcash by default); no static images.",
    },
  },

  "accounts.carousel-indicator": {
    summary:
      "Portable reference for the account/product carousel dot indicator: individual dots for up to 4 items, or a sliding 5-dot window with mini end-caps for more.",
    visualSpecifications: [
      { label: "Row height", value: "32px", detail: "13.591px backdrop blur, 6px inter-dot gap." },
      { label: "Active dot", value: "30 x 6px, rounded-full, teal (--uc-action)" },
      { label: "Inactive dot", value: "6 x 6px, rounded-full, muted" },
      { label: "Mini dot", value: "4 x 4px", detail: "Shown at either end of the window when count > 4 and the active index isn't near that end." },
    ],
    states: [
      { id: "4-first", label: "4 items / first", description: "All 4 dots visible, first active." },
      { id: "4-last", label: "4 items / last", description: "All 4 dots visible, last active." },
      { id: "7-first", label: "7 items / first", description: "Sliding window with a trailing mini dot." },
      { id: "7-more", label: "7 items / further", description: "Sliding window with mini dots on both ends." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Each real dot is a native <button aria-label=\"Go to account N\"> with aria-current on the active one.",
      "Mini end-cap dots are purely decorative <span> elements, not interactive controls.",
    ],
    assets: {
      required: false,
      summary: "Pure CSS dots; no icon or image assets.",
    },
  },

  "accounts.details-info-field": {
    summary:
      "Portable reference for the Account Details title/subtitle row, with an optional trailing-icon (e.g. copy) variant.",
    visualSpecifications: [
      { label: "Height", value: "80px", detail: "Grid layout (content column + 40px icon column) when a trailing icon is supplied, flex otherwise." },
      { label: "Title", value: "uc-type-n4, uppercase" },
      { label: "Subtitle", value: "uc-type-n4-strong, wraps on long values" },
      { label: "Title-to-subtitle gap", value: "4px" },
      { label: "Trailing icon slot", value: "40x40px" },
    ],
    states: [
      { id: "with-icon", label: "Trailing icon", description: "Adds a 40x40 trailing icon column (e.g. copy-documents)." },
      { id: "default", label: "Default row", description: "Title/subtitle only, no trailing icon." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Purely presentational: the trailing icon slot is aria-hidden since this component has no built-in click handler.",
      "Long subtitle values wrap (break-words) instead of being clipped, so full account numbers/IBANs stay readable.",
    ],
    assets: {
      required: false,
      summary: "No built-in assets; the trailing icon is supplied by the consumer as a ReactNode (e.g. an AppIcon).",
    },
  },

  "messages.mailbox-tabs": {
    summary:
      "Portable reference for the shared mailbox tab switcher: a 48px tab bar with an optional leading 'new' dot, equal-width or horizontally scrollable/draggable layouts, and an active bottom indicator.",
    visualSpecifications: [
      { label: "Height", value: "48px", detail: "1px bottom border across the whole bar." },
      { label: "Layout", value: "equal (2-col grid) or scrollable (flex, drag-to-scroll)" },
      { label: "Label", value: "uc-type-n4-strong, 16px horizontal padding", detail: "Muted color when inactive." },
      { label: "New-items dot", value: "12px, teal (--uc-action)", detail: "8px gap before the label." },
      { label: "Active indicator", value: "2px bottom bar, full tab width" },
    ],
    states: [
      { id: "inbox-new", label: "Inbox active / new", description: "Inbox selected, showing the leading new-items dot." },
      { id: "inbox", label: "Inbox active / no new", description: "Inbox selected, no new-items dot." },
      { id: "outbox", label: "Outbox active", description: "Outbox tab selected." },
    ],
    motionSpecifications: [
      { label: "Active-tab scroll", value: "smooth scrollTo", detail: "In the scrollable layout, the active tab centers itself via a smooth native scrollTo when activeTabId changes." },
    ],
    accessibilitySpecifications: [
      "Uses role=\"tablist\" on the container and role=\"tab\" with aria-selected/aria-pressed on each button.",
      "The scrollable layout supports pointer-drag scrolling; a drag gesture is distinguished from a tap via a 10px movement threshold so dragging never accidentally selects a tab.",
    ],
    assets: {
      required: false,
      summary: "Pure CSS tabs; no icon or image assets.",
    },
  },

  "accounts.transaction-search": {
    summary:
      "Portable reference for the Account transaction search bar: a compact search row that swaps its trailing icon between Filter and Clear, plus an active/remove-filters expanded state.",
    visualSpecifications: [
      { label: "Default height", value: "32px", detail: "10px corner radius, no outer padding." },
      { label: "Active/remove-filters height", value: "63px", detail: "16px horizontal / 2px vertical outer padding; row itself grows to 36px." },
      { label: "Search/filter icon slots", value: "32x32px" },
      { label: "Input", value: "uc-type-n5-strong" },
      { label: "Remove filters action", value: "uc-type-n5-strong, teal (--uc-action), right-aligned" },
    ],
    states: [
      { id: "default", label: "Default", description: "Empty search input with a Filter icon." },
      { id: "filled", label: "Filled / clear state", description: "Search icon slot swaps to a Clear-results action." },
      { id: "filters-active", label: "Active / remove filters", description: "Teal filter icon plus the expanded REMOVE FILTERS row." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "The input is type=\"search\" with an aria-label matching its placeholder.",
      "The trailing icon button's aria-label switches between 'Clear search results' and the translated 'Filters' label depending on state; aria-pressed reflects the active-filters state.",
      "The remove-filters action exposes a visible 2px focus-visible ring.",
    ],
    assets: {
      required: true,
      summary: "Uses the search, filters, and clear-results AppIcon glyphs; no static images.",
    },
  },

  "accounts.transaction-row": {
    summary:
      "Portable reference for the account transaction list row: date, PFM category icon, label, and a signed/colored amount, with an optional split category-tap interaction.",
    visualSpecifications: [
      { label: "Size", value: "375 x 80px", detail: "16px/20px padding." },
      { label: "Date column", value: "18px bold day + 14px bold month, 2px gap", detail: "16px gap to the icon." },
      { label: "Icon", value: "32x32px", detail: "PFM category glyph." },
      { label: "Details column", value: "247px wide, right-aligned", detail: "4px label-to-amount gap." },
      { label: "Label", value: "uc-type-n4, 18px line-height" },
      { label: "Amount", value: "uc-type-n2-strong integer, uc-type-n5 decimals/currency", detail: "22px line-height; credit uses the action color, debit uses the text color." },
    ],
    states: [
      { id: "credit", label: "Credit", description: "Incoming transaction, action-colored amount, '+' sign." },
      { id: "debit", label: "Debit", description: "Outgoing transaction, text-colored amount, '-' sign." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Renders as one native <button> covering the whole row by default, or as two independently focusable buttons (category icon + row body) when onCategoryClick is supplied, each with a descriptive aria-label.",
      "Focus-visible ring on the split-interaction category button uses a 2px ring via --uc-focus-ring.",
    ],
    assets: {
      required: true,
      summary: "Uses the shared PfmCategoryIcon glyph set (per transaction.pfmCategory); no static images.",
    },
  },

  "payments.hero-card": {
    summary:
      "Portable reference for the Payments primary hero card: a 120px-tall CTA with a title/description block and a right-aligned illustration or screenshot-backed image.",
    visualSpecifications: [
      { label: "Size", value: "120px tall, full width", detail: "8px corner radius." },
      { label: "Content padding", value: "20px sides, 16px top" },
      { label: "Title", value: "uc-type-l1, respects supplied line breaks, no ellipsis" },
      { label: "Description", value: "uc-type-n5, 16px top gap (single-line title) or 8px (multiline title)" },
      { label: "Illustration", value: "absolute, per-variant size/position", detail: "9 screenshot-backed image variants (payments1-9.png) or a built-in vector illustration (wallet/laptop/pen/qr-phone) fallback." },
      { label: "Disabled", value: "55% opacity, cursor: not-allowed" },
    ],
    states: [
      { id: "payments-1", label: "Payments 1 / Wallet", description: "Wallet illustration, 'Make a payment'." },
      { id: "payments-2", label: "Payments 2 / Laptop", description: "Laptop illustration, 'Transfer money'." },
      { id: "payments-6", label: "Payments 6 / Approve payment", description: "Pen illustration, 'Approve payment'." },
    ],
    motionSpecifications: [
      { label: "Transition", value: "CSS transition-opacity", detail: "Opacity fades when the disabled state changes." },
    ],
    accessibilitySpecifications: [
      "Rendered as a native <button> with a title attribute (disabledReason) shown when disabled.",
      "All artwork/illustrations are decorative (alt=\"\" or aria-hidden); the title/description text carries the meaning.",
      "Exposes a 2px action-color focus-visible ring with a 2px offset.",
    ],
    assets: {
      required: true,
      summary: "Uses 9 exact screenshot-backed images (screenshots/payments1.png..payments9.png) plus two Figma illustration assets (laptop, pen); do not substitute or regenerate these.",
    },
  },

  "contacts.navigation-card": {
    summary:
      "Portable reference for the Contacts entry row: a thin wrapper over the shared NavigationRow that maps a fixed set of contact icons to their glyphs.",
    visualSpecifications: [
      { label: "Row", value: "Delegates entirely to NavigationRow", detail: "Same 375px width, 80px height, 16px title/description typography as ui.navigation-row." },
      { label: "Icon mapping", value: "9 contact icons", detail: "prime, location, time, phone, block, email, website, youtube, x — each mapped to its own contact-* AppIcon glyph." },
      { label: "Trailing", value: "chevron (via hasChevron) or none" },
    ],
    states: [
      { id: "prime", label: "Prime / chevron", description: "Prime contact icon with a trailing chevron." },
      { id: "location", label: "Location", description: "Location contact icon, no trailing accessory." },
      { id: "time", label: "Time / subtitle", description: "Time contact icon with a subtitle (opening hours)." },
      { id: "phone", label: "Phone / value", description: "Phone contact icon with a value link (the phone number)." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Inherits NavigationRow's semantics: renders as a native <button> with an aria-label defaulting to the title.",
      "The mapped contact icon is decorative; the title/subtitle/value text is what's announced.",
    ],
    assets: {
      required: true,
      summary: "Uses the 9 contact-* AppIcon glyphs (contact-prime, contact-location, contact-time, contact-phone, contact-block, contact-email, contact-website, contact-youtube, contact-x); no static images.",
    },
  },

  "products.product-card-list-total": {
    summary:
      "Portable reference for the Products evolution family (ProductCard + ProductsList + TotalRow): PI and SME styles across Default, Accordion, and Open list states.",
    visualSpecifications: [
      { label: "Card width", value: "327px (Figma)", detail: "16px padding, 4px corner radius." },
      { label: "Icon slot", value: "32x32px" },
      { label: "Card amount", value: "24px integer + 14px decimals/currency" },
      { label: "Total row amount", value: "20px integer + 14px decimals/currency" },
      { label: "Styles", value: "PI (--uc-surface) and SME (--uc-neutral-200) tones" },
    ],
    states: [
      { id: "pi-default", label: "PI app / Default", description: "Single card, no accordion/total row." },
      { id: "pi-accordion", label: "PI app / Accordion", description: "Closed accordion: first card plus a stacked shadow." },
      { id: "pi-open", label: "PI app / Open", description: "Expanded list with every card and the TotalRow summary." },
    ],
    motionSpecifications: [
      { label: "Motion", value: "None (this variant)", detail: "The plain 'evolution' variant has no built-in expand animation; ProductAccordionAnimated is the separate animated composition." },
    ],
    accessibilitySpecifications: [
      "Cards render as static regions; the surrounding ProductAccordion/ProductAccordionAnimated composition owns any expand/collapse toggle semantics.",
      "Amount typography relies on color and size alone to separate integer/decimal parts — pair with the currency text for a fully accessible reading order.",
    ],
    assets: {
      required: true,
      summary: "Uses a per-product 32px icon slot (e.g. accounts-coins AppIcon glyph); no static images required beyond the icon set.",
    },
  },

  "ui.toast-message": {
    summary:
      "Portable reference for the Toast message family: a status-dot pill (Action required / Aware) and a compact hug-content Google Pay confirmation variant.",
    visualSpecifications: [
      { label: "Default size", value: "327 x 32px", detail: "16px corner radius, 8px pr, 20px icon-to-text gap." },
      { label: "Google Pay size", value: "174 x 35px, hug content", detail: "Centered label, no status dot." },
      { label: "Status dot", value: "8px, --uc-status-red", detail: "Inside a 32px icon slot; omitted on the Google Pay variant." },
      { label: "Message", value: "uc-type-n5-strong, 14px, truncated to one line" },
      { label: "Tone", value: "Action required = light (dark text on translucent black); Aware / Google Pay = dark (white text on translucent white)" },
    ],
    states: [
      { id: "action-required", label: "Action required / light", description: "Light-tone status pill with the red dot." },
      { id: "aware", label: "Aware / dark", description: "Dark-tone status pill with the red dot." },
      { id: "google-pay", label: "Google Pay / dark", description: "Compact hug-content confirmation pill, no status dot." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Uses role=\"status\" with aria-live=\"polite\" by default so the message is announced when it appears, without needing to be focused.",
      "The status dot is aria-hidden decorative; the message text is the only announced content.",
    ],
    assets: {
      required: false,
      summary: "Pure CSS pill with a colored dot; no icon or image assets.",
    },
  },

  "ui.wallet-button": {
    summary:
      "Portable reference for the 48px wallet/payment button family: Google Wallet, Apple Wallet, and Click to Pay, each in condensed and 327px-long sizes, with Google copy localized per market.",
    visualSpecifications: [
      { label: "Height", value: "48px" },
      { label: "Sizes", value: "condensed (content-width, Apple fixed at 163px) or long (327px)" },
      { label: "Corner radius", value: "24px (Google Wallet, or Click to Pay in HU) / 8px (otherwise)" },
      { label: "Google mark", value: "31x31px 4-band color glyph" },
      { label: "Apple mark", value: "36.9 x 27.6px inline SVG wallet-card glyph" },
      { label: "Click to Pay mark", value: "40x24px chevron glyph" },
      { label: "Background", value: "--uc-static-black, white text", detail: "Google Wallet variant also has a 1px #747775 border." },
    ],
    states: [
      { id: "google-wallet-condensed", label: "Google wallet / condensed", description: "Two-line pre/brand label with the color mark." },
      { id: "apple-wallet-condensed", label: "Apple wallet / condensed", description: "Two-line 'Add to' / 'Apple Wallet' label." },
      { id: "click-to-pay-condensed", label: "Click to Pay / condensed", description: "Two-line 'Add to' / 'Click to Pay' label." },
      { id: "google-wallet-long", label: "Google wallet / long (327px)", description: "Single-line long-form label." },
    ],
    motionSpecifications: [
      { label: "Transition", value: "CSS transition-opacity", detail: "hover:opacity-90; disabled:opacity-50." },
    ],
    accessibilitySpecifications: [
      "Rendered as a native <button> with an explicit aria-label carrying the full wallet action (e.g. 'Add to Google Wallet') independent of the two-line visual label.",
      "All brand marks are aria-hidden decorative; the button's aria-label is the sole accessible name.",
      "Exposes a 2px action-color focus-visible ring with a 2px offset.",
    ],
    assets: {
      required: true,
      summary: "Uses inline SVG brand marks defined in the component itself (Google/Apple/Click to Pay); no external image files.",
    },
  },

  "ui.pill": {
    summary:
      "Portable reference for the Meniga-normalized Pill button: a fixed 120x36 rounded action across primary, secondary, counter, loading, and activated states.",
    visualSpecifications: [
      { label: "Size", value: "120 x 36px", detail: "18px corner radius, 8px horizontal padding." },
      { label: "Label", value: "uc-type-n5-strong, 14px, centered, truncated to one line" },
      { label: "Shadow", value: "0 2px 2px rgba(0,0,0,0.2)" },
      { label: "Primary surface", value: "--uc-action background, white label" },
      { label: "Secondary/counter/loading/activated surface", value: "--uc-surface background" },
      { label: "Loading/success icon", value: "16px", detail: "8px gap to the label." },
    ],
    states: [
      { id: "primary", label: "Primary", description: "Teal filled action." },
      { id: "secondary", label: "Secondary", description: "White surface, teal label." },
      { id: "active-counter", label: "Active counter", description: "White surface showing a counter string." },
      { id: "loading-counter", label: "Loading counter", description: "Disabled with an animated spinner, aria-busy." },
      { id: "activated", label: "Activated", description: "White surface with a success checkmark." },
    ],
    motionSpecifications: [
      { label: "Spinner", value: "CSS animate-spin (indefinite)", detail: "Only in the loading-counter state." },
      { label: "Transition", value: "CSS transition on background-color/color/opacity" },
    ],
    accessibilitySpecifications: [
      "Rendered as a native <button>; the loading state sets aria-busy and disables the button natively (not by styling alone).",
      "The spinner and success-check icons are aria-hidden decorative; the visible label text is the accessible name.",
    ],
    assets: {
      required: false,
      summary: "Uses inline SVG for the spinner and success checkmark defined in the component itself; no external image files.",
    },
  },

  "dialogs.logout-confirmation": {
    summary:
      "Portable reference for the iOS-style logout confirmation alert: a centered overlay dialog with a message and Cancel/OK actions.",
    visualSpecifications: [
      { label: "Dialog box", value: "max-width 270px, 14px corner radius", detail: "Layered shadow; centered via an absolute inset-0 flex overlay." },
      { label: "Overlay", value: "40% black scrim", detail: "Clicking it also dismisses the dialog (calls onClose)." },
      { label: "Message", value: "17px semibold, 22px line-height, centered", detail: "20px top / 16px bottom padding, 16px sides." },
      { label: "Actions row", value: "44px tall", detail: "Two equal-width buttons separated by a 0.5px vertical divider; OK is bold, Cancel is regular." },
    ],
    states: [
      { id: "open", label: "Open", description: "The only meaningful visual state — this is a modal overlay with no visible closed state." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None", detail: "The dialog mounts/unmounts immediately based on isOpen; there is no enter/exit transition." }],
    accessibilitySpecifications: [
      "Both actions are native <button> elements with an active-state background for touch feedback.",
      "Message and action copy come from the translation registry (runtime.dialogs.logoutMessage / runtime.dialogs.cancel / runtime.actions.okGotIt).",
      "Tapping the scrim behind the dialog dismisses it the same way as Cancel.",
    ],
    assets: {
      required: false,
      summary: "Text-only dialog; no icon or image assets.",
    },
  },

  "cards.card-component": {
    summary:
      "Portable reference for the Card management section: card-holder name and masked number above a horizontally scrollable carousel of shared Card artwork slots.",
    visualSpecifications: [
      { label: "Frame", value: "375px wide", detail: "12px vertical gap, clips content, --uc-surface-muted (#F5F5F5) background." },
      { label: "Text block", value: "24px left padding, 8px gap", detail: "14px bold card-holder name, 18px bold masked card number." },
      { label: "Carousel", value: "351 x 140px, 24px gap, 1px left padding", detail: "Horizontally scrollable, scrollbar hidden." },
      { label: "Card slot", value: "219 x 138px, 5.67px radius", detail: "0 11.265px 11.265px rgba(0,0,0,0.2) drop shadow; renders the shared Card component at 'large' size." },
    ],
    states: [
      { id: "default", label: "Default", description: "Card-holder name, masked number, and a 2-card carousel (credit + debit)." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "Each carousel slot passes its own ariaLabel through to the shared Card component (e.g. 'Credit card ending in 4007').",
      "The card-holder name and masked number are plain text with no additional ARIA needed.",
    ],
    assets: {
      required: true,
      summary: "Renders the shared cards.card artwork per slot; no additional image assets of its own.",
    },
  },

  "prelogin.other-panel": {
    summary:
      "Portable reference for the pre-login 'Other' menu panel: a bottom-sheet with Smart Banking, Exchange rates, ATM/branches, and an optional Co-Apping entry row.",
    visualSpecifications: [
      { label: "Sheet", value: "Bottom-anchored, 12px top corners", detail: "51% opaque black backdrop with a 5.9px blur; 24px vertical padding, 8px row gap." },
      { label: "Drag handle", value: "40x5px, rounded, centered", detail: "16px tap target; clicking it also dismisses the sheet." },
      { label: "Row", value: "375 x 80px", detail: "16px padding, 16px icon-to-label gap, 32px icon slot, 14px regular white label." },
      { label: "Co-Apping row", value: "Only rendered when startCoAppingSession is supplied", detail: "The only row with its own onClick / hover affordance in the current implementation." },
    ],
    states: [
      { id: "default", label: "Default", description: "Smart Banking, Exchange rates, ATM/branches, and the Co-Apping row." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "The backdrop and drag handle both call onClose on click, giving two dismiss affordances beyond a dedicated close button.",
      "Only the Co-Apping row is currently interactive (onClick); the other three rows are presentational text rows in this implementation.",
      "All labels are required strings supplied by the consuming (translated) screen.",
    ],
    assets: {
      required: true,
      summary: "Uses the panel-smart-banking, payment-exchange-rates, contact-location, and panel-share-screen AppIcon glyphs; no static images.",
    },
  },

  "prelogin.other-panel-basic": {
    summary:
      "Portable reference for the pre-login 'Other' menu panel variant used where Co-Apping is unavailable: the same bottom-sheet without the Co-Apping row.",
    visualSpecifications: [
      { label: "Sheet", value: "Bottom-anchored, 12px top corners", detail: "51% opaque black backdrop with a 5.9px blur; 24px vertical padding, 8px row gap." },
      { label: "Drag handle", value: "40x5px, rounded, centered" },
      { label: "Row", value: "375 x 80px", detail: "16px padding, 16px icon-to-label gap, 32px icon slot, 14px regular white label." },
    ],
    states: [
      { id: "default", label: "Default", description: "Smart Banking, Exchange rates, and ATM/branches rows only." },
    ],
    motionSpecifications: [{ label: "Motion", value: "None" }],
    accessibilitySpecifications: [
      "The backdrop and drag handle both call onClose on click.",
      "All three rows are presentational text rows in this implementation (no per-row onClick).",
      "All labels are required strings supplied by the consuming (translated) screen.",
    ],
    assets: {
      required: true,
      summary: "Uses the panel-smart-banking, payment-exchange-rates, and contact-location AppIcon glyphs; no static images.",
    },
  },
};

export function getComponentImplementationPackage(componentId: string) {
  return COMPONENT_IMPLEMENTATION_PACKAGES[componentId];
}
