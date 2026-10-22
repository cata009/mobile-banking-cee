import AccountTransactionRow from '@/app/components/accounts/AccountTransactionRow'
import MerchantLogo from '@/app/components/merchants/MerchantLogo'
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import { fraudLedgerTransaction } from '@/features/cards/fraud/transactions'
import { FRAUD_TRANSACTIONS, isFraudActivityReviewed, type FraudSession } from '@/features/cards/fraud/model'

export function FraudActivityList({ state, onSelect }: { state: FraudSession; onSelect: (id: string) => void }) {
  return (
    <section className="fraud-alert-list" aria-label="Suspicious card activity">
      {[false, true].map((done) => {
        const payments = FRAUD_TRANSACTIONS.map((payment) => ({
          ...payment,
          status: state.ledgerOverrides[payment.id] ?? payment.status,
        })).filter((payment) => isFraudActivityReviewed(state, payment.id) === done)
        if (done && payments.length === 0) return null
        return (
          <div className="fraud-activity-group" key={String(done)}>
            <SectionHeadingDivider
              title={done ? 'REVIEWED' : 'TO REVIEW'}
              secondaryText={String(payments.length)}
              variant="light-small-title-data"
            />
            {payments.length === 0 ? (
              <p className="fraud-empty-group">You have reviewed all activity.</p>
            ) : (
              payments.map((payment) => (
                <div className="fraud-activity-item" key={payment.id}>
                  <button
                    type="button"
                    aria-label={`Review ${payment.merchant}`}
                    onClick={() => onSelect(payment.id)}
                    className="fraud-ledger-button"
                  >
                    <AccountTransactionRow
                      transaction={fraudLedgerTransaction(payment.id, payment.status)}
                      formattedAmount={payment.amount.replace(' BAM', '')}
                      currency="BAM"
                      detailsLabel={payment.status === 'declined' ? 'Declined attempt · No money debited' : undefined}
                      amountSign={payment.status === 'declined' ? '' : undefined}
                      showStatus
                      statusLabel={payment.status === 'declined' ? 'Declined' : undefined}
                      leadingVisual={
                        payment.id === 'berlin' ? (
                          <MerchantLogo merchant="carrefour" size={32} />
                        ) : payment.id === 'online' ? (
                          <MerchantLogo merchant="youtube" size={32} />
                        ) : payment.id === 'emag' ? (
                          <MerchantLogo merchant="emag" size={32} />
                        ) : (
                          <PfmCategoryIcon category="Finance" variant="category-circle" size={32} />
                        )
                      }
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        )
      })}
    </section>
  )
}
