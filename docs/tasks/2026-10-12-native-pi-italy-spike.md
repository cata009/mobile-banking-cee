# PI Italy native Android spike

Owner: /root (integration owner for this task only).
Base commit: 538360ead4a6da9ae889f142f8d00e333f99412b
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: native-spike/**; scripts/native-spike/**; public/downloads/mobile-banking-cee-native-*.apk; docs/tasks/2026-10-12-native-pi-italy-spike.md; .codex-temp/android-spike/native-* (ignored test/build artifacts).
Spec: approved conversation scope: true React Native Home → account detail → demo payment form, bundled UI, native keyboard, direct signed APK. No web wrapper; no publication. Existing sources and APK are preserved.

## Plan
1. Scaffold an isolated dependency project inside the existing checkout, with no nested Git initialization.
2. Adapt the shared pure Italian financial snapshot and payment policies; build native screens and test the adapter.
3. Build a signed release, install on the Android emulator, verify navigation, native keyboard and demo submission, inspect crash logs.
4. Review the exact task delta; attempt combined repository verification and record limitations; deliver the APK locally.

## Initial pending changes
```
 M api/access.js
 M src/app/AppScreenRouter.tsx
 M src/app/AppShell.tsx
 M src/app/components/FramelessDeviceFrame.tsx
 M src/app/components/MobileFrame.tsx
 M src/app/components/demo/DemoFeatureSidePanel.tsx
 M src/app/components/demo/DemoTopBar.tsx
 M src/app/components/security/AccessGate.tsx
 M src/app/config/documentsConfig.ts
 M src/app/config/messagesConfig.ts
 M src/app/config/moreCardsConfig.ts
 M src/app/config/paymentsMenuConfig.ts
 M src/app/config/productConfig.ts
 M src/app/config/productsMenuConfig.ts
 M src/app/navigation/routePolicy.ts
 M src/app/platform/effectiveAppContext.ts
 M src/app/registry/countryConfig.ts
 M src/app/registry/demoConfig.ts
 M src/app/registry/domains/home/screens.ts
 M src/app/registry/languageByCountry.ts
 M src/app/registry/projectModel.ts
 M src/app/registry/projectPackRegistry.ts
 M src/app/screens/appointments/RequestCallScreen.tsx
 M src/app/screens/appointments/appointmentModel.ts
 M src/app/screens/design-system/inventoryNav.ts
 M src/app/screens/payments/DomesticPaymentFlowScreens.tsx
 M src/app/screens/products/App2027ProductsShelf.tsx
 M src/app/screens/tools/CountryDivergenceTool.tsx
 M src/app/screens/tools/countryDivergence.ts
 M src/app/state/demoStore.tsx
 M src/app/state/demoTypes.ts
 M src/app/utils/deepLink.ts
 M src/assets/products/shelf/partner-offers-v2.png
 M src/assets/products/shelf/partner-shopsmart-v2.png
 M src/data/accountDetails.ts
 M src/data/merchantDirectory.ts
 M src/data/paymentFlow.ts
 M src/experiences/composition.ts
 M src/experiences/contracts.ts
 M src/experiences/registry.ts
 M src/translations/index.ts
 M tests/components/demo-top-bar.test.tsx
 M tests/components/device-preview.test.tsx
 M tests/data/account-pfm.test.ts
 M tests/data/merchant-directory.test.ts
 M tests/data/spending-analytics.test.ts
 M tests/platform/experience-ownership-metadata.test.ts
 M tests/platform/experience-ownership.test.ts
 M tests/registry/fixtures/declarative-baseline.json
 M tests/screens/card-detail-boundaries.test.tsx
 M tests/screens/design-system-specimens.test.tsx
 M tests/screens/products-responsive.test.tsx
 M vite.config.ts
?? .agent-task.json
?? .github/workflows/android-demo.yml
?? android-spike/
?? cz-id-nfc-original.png
?? cz-nfc-screen.png
?? docs/tasks/
?? figma-oval-after.png
?? figma-oval-before.png
?? figma-oval-state2-before.png
?? liveness-ba-display-bottom.png
?? liveness-ba-display-logic.png
?? liveness-ba-display-logic.txt
?? liveness-ba-display-top.png
?? liveness-design-notes.json
?? liveness-figma-final-state.json
?? liveness-figma-state.json
?? liveness-final-0.png
?? liveness-final-1.png
?? liveness-final-2.png
?? liveness-final-3.png
?? liveness-final-4.png
?? liveness-final-5.png
?? liveness-final-6.png
?? liveness-review-0.png
?? liveness-review-1.png
?? liveness-review-2.png
?? liveness-review-3.png
?? liveness-review-4.png
?? liveness-review-5.png
?? liveness-review-6.png
?? liveness-screen-ledger.json
?? liveness-verified-0.png
?? liveness-verified-1.png
?? liveness-verified-2.png
?? liveness-verified-3.png
?? liveness-verified-4.png
?? public/.well-known/
?? public/downloads/
?? ro-cc-details-final.png
?? ro-cc-final-0.png
?? ro-cc-final-1.png
?? ro-cc-final-2.png
?? ro-cc-final-3.png
?? ro-cc-final-4.png
?? ro-cc-final-5.png
?? ro-cc-final-6.png
?? ro-cc-ntb-ba-rules.txt
?? ro-cc-ntb-design-state.json
?? ro-cc-ntb-final-state.json
?? ro-cc-package-before.png
?? ro-cc-platinum-source.png
?? ro-cc-review-0.png
?? ro-cc-review-1.png
?? ro-cc-review-2.png
?? ro-cc-review-3.png
?? ro-cc-review-4.png
?? ro-cc-review-5.png
?? ro-cc-review-6.png
?? ro-cc-verified-0.png
?? ro-cc-verified-1.png
?? ro-cc-verified-2.png
?? scripts/android-spike/
?? sk-id-back-reference.jpg
?? sk-id-nfc-illustration.png
?? sk-id-nfc-screen-final.png
?? sk-nfc-illustration-state.json
?? src/app/state/mobileFirstContext.ts
?? src/assets/mobile-first/
?? src/experiences/pi/it/
?? src/features/accounts-payments/mobileFirstAccountExports.ts
?? src/features/accounts-payments/mobileFirstAccounts.ts
?? src/features/analytics/mobileFirstPfm.ts
?? src/features/analytics/mobileFirstPfmState.ts
?? src/features/cards/mobileFirstCards.ts
?? src/features/cards/mobileFirstCardsExport.ts
?? src/features/credit/
?? src/features/finance/
?? src/features/insurance/mobileFirstInsurance.ts
?? src/features/insurance/mobileFirstInsuranceExports.ts
?? src/features/investments/mobileFirstFunds.ts
?? src/features/investments/mobileFirstFundsState.ts
?? src/features/investments/mobileFirstInvestmentServices.ts
?? src/features/investments/mobileFirstInvestments.ts
?? src/features/investments/mobileFirstSecurities.ts
?? src/features/investments/mobileFirstValuation.ts
?? src/features/profile/
?? src/features/search/
?? src/translations/IT/
?? tests/features/italy-financials.test.ts
?? tests/features/mobile-first-cards.test.ts
?? tests/features/mobile-first-financial-account-card.test.ts
?? tests/features/mobile-first-insurance.test.ts
?? tests/features/mobile-first-investment-financials.test.ts
?? tests/features/mobile-first-loans.test.ts
?? tests/features/mobile-first-pfm.test.ts
?? tests/features/mobile-first-profile-data.test.ts
?? tests/features/mobile-first-profile-services.test.ts
?? tests/features/mobile-first-profile-settings.test.ts
?? tests/features/mobile-first-profile.test.ts
?? tests/features/mobile-first-search.test.ts
?? tests/platform/italy-mobile-first.test.ts
?? tests/screens/italy-mobile-first-account-flows.test.tsx
?? tests/screens/italy-mobile-first-account-policy.test.ts
?? tests/screens/italy-mobile-first-account.test.tsx
?? tests/screens/italy-mobile-first-cards.test.tsx
?? tests/screens/italy-mobile-first-home.test.tsx
?? tests/screens/italy-mobile-first-insurance.test.tsx
?? tests/screens/italy-mobile-first-investments.test.tsx
?? tests/screens/italy-mobile-first-loans.test.tsx
?? tests/screens/italy-mobile-first-operations.test.tsx
?? tests/screens/italy-mobile-first-pfm.test.tsx
?? tests/screens/italy-mobile-first-profile.test.tsx
?? tests/screens/italy-mobile-first-search-entry.test.tsx
?? tests/screens/italy-mobile-first-search.test.tsx
?? tests/screens/italy-mobile-first-tabs.test.tsx
?? tests/screens/mobile-first-investments-deposit-info.test.tsx
?? tests/screens/mobile-first-investments-funds-model.test.ts
?? tests/screens/mobile-first-investments-funds-state.test.ts
?? tests/screens/mobile-first-investments-funds.test.tsx
?? tests/screens/mobile-first-investments-primitives.test.tsx
?? tests/screens/mobile-first-investments-securities.test.tsx
?? tests/screens/mobile-first-investments-services.test.tsx
?? tests/screens/mobile-first-keyboard.test.tsx
?? tests/screens/mobile-first-native-keyboard.test.tsx
?? tests/screens/mobile-first-profile-data.test.tsx
?? tests/screens/mobile-first-profile-services.test.tsx
?? tests/screens/mobile-first-profile-settings.test.tsx
?? tests/security/mobile-demo-access.test.ts
?? tests/security/mobile-demo-gate.test.tsx
```

## Ledger
Ruling: user requires main checkout; use a new standalone native-spike directory without touching the root dependency tree or other editors' files. No commits or deployment.
User also requested browser annotations. Add React Native Web preview inside native-spike using the same App components. Exact UniCredit regular/bold fonts copied from locally installed fonts; unchanged Figma app icon reused.
Build ruling: Windows Ninja hit MAX_PATH in long checkout; use C:/mb-cee junction to the same checkout, without moving files or creating a worktree. SDK 37 platform absent; use installed compile SDK 36 (React Android AAR minCompileSdk 34), keep target 36.

## Final verification
Native project: TypeScript, lint, 12 Jest tests, Vite production preview build passed. Shared module audit passed (260 files). Signed release built by scripts/native-spike/build.ps1, certificate matches previous APK, versionCode 4. APK SHA256 0A7A6586907549CF077F2B3C21B51F0AD1CABDAFAB15C5C27FE82F3415B0C0D1; 35,164,893 bytes. Android7+ arm64 phones, x86_64 emulator; no runtime permissions. AndroidX adds only app-signature receiver permission.
Android9 emulator: install upgrade, cold start, Home/account native views, actual Gboard text and decimal keyboard, complete transfer + local receipt, landscape scroll/reachable return buttons, empty crash buffer. Physical phone absent from ADB; physical verification remains with user.
Review: fixed completed-key retry after all-funds debit and scrollable success content. Follow-up review: no outstanding findings.
Image regression: native Image borderRadius reproduced blank images; removing that property restored the avatar. Exact brand SVG avoids raster clipping in header; original Figma launcher icon unchanged.
Combined npm run verify: root TypeScript and lint passed; stopped at pre-existing format warning src/features/investments/mobileFirstSecurities.ts (not owned). No edits made to that file; subsequent root gates did not run.
Local download server serves only this APK and its QR/download page at http://192.168.68.60:4007 (same Wi-Fi); no external publication.

## Exact task delta (all additions; no tracked source modifications)
```
docs/tasks/2026-10-12-native-pi-italy-spike.md
native-spike/.bundle/config
native-spike/.eslintrc.js
native-spike/.gitignore
native-spike/.prettierrc.js
native-spike/.watchmanconfig
native-spike/App.tsx
native-spike/Gemfile
native-spike/README.md
native-spike/__tests__/App.test.tsx
native-spike/__tests__/banking.test.ts
native-spike/android/app/build.gradle
native-spike/android/app/debug.keystore
native-spike/android/app/proguard-rules.pro
native-spike/android/app/src/main/AndroidManifest.xml
native-spike/android/app/src/main/assets/fonts/UniCredit-bold.ttf
native-spike/android/app/src/main/assets/fonts/UniCredit-regular.ttf
native-spike/android/app/src/main/java/com/com.mobilebanking.cee.demo/MainActivity.kt
native-spike/android/app/src/main/java/com/com.mobilebanking.cee.demo/MainApplication.kt
native-spike/android/app/src/main/res/drawable-nodpi/unicredit_app_icon.png
native-spike/android/app/src/main/res/drawable/rn_edit_text_material.xml
native-spike/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
native-spike/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
native-spike/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
native-spike/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
native-spike/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
native-spike/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
native-spike/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
native-spike/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
native-spike/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
native-spike/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
native-spike/android/app/src/main/res/values/strings.xml
native-spike/android/app/src/main/res/values/styles.xml
native-spike/android/build.gradle
native-spike/android/gradle.properties
native-spike/android/gradle/wrapper/gradle-wrapper.jar
native-spike/android/gradle/wrapper/gradle-wrapper.properties
native-spike/android/gradlew
native-spike/android/gradlew.bat
native-spike/android/settings.gradle
native-spike/app.json
native-spike/assets/fonts/UniCredit-bold.ttf
native-spike/assets/fonts/UniCredit-regular.ttf
native-spike/assets/unicredit_app_icon.png
native-spike/babel.config.js
native-spike/eslint.config.mjs
native-spike/index.html
native-spike/index.js
native-spike/ios/.xcode.env
native-spike/ios/PIItalyNative.xcodeproj/project.pbxproj
native-spike/ios/PIItalyNative.xcodeproj/xcshareddata/xcschemes/PIItalyNative.xcscheme
native-spike/ios/PIItalyNative/AppDelegate.swift
native-spike/ios/PIItalyNative/Images.xcassets/AppIcon.appiconset/Contents.json
native-spike/ios/PIItalyNative/Images.xcassets/Contents.json
native-spike/ios/PIItalyNative/Info.plist
native-spike/ios/PIItalyNative/LaunchScreen.storyboard
native-spike/ios/PIItalyNative/PrivacyInfo.xcprivacy
native-spike/ios/Podfile
native-spike/jest.config.js
native-spike/metro.config.js
native-spike/package-lock.json
native-spike/package.json
native-spike/src/banking.ts
native-spike/src/icons.ts
native-spike/src/images.ts
native-spike/src/images.web.ts
native-spike/src/styles.ts
native-spike/tsconfig.json
native-spike/vite.config.mjs
native-spike/web.css
native-spike/web.tsx
public/downloads/mobile-banking-cee-native-0.2.0.apk
scripts/native-spike/build.ps1
```
Browser annotation preview verified on http://localhost:4006/ after forced Vite dependency re-optimization (native dev server restarted). Tab 6 left open as deliverable. Local APK HEAD download returns HTTP 200 with exact byte length. Native lint uses RN flat config with @eslint/compat for template Flow plugin API compatibility; no rules or thresholds disabled.
