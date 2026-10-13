import { useState } from 'react'
import {
  hasInterviewAnswer,
  isValidInvestmentHouseholdSize,
  requiresRiskConfirmation,
  nextInterviewQuestionIndex,
  readInvestmentServicePreferences,
  saveInvestmentServicePreferences,
  selectInterviewAnswer,
  type InterviewAnswers,
} from '@/features/investments/mobileFirstInvestmentServices'
import type { InvestmentAreaProps } from './investmentsNavigation'
import { InvestmentButton, InvestmentRows } from './MobileFirstInvestmentPrimitives'
import { investmentInterviewQuestions, serviceDocuments } from './investmentsServicesContent'
import {
  ServiceCheck,
  ServiceDocument,
  ServiceFrame,
  ServiceLink,
  ServiceMobileCode,
  ServiceSuccess,
} from './MobileFirstInvestmentServicesForms'

export function InvestmentMifid(props: InvestmentAreaProps) {
  const [stage, setStage] = useState<
    | 'overview'
    | 'household'
    | 'questions'
    | 'risk'
    | 'review'
    | 'document'
    | 'declaration'
    | 'sign'
    | 'code'
    | 'success'
  >('overview')
  const [kind, setKind] = useState<'adequacy' | 'appropriateness'>('adequacy')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<InterviewAnswers>({})
  const [household, setHousehold] = useState('5')
  const [expanded, setExpanded] = useState(false)
  const [questionExpanded, setQuestionExpanded] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [completed, setCompleted] = useState<string[]>(() => readInvestmentServicePreferences().completedInterviews)
  const questions = investmentInterviewQuestions.filter((question) =>
    kind === 'adequacy'
      ? question.group === 'financial' || question.group === 'risk'
      : question.group === 'education' || question.group === 'knowledge' || question.group === 'experience',
  )
  const current = questions[index] ?? investmentInterviewQuestions[0]
  const requiredQuestions = questions.filter((question) => question.id !== 'q20' || answers.q19?.[0] !== 'Nessuna')
  const label = kind === 'adequacy' ? 'adeguatezza' : 'appropriatezza'
  const title =
    stage === 'overview'
      ? 'Intervista MIFID'
      : ['document', 'declaration', 'review'].includes(stage)
        ? `Sottoscrizione intervista ${label}`
        : stage === 'sign' || stage === 'code'
          ? 'Completa la sottoscrizione'
          : `Intervista di ${label}`
  const start = (value: typeof kind) => {
    setKind(value)
    setIndex(0)
    setReviewed(false)
    setAccepted(false)
    setStage(value === 'adequacy' ? 'household' : 'questions')
  }
  const back = () => {
    if (stage === 'overview') props.onClose()
    else if (stage === 'household') setStage('overview')
    else if (stage === 'questions') {
      if (index) setIndex(current.id === 'q21' && answers.q19?.[0] === 'Nessuna' ? index - 2 : index - 1)
      else setStage(kind === 'adequacy' ? 'household' : 'overview')
    } else if (stage === 'risk') setStage('questions')
    else if (stage === 'review') setStage('questions')
    else if (stage === 'document') setStage('review')
    else if (stage === 'declaration') setStage('document')
    else if (stage === 'sign') setStage('declaration')
    else if (stage === 'code') setStage('sign')
    else setStage('overview')
  }
  const next = () => {
    if (requiresRiskConfirmation(current.id, answers[current.id] ?? [], current.options[3])) setStage('risk')
    else if (index < questions.length - 1)
      setIndex(
        nextInterviewQuestionIndex(
          questions.map((question) => question.id),
          index,
          answers,
        ),
      )
    else setStage('review')
  }
  const groupQuestions = questions.filter((question) => question.group === current.group)
  const groupIndex = groupQuestions.findIndex((question) => question.id === current.id)
  const number = current.group === 'knowledge' ? (groupIndex < 3 ? 1 : groupIndex - 1) : groupIndex + 1
  const total = current.group === 'knowledge' ? 4 : groupQuestions.length
  return (
    <ServiceFrame title={title} onBack={back} onClose={props.onClose}>
      {stage === 'overview' && (
        <div data-node-id="24262:780342">
          <ServiceLink onClick={() => setExpanded(!expanded)}>{expanded ? 'Vedi meno' : 'Vedi altro'}</ServiceLink>
          <InvestmentRows rows={[{ label: 'Intestazione', value: 'Andrea Rossini' }]} />
          {expanded && (
            <InvestmentRows
              rows={[
                { label: 'Anno di nascita', value: '1986' },
                { label: 'Profilo di rischio', value: 'Da aggiornare' },
              ]}
            />
          )}
          <h3>Intervista MIFID</h3>
          {(['adequacy', 'appropriateness'] as const).map((value) => (
            <article className="mfiv-card" key={value}>
              <h3>{value === 'adequacy' ? 'Adeguatezza' : 'Appropriatezza'}</h3>
              <p>Aggiornata il 07/06/2028</p>
              <span className={`mfiv-status ${completed.includes(value) ? '' : 'mfiv-status-warning'}`}>
                {completed.includes(value) || props.action === 'complete'
                  ? 'Completa'
                  : props.action === 'expired'
                    ? 'Da aggiornare'
                    : 'Incompleta'}
              </span>
              <ServiceLink onClick={() => start(value)}>
                Completa {value === 'adequacy' ? 'adeguatezza' : 'appropriatezza'}
              </ServiceLink>
            </article>
          ))}
          <p>Prima del rilascio dell’intervista MiFID ti raccomandiamo di prendere visione dei seguenti documenti</p>
          <ServiceDocument
            title="DOC. INFORMATIVO/CONFLICT POLICY/INFO VALUTAZIONE ADEGUATEZZA"
            image={serviceDocuments.mifidDocument}
            reviewed={reviewed}
            onReview={() => setReviewed(true)}
          />
          <a className="mfiv-link" href={serviceDocuments.mifidDocument} download>
            FAC-SIMILE ADEGUATEZZA
          </a>
          <a className="mfiv-link" href={serviceDocuments.mifidDeclaration} download>
            FAC-SIMILE APPROPRIATEZZA
          </a>
        </div>
      )}
      {stage === 'household' && (
        <div data-node-id="24262:780437">
          <InvestmentRows
            rows={[
              { label: 'Intestatario di riferimento', value: 'Andrea Rossini' },
              { label: 'Anno di nascita', value: '1986' },
            ]}
          />
          <p>
            Intendendosi per nucleo familiare il numero di persone che basano il loro sostentamento sul Suo patrimonio,
            da quante persone è composto tale nucleo familiare?
          </p>
          <label className="mfiv-field">
            Persone che compongono il nucleo familiare
            <input type="number" min={1} value={household} onChange={(event) => setHousehold(event.target.value)} />
          </label>
          <InvestmentButton disabled={!isValidInvestmentHouseholdSize(household)} onClick={() => setStage('questions')}>
            Prosegui
          </InvestmentButton>
        </div>
      )}
      {stage === 'questions' && (
        <div data-node-id={current.source}>
          <div className="mfiv-progress">
            <span>
              {number}/{total}
            </span>
            <progress value={number} max={total} />
          </div>
          <h3>{current.title}</h3>
          <p className="mfiv-question-description">
            {current.id === 'q9' && !questionExpanded
              ? current.description.split('\n')[0]
              : current.description.replace('Mostra di più', '')}
          </p>
          {current.id === 'q9' && (
            <ServiceLink onClick={() => setQuestionExpanded(!questionExpanded)}>
              {questionExpanded ? 'Mostra meno' : 'Mostra di più'}
            </ServiceLink>
          )}
          <fieldset className="mfiv-options">
            <legend className="sr-only">{current.title}</legend>
            {current.options.map((option) => (
              <label key={option}>
                <input
                  type={current.multiple ? 'checkbox' : 'radio'}
                  name={current.id}
                  value={option}
                  checked={answers[current.id]?.includes(option) ?? false}
                  onChange={() => {
                    setReviewed(false)
                    setAccepted(false)
                    setAnswers((previous) => ({
                      ...previous,
                      [current.id]: selectInterviewAnswer(previous[current.id] ?? [], option, current.multiple),
                    }))
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <InvestmentButton disabled={!hasInterviewAnswer(answers, current.id)} onClick={next}>
            Prosegui
          </InvestmentButton>
        </div>
      )}
      {stage === 'risk' && (
        <div data-node-id="24262:780608">
          <h3>Propensione al rischio</h3>
          <p>
            Il profilo di propensione al rischio selezionato è superiore al profilo di propensione al rischio che la
            Banca ritiene a te associabile sulla base delle informazioni da te fornite e/o in possesso della Banca.
          </p>
          <p>
            Cliccando su Prosegui confermi la propensione al rischio selezionata e puoi concludere l’aggiornamento
            dell’intervista.
          </p>
          <InvestmentButton
            onClick={() => {
              setIndex(index + 1)
              setStage('questions')
            }}
          >
            Prosegui
          </InvestmentButton>
          <ServiceLink onClick={() => setStage('questions')}>Modifica</ServiceLink>
        </div>
      )}
      {stage === 'review' && (
        <>
          <p>
            Ti raccomandiamo l’attenta lettura dell’intervista {label} di seguito esposta comprensiva delle risposte
            compilate sulla base delle tue indicazioni.
          </p>
          <InvestmentRows
            rows={requiredQuestions.map((question) => ({
              label: question.title,
              value: answers[question.id]?.join('; ') ?? 'Da completare',
            }))}
          />
          <InvestmentButton
            disabled={requiredQuestions.some((question) => !hasInterviewAnswer(answers, question.id))}
            onClick={() => {
              setReviewed(false)
              setStage('document')
            }}
          >
            Prosegui
          </InvestmentButton>
        </>
      )}
      {stage === 'document' && (
        <>
          <ServiceDocument
            title={`INTERVISTA ${label.toUpperCase()}`}
            image={serviceDocuments.mifidDocument}
            reviewed={reviewed}
            onReview={() => setReviewed(true)}
          />
          <InvestmentButton disabled={!reviewed} onClick={() => setStage('declaration')}>
            Conferma
          </InvestmentButton>
        </>
      )}
      {stage === 'declaration' && (
        <div data-node-id="24262:780409">
          <p>
            Confermo le risposte contenute nel documento denominato “INTERVISTA {label.toUpperCase()}” nonché le
            ulteriori dichiarazioni contenute nella relativa sezione “DICHIARAZIONI DEL CLIENTE/I”.
          </p>
          <img
            className="mfiv-document-preview"
            src={serviceDocuments.mifidDeclaration}
            alt="Dichiarazioni del cliente"
          />
          <ServiceCheck label="Accetto le dichiarazioni del cliente" checked={accepted} onChange={setAccepted} />
          <InvestmentButton disabled={!accepted || !reviewed} onClick={() => setStage('sign')}>
            Accetta e prosegui
          </InvestmentButton>
        </div>
      )}
      {stage === 'sign' && (
        <>
          <p>
            Con l’inserimento del sistema di autenticazione nel seguito richiesto, premendo sul tasto CONFERMA, si
            completa la sottoscrizione elettronica in corrispondenza dei punti firma accettati.
          </p>
          <InvestmentButton disabled={!accepted || !reviewed} onClick={() => setStage('code')}>
            Conferma
          </InvestmentButton>
        </>
      )}
      {stage === 'code' && (
        <ServiceMobileCode
          onConfirm={() => {
            if (accepted && reviewed) {
              setCompleted((previous) => {
                const next = [...new Set([...previous, kind])]
                saveInvestmentServicePreferences({ completedInterviews: next })
                return next
              })
              setStage('success')
            }
          }}
        />
      )}
      {stage === 'success' && (
        <ServiceSuccess
          title={`Sottoscrizione intervista ${label} effettuata con successo!`}
          onClose={() => setStage('overview')}
        />
      )}
    </ServiceFrame>
  )
}
