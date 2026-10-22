/** Exact editable fill layers from My Advisor 1091:24468 and 842:44900. */
// Original Figma gradientTransform inverted into SVG space. CSS angle/stops lose
// this affine mapping and incorrectly turn the upper screen nearly white.
const PRIVATE_BASE_FILL = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1 1' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><defs><linearGradient id='private' gradientUnits='userSpaceOnUse' x1='0' y1='0.5' x2='1' y2='0.5' gradientTransform='matrix(-0.526367514782241 1.3352048089244397 -1.2778686852150096 -0.6251349915717538 1.6666351523424976 -0.38534921231275354)'><stop stop-color='rgb(255,255,255)' offset='0.004807692486792803'/><stop stop-color='rgb(34,34,34)' offset='1'/></linearGradient></defs><rect width='1' height='1' fill='url(%23private)'/></svg>\")";
export const PRIVATE_BADGE_GRADIENTS = [
  PRIVATE_BASE_FILL,
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 141 32' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.20000000298023224'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.0188 1.5982 -8.7209 -0.0009487 70.688 16.018)'><stop stop-color='rgba(254,226,170,1)' offset='0'/><stop stop-color='rgba(200,179,137,1)' offset='0.25'/><stop stop-color='rgba(146,132,104,1)' offset='0.5'/><stop stop-color='rgba(119,109,88,1)' offset='0.625'/><stop stop-color='rgba(92,85,71,1)' offset='0.75'/><stop stop-color='rgba(65,62,55,1)' offset='0.875'/><stop stop-color='rgba(38,38,38,1)' offset='1'/></radialGradient></defs></svg>\")",
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 141 32' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.20000000298023224'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-2.82 2.2725 -5.2359 -0.060085 98.7 9.2746)'><stop stop-color='rgba(23,20,32,0)' offset='0'/><stop stop-color='rgba(11,10,16,0.5)' offset='0.5'/><stop stop-color='rgba(0,0,0,1)' offset='1'/></radialGradient></defs></svg>\")"
] as const;
export const PRIVATE_PAGE_GRADIENTS = [
  "linear-gradient(206deg, #FFF -47.26%, #222 59.18%)",
  "radial-gradient(61.85% 49.94% at 50.13% 50.06%, rgba(254, 226, 170, 0.20) 0%, rgba(38, 38, 38, 0.20) 100%)",
  "radial-gradient(37.18% 73.78% at 70% 28.98%, rgba(23, 20, 32, 0.00) 0%, rgba(0, 0, 0, 0.20) 100%)",
] as const;

