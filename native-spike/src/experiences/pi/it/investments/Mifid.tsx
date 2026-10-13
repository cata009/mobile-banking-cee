import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  hasInterviewAnswer,
  isValidInvestmentHouseholdSize,
  requiresRiskConfirmation,
  nextInterviewQuestionIndex,
  readInvestmentServicePreferences,
  saveInvestmentServicePreferences,
  selectInterviewAnswer,
  canSignService,
  type InterviewAnswers,
} from '@/features/investments/mobileFirstInvestmentServices';
import {
  investmentInterviewQuestions,
  serviceDocuments,
  servicesAssets,
} from '@/experiences/pi/it/mobile-first/investmentsServicesContent';
import { FormField } from '../../../../universal/FormField';
import {
  AssetGlyph,
  Button,
  ServiceLink as Link,
  Rows,
  s,
  tokens,
} from './Primitives';
import {
  OriginalDocumentPreview,
  ServiceDocument,
  ServiceMobileCode,
} from './ServiceForms';
import { InvestmentFooter } from './PageLayout';
import { shareOriginalAsset } from '../../../../platform/nativeFiles';
type Stage =
  | 'overview'
  | 'household'
  | 'questions'
  | 'risk'
  | 'review'
  | 'document'
  | 'declaration'
  | 'sign'
  | 'code'
  | 'success';
export default function Mifid({
  action,
  registerBack,
  onChanged,
  onPreferences,
}: {
  action?: string;
  registerBack: (handler: null | (() => boolean)) => void;
  onChanged: () => void;
  onPreferences: () => void;
}) {
  const [stage, setStage] = useState<Stage>('overview');
  const [kind, setKind] = useState<'adequacy' | 'appropriateness'>('adequacy');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswers>({});
  const [household, setHousehold] = useState('5');
  const [expanded, setExpanded] = useState(false);
  const [questionExpanded, setQuestionExpanded] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [shareError, setShareError] = useState('');
  const [completed, setCompleted] = useState(
    () => readInvestmentServicePreferences().completedInterviews,
  );
  const questions = investmentInterviewQuestions.filter(question =>
    kind === 'adequacy'
      ? question.group === 'financial' || question.group === 'risk'
      : question.group === 'education' ||
        question.group === 'knowledge' ||
        question.group === 'experience',
  );
  const current = questions[index] ?? investmentInterviewQuestions[0]!;
  const ids = questions.map(question => question.id);
  const required: typeof questions = [];
  // Compose the reachable path through the canonical q19 skip policy.
  for (
    let position = 0;
    position < questions.length;
    position = nextInterviewQuestionIndex(ids, position, answers)
  )
    required.push(questions[position]!);
  const label = kind === 'adequacy' ? 'adeguatezza' : 'appropriatezza';
  const download = (asset: string | number, filename: string) => {
    setShareError('');
    shareOriginalAsset(asset, filename).catch(reason =>
      setShareError(
        reason instanceof Error
          ? reason.message
          : 'Condivisione documenti non disponibile',
      ),
    );
  };
  const title =
    stage === 'overview'
      ? 'Intervista MIFID'
      : ['document', 'declaration', 'review'].includes(stage)
      ? `Sottoscrizione intervista ${label}`
      : stage === 'sign' || stage === 'code'
      ? 'Completa la sottoscrizione'
      : `Intervista di ${label}`;
  useEffect(() => {
    registerBack(() => {
      if (stage === 'overview') return false;
      if (stage === 'household') setStage('overview');
      else if (stage === 'questions') {
        if (index) {
          const previous = required
            .slice(
              0,
              required.findIndex(question => question.id === current.id),
            )
            .at(-1);
          setIndex(
            previous
              ? questions.findIndex(question => question.id === previous.id)
              : 0,
          );
        } else setStage(kind === 'adequacy' ? 'household' : 'overview');
      } else if (stage === 'risk' || stage === 'review') setStage('questions');
      else if (stage === 'document') setStage('review');
      else if (stage === 'declaration') setStage('document');
      else if (stage === 'sign') setStage('declaration');
      else if (stage === 'code') setStage('sign');
      else setStage('overview');
      return true;
    });
    return () => registerBack(null);
  });
  const start = (value: typeof kind) => {
    setKind(value);
    setIndex(0);
    setReviewed(false);
    setAccepted(false);
    setStage(value === 'adequacy' ? 'household' : 'questions');
  };
  const next = () => {
    if (
      requiresRiskConfirmation(
        current.id,
        answers[current.id] ?? [],
        current.options[3],
      )
    )
      setStage('risk');
    else if (index < questions.length - 1)
      setIndex(nextInterviewQuestionIndex(ids, index, answers));
    else setStage('review');
  };
  const group = questions.filter(question => question.group === current.group);
  const groupIndex = group.findIndex(question => question.id === current.id);
  const number =
    current.group === 'knowledge'
      ? groupIndex < 3
        ? 1
        : groupIndex - 1
      : groupIndex + 1;
  const total = current.group === 'knowledge' ? 4 : group.length;
  const footer = (caption: string, nextStage: Stage, disabled = false) => (
    <InvestmentFooter>
      <Button
        label={caption}
        disabled={disabled}
        onPress={() => setStage(nextStage)}
      />
    </InvestmentFooter>
  );
  return (
    <>
      <PageTitle>{title}</PageTitle>
      {!!shareError && (
        <Text accessibilityRole="alert" style={s.error}>
          {shareError}
        </Text>
      )}
      {stage === 'overview' && (
        <>
          <Link
            label={expanded ? 'Vedi meno' : 'Vedi altro'}
            onPress={() => setExpanded(!expanded)}
          />
          <Rows rows={[{ label: 'Intestazione', value: 'Andrea Rossini' }]} />
          {expanded && (
            <Rows
              rows={[
                { label: 'Anno di nascita', value: '1986' },
                { label: 'Profilo di rischio', value: 'Da aggiornare' },
              ]}
            />
          )}
          <Text style={s.heading}>Intervista MIFID</Text>
          {(['adequacy', 'appropriateness'] as const).map(value => (
            <View
              key={value}
              testID={`mifid-card-${value}`}
              style={styles.interviewCard}
            >
              <Text style={[s.heading, styles.cardHeading]}>
                {value === 'adequacy' ? 'Adeguatezza' : 'Appropriatezza'}
              </Text>
              <Text style={[s.body, styles.cardDate]}>
                Aggiornata il 07/06/2028
              </Text>
              <View style={styles.statusLine}>
                <View
                  style={[
                    styles.statusBadge,
                    !completed.includes(value) && styles.statusWarning,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      !completed.includes(value) && styles.statusWarningText,
                    ]}
                  >
                    {completed.includes(value) || action === 'complete'
                      ? 'Completa'
                      : action === 'expired'
                      ? 'Da aggiornare'
                      : 'Incompleta'}
                  </Text>
                </View>
              </View>
              <Link
                label={`Completa ${
                  value === 'adequacy' ? 'adeguatezza' : 'appropriatezza'
                }`}
                onPress={() => start(value)}
              />
            </View>
          ))}
          <Text style={s.body}>
            Prima del rilascio dell’intervista MiFID ti raccomandiamo di
            prendere visione dei seguenti documenti
          </Text>
          <ServiceDocument
            title="DOC. INFORMATIVO/CONFLICT POLICY/INFO VALUTAZIONE ADEGUATEZZA"
            image={serviceDocuments.mifidDocument}
            reviewed={reviewed}
            onReview={() => setReviewed(true)}
            onDownload={() =>
              download(
                serviceDocuments.mifidDocument,
                'DOC. INFORMATIVO_CONFLICT POLICY_INFO VALUTAZIONE ADEGUATEZZA.png',
              )
            }
          />
          <Link
            label="FAC-SIMILE ADEGUATEZZA"
            icon={null}
            anchor
            onPress={() =>
              download(serviceDocuments.mifidDocument, 'mifidDocument.png')
            }
          />
          <Link
            label="FAC-SIMILE APPROPRIATEZZA"
            icon={null}
            anchor
            onPress={() =>
              download(
                serviceDocuments.mifidDeclaration,
                'mifidDeclaration.png',
              )
            }
          />
        </>
      )}
      {stage === 'household' && (
        <>
          <Rows
            rows={[
              { label: 'Intestatario di riferimento', value: 'Andrea Rossini' },
              { label: 'Anno di nascita', value: '1986' },
            ]}
          />
          <Text style={s.body}>
            Intendendosi per nucleo familiare il numero di persone che basano il
            loro sostentamento sul Suo patrimonio, da quante persone è composto
            tale nucleo familiare?
          </Text>
          <FormField
            tokens={tokens}
            label="Persone che compongono il nucleo familiare"
            value={household}
            onChange={setHousehold}
            labelStyle={s.body}
            inputProps={{ keyboardType: 'number-pad', style: styles.input }}
          />
          {footer(
            'Prosegui',
            'questions',
            !isValidInvestmentHouseholdSize(household),
          )}
        </>
      )}
      {stage === 'questions' && (
        <>
          <View style={styles.progress}>
            <Text style={s.strong}>
              {number}/{total}
            </Text>
            <View style={styles.track}>
              <View
                style={[styles.band, { width: `${(number / total) * 100}%` }]}
              />
            </View>
          </View>
          <Text style={s.heading}>{current.title}</Text>
          <Text style={s.body}>
            {current.id === 'q9' && !questionExpanded
              ? current.description.split('\n')[0]
              : current.description.replace('Mostra di più', '')}
          </Text>
          {current.id === 'q9' && (
            <Link
              label={questionExpanded ? 'Mostra meno' : 'Mostra di più'}
              onPress={() => setQuestionExpanded(!questionExpanded)}
            />
          )}
          {current.options.map(option => (
            <Pressable
              key={option}
              accessibilityRole={current.multiple ? 'checkbox' : 'radio'}
              accessibilityLabel={option}
              accessibilityState={{
                checked: answers[current.id]?.includes(option) ?? false,
              }}
              style={styles.option}
              onPress={() => {
                setReviewed(false);
                setAccepted(false);
                setAnswers({
                  ...answers,
                  [current.id]: selectInterviewAnswer(
                    answers[current.id] ?? [],
                    option,
                    current.multiple,
                  ),
                });
              }}
            >
              <View
                style={[
                  styles.control,
                  !current.multiple && styles.radio,
                  answers[current.id]?.includes(option) && styles.checked,
                ]}
              />
              <Text style={[s.body, s.grow]}>{option}</Text>
            </Pressable>
          ))}
          <InvestmentFooter>
            <Button
              label="Prosegui"
              disabled={!hasInterviewAnswer(answers, current.id)}
              onPress={next}
            />
          </InvestmentFooter>
        </>
      )}
      {stage === 'risk' && (
        <>
          <Text style={s.heading}>Propensione al rischio</Text>
          <Text style={s.body}>
            Il profilo di propensione al rischio selezionato è superiore al
            profilo di propensione al rischio che la Banca ritiene a te
            associabile sulla base delle informazioni da te fornite e/o in
            possesso della Banca.
          </Text>
          <Text style={s.body}>
            Cliccando su Prosegui confermi la propensione al rischio selezionata
            e puoi concludere l’aggiornamento dell’intervista.
          </Text>
          <InvestmentFooter>
            <Button
              label="Prosegui"
              onPress={() => {
                setIndex(index + 1);
                setStage('questions');
              }}
            />
          </InvestmentFooter>
          <Link label="Modifica" onPress={() => setStage('questions')} />
        </>
      )}
      {stage === 'review' && (
        <>
          <Text style={s.body}>
            Ti raccomandiamo l’attenta lettura dell’intervista {label} di
            seguito esposta comprensiva delle risposte compilate sulla base
            delle tue indicazioni.
          </Text>
          <Rows
            rows={required.map(question => ({
              label: question.title,
              value: answers[question.id]?.join('; ') ?? 'Da completare',
            }))}
          />
          <InvestmentFooter>
            <Button
              label="Prosegui"
              disabled={required.some(
                question => !hasInterviewAnswer(answers, question.id),
              )}
              onPress={() => {
                setReviewed(false);
                setStage('document');
              }}
            />
          </InvestmentFooter>
        </>
      )}
      {stage === 'document' && (
        <>
          <ServiceDocument
            title={`INTERVISTA ${label.toUpperCase()}`}
            image={serviceDocuments.mifidDocument}
            reviewed={reviewed}
            onReview={() => setReviewed(true)}
            onDownload={() =>
              download(
                serviceDocuments.mifidDocument,
                `INTERVISTA ${label.toUpperCase()}.png`,
              )
            }
          />
          {footer('Conferma', 'declaration', !reviewed)}
        </>
      )}
      {stage === 'declaration' && (
        <>
          <Text style={s.body}>
            Confermo le risposte contenute nel documento denominato “INTERVISTA{' '}
            {label.toUpperCase()}” nonché le ulteriori dichiarazioni contenute
            nella relativa sezione “DICHIARAZIONI DEL CLIENTE/I”.
          </Text>
          <OriginalDocumentPreview
            asset={serviceDocuments.mifidDeclaration}
            label="Dichiarazioni del cliente"
          />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="Accetto le dichiarazioni del cliente"
            accessibilityState={{ checked: accepted }}
            style={styles.option}
            onPress={() => setAccepted(!accepted)}
          >
            <View style={[styles.control, accepted && styles.checked]} />
            <Text style={s.body}>Accetto le dichiarazioni del cliente</Text>
          </Pressable>
          {footer('Accetta e prosegui', 'sign', !accepted || !reviewed)}
        </>
      )}
      {stage === 'sign' && (
        <>
          <Text style={s.body}>
            Con l’inserimento del sistema di autenticazione nel seguito
            richiesto, premendo sul tasto CONFERMA, si completa la
            sottoscrizione elettronica in corrispondenza dei punti firma
            accettati.
          </Text>
          {footer('Conferma', 'code', !accepted || !reviewed)}
        </>
      )}
      {stage === 'code' && (
        <ServiceMobileCode
          onConfirm={code => {
            if (!canSignService(reviewed, accepted, code)) return;
            const preferences = readInvestmentServicePreferences();
            const interviews = [
              ...new Set([...preferences.completedInterviews, kind]),
            ];
            saveInvestmentServicePreferences({
              completedInterviews: interviews,
            });
            setCompleted(interviews);
            onPreferences();
            onChanged();
            setStage('success');
          }}
        />
      )}
      {stage === 'success' && (
        <>
          <AssetGlyph
            asset={servicesAssets.imgNavigationAndActionSuccessLargeTkyPage}
          />
          <Text style={s.heading}>
            {`Sottoscrizione intervista ${label} effettuata con successo!`}
          </Text>
          <Button label="Chiudi" onPress={() => setStage('overview')} />
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  interviewCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    gap: 0,
  },
  cardHeading: { lineHeight: 26, marginBottom: 16 },
  cardDate: { marginBottom: 16 },
  statusLine: { alignItems: 'flex-start', paddingTop: 1.5 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#368247',
  },
  statusWarning: { backgroundColor: '#ffd000' },
  statusText: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
  },
  statusWarningText: { color: '#262626' },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  track: { flex: 1, height: 4, backgroundColor: '#ddd', overflow: 'hidden' },
  band: { height: 4, backgroundColor: '#007f96' },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 16,
  },
  control: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 2,
  },
  radio: { borderRadius: 12 },
  checked: { backgroundColor: '#007f96', borderColor: '#007f96' },
});
