# Lossless deployment assets

The web build optimizes emitted assets after both Vite bundles finish. All source artwork, original photos, native assets, source/code exports and PRIME flow implementations remain unchanged.

## Deployment boundary

- Vite's automatic public-directory copy is disabled. The build copies public files explicitly, excluding only the operator-owned `public/downloads` directory. It never deletes the original downloads.
- Copied public files retain their original bytes and public URLs, including the artwork used by exported source packages.
- Byte-identical emitted images and fonts are stored once. When Native uses a shared asset, its canonical copy stays inside `native-demo/assets`, preserving the independent Native artifact.
- React runtimes, executable module names, audio, routing and flow logic are not deduplicated or changed.

## Lossless acceptance

The encoder detects actual image format rather than trusting the extension. A smaller WebP lossless candidate is accepted only when dimensions, color profile, orientation, and both color-managed and unmanaged decoded RGBA samples match. PNGs with an alpha channel use PNG compression only: browser decoders can otherwise introduce premultiplication rounding even when the encoder's RGBA checks pass. Other PNGs that cannot pass WebP acceptance get a lossless PNG compression attempt with the same acceptance checks. Ambiguous gamma/color metadata, nonidentity orientation, animation and unsupported color spaces remain untouched.

SVG vector markup is not flattened or approximated. Only an embedded PNG/JPEG data URI may change, after the same raster checks. The rest of the SVG remains byte-identical.

## References and verification

URL rewrites operate on complete executable JavaScript string literals, CSS URLs and HTML asset attributes. Relative JavaScript URLs are changed only inside `new URL(..., import.meta.url)`. Embedded raw-source payloads are not searched or globally replaced. Generated asset names are content-hashed; every referenced emitted asset must exist after cleanup or the build fails.

The Native integrity manifest is regenerated after all optimization. A local ignored cache stores encoder results with source/module/output hashes; it is neither required nor shipped. Each build writes sizes and accepted-image proofs to `.codex-temp/asset-optimization-report.json`.

Before publication, run focused optimizer regressions and `npm run verify`, confirm original asset hashes, compare every accepted optimized image against its original through browser canvas decoding, inspect PRIME Standard/Prime/Private presentation images, and exercise native-host rendering and source exports. The production build uses the existing Vercel environment; local QA passwords are confined to the local build process.
