# Italy Mobile First profile settings and security
Owner: /root/profile_settings. Base commit: 538360ead4a6da9ae889f142f8d00e333f99412b. Checkout: C:/Users/mihai/Desktop/Mobile Banking - CEE. Initial status and disjoint owned paths are in the ownership record.

The implementation is native React/CSS and composes the shared Profile primitives. Settings are held by the feature-level profileSettingsStore, with a versioned localStorage snapshot. Demo credential fixtures remain in memory, never in the persisted settings payload.

Feature policies cover numeric PIN history/identity/repetition checks; Mobile Code generation and changes; authorization failure lockout; digital signature suspension/90-day expiry; daily limit bounds and validity expiry; instant limit changes; quick-operation contact/default-account/cost prerequisites; category notification duplicates; irreversible SMS-to-Push conversion (including stale drafts); imported consent supersession; consent renewal/revocation; access-history filtering; tax-code validation; and real PDF facsimile generation.

The coverage JSON maps every captured source frame to its runtime family or explicit source handoff. Repeated source variants share state machines. It includes all source IDs, section/page provenance, canonical context IDs, and the honest visual-verification boundary.

Fixture values for reviewers: initial PIN 87263915; initial Mobile Code 12345678; generated Mobile Code 59382746 after penultimate card block 5678; contact verification code 123456; tax-code fixture RSSMRA90R10F205I; third-party code YADITY. These values stay out of product copy.

Entrypoint: MobileFirstProfileSettings({ entry?: 'settings' | 'security', initialFlow?: 'forgot-mobile-code' | 'digital-signature', onBack, onClose, onNavigate?, onHome? }). Security entry opens Check-up; the menu's Sicurezza row opens credential/security controls. onNavigate('practices') and onHome are the source privacy completion destinations. ProfileSettingsRecoveryContext supplies root Mobile Code recovery navigation for shared authorization.

The 37 focused tests passed (19 feature and 18 screen). Review regressions cover applied versus draft history filters, independent notification-group flags, and fresh email verification codes. Integrated menu/security/check-up navigation and screenshots were inspected. No branches, Git index, commits, worktrees, remote publication, deletions, conversions or existing operator files were changed. Root owns the final combined verify, routing and shared frame chrome.


Root login can use authorizeProfilePin and verifyProfilePin; both read the canonical current private PIN. resetProfileAuthorization resets PIN and Mobile Code attempt counters. ProfileSettingsRecoveryContext is supplied by root for generic authorization recovery.

History delivery records recipient/count/status locally; no email API is invoked. The source email receipt screen is reproduced. isProfileAuthorizationLocked exposes canonical PIN and Mobile Code locks, and the settings biometric handler checks the canonical lock before committing.

CSS ownership is released to root for the shared text-scale conversion. All worker product TypeScript files are frozen. The temporary verification server on port 5177 was stopped; the shared port 4004 server was left running.
