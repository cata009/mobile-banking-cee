# Romanian baseline onboarding: Figma coverage audit

Owner: Codex. Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`. Base commit: `d5889198ada291354c85b3d2fd6d536b5cb5d035`.

Scope: PI Romania Baseline. Preserve the complete baseline journey; apply the CR as changes to its affected screens and branches, not as a replacement journey.

Cash Loan extension (same owner and checkout): source section `9453:159644`. Initial pending changes at extension start were the onboarding files recorded by this audit; no unrelated editor is active. Owned additions include `src/features/ro-cash-loan/`, `src/flows/ro/cash-loan/`, native `CashLoan*.tsx` compositions in the existing baseline auth directory, their tests/assets, and this audit. Shared integration changes remain owned by Codex: inactive prelogin, Flow Library registration/preview/source metadata and the shared onboarding controller/session. No Git index mutation or publication is authorized.

Reuse mapping: header → BaselinePageHeader; inputs → BaselineTextField/DropdownField/CodeField; amount/period → existing spin/slider primitives; agreements → ToggleButton/Checkbox; document reader → OnboardingDocumentSheet; identification/contacts/address/selfie → existing onboarding pages; cards/delivery/questionnaire/branch → existing onboarding compositions with source-specific configuration. New compositions cover only credit agreements, income, offer/refinancing, uploads, contract list and feedback differences.

Sources: baseline section `9852:63285`; CR section `6216:87322`, both in Figma file `bM3r8YmHuaIDXFFgsPhvDY`.

Source review: design context and extracted copy were retrieved for all 471 phone frames (167 baseline, 102 CR and 202 Cash Loan). **Source reviewed** identifies that evidence; it does not assert an individual pixel comparison. Section headings preserve source grouping. Runtime variants are consolidated into the executable state matrix below, with the CR superseding affected older baseline states.

## Baseline

| Source node | Frame | Size | Canvas position | Status |
|---|---|---|---|---|
| [9852:65534](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65534) | Frame 6358554 | 376×223 | 260, 628 | Context / heading |
| [9852:65519](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65519) | New Pre Login - Inactive | 375×812 | 261, 1046 | Source reviewed |
| [9852:65524](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65524) | New Pre Login - Inactive | 375×812 | 261, 2037 | Source reviewed |
| [9852:65536](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65536) | Frame 1010110491 | 1205×223 | 936, 628 | Context / heading |
| [10164:109267](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-109267) | 01 - Product information - CA opening | 375×948 | 936, 1045 | Source reviewed; rendered comparison |
| [9852:83344](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-83344) | 01 - Product information - CA opening | 375×1077 | 1351, 1045 | Source reviewed |
| [9852:83627](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-83627) | 01 - Product information - CA opening | 375×1205 | 1766, 1045 | Source reviewed |
| [9852:65538](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65538) | Frame 1010110492 | 1205×223 | 2441, 628 | Context / heading |
| [9852:70931](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70931) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×812 | 2441, 1046 | Source reviewed |
| [9852:71071](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-71071) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×812 | 2441, 1938 | Source reviewed |
| [9852:70966](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70966) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×812 | 2856, 1046 | Source reviewed |
| [11474:44888](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=11474-44888) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×812 | 2856, 1938 | Source reviewed |
| [9852:83830](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-83830) | 01 - Product information - CA opening | 375×965 | 3271, 1046 | Source reviewed |
| [9852:84644](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-84644) | Frame 1010110497 | 1205×223 | 3946, 628 | Context / heading |
| [9852:84646](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-84646) | 01 - Product information - CA opening | 375×1142 | 3946, 1046 | Source reviewed; rendered comparison |
| [9852:90664](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-90664) | 01 - Product information - CA opening | 375×812 | 3946, 2318 | Source reviewed |
| [9852:85504](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-85504) | 01 - Product information - CA opening | 375×1136 | 4361, 1046 | Source reviewed |
| [9852:90817](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-90817) | 01 - Product information - CA opening | 375×971 | 4776, 1046 | Source reviewed |
| [9868:91023](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9868-91023) | Frame 1010110498 | 1205×223 | 5451, 628 | Context / heading |
| [9868:91687](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9868-91687) | 01 - Product information - CA opening | 375×832 | 5451, 1046 | Source reviewed; rendered comparison |
| [9868:91940](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9868-91940) | 01 - Product information - CA opening | 375×808 | 5866, 1046 | Source reviewed |
| [9868:92090](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9868-92090) | 01 - Product information - CA opening | 375×812 | 6281, 1046 | Source reviewed |
| [9868:92246](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9868-92246) | Frame 1010110499 | 790×223 | 6956, 628 | Context / heading |
| [9868:92601](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9868-92601) | 01 - Product information - CA opening | 375×812 | 6956, 1046 | Source reviewed; rendered comparison |
| [9868:92914](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9868-92914) | 01 - Product information - CA opening | 375×812 | 7371, 1046 | Source reviewed |
| [9868:93382](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9868-93382) | Frame 1010110500 | 790×223 | 8046, 628 | Context / heading |
| [9868:93384](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9868-93384) | 01 - Product information - CA opening | 375×812 | 8046, 1046 | Source reviewed |
| [9869:96560](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-96560) | 01 - Product information - CA opening | 375×812 | 8046, 1960 | Source reviewed |
| [10164:116300](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-116300) | 01 - Product information - CA opening | 375×812 | 8046, 2842 | Source reviewed |
| [9869:96764](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-96764) | 01 - Product information - CA opening | 375×812 | 8461, 1046 | Source reviewed |
| [9869:96916](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-96916) | 01 - Product information - CA opening | 375×812 | 8461, 1960 | Source reviewed |
| [10164:116446](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-116446) | 01 - Product information - CA opening | 375×812 | 8461, 2842 | Source reviewed |
| [9852:65540](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65540) | Frame 6358555 | 3280×223 | 9136, 628 | Context / heading |
| [9852:66485](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66485) | 08 - Add mobile number (default) | 375×812 | 9136, 1046 | Source reviewed |
| [10182:119010](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10182-119010) | 08 - Add mobile number (default) | 375×812 | 9136, 1938 | Source reviewed |
| [9852:70495](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70495) | 08 - Add mobile number (default) | 375×812 | 9551, 1046 | Source reviewed |
| [9852:67532](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67532) | 08 - Add mobile number (default) | 375×812 | 9551, 1938 | Source reviewed |
| [9852:66546](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66546) | 08 - Add mobile number (default) | 375×812 | 9966, 1046 | Source reviewed |
| [9852:66634](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66634) | 08 - Add mobile number (default) | 375×812 | 10381, 1046 | Source reviewed |
| [9852:66767](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66767) | 08 - Add mobile number (default) | 375×812 | 10796, 1046 | Source reviewed |
| [9852:66710](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66710) | 08 - Add mobile number (default) | 375×812 | 11211, 1046 | Source reviewed |
| [9852:66993](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66993) | 08 - Add mobile number (default) | 375×812 | 11211, 1938 | Source reviewed |
| [9852:67057](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67057) | 08 - Add mobile number (default) | 375×812 | 11211, 2830 | Source reviewed |
| [9852:67121](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67121) | 08 - Add mobile number (default) | 375×764 | 11211, 3730 | Source reviewed |
| [9852:67155](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67155) | 08 - Add mobile number (default) | 375×744 | 11211, 4614 | Source reviewed |
| [9852:66829](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66829) | 08 - Add mobile number (default) | 375×812 | 11626, 1046 | Source reviewed |
| [9852:66877](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66877) | 08 - Add mobile number (default) | 375×812 | 12041, 1046 | Source reviewed |
| [9852:66935](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66935) | 08 - Add mobile number (default) | 375×812 | 12041, 1938 | Source reviewed |
| [9852:66574](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66574) | 08 - Add mobile number (default) | 375×812 | 12041, 2830 | Source reviewed |
| [9852:63286](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63286) | 08 - Add mobile number (default) | 375×812 | 12041, 3722 | Source reviewed |
| [9852:63314](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63314) | 08 - Add mobile number (default) | 375×812 | 12041, 4614 | Source reviewed |
| [9852:65542](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65542) | Frame 6358556 | 3280×223 | 12716, 628 | Context / heading |
| [9852:67245](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67245) | 08 - Add mobile number (default) | 375×812 | 12716, 1046 | Source reviewed |
| [10182:119624](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10182-119624) | 08 - Add mobile number (default) | 375×812 | 12716, 1938 | Source reviewed |
| [9852:67290](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67290) | 08 - Add mobile number (default) | 375×812 | 13131, 1046 | Source reviewed |
| [9852:67311](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67311) | 08 - Add mobile number (default) | 375×812 | 13131, 1938 | Source reviewed |
| [9852:67428](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67428) | 08 - Add mobile number (default) | 375×812 | 13546, 1046 | Source reviewed |
| [9852:67456](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67456) | 08 - Add mobile number (default) | 375×812 | 13961, 1046 | Source reviewed |
| [9852:66798](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66798) | 08 - Add mobile number (default) | 375×812 | 14376, 1046 | Source reviewed |
| [9852:66736](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66736) | 08 - Add mobile number (default) | 375×868 | 14791, 1046 | Source reviewed |
| [9852:67025](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67025) | 08 - Add mobile number (default) | 375×812 | 14791, 2000 | Source reviewed |
| [9852:67089](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67089) | 08 - Add mobile number (default) | 375×812 | 14791, 2892 | Source reviewed |
| [9852:67211](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67211) | 08 - Add mobile number (default) | 375×812 | 14791, 3792 | Source reviewed |
| [9852:67183](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67183) | 08 - Add mobile number (default) | 375×812 | 14791, 4676 | Source reviewed |
| [9852:66853](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66853) | 08 - Add mobile number (default) | 375×812 | 15206, 1046 | Source reviewed |
| [9852:66906](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66906) | 08 - Add mobile number (default) | 375×812 | 15621, 1046 | Source reviewed |
| [9852:66964](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66964) | 08 - Add mobile number (default) | 375×812 | 15621, 2000 | Source reviewed |
| [9852:66604](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66604) | 08 - Add mobile number (default) | 375×812 | 15621, 2892 | Source reviewed |
| [9852:63300](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63300) | 08 - Add mobile number (default) | 375×812 | 15621, 3792 | Source reviewed |
| [9852:63332](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63332) | 08 - Add mobile number (default) | 375×812 | 15621, 4676 | Source reviewed |
| [9852:63350](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63350) | Frame 6358553 | 790×223 | 16296, 618 | Context / heading |
| [9852:67980](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67980) | Leave screen | 375×812 | 16296, 1036 | Source reviewed |
| [9852:68038](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68038) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 16296, 1938 | Source reviewed |
| [9852:68023](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68023) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 16711, 1036 | Source reviewed |
| [9869:97909](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-97909) | Frame 1010110503 | 790×223 | 17386, 618 | Context / heading |
| [9869:98028](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-98028) | 08 - Add mobile number (default) | 375×812 | 17386, 1036 | Source reviewed |
| [9869:98156](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-98156) | 08 - Add mobile number (default) | 375×812 | 17801, 1036 | Source reviewed |
| [9869:98518](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-98518) | Frame 1010110505 | 375×223 | 18476, 618 | Context / heading |
| [9869:99361](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-99361) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 18476, 1036 | Source reviewed |
| [9869:99594](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-99594) | Frame 1010110506 | 375×210 | 19151, 618 | Context / heading |
| [9869:99592](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-99592) | 18 - PreContractual docs | 375×805 | 19151, 1036 | Source reviewed |
| [9852:65544](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65544) | Frame 6358557 | 1620×223 | 19826, 628 | Context / heading |
| [9852:67606](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67606) | KO-Quit the same day | 375×812 | 19826, 1046 | Source reviewed |
| [9852:67668](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67668) | KO-Quit the same day | 375×812 | 19826, 1942 | Source reviewed |
| [9852:67637](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67637) | KO-Quit the same day | 375×812 | 20241, 1046 | Source reviewed |
| [9852:67993](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67993) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 20656, 1046 | Source reviewed |
| [9852:68008](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68008) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 21071, 1046 | Source reviewed |
| [9852:68065](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68065) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 21071, 1942 | Source reviewed |
| [9852:65546](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65546) | Frame 6358558 | 2462×223 | 21746, 628 | Context / heading |
| [9852:63352](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63352) | 08 - Add mobile number (default) | 375×831 | 21758, 1046 | Source reviewed |
| [9852:65186](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65186) | 08 - Add mobile number (default) | 375×831 | 21758, 1997 | Source reviewed |
| [9869:100898](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-100898) | 08 - Add mobile number (default) | 375×812 | 21758, 2966 | Source reviewed |
| [9852:63383](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63383) | 08 - Add mobile number (default) | 375×905 | 22173, 1046 | Source reviewed |
| [9869:101219](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-101219) | 08 - Add mobile number (default) | 375×812 | 22588, 1046 | Source reviewed |
| [9852:65294](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65294) | M2_2.07 riepilogo foto 12 | 375×812 | 23003, 1046 | Source reviewed |
| [9852:65217](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65217) | 08 - Add mobile number (default) | 375×812 | 23003, 1942 | Source reviewed |
| [9852:65276](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65276) | M2_2.07 riepilogo foto 11 | 375×812 | 23418, 1046 | Source reviewed |
| [9852:65230](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65230) | 08 - Add mobile number (default) | 375×812 | 23418, 1942 | Source reviewed |
| [9852:65494](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65494) | M2_2.07 riepilogo foto 13 | 375×812 | 23833, 1046 | Source reviewed |
| [9852:65243](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65243) | 08 - Add mobile number (default) | 375×812 | 23833, 1942 | Source reviewed |
| [9852:65259](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65259) | 08 - Add mobile number (default) | 375×812 | 23833, 2830 | Source reviewed |
| [9852:65548](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65548) | Frame 1010110490 | 1620×223 | 24508, 628 | Context / heading |
| [9852:65020](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65020) | 08 - Add mobile number (default) | 375×905 | 24508, 1055 | Source reviewed |
| [9852:63718](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63718) | 08 - Add mobile number (default) | 375×1163 | 24508, 2301 | Source reviewed |
| [9852:65106](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65106) | 08 - Add mobile number (default) | 375×1013 | 24923, 1055 | Source reviewed |
| [9852:65146](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65146) | 08 - Add mobile number (default) | 375×1125 | 25338, 1056 | Source reviewed |
| [9852:65054](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65054) | 28 - Data recap -Address (residence diffferent, 2) | 375×1765 | 25338, 2301 | Source reviewed |
| [9852:63756](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63756) | Data recap (edit 4) | 375×1206 | 25753, 1046 | Source reviewed |
| [9852:65430](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65430) | Data recap (edit 4) | 375×812 | 25753, 2301 | Source reviewed |
| [16094:30296](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=16094-30296) | Select | 375×812 | 25753, 3206 | Source reviewed |
| [16094:30445](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=16094-30445) | Select | 375×812 | 25753, 4111 | Source reviewed |
| [9852:65550](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65550) | Frame 6358560 | 2450×223 | 26428, 628 | Context / heading |
| [9852:63588](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63588) | 29 - Video selfie (guidelines & consent) | 375×812 | 26428, 1046 | Source reviewed |
| [10164:117699](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-117699) | 29 - Video selfie (guidelines & consent) | 375×812 | 26428, 2301 | Source reviewed |
| [9852:65511](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65511) | Identification | 375×667 | 26843, 1046 | Source reviewed |
| [10164:117922](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-117922) | 29 - Video selfie (guidelines & consent) | 375×812 | 26843, 2301 | Source reviewed |
| [9852:65513](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65513) | 32 - Identification - smile | 375×667 | 27258, 1046 | Source reviewed |
| [9852:65515](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65515) | 33 - Identification - waiting | 375×667 | 27673, 1046 | Source reviewed |
| [9852:65517](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65517) | 33B - Face recon - error | 375×667 | 28088, 1046 | Source reviewed |
| [9852:63482](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63482) | 34 - Identification successful | 375×812 | 28503, 1046 | Source reviewed |
| [9852:63573](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63573) | 08 - Add mobile number (default) | 375×812 | 28503, 2301 | Source reviewed |
| [9852:69222](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-69222) | Frame 6358591 | 2035×223 | 29178, 628 | Context / heading |
| [9852:70017](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70017) | 48 - Card address (physical&digital, new one, default) | 375×812 | 29178, 1046 | Source reviewed |
| [10182:120112](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10182-120112) | 48 - Card address (physical&digital, new one, default) | 375×812 | 29178, 1969 | Source reviewed |
| [10182:120762](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10182-120762) | 48 - Card address (physical&digital, new one, default) | 375×812 | 29178, 2892 | Source reviewed |
| [9852:70187](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70187) | 48 - Card address (physical&digital, new one, default) | 375×812 | 29593, 1046 | Source reviewed |
| [10182:120315](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10182-120315) | 48 - Card address (physical&digital, new one, default) | 375×812 | 29593, 1969 | Source reviewed |
| [9852:70052](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70052) | 48 - Card address (physical&digital, new one, default) | 375×812 | 29593, 2892 | Source reviewed |
| [9852:70212](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70212) | 48 - Card address (physical&digital, new one, default) | 375×812 | 30008, 1046 | Source reviewed |
| [9852:70279](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70279) | 48 - Card address (physical&digital, new one, default) | 375×812 | 30008, 1969 | Source reviewed |
| [24197:26351](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=24197-26351) | 48 - Card address (physical&digital, new one, default) | 375×830 | 30423, 1046 | Source reviewed |
| [9852:70330](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70330) | 48 - Card address (physical&digital, new one, default) | 375×812 | 30423, 1969 | Source reviewed |
| [9852:70237](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-70237) | 48 - Card address (physical&digital, new one, default) | 375×908 | 30838, 1046 | Source reviewed |
| [9852:69515](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-69515) | Frame 6358592 | 1620×223 | 31513, 628 | Context / heading |
| [9852:69345](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-69345) | Select branch | 375×812 | 31513, 1046 | Source reviewed |
| [9930:56775](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-56775) | Select branch | 375×812 | 31928, 1046 | Source reviewed |
| [16094:74408](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=16094-74408) | Select branch | 375×812 | 32343, 1046 | Source reviewed |
| [16094:74742](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=16094-74742) | Select branch | 375×812 | 32758, 1046 | Source reviewed |
| [9852:68119](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68119) | Frame 6358579 | 375×224 | 33433, 628 | Context / heading |
| [9852:63549](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-63549) | KO SCREEN | 375×812 | 33433, 1046 | Source reviewed |
| [9930:82941](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-82941) | Frame 1010110509 | 790×224 | 34108, 628 | Context / heading |
| [9930:82904](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-82904) | 34 - Identification successful | 375×812 | 34108, 1046 | Source reviewed |
| [10164:114434](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-114434) | KO-Quit the same day | 375×812 | 34108, 2107 | Source reviewed |
| [10164:114496](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-114496) | KO-Quit the same day | 375×812 | 34108, 3003 | Source reviewed |
| [9930:82957](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-82957) | 34 - Identification successful | 375×812 | 34523, 1046 | Source reviewed |
| [10164:114465](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-114465) | KO-Quit the same day | 375×812 | 34523, 2107 | Source reviewed |
| [10164:115153](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-115153) | KO-Quit the same day | 375×812 | 34523, 3003 | Source reviewed |
| [9852:68095](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68095) | Frame 6358566 | 790×223 | 35198, 628 | Context / heading |
| [9852:67331](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67331) | RO_Marketing consent (default) | 375×1061 | 35198, 1046 | Source reviewed |
| [9852:67368](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67368) | RO_Marketing consent (default) | 375×1566 | 35613, 1046 | Source reviewed |
| [9852:68137](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68137) | Frame 6358588 | 2035×224 | 36288, 628 | Context / heading |
| [9852:68496](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68496) | Card selection | 375×812 | 36288, 1046 | Source reviewed |
| [9930:84096](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-84096) | 01 - Product information - CA opening | 375×812 | 36288, 2289 | Source reviewed |
| [9852:68376](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68376) | Card selection | 375×886 | 36703, 1046 | Source reviewed |
| [10182:118595](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10182-118595) | 01 - Product information - CA opening | 375×812 | 36703, 2289 | Source reviewed |
| [9930:89016](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-89016) | Card selection | 375×812 | 36703, 3202 | Source reviewed |
| [9852:68256](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68256) | Card selection | 375×937 | 37118, 1046 | Source reviewed |
| [9852:69772](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-69772) | 48 - Card address (physical&digital, new one, default) | 375×812 | 37533, 1046 | Source reviewed |
| [9930:86930](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-86930) | 48 - Card address (physical&digital, new one, default) | 375×812 | 37533, 2289 | Source reviewed |
| [10164:115969](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10164-115969) | 48 - Card address (physical&digital, new one, default) | 375×812 | 37533, 3202 | Source reviewed |
| [9852:69892](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-69892) | 48 - Card address (physical&digital, new one, default) | 375×1060 | 37948, 1047 | Source reviewed |
| [9930:87742](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-87742) | 48 - Card address (physical&digital, new one, default) | 375×812 | 37948, 2289 | Source reviewed |
| [9930:89335](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-89335) | 48 - Card address (physical&digital, new one, default) | 375×812 | 37948, 3202 | Source reviewed |
| [9852:68123](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68123) | Frame 6358581 | 375×224 | 38623, 628 | Context / heading |
| [9852:69307](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-69307) | WA - Waiting Screen | 375×812 | 38623, 1046 | Source reviewed |
| [9852:69318](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-69318) | WA - Waiting Screen | 375×812 | 38623, 1960 | Source reviewed |
| [9852:68125](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68125) | Frame 1010110494 | 3761×224 | 39298, 628 | Context / heading |
| [9852:65841](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65841) | 01 - Product information - CA opening | 375×812 | 39298, 1046 | Source reviewed |
| [9930:91723](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-91723) | 01 - Product information - CA opening | 375×916 | 39298, 1960 | Source reviewed |
| [9852:65910](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65910) | 01 - Product information - CA opening | 375×812 | 39713, 1046 | Source reviewed |
| [9852:65999](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65999) | 01 - Product information - CA opening | 375×812 | 40128, 1046 | Source reviewed |
| [9930:91610](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-91610) | 01 - Product information - CA opening | 375×812 | 40543, 1046 | Source reviewed |
| [9852:65303](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65303) | Sign documentation - insert OTP (default) | 375×812 | 41439, 1046 | Source reviewed |
| [9852:65345](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65345) | Sign documentation - insert OTP (default) | 375×812 | 41439, 1937 | Source reviewed |
| [9852:65324](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65324) | Sign documentation - insert OTP (default) | 375×812 | 41854, 1046 | Source reviewed |
| [9852:65816](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65816) | 34 - Identification successful | 375×812 | 42269, 1046 | Source reviewed |
| [9930:91985](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-91985) | 01 - Product information - CA opening | 375×812 | 42684, 1046 | Source reviewed |
| [9852:68129](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-68129) | Frame 6358583 | 790×224 | 43359, 628 | Context / heading |
| [9852:66202](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66202) | 52- Sign contract (Success messgae)  | 375×812 | 43359, 1046 | Source reviewed |
| [9852:66231](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66231) | 52- Sign contract (Success messgae)  | 375×812 | 43774, 1046 | Source reviewed |
| [9852:65554](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65554) | Frame 6358562 | 375×223 | 44449, 628 | Context / heading |
| [9852:66171](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-66171) | 52- Sign contract (Success messgae)  | 375×812 | 44449, 1046 | Source reviewed |
| [9852:65558](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-65558) | Frame 1010110496 | 2460×223 | 45124, 628 | Context / heading |
| [9852:67857](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67857) | KO-Quit the same day | 375×812 | 45124, 3625 | Source reviewed |
| [9852:67755](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67755) | KO-Quit the same day | 375×812 | 45134, 1046 | Source reviewed |
| [9852:67780](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67780) | KO-Quit the same day | 375×812 | 45134, 1905 | Source reviewed |
| [9852:67811](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67811) | KO-Quit the same day | 375×812 | 45134, 2765 | Source reviewed |
| [9852:67875](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67875) | KO-Quit the same day | 375×812 | 45549, 1046 | Source reviewed |
| [9852:67698](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67698) | Expired Link | 375×812 | 45964, 1046 | Source reviewed |
| [9852:67900](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67900) | Expired Link | 375×812 | 46379, 1046 | Source reviewed |
| [9852:67724](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67724) | 08 - Add mobile number (default) | 375×812 | 46379, 1905 | Source reviewed |
| [9852:67825](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67825) | KO-Quit the same day | 375×812 | 46379, 2765 | Source reviewed |
| [9852:67839](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67839) | KO-Quit the same day | 375×812 | 46379, 3625 | Source reviewed |
| [9852:67926](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67926) | 08 - Add mobile number (default) | 375×812 | 46794, 1046 | Source reviewed |
| [9852:67954](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9852-67954) | 08 - Add mobile number (default) | 375×812 | 47209, 1046 | Source reviewed |

## CR changes

| Source node | Frame | Size | Canvas position | Status |
|---|---|---|---|---|
| [15048:98042](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-98042) | New Pre Login - Inactive | 375×812 | 221, 1425 | Source reviewed |
| [6216:92448](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6216-92448) | Frame 6358375 | 3125×210 | 230, 402 | Context / heading |
| [6216:90977](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6216-90977) | Frame 6358349 | 375×210 | 230, 709 | Context / heading |
| [6216:90979](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6216-90979) | Frame 6358350 | 2450×210 | 905, 712 | Context / heading |
| [15048:98164](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-98164) | 01 - Product information - CA opening | 375×949 | 905, 1420 | Source reviewed |
| [15048:98377](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-98377) | 08 - Add mobile number (default) | 375×812 | 1320, 1420 | Source reviewed |
| [15048:98752](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-98752) | 08 - Add mobile number (default) | 375×812 | 1735, 1420 | Source reviewed |
| [15048:98833](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-98833) | 08 - Add mobile number (default) | 375×812 | 2150, 1420 | Source reviewed |
| [15048:99410](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-99410) | 08 - Add mobile number (default) | 375×812 | 2150, 2402 | Source reviewed |
| [15048:99033](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-99033) | 08 - Add mobile number (default) | 375×812 | 2565, 1420 | Source reviewed |
| [15048:99870](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-99870) | 08 - Add mobile number (default) | 375×812 | 2565, 2402 | Source reviewed |
| [15048:99235](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-99235) | 08 - Add mobile number (default) | 375×812 | 2980, 1420 | Source reviewed |
| [15048:100542](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-100542) | OPTIM | 375×1366 | 2980, 2402 | Source reviewed |
| [6243:40713](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6243-40713) | Frame 6358388 | 2975×210 | 3655, 402 | Context / heading |
| [6243:40718](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6243-40718) | Frame 6358390 | 2975×210 | 3655, 712 | Context / heading |
| [15048:100897](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-100897) | OPTIM | 375×1348 | 3655, 1420 | Source reviewed |
| [15048:104081](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-104081) | OPTIM | 375×1348 | 3655, 3346 | Source reviewed |
| [15048:101151](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-101151) | OPTIM | 375×1464 | 4070, 1420 | Source reviewed |
| [15048:104588](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-104588) | OPTIM | 375×1468 | 4070, 3346 | Source reviewed |
| [27310:16122](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=27310-16122) | OPTIM | 375×1445 | 4070, 5042 | Source reviewed |
| [15048:101593](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-101593) | OPTIM | 375×1524 | 4485, 1420 | Source reviewed |
| [15048:105241](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-105241) | OPTIM | 375×1524 | 4485, 3346 | Source reviewed |
| [27313:16562](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=27313-16562) | Card selection | 375×912 | 4485, 5042 | Source reviewed |
| [15048:102173](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-102173) | OPTIM | 375×1574 | 4900, 1420 | Source reviewed |
| [15048:105923](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-105923) | 08 - Add mobile number (default) | 375×812 | 4900, 3346 | Source reviewed |
| [27313:22082](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=27313-22082) | Card selection | 375×912 | 4900, 5042 | Source reviewed |
| [27313:20896](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=27313-20896) | 48 - Card address (physical&digital, new one, default) | 375×842 | 5315, 5042 | Source reviewed |
| [27313:20311](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=27313-20311) | 48 - Card address (physical&digital, new one, default) | 375×842 | 5730, 5042 | Source reviewed |
| [15048:102794](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-102794) | OPTIM | 375×1354 | 5840, 1420 | Source reviewed |
| [15048:106857](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-106857) | OPTIM | 375×1246 | 5840, 3346 | Source reviewed |
| [27313:17324](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=27313-17324) | 48 - Card address (physical&digital, new one, default) | 375×812 | 6145, 5042 | Source reviewed |
| [15048:103437](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-103437) | OPTIM | 375×1530 | 6255, 1420 | Source reviewed |
| [27313:17464](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=27313-17464) | 48 - Card address (physical&digital, new one, default) | 375×812 | 6560, 5042 | Source reviewed |
| [27313:17596](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=27313-17596) | 48 - Card address (physical&digital, new one, default) | 375×1060 | 6975, 5042 | Source reviewed |
| [6216:92458](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6216-92458) | Frame 6358380 | 2035×210 | 7062, 402 | Context / heading |
| [6216:90999](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6216-90999) | Frame 6358360 | 2035×210 | 7062, 712 | Context / heading |
| [15048:108639](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-108639) | 48 - Card address (physical&digital, new one, default) | 375×812 | 7062, 1400 | Source reviewed |
| [15048:107258](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-107258) | 48 - Card address (physical&digital, new one, default) | 375×812 | 7062, 2400 | Source reviewed |
| [15048:108724](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-108724) | 48 - Card address (physical&digital, new one, default) | 375×812 | 7477, 1400 | Source reviewed |
| [15048:107685](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-107685) | 48 - Card address (physical&digital, new one, default) | 375×812 | 7477, 2400 | Source reviewed |
| [15048:107467](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-107467) | 48 - Card address (physical&digital, new one, default) | 375×812 | 7892, 1400 | Source reviewed |
| [15048:107749](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-107749) | 48 - Card address (physical&digital, new one, default) | 375×812 | 7892, 2400 | Source reviewed |
| [15048:107822](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-107822) | 48 - Card address (physical&digital, new one, default) | 375×844 | 8307, 1400 | Source reviewed |
| [15048:107561](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-107561) | 48 - Card address (physical&digital, new one, default) | 375×1000 | 8307, 2400 | Source reviewed |
| [15048:107506](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-107506) | 48 - Card address (physical&digital, new one, default) | 375×908 | 8722, 1400 | Source reviewed |
| [15048:107623](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-107623) | 48 - Card address (physical&digital, new one, default) | 375×1000 | 8722, 2400 | Source reviewed |
| [6482:51694](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6482-51694) | Frame 6358393 | 16266×210 | 9464, 402 | Context / heading |
| [6482:51699](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6482-51699) | Frame 6358395 | 16266×210 | 9464, 712 | Context / heading |
| [7195:75809](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7195-75809) | Frame 6358493 | 3695×83 | 9469, 1022 | Context / heading |
| [7195:75804](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7195-75804) | Frame 6358491 | 3695×83 | 9469, 1172 | Context / heading |
| [15048:114903](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-114903) | Card selection | 375×812 | 9469, 1482 | Source reviewed |
| [15048:115168](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-115168) | Card selection | 375×812 | 9884, 1482 | Source reviewed |
| [7195:114103](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7195-114103) | Frame 6358494 | 1620×83 | 9884, 3008 | Context / heading |
| [15048:115433](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-115433) | Card selection | 375×812 | 9884, 3312 | Source reviewed |
| [7195:114105](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7195-114105) | Frame 6358495 | 1620×83 | 9884, 4409 | Context / heading |
| [15048:116975](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-116975) | Card selection | 375×812 | 9884, 4696 | Source reviewed |
| [15048:112677](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-112677) | 48 - Card address (physical&digital, new one, default) | 375×842 | 10299, 1482 | Source reviewed |
| [15048:115698](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-115698) | 48 - Card address (physical&digital, new one, default) | 375×842 | 10299, 3312 | Source reviewed |
| [15048:117353](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-117353) | 48 - Card address (physical&digital, new one, default) | 375×842 | 10299, 4696 | Source reviewed |
| [15048:113320](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-113320) | 48 - Card address (physical&digital, new one, default) | 375×842 | 10714, 1482 | Source reviewed |
| [15048:116423](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-116423) | 48 - Card address (physical&digital, new one, default) | 375×812 | 10714, 3312 | Source reviewed |
| [15048:117693](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-117693) | 48 - Card address (physical&digital, new one, default) | 375×812 | 10714, 4696 | Source reviewed |
| [15048:114040](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-114040) | 48 - Card address (physical&digital, new one, default) | 375×812 | 11129, 1482 | Source reviewed |
| [15048:116802](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-116802) | 48 - Card address (physical&digital, new one, default) | 375×812 | 11129, 3311 | Source reviewed |
| [15048:118256](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-118256) | 48 - Card address (physical&digital, new one, default) | 375×1030 | 11129, 4696 | Source reviewed |
| [15048:114329](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-114329) | 48 - Card address (physical&digital, new one, default) | 375×812 | 11544, 1482 | Source reviewed |
| [15048:114611](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-114611) | 48 - Card address (physical&digital, new one, default) | 375×1060 | 11959, 1482 | Source reviewed |
| [15048:120312](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-120312) | 48 - Card address (physical&digital, new one, default) | 375×1159 | 12374, 1482 | Source reviewed |
| [15048:119264](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-119264) | Card selection | 375×848 | 12789, 1482 | Source reviewed |
| [7214:97002](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-97002) | Frame 6358500 | 1205×83 | 13394, 3008 | Context / heading |
| [15048:126344](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-126344) | Card selection | 375×848 | 13394, 3312 | Source reviewed |
| [7214:82220](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-82220) | Frame 6358498 | 5008×83 | 13414, 1022 | Context / heading |
| [7214:82222](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-82222) | Frame 6358499 | 3280×83 | 13414, 1172 | Context / heading |
| [15048:119884](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-119884) | Card selection | 375×848 | 13414, 1482 | Source reviewed |
| [7214:98986](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-98986) | Frame 6358501 | 1205×83 | 13414, 4409 | Context / heading |
| [15048:137991](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-137991) | Card selection | 375×828 | 13414, 4696 | Source reviewed |
| [15048:126772](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-126772) | 48 - Card address (physical&digital, new one, default) | 375×876 | 13809, 3311 | Source reviewed |
| [15048:121567](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-121567) | 48 - Card address (physical&digital, new one, default) | 375×896 | 13829, 1482 | Source reviewed |
| [15048:128593](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-128593) | 48 - Card address (physical&digital, new one, default) | 375×896 | 13829, 4696 | Source reviewed |
| [15048:127161](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-127161) | 48 - Card address (physical&digital, new one, default) | 375×920 | 14224, 3312 | Source reviewed |
| [15048:120940](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-120940) | 48 - Card address (physical&digital, new one, default) | 375×978 | 14244, 1482 | Source reviewed |
| [15048:128929](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-128929) | 48 - Card address (physical&digital, new one, default) | 375×978 | 14244, 4696 | Source reviewed |
| [15048:122244](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-122244) | 48 - Card address (physical&digital, new one, default) | 375×920 | 14659, 1482 | Source reviewed |
| [15048:123104](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-123104) | 48 - Card address (physical&digital, new one, default) | 375×1159 | 15074, 1482 | Source reviewed |
| [15048:123920](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-123920) | 48 - Card address (physical&digital, new one, default) | 375×948 | 15489, 1482 | Source reviewed |
| [15048:124661](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-124661) | 48 - Card address (physical&digital, new one, default) | 375×876 | 15904, 1482 | Source reviewed |
| [15048:125435](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-125435) | 48 - Card address (physical&digital, new one, default) | 375×812 | 16319, 1482 | Source reviewed |
| [7214:100921](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-100921) | Frame 6358502 | 1578×83 | 16844, 1172 | Context / heading |
| [15048:129626](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-129626) | 48 - Card address (physical&digital, new one, default) | 375×896 | 16844, 1482 | Source reviewed |
| [15048:129962](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-129962) | 48 - Card address (physical&digital, new one, default) | 375×978 | 17259, 1482 | Source reviewed |
| [15048:130323](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-130323) | 48 - Card address (physical&digital, new one, default) | 375×876 | 17674, 1482 | Source reviewed |
| [15048:130712](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-130712) | 48 - Card address (physical&digital, new one, default) | 375×920 | 18089, 1482 | Source reviewed |
| [7214:132714](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-132714) | Frame 6358507 | 2035×83 | 18672, 1022 | Context / heading |
| [7214:132706](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-132706) | Frame 6358503 | 2035×83 | 18672, 1172 | Context / heading |
| [15048:131785](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-131785) | Card selection | 375×812 | 18672, 1482 | Source reviewed |
| [7214:132710](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-132710) | Frame 6358505 | 790×83 | 18672, 3008 | Context / heading |
| [15048:135131](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-135131) | Card selection | 375×834 | 18672, 3211 | Source reviewed |
| [7214:132712](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-132712) | Frame 6358506 | 1205×83 | 18672, 4742 | Context / heading |
| [15048:139699](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-139699) | Card selection | 375×834 | 18672, 5029 | Source reviewed |
| [15048:132118](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-132118) | 48 - Card address (physical&digital, new one, default) | 375×896 | 19087, 1482 | Source reviewed |
| [15048:134764](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-134764) | 48 - Card address (physical&digital, new one, default) | 375×848 | 19087, 3211 | Source reviewed |
| [15048:140038](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-140038) | 48 - Card address (physical&digital, new one, default) | 375×896 | 19087, 5029 | Source reviewed |
| [15048:132454](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-132454) | 48 - Card address (physical&digital, new one, default) | 375×978 | 19502, 1482 | Source reviewed |
| [15048:140374](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-140374) | 48 - Card address (physical&digital, new one, default) | 375×978 | 19502, 5029 | Source reviewed |
| [15048:133199](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-133199) | 48 - Card address (physical&digital, new one, default) | 375×848 | 19917, 1482 | Source reviewed |
| [15048:133951](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-133951) | 48 - Card address (physical&digital, new one, default) | 375×812 | 20332, 1482 | Source reviewed |
| [7214:138380](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-138380) | Frame 6358508 | 3280×83 | 20957, 1022 | Context / heading |
| [7214:139523](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-139523) | Frame 6358509 | 3280×83 | 20957, 1172 | Context / heading |
| [15048:141493](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-141493) | Card selection | 375×841 | 20957, 1482 | Source reviewed |
| [7214:144110](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-144110) | Frame 6358510 | 1205×83 | 20957, 2780 | Context / heading |
| [15048:148240](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-148240) | Card selection | 375×861 | 20957, 2983 | Source reviewed |
| [7214:145230](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=7214-145230) | Frame 6358511 | 1620×83 | 20957, 4742 | Context / heading |
| [15048:150267](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-150267) | Card selection | 375×861 | 20957, 4949 | Source reviewed |
| [15048:142570](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-142570) | 48 - Card address (physical&digital, new one, default) | 375×936 | 21372, 1482 | Source reviewed |
| [15048:148737](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-148737) | 48 - Card address (physical&digital, new one, default) | 375×876 | 21372, 2983 | Source reviewed |
| [15048:150764](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-150764) | 48 - Card address (physical&digital, new one, default) | 375×936 | 21372, 4949 | Source reviewed |
| [15048:143492](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-143492) | 48 - Card address (physical&digital, new one, default) | 375×877 | 21787, 1482 | Source reviewed |
| [15048:149126](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-149126) | 48 - Card address (physical&digital, new one, default) | 375×920 | 21787, 2983 | Source reviewed |
| [15048:151083](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-151083) | 48 - Card address (physical&digital, new one, default) | 375×877 | 21787, 4949 | Source reviewed |
| [15048:144473](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-144473) | 48 - Card address (physical&digital, new one, default) | 375×976 | 22202, 1482 | Source reviewed |
| [15048:151427](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-151427) | 48 - Card address (physical&digital, new one, default) | 375×976 | 22202, 4949 | Source reviewed |
| [15048:144842](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-144842) | 48 - Card address (physical&digital, new one, default) | 375×920 | 22617, 1482 | Source reviewed |
| [15048:145730](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-145730) | 48 - Card address (physical&digital, new one, default) | 375×1159 | 23032, 1482 | Source reviewed |
| [15048:146234](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-146234) | 48 - Card address (physical&digital, new one, default) | 375×948 | 23447, 1482 | Source reviewed |
| [15048:146470](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-146470) | 48 - Card address (physical&digital, new one, default) | 375×876 | 23447, 2545 | Source reviewed |
| [15048:147219](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-147219) | 48 - Card address (physical&digital, new one, default) | 375×812 | 23862, 1482 | Source reviewed |
| [6887:177433](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=6887-177433) | Frame 6358486 | 1343×83 | 24387, 1022 | Context / heading |
| [15048:152199](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-152199) | 48 - Card address (physical&digital, new one, default) | 375×997 | 24387, 1482 | Source reviewed |
| [15048:153231](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=15048-153231) | 48 - Card address (physical&digital, new one, default) | 375×812 | 24801, 1482 | Source reviewed |



## Cash Loan source inventory

| Source node | Frame | Size | Canvas position | Status |
|---|---|---|---|---|
| [9453:159645](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-159645) | 08 - Add mobile number (default) | 375×812 | 6851, 3722 | Source reviewed |
| [9534:195473](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195473) | 08 - Add mobile number (default) | 375×812 | 11106, 3722 | Source reviewed |
| [9591:78765](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-78765) | 08 - Add mobile number (default) | 375×812 | 6851, 4614 | Source reviewed |
| [9534:195520](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195520) | 08 - Add mobile number (default) | 375×812 | 11106, 4614 | Source reviewed |
| [9453:159863](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-159863) | Frame 6358553 | 375×223 | 7526, 628 | Context / heading |
| [9453:159865](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-159865) | 08 - Add mobile number (default) | 375×812 | 13713, 1046 | Source reviewed |
| [9534:196349](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-196349) | 08 - Add mobile number (default) | 375×812 | 14128, 1046 | Source reviewed |
| [9534:196644](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-196644) | 08 - Add mobile number (default) | 375×812 | 14543, 1046 | Source reviewed |
| [9453:159943](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-159943) | 34 - Identification successful | 375×812 | 20458, 1046 | Source reviewed |
| [9453:160112](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-160112) | 34 - Identification successful | 375×812 | 22223, 1046 | Source reviewed |
| [9453:160139](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-160139) | 34 - Identification successful | 375×812 | 22638, 1046 | Source reviewed |
| [9618:40320](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-40320) | KO SCREEN | 375×812 | 33648, 1046 | Source reviewed |
| [9618:40360](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-40360) | KO SCREEN | 375×812 | 33648, 1920 | Source reviewed |
| [9453:160512](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-160512) | 08 - Add mobile number (default) | 375×812 | 20458, 2301 | Source reviewed |
| [9453:160530](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-160530) | 29 - Video selfie (guidelines & consent) | 375×812 | 18383, 1046 | Source reviewed |
| [9591:80454](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-80454) | 29 - Video selfie (guidelines & consent) | 375×812 | 18383, 2301 | Source reviewed |
| [9591:80536](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-80536) | 29 - Video selfie (guidelines & consent) | 375×812 | 18798, 2301 | Source reviewed |
| [9453:160687](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-160687) | 08 - Add mobile number (default) | 375×1097 | 16463, 2301 | Source reviewed |
| [9453:160729](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-160729) | Data recap (edit 4) | 375×1138 | 17708, 1046 | Source reviewed |
| [9453:160760](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-160760) | Data recap (edit 4) | 375×812 | 26428, 1046 | Source reviewed |
| [9591:82757](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-82757) | Data recap (edit 4) | 375×817 | 27518, 1046 | Source reviewed |
| [9591:83611](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-83611) | Data recap (edit 4) | 375×819 | 27933, 1046 | Source reviewed |
| [9591:83859](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-83859) | Data recap (edit 4) | 375×812 | 28348, 1046 | Source reviewed |
| [9591:83481](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-83481) | Data recap (edit 4) | 375×817 | 28794, 2356 | Source reviewed |
| [9453:160968](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-160968) | Data recap (edit 4) | 375×812 | 26843, 1046 | Source reviewed |
| [9591:82632](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-82632) | Data recap (edit 4) | 375×962 | 28763, 1046 | Source reviewed |
| [9453:161096](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-161096) | 17 - Email verification (complete, successful) | 375×1681 | 30113, 1046 | Source reviewed |
| [23939:85093](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=23939-85093) | 17 - Email verification (complete, successful) | 375×1719 | 28004, 3553 | Source reviewed |
| [25200:12271](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=25200-12271) | 17 - Email verification (complete, successful) | 375×1445 | 28419, 3553 | Source reviewed |
| [9591:87708](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-87708) | 17 - Email verification (complete, successful) | 375×812 | 30113, 3015 | Source reviewed |
| [9591:88160](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-88160) | 17 - Email verification (complete, successful) | 375×812 | 30113, 3959 | Source reviewed |
| [9591:85262](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-85262) | 17 - Email verification (complete, successful) | 375×1849 | 30528, 1046 | Source reviewed |
| [9591:85477](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-85477) | 17 - Email verification (complete, successful) | 375×1429 | 30943, 1046 | Source reviewed |
| [9618:40979](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-40979) | 17 - Email verification (complete, successful) | 375×1429 | 34323, 1046 | Source reviewed |
| [9618:41352](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-41352) | 17 - Email verification (complete, successful) | 375×2412 | 34738, 1046 | Source reviewed |
| [9453:161414](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-161414) | 17 - Email verification (complete, successful) | 375×2316 | 31468, 1046 | Source reviewed |
| [9591:87198](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-87198) | 17 - Email verification (complete, successful) | 375×2412 | 31883, 1046 | Source reviewed |
| [9453:162031](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162031) | 08 - Add mobile number (default) | 375×833 | 16463, 1055 | Source reviewed |
| [9453:162067](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162067) | 28 - Data recap -Address (residence diffferent, 2) | 375×1698 | 17293, 2301 | Source reviewed |
| [9453:162123](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162123) | 08 - Add mobile number (default) | 375×941 | 16878, 1055 | Source reviewed |
| [9453:162157](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162157) | 08 - Add mobile number (default) | 375×1053 | 17293, 1056 | Source reviewed |
| [9534:196274](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-196274) | 08 - Add mobile number (default) | 375×812 | 13713, 1942 | Source reviewed |
| [9453:162230](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162230) | 08 - Add mobile number (default) | 375×812 | 14958, 1942 | Source reviewed |
| [9453:162245](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162245) | 08 - Add mobile number (default) | 375×812 | 15373, 1942 | Source reviewed |
| [9453:162260](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162260) | 08 - Add mobile number (default) | 375×812 | 15788, 1942 | Source reviewed |
| [9534:197421](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-197421) | 08 - Add mobile number (default) | 375×812 | 15788, 2830 | Source reviewed |
| [9534:197169](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-197169) | M2_2.07 riepilogo foto 11 | 375×812 | 15373, 1046 | Source reviewed |
| [9534:197229](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-197229) | M2_2.07 riepilogo foto 12 | 375×812 | 14958, 1046 | Source reviewed |
| [9453:162329](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162329) | Sign documentation - insert OTP (default) | 375×812 | 49893, 1046 | Source reviewed |
| [9618:51632](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-51632) | Sign documentation - insert OTP (default) | 375×812 | 50308, 1046 | Source reviewed |
| [9618:51718](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-51718) | Sign documentation - insert OTP (default) | 375×812 | 50308, 1937 | Source reviewed |
| [9453:162381](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162381) | 34 - Identification successful | 375×812 | 50983, 1046 | Source reviewed |
| [9453:162392](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162392) | NEW-Sector/county | 375×666.9999389648438 | 17708, 3208 | Source reviewed |
| [9453:162420](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162420) | NEW-Sector/county | 375×666.9999389648438 | 17708, 3961 | Source reviewed |
| [9591:79892](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-79892) | Data recap (edit 4) | 375×812 | 17708, 2301 | Source reviewed |
| [9591:81088](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-81088) | NEWnative-PIN set up (existing customer) | 375×812 | 23313, 1046 | Source reviewed |
| [9534:197109](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-197109) | M2_2.07 riepilogo foto 13 | 375×812 | 15788, 1046 | Source reviewed |
| [9453:162708](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162708) | Identification | 375×666.9999389648438 | 18798, 1046 | Source reviewed |
| [9453:162710](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162710) | 32 - Identification - smile | 375×666.9999389648438 | 19213, 1046 | Source reviewed |
| [9453:162712](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162712) | 33 - Identification - waiting | 375×666.9999389648438 | 19628, 1046 | Source reviewed |
| [9453:162714](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162714) | 33B - Face recon - error | 375×666.9999389648438 | 20043, 1046 | Source reviewed |
| [9482:78316](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9482-78316) | New Pre Login - Inactive | 375×812 | 261, 1046 | Source reviewed |
| [9582:40314](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-40314) | New Pre Login - Inactive | 375×812 | 261, 2037 | Source reviewed |
| [9453:162721](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162721) | New Pre Login - Inactive | 375×812 | 676, 1046 | Source reviewed |
| [9453:162726](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162726) | Frame 6358554 | 790×223 | 260, 628 | Context / heading |
| [9582:40519](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-40519) | Frame 1010110491 | 790×223 | 1351, 628 | Context / heading |
| [9582:40851](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-40851) | Frame 1010110492 | 1205×223 | 2441, 628 | Context / heading |
| [9453:162728](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162728) | Frame 6358555 | 3280×223 | 3946, 628 | Context / heading |
| [9453:162730](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162730) | Frame 6358556 | 3280×223 | 8201, 628 | Context / heading |
| [9453:162732](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162732) | Frame 6358557 | 1620×223 | 11781, 628 | Context / heading |
| [9453:162734](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162734) | Frame 6358558 | 2462×223 | 13701, 628 | Context / heading |
| [9534:197487](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-197487) | Frame 1010110490 | 1620×223 | 16463, 628 | Context / heading |
| [9453:162738](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162738) | Frame 6358560 | 2450×223 | 18383, 628 | Context / heading |
| [9453:162740](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162740) | Frame 6358561 | 790×223 | 49893, 628 | Context / heading |
| [9453:162742](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-162742) | Frame 6358562 | 375×223 | 53423, 628 | Context / heading |
| [9618:52603](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-52603) | Frame 1010110495 | 790×223 | 54098, 628 | Context / heading |
| [9641:24974](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9641-24974) | Frame 1010110496 | 2875×223 | 55188, 628 | Context / heading |
| [9453:163043](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163043) | 01 - Product information - CA opening | 375×1922 | 35413, 1046 | Source reviewed |
| [9453:163207](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163207) | 01 - Product information - CA opening | 375×1922 | 35828, 1046 | Source reviewed |
| [9453:163371](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163371) | 01 - Product information - CA opening | 375×1467 | 24663, 1046 | Source reviewed |
| [9591:81194](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-81194) | 01 - Product information - CA opening | 375×1413 | 24663, 2656 | Source reviewed |
| [9453:163406](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163406) | 34 - Identification successful | 375×812 | 29438, 1046 | Source reviewed |
| [9453:163710](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163710) | 34 - Identification successful | 375×812 | 37178, 1046 | Source reviewed |
| [9618:42568](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-42568) | 34 - Identification successful | 375×812 | 37178, 2052 | Source reviewed |
| [9453:163723](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163723) | 01 - Product information - CA opening | 375×985 | 47973, 1046 | Source reviewed |
| [9618:51346](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-51346) | 01 - Product information - CA opening | 375×812 | 48388, 1046 | Source reviewed |
| [9618:51481](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-51481) | 01 - Product information - CA opening | 375×812 | 48803, 1046 | Source reviewed |
| [9453:163789](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163789) | 01 - Product information - CA opening | 375×985 | 49218, 1046 | Source reviewed |
| [9453:163855](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163855) | 52- Sign contract (Success messgae)  | 375×812 | 52748, 1046 | Source reviewed |
| [9618:52540](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-52540) | 52- Sign contract (Success messgae)  | 375×812 | 53423, 1046 | Source reviewed |
| [9618:54276](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-54276) | ProductShelf - CEE Light Restyle | 375×812 | 54098, 1046 | Source reviewed |
| [9618:54196](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-54196) | 34 - Identification successful | 375×812 | 54513, 1046 | Source reviewed |
| [14349:17371](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=14349-17371) | 34 - Identification successful | 375×812 | 57688, 1046 | Source reviewed |
| [9453:163877](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163877) | 52- Sign contract (Success messgae)  | 375×812 | 51658, 1046 | Source reviewed |
| [9618:52323](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-52323) | 52- Sign contract (Success messgae)  | 375×812 | 52073, 1046 | Source reviewed |
| [9618:52401](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-52401) | 52- Sign contract (Success messgae)  | 375×1012 | 51658, 1956 | Source reviewed |
| [9453:163903](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163903) | 01 - Product information - CA opening | 375×848 | 37853, 1046 | Source reviewed |
| [9453:163921](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-163921) | 01 - Product information - CA opening | 375×1140 | 32558, 1046 | Source reviewed |
| [9930:111726](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-111726) | 01 - Product information - CA opening | 375×1167 | 32973, 1046 | Source reviewed |
| [9930:111530](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-111530) | 01 - Product information - CA opening | 375×812 | 32558, 2300 | Source reviewed |
| [9930:151048](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-151048) | 01 - Product information - CA opening | 375×812 | 32558, 3226 | Source reviewed |
| [9930:151142](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-151142) | 01 - Product information - CA opening | 375×812 | 32973, 3226 | Source reviewed |
| [9930:111861](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-111861) | 01 - Product information - CA opening | 375×812 | 32973, 2300 | Source reviewed |
| [9930:151221](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-151221) | 01 - Product information - CA opening | 375×812 | 32973, 4125 | Source reviewed |
| [9453:164036](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164036) | 01 - Product information - CA opening | 375×1264 | 25078, 1046 | Source reviewed |
| [9453:164127](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164127) | PIN_B10 | 375×812 | 25753, 1046 | Source reviewed |
| [9453:164144](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164144) | PIN_B10 | 375×812 | 36503, 1046 | Source reviewed |
| [9453:164159](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164159) | 08 - Add mobile number (default) | 375×812 | 3946, 1046 | Source reviewed |
| [9591:78934](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-78934) | 08 - Add mobile number (default) | 375×812 | 3946, 1938 | Source reviewed |
| [9869:93897](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-93897) | 08 - Add mobile number (default) | 375×812 | 3946, 2830 | Source reviewed |
| [9453:164249](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164249) | 08 - Add mobile number (default) | 375×812 | 4776, 1046 | Source reviewed |
| [9534:193964](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-193964) | 08 - Add mobile number (default) | 375×812 | 6851, 2830 | Source reviewed |
| [9534:195403](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195403) | 08 - Add mobile number (default) | 375×812 | 11106, 2830 | Source reviewed |
| [9534:193213](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-193213) | 08 - Add mobile number (default) | 375×812 | 5191, 1046 | Source reviewed |
| [9453:164297](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164297) | 08 - Add mobile number (default) | 375×812 | 6021, 1046 | Source reviewed |
| [9534:195065](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195065) | 08 - Add mobile number (default) | 375×812 | 10276, 1046 | Source reviewed |
| [9534:193423](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-193423) | 08 - Add mobile number (default) | 375×812 | 5606, 1046 | Source reviewed |
| [9534:194993](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-194993) | 08 - Add mobile number (default) | 375×812 | 9861, 1046 | Source reviewed |
| [9534:193586](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-193586) | 08 - Add mobile number (default) | 375×812 | 6436, 1046 | Source reviewed |
| [9534:195152](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195152) | 08 - Add mobile number (default) | 375×812 | 10691, 1046 | Source reviewed |
| [9534:193681](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-193681) | 08 - Add mobile number (default) | 375×812 | 6851, 1046 | Source reviewed |
| [9534:195243](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195243) | 08 - Add mobile number (default) | 375×812 | 11106, 1046 | Source reviewed |
| [9534:193805](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-193805) | 08 - Add mobile number (default) | 375×812 | 6851, 1938 | Source reviewed |
| [9534:195323](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195323) | 08 - Add mobile number (default) | 375×812 | 11106, 1938 | Source reviewed |
| [9534:193331](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-193331) | 08 - Add mobile number (default) | 375×812 | 6021, 1938 | Source reviewed |
| [9534:195572](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195572) | 08 - Add mobile number (default) | 375×812 | 10276, 1938 | Source reviewed |
| [9534:193749](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-193749) | 08 - Add mobile number (default) | 375×812 | 6021, 2830 | Source reviewed |
| [9534:195644](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195644) | 08 - Add mobile number (default) | 375×812 | 10276, 2830 | Source reviewed |
| [9534:193512](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-193512) | 08 - Add mobile number (default) | 375×812 | 6021, 3730 | Source reviewed |
| [9582:42882](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-42882) | 08 - Add mobile number (default) | 375×812 | 6021, 4614 | Source reviewed |
| [9582:42955](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-42955) | 08 - Add mobile number (default) | 375×812 | 10276, 4614 | Source reviewed |
| [9534:195716](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195716) | 08 - Add mobile number (default) | 375×812 | 10276, 3730 | Source reviewed |
| [9453:164345](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164345) | 08 - Add mobile number (default) | 375×812 | 8201, 1046 | Source reviewed |
| [9869:94221](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-94221) | 08 - Add mobile number (default) | 375×812 | 8201, 1942 | Source reviewed |
| [9453:164371](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164371) | 08 - Add mobile number (default) | 375×812 | 8616, 1046 | Source reviewed |
| [9534:194284](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-194284) | 08 - Add mobile number (default) | 375×812 | 8616, 1942 | Source reviewed |
| [9453:164397](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164397) | RO_Marketing consent (default) | 375×812 | 21133, 1046 | Source reviewed |
| [9453:164422](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164422) | RO_Marketing consent (default) | 375×1329 | 21548, 1046 | Source reviewed |
| [9453:164544](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-164544) | 08 - Add mobile number (default) | 375×812 | 9031, 1046 | Source reviewed |
| [9534:194876](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-194876) | 08 - Add mobile number (default) | 375×812 | 9446, 1046 | Source reviewed |
| [9534:192824](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-192824) | 08 - Add mobile number (default) | 375×812 | 4361.2421875, 1938 | Source reviewed |
| [9453:165002](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165002) | KO-Quit the same day | 375×812 | 11781, 1046 | Source reviewed |
| [9453:165039](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165039) | KO-Quit the same day | 375×812 | 12196, 1046 | Source reviewed |
| [9534:195900](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195900) | KO-Quit the same day | 375×812 | 11781, 1942 | Source reviewed |
| [9453:165129](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165129) | Expired Link | 375×812 | 56028, 1046 | Source reviewed |
| [9618:53710](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-53710) | 08 - Add mobile number (default) | 375×812 | 56443, 1905 | Source reviewed |
| [9453:165222](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165222) | KO-Quit the same day | 375×812 | 55198, 1046 | Source reviewed |
| [9618:52672](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-52672) | KO-Quit the same day | 375×812 | 55198, 1905 | Source reviewed |
| [9618:53240](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-53240) | KO-Quit the same day | 375×812 | 55198, 2765 | Source reviewed |
| [9618:53794](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-53794) | KO-Quit the same day | 375×812 | 56443, 2765 | Source reviewed |
| [9618:53847](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-53847) | KO-Quit the same day | 375×812 | 56443, 3625 | Source reviewed |
| [9618:53545](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-53545) | KO-Quit the same day | 375×812 | 55188, 3625 | Source reviewed |
| [9618:53142](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-53142) | KO-Quit the same day | 375×812 | 55613, 1046 | Source reviewed |
| [9453:165296](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165296) | Expired Link | 375×812 | 56443, 1046 | Source reviewed |
| [9618:54026](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-54026) | 08 - Add mobile number (default) | 375×812 | 56858, 1046 | Source reviewed |
| [9618:54076](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-54076) | 08 - Add mobile number (default) | 375×812 | 57273, 1046 | Source reviewed |
| [9453:165399](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165399) | Leave screen | 375×812 | 7526, 1046 | Source reviewed |
| [9453:165414](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165414) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 12611, 1046 | Source reviewed |
| [9534:195998](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-195998) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 13026, 1046 | Source reviewed |
| [9453:165435](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165435) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 7526, 1941 | Source reviewed |
| [9534:194098](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-194098) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 7526, 2830 | Source reviewed |
| [9489:115278](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9489-115278) | KO-Quit X (0 step , b, complete, no_i) | 375×812 | 13026, 1942 | Source reviewed |
| [9453:165480](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165480) | Frame 6358566 | 790×223 | 21133, 628 | Context / heading |
| [9453:165482](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165482) | Frame 6358567 | 790×223 | 22223, 628 | Context / heading |
| [9453:165484](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165484) | Frame 6358568 | 375×223 | 23313, 628 | Context / heading |
| [9453:165486](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165486) | Frame 6358569 | 375×223 | 23988, 628 | Context / heading |
| [9453:165492](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165492) | Frame 6358572 | 790×224 | 24663, 628 | Context / heading |
| [9453:165494](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165494) | Frame 6358573 | 375×224 | 25753, 628 | Context / heading |
| [9453:165496](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165496) | Frame 6358574 | 790×224 | 26428, 628 | Context / heading |
| [9591:84196](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-84196) | Frame 1010110493 | 1620×224 | 27518, 628 | Context / heading |
| [9453:165498](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165498) | Frame 6358575 | 2145×224 | 30113, 628 | Context / heading |
| [9453:165500](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165500) | Frame 6358576 | 790×224 | 34323, 628 | Context / heading |
| [9453:165502](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165502) | Frame 6358577 | 790×224 | 32558, 628 | Context / heading |
| [9453:165504](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165504) | Frame 6358578 | 375×224 | 29438, 628 | Context / heading |
| [9453:165506](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165506) | Frame 6358579 | 375×224 | 33648, 628 | Context / heading |
| [9453:165508](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165508) | Frame 6358580 | 375×224 | 37178, 628 | Context / heading |
| [9453:165510](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165510) | Frame 6358581 | 375×224 | 47298, 628 | Context / heading |
| [9618:51208](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-51208) | Frame 1010110494 | 1620×224 | 47973, 628 | Context / heading |
| [9453:165512](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165512) | Frame 6358582 | 375×224 | 50983, 628 | Context / heading |
| [9453:165514](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165514) | Frame 6358583 | 790×224 | 51658, 628 | Context / heading |
| [9453:165516](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165516) | Frame 6358584 | 375×224 | 52748, 628 | Context / heading |
| [9453:165520](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165520) | Frame 6358586 | 375×224 | 37853, 628 | Context / heading |
| [9453:165522](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165522) | Frame 6358587 | 790×224 | 38528, 628 | Context / heading |
| [9453:165524](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165524) | Frame 6358588 | 2035×224 | 39618, 628 | Context / heading |
| [9453:165526](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165526) | Frame 6358589 | 375×224 | 36503, 628 | Context / heading |
| [9453:165528](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165528) | Frame 6358590 | 790×224 | 35413, 628 | Context / heading |
| [19572:13150](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=19572-13150) | ProductShelf - CEE Light Restyle | 375×812 | 23988, 1046 | Source reviewed |
| [9453:165533](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165533) | OPTIM | 375×1117 | 38518, 1046 | Source reviewed |
| [9453:165592](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165592) | OPTIM | 375×1117 | 38933, 1046 | Source reviewed |
| [9453:165691](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165691) | Card selection | 375×868.9999389648438 | 39618, 1046 | Source reviewed |
| [9618:43902](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-43902) | Card selection | 375×868.9999389648438 | 39618, 2050 | Source reviewed |
| [9618:44140](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-44140) | Card selection | 375×868.9999389648438 | 39618, 3004 | Source reviewed |
| [9453:165815](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165815) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×894 | 40033, 1046 | Source reviewed |
| [9453:165862](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-165862) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×854 | 40448, 1047 | Source reviewed |
| [9618:45035](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-45035) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×812 | 40033, 2050 | Source reviewed |
| [10198:204139](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10198-204139) | 17 - Email verification (complete, successful) | 375×812 | 31468, 3553 | Source reviewed |
| [9453:166868](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-166868) | Frame 6358591 | 2035×223 | 41953, 629 | Context / heading |
| [16094:74575](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=16094-74575) | Select branch | 375×812 | 45118, 1046 | Source reviewed |
| [9930:97603](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-97603) | Select branch | 375×812 | 45533, 1046 | Source reviewed |
| [9453:166953](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-166953) | WA - Waiting Screen | 375×812 | 47298, 1046 | Source reviewed |
| [9618:51147](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-51147) | WA - Waiting Screen | 375×812 | 47298, 1960 | Source reviewed |
| [9930:97937](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9930-97937) | Select branch | 375×812 | 44703, 1046 | Source reviewed |
| [9453:166979](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-166979) | Select branch | 375×812 | 44288, 1046 | Source reviewed |
| [9453:166997](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-166997) | 01 - Product information - CA opening | 375×913 | 46208, 1047 | Source reviewed |
| [9618:50823](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-50823) | 01 - Product information - CA opening | 375×1181 | 46623, 1047 | Source reviewed |
| [9453:167103](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-167103) | Frame 6358592 | 1620×223 | 44288, 628 | Context / heading |
| [9453:167105](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-167105) | Frame 6358593 | 790×223 | 46208, 628 | Context / heading |
| [9453:167107](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9453-167107) | 17 - Email verification (complete, successful) | 375×812 | 25078, 2656 | Source reviewed |
| [12974:57113](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=12974-57113) | 17 - Email verification (complete, successful) | 375×812 | 25493, 2656 | Source reviewed |
| [20853:12083](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=20853-12083) | 29 - Video selfie (guidelines & consent) | 375×812 | 25493, 3599 | Source reviewed |
| [20853:12274](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=20853-12274) | 01 - Product information - CA opening | 375×812 | 25908, 3599 | Source reviewed |
| [9591:83985](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-83985) | 17 - Email verification (complete, successful) | 375×812 | 26428, 3269 | Source reviewed |
| [9496:44289](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9496-44289) | 17 - Email verification (complete, successful) | 375×812 | 25078, 3576 | Source reviewed |
| [9618:46202](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-46202) | 48 - Card address (physical&digital, new one, default) | 375×812 | 40863, 1046 | Source reviewed |
| [9618:46941](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-46941) | 48 - Card address (physical&digital, new one, default) | 375×877 | 41278, 1047 | Source reviewed |
| [9618:47217](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-47217) | 48 - Card address (physical&digital, new one, default) | 375×812 | 41953, 1047 | Source reviewed |
| [9618:47709](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-47709) | 48 - Card address (physical&digital, new one, default) | 375×812 | 41953, 1970 | Source reviewed |
| [9618:47824](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-47824) | 48 - Card address (physical&digital, new one, default) | 375×812 | 42368, 1970 | Source reviewed |
| [9618:47627](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-47627) | 48 - Card address (physical&digital, new one, default) | 375×812 | 42368, 1047 | Source reviewed |
| [9618:48001](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-48001) | 48 - Card address (physical&digital, new one, default) | 375×812 | 42783, 1047 | Source reviewed |
| [9618:48968](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-48968) | 48 - Card address (physical&digital, new one, default) | 375×812 | 43613, 1047 | Source reviewed |
| [9618:48864](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-48864) | 48 - Card address (physical&digital, new one, default) | 375×812 | 42783, 1970 | Source reviewed |
| [9618:49044](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-49044) | 48 - Card address (physical&digital, new one, default) | 375×812 | 43198, 1970 | Source reviewed |
| [24197:12443](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=24197-12443) | 48 - Card address (physical&digital, new one, default) | 375×830 | 43198, 1054 | Source reviewed |
| [9618:49209](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-49209) | 48 - Card address (physical&digital, new one, default) | 375×812 | 41953, 2893 | Source reviewed |
| [9534:192604](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9534-192604) | 08 - Add mobile number (default) | 375×812 | 4361.2421875, 1046 | Source reviewed |
| [9591:82997](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-82997) | Data recap (edit 4) | 375×817 | 26428, 2356 | Source reviewed |
| [13747:67130](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=13747-67130) | Data recap (edit 4) | 375×817 | 26843, 2356 | Source reviewed |
| [13747:67309](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=13747-67309) | Data recap (edit 4) | 375×817 | 27258, 2356 | Source reviewed |
| [9591:83164](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-83164) | Data recap (edit 4) | 375×817 | 27673, 2356 | Source reviewed |
| [9591:83327](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9591-83327) | Data recap (edit 4) | 375×817 | 26843, 3269 | Source reviewed |
| [9532:189867](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9532-189867) | 01 - Product information - CA opening | 375×1177 | 1351, 1046 | Source reviewed |
| [9869:95893](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9869-95893) | 01 - Product information - CA opening | 375×1177 | 1766, 1046 | Source reviewed |
| [9582:41993](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-41993) | 01 - Product information - CA opening | 375×1193 | 3271, 2417 | Source reviewed |
| [9582:42161](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-42161) | 01 - Product information - CA opening | 375×1207 | 3271, 3782 | Source reviewed |
| [9582:40787](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-40787) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×812 | 2441, 1046 | Source reviewed |
| [9582:40853](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-40853) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×812 | 2856, 1046 | Source reviewed |
| [9582:42732](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-42732) | 01 - Product information - CA opening | 375×1283 | 3271, 1046 | Source reviewed |
| [9582:42552](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9582-42552) | 43A - Select your card (selected, physical, LEI e EUR Accounts) | 375×812 | 2856, 1938 | Source reviewed |
| [9618:43054](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=9618-43054) | Steps (more details, default) | 375×972 | 38518, 2302 | Source reviewed |
| [11333:107251](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=11333-107251) | 17 - Email verification (complete, successful) | 375×812 | 1766, 2371 | Source reviewed |
| [10048:93915](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=10048-93915) | 01 - Product information - CA opening | 375×900 | 24663, 4155 | Source reviewed |
| [14481:17337](https://www.figma.com/design/bM3r8YmHuaIDXFFgsPhvDY?node-id=14481-17337) | KO-Quit X (0 step , b, complete, no_i) | 375×935 | 54513, 1922 | Source reviewed |

## Executable composition and validation evidence

| Family | Shared executable composition | Source differences and verified behavior |
|---|---|---|
| Entry and product | InactiveBaselinePrelogin, OnboardingIntroduction/Details/Employment/Offer/ProductPages | RO Baseline restriction; account CTA and Loans CTA open distinct journeys; CR Optim/Star/Premium/Prime composition and declarations |
| Contact and OTP | OnboardingContactPages, BaselineCodeField; ro-onboarding validation/amendments | Phone/email validation, six slots, code expiry, three wrong attempts, resend budget, verified and loading states; correcting a contact invalidates prior verification |
| Identity | OnboardingIdentityPages, CameraPermission, SelfieCapture/Photograph | Scan retries and terminal branch exit; camera simulation, address editing and recap, postal format, selfie phases and failure; only approved source photo region is used |
| Account customization | OnboardingCards, CardCostDetails, DeliverySheet, ProductPages | CR card-tier choices and Gold conflict; loan reuses physical-first/virtual-second with source artwork and Romanian benefits; delivery validation and courier exception |
| KYC and branch | OnboardingQuestionnaire, Branches/BranchMap | Required conditional answers; searchable choices; map/list/detail, selection and terminal branch route; approved geographic background only |
| Legal and signing | OnboardingDocumentSheet/Contract, CashLoanDocuments | Executable document reader with scroll acceptance, per-document acknowledgement, prerequisite waiver gate, PIN/OTP failures and retries |
| Loan delta | CashLoanIntroduction/Income/Offer/Pages/Common | Mandatory/optional credit consents; PIN confirmation; financial fields; additional income and documents; preliminary/final/insurance/refinance offers; payment-day and repayment choices; IBAN checksum; contract selection; low-score feedback |
| Save and resume | createOnboardingSessionStore; isolated onboarding and loan stores | Encrypted sessionStorage, expiry and attempt budgets; password → missing phone digits → OTP; exact saved stage restored in both real-browser refresh checks |
| Flows and handoff | src/flows/ro/onboarding and src/flows/ro/cash-loan | 73/72 scenarios, 106/117 distinct native review states; source/specification/ZIP export; original flow IDs, order and frozen definitions preserved |

Targeted verification: 310 tests passed in the four-file complete-journey run; six further source-delta checks passed (316 total checks in these four files after the additional cases). These cover both complete connected journeys, every registered native review state, shared-state fixture base mapping, local encrypted session persistence and isolation. Source package regression adds three passing checks and preserves the original source order before appending the two new entries. A common-state fallback discovered in real-browser review was reproduced by 40 failing assertions and corrected; the matrix now rejects an introduction fallback for every other credit state.

Real browser checks: both inactive-screen CTAs; Flow Library entries; branch pin/detail selection; account-opening and Cash Loan resume after page refresh; actual synthetic PDF selection and explicit deletion confirmation; disabled continuation after removal. Synthetic saved drafts were cleared through the native restart UI. No real camera, bank, credit bureau, ANAF, signing or document-upload service is invoked.

Rendered comparisons include onboarding product/CR cards, provider identification, branch map, loan introduction, financial form, standard/refinancing offer, account/cards, income-document cards, offer summary, contract list, PIN and low-rating follow-up. Full screen PNG downloads retain long scroll content; source contexts retain all original copy and geometry. Individual pixel certification of all 471 redundant source frames has not been performed.

Source interpretation: CR supersedes affected older card/product states without replacing the remaining baseline. Repeated identical Arad choices in source are consolidated into one selectable item. Source CTA wording, including historical card-tier naming inconsistencies, is preserved while selection uses the actual tier. External mail-client chrome is excluded from the in-app email reference. Native status/safe areas follow the current device host instead of reproducing old Figma system chrome.

Limits: this is a complete local demo implementation; external services use deterministic fixtures. Source legal PDF bytes were not supplied, so the existing executable reader uses a clearly illustrative document area and demo PDF export. Source interest/rate illustrations remain Figma examples, not a production lending calculation. Flow ZIPs are developer reference packages that depend on the shared project infrastructure and assets.

## Combined repository gate

The 18:24 full run completed naturally: 383 files passed, 17 failed; 4,511 tests passed, 28 failed. One introduced exact source-registry list expectation was updated to include the two authorized entries, preserving all prior entries and their order; its three checks pass. Other failures involve frozen ETHOCA metadata, header/Wallet geometry, product fixtures, Robo state, icon metadata, retired PI audit, account details, CZ analytics/goal routing/internal transfer, pending transaction presentation and Spending translations. Their owning sources are unchanged by this task; that fact alone does not prove historical baseline success or failure. No frozen hashes, assertions or thresholds were weakened. Final combined gate results are recorded after the fresh final run.

Final review corrections: recovery OTP now re-reads the current session store before restoration, so expiry between password/phone and OTP cannot restore an expired draft. Resume routing metadata is removed from live values after restoration, preventing a later save from retaining an old temporary page. Both regressions were reproduced against the previous native bundle and now pass through the real native host. Additional checks cover income opt-out/addition, retention of existing incomes, source categories, the recommended-insurance variant and credit-specific information sheets. Shared selections now use the canonical checkbox component with one selected value.

The 18:49 combined run also finished naturally: 384 files passed, 16 failed; 4,552 tests passed, 27 failed. The source-registry regression is resolved. User subsequently authorized committing/pushing on main and production publication to the existing Vercel project; this supersedes the initial local-only delivery restriction. Final release verification follows all source corrections above.

## Final integration evidence

The 19:19 full run completed naturally: 383 files passed, 17 failed; 4,564 tests passed, 28 failed. One additional failure was a Native press-event synchronization race in the complete Cash Loan test. React Native Web configures its PressResponder in a passive effect after the enabled state commits. The new tests now wait for that state to paint before sending exactly one press; all assertions and disabled-state gates are retained. An instrumented diagnostic run then passed all 316 affected tests. Its project-wide coverage thresholds correctly failed because only four test files ran; it is not reported as a passing global coverage gate.

Both All screens views were inspected in the real browser: onboarding 32/32 ready and credit 44/44 ready, with no unavailable previews. The Word exports contain exactly 32 and 44 embedded phone images. The reference ZIP was downloaded and its selected native controller/page, tests, information model and SVG contents matched current checkout bytes exactly after restarting the development server to clear ignored-Native-source raw-module caching. The PDF action was blocked by the verification browser's pop-up policy; its print-window output was not certified.

Asset integration preserves the prior strict 1,501-asset aggregate 7443255c8bbe8ac6ed5b31ce8668a5754813739c03a012c887148a9f9ae5af57 exactly. The 16 Apple Wallet/Click to Pay/share-preview assets already committed on main are distinguished from this task's 37 original Figma asset additions. Combined strict inventory is 1,554 assets, aggregate 7a6f522405aac9af61bd6ee0ed0f3dd9c4b1ebac106c04ece83128f94922d795. Audit implementation, count/hash checks and retirement approvals are unchanged. Exact paths, bytes and hashes: 2026-11-13-ro-onboarding-asset-proof.json. No new source asset exactly duplicates existing asset bytes.

The identification provider's intentionally different branding is represented by a flow-local source palette, with Figma provenance; common black/white and overlays use canonical tokens. This does not add or promote a UniCredit Design System variant. The color-literal ratchet reports no additions in these task files. Remaining color failures are unchanged MortgageReimbursementFlow, RoBaselinePaymentFlow, RoCardServices, visualQaEvidence and visualQaReport. Consumption reports the unchanged ContractWithdrawalFlow ReviewField. The platform audit expects the absent Release Features section. The retired-PI graph failure follows the unchanged ETHOCA dependency into DomesticPaymentFlowScreens. These are recorded, not waived or re-baselined.

The final 19:57 combined run finished naturally after 992.97 seconds: 384 test files passed, 16 failed; 4,565 tests passed, 27 failed. Both new native-host screen suites passed in this full run (onboarding 132/132 and Cash Loan 133/133), including both complete connected journeys and the resume regressions. The remaining failures are the repository areas listed above; the general verify gate remains red and is not represented as a passing release gate.

Final production build passed with 517 native bundle files (bundle hash 056577397f92ef040f54f57092a5824428e9dc80d0cbaad90e0346f9d60db04d). Native TypeScript passed; module audit passed for 415 files. Root TypeScript, lint, formatting and 25 server tests passed before the final complete test run. Strict asset inventory passed with the preserved aggregate and explicit additions recorded above. Read-only integration review confirmed the two resume fixes and found no remaining material defect in its reviewed scope. Publication is authorized to the existing main branch and linked production Vercel project; bank and identity services remain demo fixtures.
