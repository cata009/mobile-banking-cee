import { useState } from 'react'
import { InvestmentButton, InvestmentPage } from './MobileFirstInvestmentPrimitives'
import back from '@/assets/mobile-first/it/investments/common/back.svg'
import unicredit from '@/assets/mobile-first/it/investments/commercial/unicredit.svg'
import buddy from '@/assets/mobile-first/it/investments/commercial/buddy.svg'
import brandLine from '@/assets/mobile-first/it/investments/commercial/brand-line.svg'
import list from '@/assets/mobile-first/it/investments/commercial/deposit-list.png'
import detailImage from '@/assets/mobile-first/it/investments/commercial/deposit-detail.png'
import appointment from '@/assets/mobile-first/it/investments/commercial/appointment.svg'

export default function MobileFirstInvestmentDepositInfo({
  onClose,
  onAppointment,
}: {
  onClose: () => void
  onAppointment: () => void
}) {
  const [detail, setDetail] = useState(false)
  const goBack = () => (detail ? setDetail(false) : onClose())
  const header = (
    <header className="mfi-web-toolbar">
      <button type="button" aria-label="Indietro" onClick={goBack}>
        <img src={back} alt="" />
      </button>
      <img src={unicredit} alt="UniCredit" />
      <span>
        <img src={brandLine} alt="" />
      </span>
      <img src={buddy} alt="buddy UniCredit" />
    </header>
  )
  return (
    <InvestmentPage
      title={detail ? 'Conto Titoli come aprirlo' : 'Tutti gli investimenti'}
      onClose={onClose}
      header={header}
      hideHeading
      contentClassName="mfi-web-content"
      footer={
        detail ? (
          <InvestmentButton onClick={onAppointment}>
            <span className="mfi-appointment-button">
              <img src={appointment} alt="" />
              Appuntamento
            </span>
          </InvestmentButton>
        ) : undefined
      }
    >
      {detail ? (
        <div data-node-id="24262:675751">
          <div className="mfi-deposit-info-title">Conto Titoli come aprirlo</div>
          <div className="mfi-deposit-info-image">
            <img
              src={detailImage}
              alt="Conto Titoli Ordinario: apri un conto titoli per negoziare titoli, sottoscrivere fondi e ricevere consulenza a distanza."
            />
          </div>
        </div>
      ) : (
        <div className="mfi-deposit-list" data-node-id="24262:675745">
          <img src={list} alt="Tutti gli investimenti. Investi online. Conto Titoli come aprirlo." />
          <button
            type="button"
            className="mfi-deposit-list-target"
            aria-label="Conto Titoli come aprirlo"
            onClick={() => setDetail(true)}
          />
        </div>
      )}
    </InvestmentPage>
  )
}
