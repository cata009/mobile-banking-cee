# Original image artwork primitives

The canonical RN primitive BaselinePaymentImage supports the 13 original page-7 Card payment images Type variants at 137 × 120 and the nine existing application presets. BaselineCardArt supports all 29 original Card art variants at their source dimensions: 28 at 219 × 138, Credit Mobexpert at 219 × 154.51324462890625. The Web host compiles these RN primitives; there is no independent Web UI implementation of either family.

These are asset-only DS primitives. They do not define eligibility, selection, navigation, card data or payments business behavior. The consuming surface owns copy and interaction.

The existing cards/Card, contracts/cardArtwork and BaselineCardArtwork remain the separate 64 × 40 geometry family. Their variants are not aliases for these full artworks. The banking CardArt API now delegates to BaselineCardArtwork, retaining its dimensions, colors, viewBox and rounded background geometry. BaselinePaymentHero and the classic/non-classic payment screens consume BaselinePaymentImage. Existing source rasters, preset crop/placement, interactions and feature policies are preserved.

The nine application presets are not asserted to be a one-to-one mapping of the 13 original Figma Types. The application currently uses the 64 × 40 geometry at several display sizes; this does not implement or select the full set of 29 original card artworks. Those 29 are a separate DS asset API, without invented product-to-artwork policies or wholesale screen migration.

SVG exports are the original Figma node exports, downloaded without modifying their paths, images, masks, gradients, filters or root dimensions. None of the components was rasterized. Embedded bitmap fills stay inside their original vector compositions. Metadata records each source node, component key, exact logical canvas, exported SVG bounds and SHA-256. A few original canvases have visual overflow; it remains visible. Scaling applies uniformly around the artwork, preserving both canvas and exported SVG geometry.

Native uses the existing Metro SVG transformer and VectorArtworkLayer. The active preset path does not import the original SVG asset map. For an original Figma payment Type, supply its `variant` and `asset` explicitly; BaselineCardArt is a separate explicit entry point for the full card-art family. This keeps the 103 MB original-source inventory outside the active preset dependency tree. No duplicate XML copies, native bridges, package changes or global renderer changes are introduced. RN web resolves the same local SVG URLs. No lossy image optimization was applied.

Artwork is decorative by default. Supply ariaLabel only when it conveys information absent from adjacent text. All child artwork stays excluded from the accessibility tree so a meaningful image has one accessible name. This does not certify VoiceOver/TalkBack behavior on devices.
