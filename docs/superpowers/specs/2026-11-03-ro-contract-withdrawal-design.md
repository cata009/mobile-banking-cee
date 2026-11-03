# RO contract withdrawal design

## Intent

Wire the existing Romania-only **Contract withdrawal** card in More to the complete withdrawal-request journey shown in Figma, using the existing Native design-system components. The customer should be able to identify a product, provide request details and contact information, review the request, acknowledge the document, sign the demo request, and see a receipt.

## Source

- Figma file: `mJlcvkjy5c195pALQyTEJd`
- Parent flow: `8245:8095` — `SBL-XXXX RO EXPERIENCE Withdraw from contract`
- Relevant screens: `8245:8135`, `8245:8337`, `8245:8429`, `8245:8490`, `8245:8520`, `8245:8264`, `8245:8282`, `8245:8453`, `8245:8471`, `8245:8373`, `8245:8392`, `8245:8410`, `8245:8905`, `8245:8980`, `8245:9001`, `8245:9011`, `8245:9166`, `8245:9211`.
- The Figma file presents three paths: UniCredit Bank single product, UniCredit Bank package, and UniCredit Consumer Financing product.

## Scope and constraints

- Launch only from the existing `my-requests` More card when `country === 'RO'`; other markets keep their current routes and cards.
- Keep the flow inside the current More composition as a local overlay. Do not add a global Native route for a Romania-only More journey.
- Keep branch transitions and required-field checks in a plain feature model; the Native screen owns composition and rendering.
- Reuse the implemented Native components: `BaselineBottomSheet`, `BaselinePageHeader`, `BaselineNavigationRow`, `BaselineDropdownField`, `BaselineTextField`, `DateField`, `BaselineSectionDivider`, `BaselineBanner`, `ToggleButton`, and `PrimaryButton`. The Figma library's `Dropdown field` is represented by the verified `BaselineDropdownField` implementation (`ui.dropdown-field`). Figma's generic `List` variants have no direct Code Connect mapping in this file; use the existing navigation-row/account-information primitives for the concrete interactive and summary rows without claiming a separate List implementation.
- Use the Figma `image 126` photo at node `8245:8151` for the intro illustration. Its original PNG is stored at `src/assets/pi/ro/contract-withdrawal/intro.png` (1264×723; SHA-256 `D9A3561E66BF77E56AB7DDE809B9BBA791D67B3E764D1DDC30F92772FD100FC1`). Reuse current More-card artwork as-is.
- Submission, PIN signing, and the PDF page are deterministic demo behavior. No bank API, document service, or real financial request is available in this checkout.
- Capture contract date and distribution channel, but do not make a legal eligibility decision in the client. The Figma sends the request for bank review. Directive (EU) 2023/2673 specifies 14 calendar days for distance financial-service contracts, with the period potentially starting later when contract terms and required information are received; product-specific exceptions and bank policy require bank validation. See [EUR-Lex, Directive (EU) 2023/2673](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023L2673).
- Keep all existing user edits outside the owned paths intact. Do not deploy this update; the user asked to accumulate changes instead of deploying each change.

## Approaches considered

1. **Local More overlay with a feature state model (chosen).** Matches the Figma entry overlay, keeps the capability attached to the existing Romania-only card, and avoids changing global Native route contracts.
2. **New global Native route.** Would make a country-specific More journey visible to every route registry and require extra contracts and fallback screens without adding value to this entry point.
3. **Bank submission integration.** The repository contains no withdrawal-request endpoint or bank document/PIN service, so a real submission cannot be implemented from the available interfaces.

## Flow behavior

1. More card opens the Figma intro in the shared Native bottom-sheet portal, sized to the active viewport. The body scrolls while the primary action stays visible; close returns to More.
2. Source choice branches to UniCredit Bank or UniCredit Consumer Financing.
3. UniCredit Bank chooses single product or package. Single product then chooses a product category; package continues to package details. UniCredit Consumer Financing chooses credit card, cash loan, or credit-life insurance.
4. Product details collect an identifier (where applicable), contract/request date, request channel, and optional contract reference. Card details also show the Figma information banner.
5. Contact information confirms the demo customer and allows email correction.
6. Review shows the selected values and requires the customer's declaration. Confirm opens the PDF preview; “I agree” returns to the final review with the declaration retained.
7. Final review continues to a six-digit demo PIN screen. A valid PIN leads to the success receipt; “Ok, I got it” returns to More.
8. Back navigation preserves the draft and follows the branch-specific previous step. Closing the intro or finishing the receipt exits the flow.

## Data and validation

- Populate account/card identifiers from the current Romania demo products where those product types exist; retain clearly labelled demo examples for package and Consumer Financing products not represented in the mock product store.
- Require a product identifier where the chosen product type has one, a valid date, a request channel, and a valid contact email. Contract reference remains optional, matching the Figma helper text.
- Require the declaration before the PDF preview, retain acceptance after “I agree”, and require six PIN digits before the demo receipt.
- Do not reject the request solely because the entered contract date is older than 14 days; the app does not know when the required terms/information were received or which product exception applies.

## Acceptance

1. RO More opens the flow; non-RO More never exposes or opens it.
2. All three Figma branches reach the same contact, review, PDF, PIN, and receipt sequence.
3. Required-field and consent gates match the flow; optional reference may be blank; Back preserves entered data.
4. Product summary on review reflects the selected branch and form data.
5. Existing components and original Figma photo are used; no temporary Figma asset URL remains in the app.
6. No external request is sent and no new deployment is triggered.
