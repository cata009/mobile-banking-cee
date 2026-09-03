# Bank logos

Drop each bank's **official** logo file here, named after its id in
`src/app/config/bankLogos.ts`. The Payments beneficiaries list picks it up
automatically — no code change:

| File                | Bank                |
| ------------------- | ------------------- |
| `unicredit.svg`     | UniCredit Bank      |
| `revolut.svg`       | Revolut             |
| `kb.svg`            | Komerční banka      |
| `cs.svg`            | Česká spořitelna    |
| `raiffeisen.svg`    | Raiffeisenbank      |
| `moneta.svg`        | MONETA Money Bank   |

`.svg` is preferred; `.png` works too. Square (or near-square) marks read best
at the 18px badge size — use the icon/symbol from the bank's press kit rather
than the horizontal wordmark.

Until a file is present the badge falls back to the bank's brand colour with
its initials, so the list never shows a broken image.
