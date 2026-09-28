# International payment wizard: US and mainland China demo

This Evo 2027 preview models two distinct corridors from the Czech app. It collects the information needed to explain the payment journey to business stakeholders; it does not submit or sign an international payment.

| Destination | Demo currency | Recipient and bank information collected | Why |
| --- | --- | --- | --- |
| United States | USD | Exact account holder name, account number, recipient address and receiving bank name. The bank identifier changes with the selected method: ACH routing number, Fedwire routing number, or SWIFT/BIC. | US banks do not use IBAN for incoming international wires. FedACH and Fedwire have separate participant directories; a routing-number checksum alone does not confirm that a bank accepts the selected method. |
| Mainland China | CNY or USD | Exact account holder name, account number, recipient address, receiving bank name and SWIFT/BIC, payment purpose. CNAPS is required in the CNY preview and optional in the USD preview. | A Bank of China remittance form identifies CNAPS as mandatory for CNY remittance to China. Swift guidance describes structured purpose categories for cross-border CNY payments, with actual processing subject to bank-to-bank arrangements. |

The China purpose choices shown in the UI correspond to categories in a legacy Swift MT guideline: `RMT` for individual remittance, `GOD` for goods trade, `STR` for services trade and `OCA` for other current-account payments. They are illustrative UI choices, **not a claim that these legacy codewords are the current ISO 20022 or CIPS message requirement**. China's revised CIPS business rules took effect on 1 February 2026 and require participants to follow current CIPS message standards. The receiving bank may require additional or different evidence. The wizard checks the selected US bank identifier, the shape of SWIFT/BIC, the checksum of a nine-digit US routing number and the completeness of the selected fields. It does **not** verify ACH or Fedwire network participation, a bank directory entry, account ownership, sanctions, supporting documents or whether a particular bank accepts the chosen currency.

The FX amount is an **indicative demo estimate**, using the project's reference table dated 28 May 2026. The CNY extension uses that date's published ECB reference rate of 1 EUR = 7.8762 CNY. Fees, delivery timing and a live executable rate are unavailable, so review is possible but signing is disabled for both corridors.

## Primary sources

- [UniCredit Czech Online Banking guide](https://www.unicreditbank.cz/cs/online-banking-tutorial/pruvodce-novym-ob.html) — foreign-payment flow, recipient's exact name and BIC/SWIFT.
- [Chase wire transfer FAQ](https://www.chase.com/digital/wire-transfer/faqs) — no US IBAN; incoming international wire uses account number and SWIFT/BIC.
- [American Bankers Association routing numbers](https://www.aba.com/about-us/routing-number) — US routing numbers have nine digits.
- [Federal Reserve E-Payments Routing Directory](https://www.frbservices.org/resources/routing-number-directory) — separate Fedwire and FedACH participant directories.
- [Nacha IAT definition](https://www.nacha.org/rules/definition-iat-entries) — an international payment can have a US ACH network component; availability depends on the institutions involved.
- [Bank of China remittance application](https://pic.bankofchina.com/bocappd/singapore/202001/P020200123569494055986.pdf) — beneficiary/bank/address/purpose fields and CNAPS for CNY remittance to China.
- [Swift cross-border CNY guideline](https://www.swift.com/sites/default/files/documents/swift_standards_guidelines_crossbordercnytransaction.pdf) — purpose categories and bank-specific adoption caveat.
- [People's Bank of China revised CIPS business rules](https://www.cips.com.cn/eportal/ui?articleKey=35735e8044344ea1a73ab3fda1f555f8&columnId=43753&pageId=44397) — current participant/message framework effective 1 February 2026.
- [Bank of China 2026 international remittance guidance](https://www.bankofchina.com/pa/pbservice/pb3/202603/t20260320_25655954.html) — SWIFT for USD remittances and CNAPS for CNY to mainland China.
- [EU Official Journal: 28 May 2026 euro reference rates](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=OJ:C_202602569) — CNY reference value used for the demo quote.
