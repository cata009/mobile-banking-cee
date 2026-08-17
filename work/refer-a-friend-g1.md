# G1 - Mobile Banking CEE - Refer a Friend

**Document status:** Working DF specification for review and estimation  
**Design reference:** [Figma Refer a friend flow](https://www.figma.com/design/d2TyUaQNN6YsgznQaWymIR/CEE---Mobile-First---Enhanced?node-id=24014-357430&t=Fr2Vcw143wDHR6LN-1)

## G1 1 Initiative overview and scope

### G1 1.1 Scope and expected impacts and benefits

Refer a Friend is a mobile referral-program experience that lets an eligible customer share a personal referral code or link, understand the relevant campaign conditions, follow invite progress, and see earned rewards. A customer who has been invited can also enter and apply another customer's referral code.

The flow makes an existing referral proposition visible and self-service in Mobile Banking rather than leaving the customer to find campaign information or obtain progress updates through support. It is a change to the existing referral-program presentation and referral-code entry process; it does not create a new current-account product.

**Changes in scope.**

- Surface the referral program from the More/Home promotional placement when a campaign is eligible and active.
- Present the customer's referral code with a share entry point.
- Present campaign reward information, validity period, conditions and, where available, base and extra reward tiers.
- Show active invitees with a clear status and a tap-through detail view.
- Show past invitees, their terminal/pending status and aggregate earned reward where supplied.
- Provide a recipient-side entry point to enter and apply a referral code, including validation feedback and the recipient's potential reward/conditions.
- Reuse an explicit campaign-off state that still supports referral-code sharing where applicable, without presenting inactive campaign rewards as available.

**Expected benefits.** The customer sees a clear action to invite, understands what needs to happen before a reward is earned, can self-serve progress rather than contact support, and can act on an invitation from another customer. Potential measures: referral share rate, referral-code application completion, invited-customer conversion, completion of base/extra conditions, time to reward, and referral-related support contacts.

### G1 1.2 Countries/Legal Entities impacted

The reference uses HUF amounts and campaign examples. The production country/legal-entity perimeter, campaign values, eligibility, validity dates and rollout approach **Cannot determine** from the design and must be confirmed by the referral-program owner.

### G1 1.3 Client Type & Target

Logged-in retail Mobile Banking customers who are eligible to invite friends, receive an invite, or monitor referrals. The journey must be shown only where the referral program and the relevant customer/campaign eligibility permit it.

### G1 1.4 Actors

- **Referring customer:** views their code, shares it and monitors invitations/rewards.
- **Invited customer:** receives a code/link, enters or arrives with the code, and completes the qualifying account and usage steps.
- **Referral/campaign service:** determines eligibility, code validity, reward configuration, invite lifecycle and reward status.
- **Existing account, card and digital-banking services:** provide evidence for qualifying conditions.
- **Customer support:** handles unresolved programme questions through an existing help destination.

### G1 1.5 Channels

Mobile Banking is the primary channel for discovery, sharing, applying a code and monitoring progress. The external share target is chosen by the device/customer; supported apps/channels **Cannot determine** and must use the existing operating-system share capability. Support may be handed off to existing help channels.

## G1 2 Process description

### G1 2.1 Overview

1. An eligible customer sees the Referral program entry in More/Home or opens the referral journey directly.
2. The customer lands on the active campaign view or a campaign-off/share-only view.
3. The referring customer shares their personal code/link; the invited customer signs up and completes the stated qualifying steps.
4. The referring customer checks Active invites and opens an invite detail to understand completed and outstanding conditions and the expected reward state.
5. Terminal/past invitees are visible in Past invites, with reward history where supplied.
6. A customer who was invited can choose Use a friend's referral code, enter the code and apply it; invalid-code feedback is returned in the same flow.

The process has mixed timing: code validation and status display should be near real-time where the underlying service supports it; qualifying steps and reward payout may be deferred until the campaign conditions are evidenced.

### G1 2.2 Referral programme entry and campaign state

#### G1 2.2.1 Actors

The referring customer opens the referral entry. The campaign service determines whether a campaign is active and which promotional/reward content is eligible for display.

#### G1 2.2.2 Channels

Mobile Banking More/Home placement and the in-app referral journey.

#### G1 2.2.3 Changes to be implemented

When the campaign is active, show the referral-program placement with the reward amount and a validity signal. The programme screen includes a clear Share with a friend / Your referral code entry. When the campaign is off, do not show active campaign reward messaging; retain only the permitted referral/share experience.

#### G1 2.2.4 Data impacted

Consume campaign status, campaign end date, eligible reward text/value, customer eligibility and the customer's referral-code availability. Campaign configuration ownership **Cannot determine**.

#### G1 2.2.5 Communications to customer

The placement and programme view are in-app communications. Push, email or SMS communications **Cannot determine** and are not required for the base flow.

#### G1 2.2.6 Communications to bank operators

No new operator communication is specified.

#### G1 2.2.7 Risk & Controls

Automatic eligibility and campaign-state control is required before presenting a reward or share action. Expired campaigns must not be represented as active.

#### G1 2.2.8 Unhappy Flows

- No active campaign: show the approved campaign-off/share-only state or hide the placement according to the campaign decision.
- Customer not eligible: do not expose an ineligible reward; show an approved explanatory state if required.
- Referral service unavailable: show the existing recoverable error pattern and do not display stale reward/eligibility as definitive.

### G1 2.3 Share a referral code

The programme screen presents the personal referral code and a share action. Tapping Share invokes the existing device sharing mechanism with the code/link payload. The customer does not need to manually reconstruct the invitation.

**Data:** referral-code identifier, sharable link/deep-link if supplied, campaign context and expiry/eligibility where relevant. The exact share payload, deep-link behaviour and supported receiving channels **Cannot determine**.

### G1 2.4 Referral conditions and reward logic

The flow explains the sequence needed to earn a reward: invite/share the code, the friend opens an eligible account, activates the debit card and digital banking, then completes the required usage conditions. The design also demonstrates a conditional extra-reward tier such as a higher monthly incoming amount.

Reward values in Figma are examples only. Production calculation, account eligibility, qualifying activity, timeframe, tax treatment, caps, reward recipient, payment timing and reversal rules **Cannot determine** and must come from approved campaign rules. The UI must display only the rule/result returned by the authorised campaign/referral service.

### G1 2.5 Active invites and invite detail

#### G1 2.5.1 Active invite list

Show active invites with a named/approved display identity and status such as In progress. Tapping an invite opens the referral-progress detail. The list must not imply that a reward has been paid before the campaign service marks it as paid.

#### G1 2.5.2 Invite-progress detail

The detail view gives the referring customer a transparent condition checklist. It distinguishes:

- completed base conditions, such as eligible account opened, debit card activated, digital banking activated and usage conditions met;
- outstanding conditions and their deadline where provided;
- an optional extra-reward section;
- the outcome: in progress, completed/reward paid, or not completed/not finalised;
- a help entry point for referral-program questions.

The customer may view status but cannot manually change the invited customer's qualifying conditions.

### G1 2.6 Past invites and reward history

Past invites show historic invitation records and statuses such as Completed or Not finalised. Where available, show aggregate earned reward separately from referral status. An invite can move from active to past only based on a lifecycle event returned by the underlying service; the exact lifecycle definition **Cannot determine**.

### G1 2.7 Apply a friend's referral code

The recipient-side route offers Use a friend's referral code, a code field, Apply code action, potential reward information and the qualifying conditions. The field accepts the configured code format (the reference shows 11 digits); exact format and expiry rules **Cannot determine**.

On Apply code, validate the code and recipient eligibility through the referral service. A clear inline error, for example "The code is incorrect, please retry", must be returned for invalid/non-usable codes without losing the entered value unless security rules require otherwise.

### G1 2.8 Channel specificity Vs standard workflow

The internal referral view is Mobile Banking only. Sharing continues through the device's existing share surface; it may hand off to external apps, which are outside the bank's screen control. The recipient may arrive through a shared link or manually enter a code; both must resolve to the same referral validation and campaign rules.

### G1 2.9 Special cases Vs standard workflow

- Campaign active versus campaign off.
- Customer has zero active/past invites.
- Reward conditions partly completed, fully completed, expired, rejected or awaiting finalisation.
- Base reward earned while the extra condition remains outstanding.
- Referral code is missing, invalid, expired, already used or recipient is not eligible.
- Invitee personal-data visibility is restricted by campaign/privacy rules; display only approved identity/status data.

### G1 2.10 Third party services impact

No new third-party service is defined. The operating-system share capability is reused. External social/messaging apps are only destinations selected by the customer and must not become a system of record. Any deep-link provider, referral vendor or customer-communication platform **Cannot determine**.

## G1 3 Document Management and Signature methods

### G1 3.1 Document Management/Contracts

No new customer contract is created by the referral UI. Approved campaign terms, disclosures and help content must remain accessible through existing document/help mechanisms where required.

### G1 3.2 Signature methods

No document signature is introduced by the proposed mobile experience. Any acceptance required by local campaign terms **Cannot determine**.

### G1 3.3 Archiving rules

Reuse existing retention requirements for campaign configuration, referral-code application, qualification evidence and reward payment records.

## G1 4 Product catalogue and Customer impact

### G1 4.1 Product catalogue impact

No new banking product is created. The initiative presents an existing referral campaign and can drive acquisition of eligible retail products defined by campaign rules.

### G1 4.2 Customer Base Impact

Eligible retail customers gain an in-app self-service referral view. Existing customer products, balances and account contracts are unchanged. No customer migration is defined.

## G1 5 Compliance, Regulation and Security impacts

### G1 5.1 Regulatory or Compliance Requirements

Campaign eligibility, reward disclosures, validity periods, marketing consent, local promotion rules and consumer-information requirements must be confirmed per country. The UI must reflect approved legal/campaign content rather than encode unapproved terms.

### G1 5.2 Data protection/GDPR impact

The journey processes banking and personal data: referrer identity, referral code, invite status, campaign eligibility and reward status. Invitee data shown to the referrer must be limited to the approved minimum; detailed account/transaction data must never be exposed. The lawful basis, retention, subject-right handling and exact display-name policy **Cannot determine**.

### G1 5.3 Security requirements

Referral codes must be generated, validated and associated server-side. Deep links must not expose sensitive customer data. The app must prevent a customer from viewing or altering another customer's qualification data. Reuse authenticated-session, rate-limit and anti-abuse controls.

### G1 5.4 Anti financial crimes requirements

Potential fraud/abuse controls, self-referral prevention, duplicate-device checks, reward caps and sanctions/AFC implications **Cannot determine**. They must be confirmed by the relevant control owners before release.

## G1 6 Data Management and Traceability

### G1 6.1 Data Lineage

Traceability is required from referral code/link, campaign configuration and eligibility through invite creation, condition events, lifecycle status and reward outcome. This is necessary to explain customer-visible progress and a paid/not-paid result.

### G1 6.2 Traceability

#### G1 6.2.1 Application/Proposal/Dossier status tracking and actions, reporting

Track at minimum: campaign state, code validation result, invite status, each qualification condition status, deadline, base/extra reward eligibility and reward payment outcome. Status changes are driven by referral/campaign and qualifying product events, not by the referring customer's UI action.

#### G1 6.2.2 Versioning

Campaign configuration and terms must be versioned or otherwise reproducible so that a historical reward result can be explained against the applicable rules.

#### G1 6.2.3 Operation track record

Record share invocation where approved, referral-code application attempt/result, invitation lifecycle, qualifying events and reward payout/reversal outcomes.

#### G1 6.2.4 Logging and Audit Trail

Reuse approved security/audit logging for customer ID, timestamp, campaign/version, action, referral-code validation result and affected referral record. Do not log full referral codes in client-visible logs.

## G1 7 Reports & KPIs, Accounting

### G1 7.1 KPIs

Suggested measures: exposure-to-share conversion, code application completion, invalid-code rate, active invite count, qualification-step completion, completed invite rate, time to reward, base versus extra reward attainment, reward payout/reversal and support-contact rate.

### G1 7.2 Reporting

Existing campaign/referral reporting may be extended to include the above funnel and lifecycle measures. New report ownership and cadence **Cannot determine**.

### G1 7.3 Data Feeding for Monitoring/Reporting Systems

Feed the campaign/referral record, lifecycle events, qualifying condition evidence and payout result to existing approved monitoring/reporting systems where available.

### G1 7.4 Impacts on Accounting / Management Control / Regulatory Reporting

Reward payout accounting and tax/reporting treatment are governed by existing or approved campaign finance processes. Changes **Cannot determine** and must be confirmed with Finance/Compliance.

## G1 8 Web Analytics or External Campaign Tracking

Measure approved in-app funnel events: referral entry viewed, share tapped, code screen viewed, code applied, validation outcome, active/past invite viewed and invite detail viewed. External-share conversion attribution must respect consent and privacy requirements.

## G1 9 System performance, usability and dotation

### G1 9.1 Expected Performance and SLAs

Referral status, code validation and campaign content should use existing service performance expectations. The UI must clearly differentiate real-time validation from deferred qualification/reward updates.

### G1 9.2 Process Availability

Available through Mobile Banking subject to existing authentication, referral service and campaign availability.

### G1 9.3 Access frequency by User role

Retail customer self-service; no new bank-operator role is introduced.

### G1 9.4 Volumes

Cannot determine. Estimate based on country campaign reach and historical referral performance.

### G1 9.5 Peak Times

Campaign launches and closing dates may create peaks. The platform should handle share/code-validation bursts under existing service controls.

### G1 9.6 Usability

- Explain reward conditions in plain language and separate base from extra reward.
- Use clear, non-technical invite statuses with a direct drill-down.
- Do not present a reward as paid until the service confirms payment.
- Preserve code-entry value on recoverable validation error.
- Make campaign-off and no-invite states explicit rather than showing an empty/ambiguous page.
- Meet existing Light/Dark, localisation and accessibility requirements.

### G1 9.7 Dotation (device, technological dotation required)

No new device or employee equipment is required.

## G1 10 Test, release strategy, decommissioning

### G1 10.1 Test strategy

Test campaign active/off, eligible/ineligible referrer and recipient, share invocation, manual/deep-link code entry, valid/invalid/expired/already-used codes, zero/one/many active and past invites, every qualification condition state, base/extra reward, paid/not-paid/not-finalised, deadline, privacy-restricted identity, service failure, localisation, accessibility and Light/Dark themes.

### G1 10.2 Test factory

Cannot determine. UAT needs controlled campaign versions, referral codes, customers/invites at every lifecycle state and simulated qualifying events/reward results.

### G1 10.2.1 Data preparation

Prepare non-production fixtures for active/off campaigns, current/expired terms, valid/invalid codes, no invitees, in-progress/completed/not-finalised invitees, base-only and base-plus-extra rewards.

### G1 10.3 Release strategy

Release per country only after campaign-rule, legal, privacy, fraud/abuse, service and support-content approvals. Feature visibility must be configurable by campaign/country/eligibility.

### G1 10.3.1 Dependencies

- Referral/campaign configuration and code-validation service.
- Eligibility and qualifying-event feeds from account, card and digital-banking services.
- Reward payout/status service.
- Existing share/deep-link capability and approved help content.
- Legal, compliance, privacy, fraud/abuse and Finance confirmation of rules.

### G1 10.4 Decommissioning

No existing banking product or service is decommissioned. Any replacement of a legacy referral communication flow **Cannot determine**.

