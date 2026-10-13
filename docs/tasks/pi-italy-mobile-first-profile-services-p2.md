# Services P2 repair evidence

Owner `/root/profile_services`, same allocated paths and original base `538360ead4a6da9ae889f142f8d00e333f99412b`. Existing operator/integration changes are preserved. Settings feature files are dependencies only; no Settings or root file was edited here.

Confirmed issues were reproduced by new meaningful regressions: the initial repair run had 13 failures and 19 passing tests. The red output is retained in `pi-italy-mobile-first-profile-services-p2-red.txt`. After repairs and extra expiry/strict-mode proofs, 36 tests pass (10 feature, 26 screen). Scoped ESLint passes with zero warnings; formatting, combined typecheck and module audit pass. Integration owner retains final combined verification responsibility.

Repairs:

- Document filter validation uses `draft.category || active category || tab`, so blank category drafts cannot bypass inherited investment/advice one-month or featured six-month limits. Calendar-month range bounds clamp to the destination month's final day, including leap years.
- Valid direct communications/practice entry marks the canonical item read in an effect. Already-read and unknown IDs do not mutate the snapshot. Strict Mode mounting produces one read update, and rerender keeps snapshot identity stable.
- Selecting a topic from global Support search synchronizes its actual category, preserving the matching body and contextual navigation target.
- Ordinary entry to delivery authorization or MIFID signature no longer resets the canonical three-attempt lock. Explicit store/lifecycle reset remains available. Back/re-entry regressions show a locked correct code remains blocked.
- Actual MIFID signing uses the canonical Settings effective certificate state, including suspended, revoked, non-active and 90-day suspension expiry. The UI subscribes to Settings changes while open, disables signing when unavailable, and offers `onNavigate('settings', 'digital-signature')` for certificate management. The final signing function checks state again at submission. Delivery preference authorization remains generic Mobile Code authorization and works with a revoked certificate.

The public `profileServicesStore` API is unchanged. `authorizeServiceSignature` remains the generic authorization helper; new `servicePracticeSignatureError` and `authorizeServicePracticeSignature` are MIFID-specific guards. Root/Settings owners coordinate a direct digital-signature landing path; the delegated Settings route remains usable without editing their files here.
