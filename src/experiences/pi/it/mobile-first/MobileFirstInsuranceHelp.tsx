import { useState } from 'react'
import { InsuranceButton, InsuranceLink, InsurancePage } from './MobileFirstInsurancePrimitives'
import { INSURANCE_FAQ } from './insuranceContent'
import { insuranceAssets as a } from './insuranceAssets'

export default function MobileFirstInsuranceHelp({
  variant = 'faq',
  onClose,
  onContact,
  subject,
}: {
  variant?: 'faq' | 'contact'
  onClose: () => void
  onContact?: (channel: 'chat' | 'phone') => void
  subject?: string
}) {
  const [question, setQuestion] = useState<number | null>(null)
  const [channel, setChannel] = useState<'chat' | 'phone' | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const contact = (value: 'chat' | 'phone') => {
    if (onContact) onContact(value)
    else setChannel(value)
  }
  if (channel)
    return (
      <InsurancePage
        title={channel === 'chat' ? 'Chatta con noi' : 'Chiama'}
        subtitle={subject}
        onClose={() => setChannel(null)}
        footer={
          channel === 'chat' && (
            <InsuranceButton
              disabled={!message.trim()}
              onClick={() => {
                setMessages([...messages, message.trim()])
                setMessage('')
              }}
            >
              Invia
            </InsuranceButton>
          )
        }
      >
        {channel === 'phone' ? (
          <p>
            Trovi il contatto telefonico della compagnia nei documenti della tua polizza. Puoi consultare il contratto o
            rivolgerti alla tua filiale.
          </p>
        ) : (
          <>
            <p>Come possiamo aiutarti con la tua polizza?</p>
            {messages.map((text, index) => (
              <p className="mf-ins-chat-message" key={index}>
                {text}
              </p>
            ))}
            <label className="mf-ins-label">
              Messaggio
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                placeholder="Scrivi un messaggio..."
              />
            </label>
          </>
        )}
      </InsurancePage>
    )
  if (variant === 'contact')
    return (
      <InsurancePage title="Hai bisogno di assistenza sui canali digitali?" onClose={onClose}>
        <p>Scegli il canale che preferisci per parlare con noi.</p>
        {subject && <p className="mf-ins-contact-subject">{subject}</p>}
        <div className="mf-ins-contact-actions">
          <InsuranceButton onClick={() => contact('chat')}>
            <img src={a.chatWhite} alt="" />
            Chatta con noi
          </InsuranceButton>
          <InsuranceButton onClick={() => contact('phone')}>
            <img src={a.phone} alt="" />
            Chiama
          </InsuranceButton>
        </div>
      </InsurancePage>
    )
  return (
    <InsurancePage
      title="Polizze assicurative"
      onClose={onClose}
      footer={
        <>
          <InsuranceButton onClick={() => contact('chat')}>
            <img src={a.chat} alt="" />
            Avvia Chat
          </InsuranceButton>
          <InsuranceButton secondary onClick={() => contact('phone')}>
            <img src={a.agency} alt="" />
            Parla con noi
          </InsuranceButton>
        </>
      }
    >
      <p>
        In queste pagine trovi le informazioni relative alle tue polizze assicurative di protezione distribuite da
        UniCredit.
      </p>
      <p className="mf-ins-help-copy">Inoltre, qui troverai anche:</p>
      <ul className="mf-ins-help-list">
        <li>Il dettaglio delle protezioni e dei moduli assicurati.</li>
        <li>I documenti e lo storico della tua polizza.</li>
        <li>I contatti per ricevere assistenza.</li>
      </ul>
      <p className="mf-ins-help-copy">
        Inizialmente, alcuni prodotti potrebbero non essere presenti nella sezione, stiamo lavorando per inserirli e
        darti così piena visibilità delle tue polizze.
      </p>
      <h3>Consulta le FAQ</h3>
      {INSURANCE_FAQ.map((faq, index) => (
        <div className="mf-ins-faq" key={faq.question}>
          <button
            type="button"
            aria-expanded={question === index}
            onClick={() => setQuestion(question === index ? null : index)}
          >
            {faq.question}
            <img src={a.forth} alt="" />
          </button>
          {question === index && <p>{faq.answer}</p>}
        </div>
      ))}
      <InsuranceLink onClick={() => setQuestion(question === null ? 0 : null)}>Vedi tutte le FAQ</InsuranceLink>
    </InsurancePage>
  )
}
