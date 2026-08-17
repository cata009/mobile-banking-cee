# G1 - Mobile Banking CEE - Secure Application PIN Entry

**Document status:** Working DF specification for review and estimation  
**Design references:** [Login PIN screens](https://www.figma.com/design/d2TyUaQNN6YsgznQaWymIR/CEE---Mobile-First---Enhanced?node-id=24014-363416&t=Fr2Vcw143wDHR6LN-1) and [Change PIN screens](https://www.figma.com/design/d2TyUaQNN6YsgznQaWymIR/CEE---Mobile-First---Enhanced?node-id=24014-364047&t=Fr2Vcw143wDHR6LN-1)

## G1 1 Initiative overview and scope

### G1 1.1 Scope and expected impacts and benefits

This initiative replaces the existing SIGN application-PIN entry screens with a consistent, dedicated in-app numeric PIN pad for Mobile Banking login and Change PIN. The user enters a masked application PIN through the controlled screen, receives immediate, comprehensible feedback and can recover through the existing Forgot your passcode journey.

The target interaction is a modern, focused PIN experience: a clear instruction, masked progress dots, a 0-9 in-app keypad, delete control and a secondary recovery entry point. The login and Change PIN journeys use the same interaction model so customers do not have to learn different PIN-entry behaviours in different moments.

**Changes in scope.**

- Replace the existing SIGN PIN-entry presentation with the Figma PIN pad for application login.
- Support the configured 6 to 8 digit PIN length and show masked digit progress only.
- Provide a dedicated in-app numeric keypad, including delete/backspace, rather than rely on an editable free-text field as the visual entry surface.
- Validate login PIN entry and present an incorrect-PIN state with remaining-attempt information returned by the authentication service.
- Reuse the existing Forgot your passcode recovery destination.
- Apply the same PIN pad model to Change PIN: current PIN, new PIN, confirmation and validation/error states.
- Prevent weak or disallowed PIN values according to the approved PIN policy, including simple sequences and previously used PINs where the security service supports those checks.

**Business and user benefits.** A controlled, consistent input surface reduces ambiguity and limits the exposure created by unprotected or generic text input patterns. It also supports clear fraud/security controls, masked entry, attempt messaging and recovery. The exact protection model against keyboard-overlay, input interception, screen overlay, rooted-device or malware threats **Cannot determine** from Figma and must be validated by Security; this document does not claim that visual redesign alone prevents any specific attack.

### G1 1.2 Countries/Legal Entities impacted

All CEE Mobile Banking entities using the affected SIGN login and Change PIN flows are potential scope. Final country rollout, local PIN policy, authentication dependencies and language variants **Cannot determine**.

### G1 1.3 Client Type & Target

Existing registered retail Mobile Banking customers who authenticate with an application PIN, change that PIN, or need to enter recovery after a PIN issue. The PIN must never be visible as plain text to any user.

### G1 1.4 Actors

- **Retail customer:** enters, changes or recovers an application PIN.
- **Mobile application:** renders the controlled PIN-entry experience and protects the local presentation state.
- **Existing authentication/PIN service:** validates the PIN, provides remaining-attempt state, applies lockout/policy checks and finalises PIN change.
- **Existing recovery service:** owns the Forgot your passcode journey.
- **Security/Fraud and Identity owners:** approve security controls, PIN policy, lockout/recovery and monitoring rules.

### G1 1.5 Channels

Mobile Banking application only. The user may be handed off to an existing recovery mechanism; the recovery channel and continuity details **Cannot determine**.

## G1 2 Process description

### G1 2.1 Overview

1. The customer presses Login or chooses Change PIN from the existing relevant entry point.
2. The app opens the dedicated PIN screen with contextual instruction and masked digit indicators.
3. The customer enters digits through the in-app numeric keypad; the app never renders entered digits in clear text.
4. After the configured digit count, the app submits the PIN to the existing authentication/PIN service and shows processing feedback while a response is pending.
5. The service returns success, incorrect PIN/remaining attempts, lockout/recovery outcome or a policy error.
6. For Change PIN, the customer enters current PIN, enters a new PIN, confirms it, then receives success or a targeted validation state.

### G1 2.2 Login PIN entry

#### G1 2.2.1 Actors

The customer provides input; the app renders local masked state and forwards the completed PIN only to the existing authentication service. The service owns authentication decisioning and attempt count.

#### G1 2.2.2 Channels

Mobile Banking pre-login authentication screen.

#### G1 2.2.3 Changes to be implemented

The existing SIGN PIN screen is replaced by a centred, controlled PIN pad. It includes:

- instruction: Insert your PIN Code;
- masked progress dots for the configured PIN length;
- numeric keys 0-9, a dedicated delete control and no clear-text PIN echo;
- optional Continue only when the product interaction requires an explicit submit; otherwise submission occurs at the configured digit count;
- a visible Forgot your passcode action;
- loading presentation while validation is pending.

The user experience must behave predictably with keyboard focus, screen reader and reduced-motion settings. The precise native-versus-custom keypad implementation and device-hardening approach **Cannot determine** and require Security/Platform approval.

#### G1 2.2.4 Data impacted

Consume PIN-length policy, current authentication state, attempt count/maximum attempts, validation response, lockout state and recovery eligibility. The PIN itself must not be logged, exposed to analytics or persisted in UI state beyond the secure minimum required by the approved authentication SDK/service.

#### G1 2.2.5 Communications to customer

Show in-app feedback only: processing, incorrect PIN, remaining attempts, locked/recovery-required and generic technical error. Push/SMS/email communications **Cannot determine**.

#### G1 2.2.6 Communications to bank operators

No new manual operator communication is defined. Existing security-event alerting/logging may be reused if approved.

#### G1 2.2.7 Risk & Controls

- Mask digits at all times.
- Rate-limit and lock/step-up according to the existing authentication policy.
- Render remaining attempts only from the server/authoritative authentication response.
- Prevent copy, paste, autofill and generic text-field behaviour where not approved for application PIN input.
- Never infer an authentication success locally.
- Do not claim the keypad alone defeats malware or hardware compromise; combine it with approved secure-input, device-integrity, anti-overlay and session controls where required.

#### G1 2.2.8 Unhappy Flows

- Incorrect PIN: retain only allowed masked-entry state, show the remaining attempts returned by the service and offer Try again.
- Too many failed attempts/locked state: route to the approved lockout/recovery experience.
- Authentication timeout/technical error: allow safe retry without exposing PIN or misleading attempt count.
- App backgrounded/interrupted: clear transient PIN entry according to approved security policy.

### G1 2.3 Forgot your passcode

Forgot your passcode remains a secondary action from every PIN-entry state. It must redirect to the existing recovery journey rather than create a parallel recovery mechanism in this scope. Recovery identification, authentication factors and PIN reset rules **Cannot determine**.

### G1 2.4 Change PIN

#### G1 2.4.1 Current PIN verification

The customer first enters their current PIN using the same masked keypad. The service validates it before the customer can set a new PIN. Incorrect current-PIN handling uses the same authoritative attempt/lockout policy as login.

#### G1 2.4.2 New PIN and confirmation

The customer enters a new PIN, then confirms it on a separate screen. The UI must not show either PIN in clear text. A mismatch returns a targeted message and allows a safe restart/retry according to policy.

#### G1 2.4.3 PIN policy feedback

The Figma flow includes explicit feedback for a PIN that is too easy to guess, for example simple sequences, and a PIN that was used before. The server/approved PIN policy must decide the outcome. The UI presents only an approved non-sensitive explanation, for example "Choose a stronger PIN" or "This PIN was used before", and a clear next action.

#### G1 2.4.4 Successful PIN change

After confirmed policy validation and secure completion, show the approved success state and update only the authenticated app session according to the existing identity/session policy. Whether other sessions/devices are revoked or notified **Cannot determine**.

### G1 2.5 Channel specificity Vs standard workflow

PIN entry is intentionally limited to Mobile Banking. Any recovery handoff uses the approved existing journey. No branch/contact-centre process is changed by this visual/interaction specification.

### G1 2.6 Special cases Vs standard workflow

- Configured PIN length may be 6, 7 or 8 digits; the screen derives the indicator count from policy rather than hardcoding a single length.
- Biometric login can be presented before PIN fallback where supported, but biometric policy is outside this specific PIN-pad scope.
- Accessibility/assistive technology must provide an equivalent secure input interaction without exposing PIN digits in spoken, copied or visible text.
- A device with compromised-integrity or an active fraud challenge may require existing step-up/deny behaviour; exact treatment **Cannot determine**.

### G1 2.7 Third party services impact

No new third-party integration is specified. Existing authentication, secure-input, device-security or identity vendors may be involved; their contracts and integration boundaries **Cannot determine**.

## G1 3 Document Management and Signature methods

### G1 3.1 Document Management/Contracts

No document or contract is created by PIN entry or PIN change.

### G1 3.2 Signature methods

The application PIN is an authentication factor, not a contract-signature method in this scope. Any payment-signature/SCA relationship must be defined separately.

### G1 3.3 Archiving rules

Reuse existing authentication and security-event retention rules. Do not archive PIN values.

## G1 4 Product catalogue and Customer impact

### G1 4.1 Product catalogue impact

No banking product catalogue change or new product approval is introduced.

### G1 4.2 Customer Base Impact

Existing registered customers receive the new PIN-entry presentation at next supported release. No product migration is required; PIN migration/reset requirements **Cannot determine**.

## G1 5 Compliance, Regulation and Security impacts

### G1 5.1 Regulatory or Compliance Requirements

The solution must comply with applicable authentication, SCA, accessibility and local security requirements. The exact regulatory interpretation and whether this PIN is used for transaction signing **Cannot determine**.

### G1 5.2 Data protection/GDPR impact

Authentication event data, device/session metadata and attempt outcomes may be personal/banking data. PIN values must not be stored or exposed by the UI, logs, screen recordings or analytics. Data retention, lawful basis and RTBF handling follow existing authentication controls.

### G1 5.3 Security requirements

- Use an approved controlled numeric input surface.
- Keep PIN values masked and out of screenshots, logs, analytics and accessibility announcements.
- Use only approved secure storage/transmission mechanisms; no plain-text PIN persistence.
- Enforce server/authoritative policy for length, attempt limits, reuse/history and weak-pattern rules.
- Clear transient entry when appropriate on backgrounding, cancellation or failure.
- Validate actual anti-keylogging, anti-overlay, root/jailbreak and screen-capture controls with Security; they are requirements to assess, not capabilities proven by this design.

### G1 5.4 Anti financial crimes requirements

The change may contribute to fraud prevention through controlled authentication input and clearer attempt handling. Specific AFC rules, fraud signals and escalation paths **Cannot determine** and remain owned by Fraud/Security.

## G1 6 Data Management and Traceability

### G1 6.1 Data Lineage

Trace authentication request, service response, attempt/lockout outcome, recovery redirect and PIN-change policy result without storing the PIN value.

### G1 6.2 Traceability

#### G1 6.2.1 Application/Proposal/Dossier status tracking and actions, reporting

Track authentication states such as entered, validating, success, incorrect, locked, recovery started, current-PIN verified, new-PIN policy rejected, confirmation mismatch and PIN changed. Do not record digit values.

#### G1 6.2.2 Versioning

PIN policy versioning/traceability is required where the policy determines an acceptance or rejection result.

#### G1 6.2.3 Operation track record

Record only approved event metadata: customer/session reference, timestamp, action, outcome, policy/version reference and error category.

#### G1 6.2.4 Logging and Audit Trail

Reuse approved authentication/audit logging. Exclude PIN values, digit sequences and recoverable PIN material.

## G1 7 Reports & KPIs, Accounting

### G1 7.1 KPIs

Potential measures: login success/failure rate, incorrect-PIN retries, lockout rate, recovery initiation/completion, PIN-change completion, weak/reused PIN rejection, abandonment and technical-validation failure. These must exclude PIN content.

### G1 7.2 Reporting

No new mandatory report is specified. Existing security/authentication reporting may use approved aggregate outcomes.

### G1 7.3 Data Feeding for Monitoring/Reporting Systems

Reuse existing approved authentication/fraud monitoring feeds; no new unapproved PIN-data feed is created.

### G1 7.4 Impacts on Accounting / Management Control / Regulatory Reporting

No accounting impact is expected.

## G1 8 Web Analytics or External Campaign Tracking

Do not track PIN content, digit count at a user level, or raw input interactions. Approved privacy-safe funnel telemetry may track screen displayed, recovery selected and final outcome category only.

## G1 9 System performance, usability and dotation

### G1 9.1 Expected Performance and SLAs

PIN validation must meet existing authentication SLA. The keypad responds immediately to a permitted tap; server validation uses clear loading and recoverable timeout state.

### G1 9.2 Process Availability

Available whenever the pre-login authentication/recovery service is available.

### G1 9.3 Access frequency by User role

Registered retail customers. No new employee role.

### G1 9.4 Volumes

Existing login and PIN-change volume applies.

### G1 9.5 Peak Times

Existing login peak patterns apply. Security limits must protect the service from repeated attempts without creating user-visible ambiguity.

### G1 9.6 Usability

- Large, reachable numeric targets and one predictable keypad layout.
- Masked progress and clear context: login, current PIN, new PIN or confirmation.
- Direct feedback that preserves privacy and does not leak sensitive policy/detail.
- Same model for login and Change PIN.
- Light/Dark, localisation, reduced-motion and screen-reader support must be verified.

### G1 9.7 Dotation (device, technological dotation required)

No new device equipment is required.

## G1 10 Test, release strategy, decommissioning

### G1 10.1 Test strategy

Test configured 6/7/8 digit policy, empty/partial entry, delete, auto/explicit submission, success, incorrect PIN and remaining attempts, lockout, recovery redirect, server timeout, backgrounding, login with biometric fallback, current/new/confirm PIN, mismatch, weak sequence, previously used PIN, policy-service error, localisation, Light/Dark, screen reader, reduced motion and no sensitive logging/capture.

### G1 10.2 Test factory

Cannot determine. UAT needs test users with controlled PIN policies, attempt counts, locked/unlocked states, recovery eligibility and PIN-history outcomes.

### G1 10.2.1 Data preparation

Prepare non-production authentication responses for all success/error/lockout states. Never place real PINs or real customer authentication secrets into test evidence.

### G1 10.3 Release strategy

Release behind the existing authentication rollout controls after Security, Identity, Accessibility and local-market approval. Provide rollback to the approved existing SIGN presentation only if technically/security approved.

### G1 10.3.1 Dependencies

- Existing authentication and PIN policy service.
- Existing recovery journey.
- Approved secure-input/device-security approach.
- Security/Fraud/Identity policy approval.
- Accessibility and localisation validation.

### G1 10.4 Decommissioning

The existing SIGN PIN-entry presentation is decommissioned/replaced by the secure PIN pad once the new flow is approved and released. No banking product is decommissioned.

