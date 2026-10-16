import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  canContinueCall,
  CONTACT_INTERVALS,
  createCallDraft,
  type RequestCallDraft,
} from '@/features/profile/evoCallRequest';
import {
  formatAppointmentDate,
  getAppointmentDateLocale,
} from '@/app/screens/appointments/appointmentModel';
import type { CurrentScreenProps } from '../../contracts';
import { TextInput } from '../../../../../universal/Typography';
import {
  AppointmentHost,
  AppointmentPage,
  Button,
  Copy,
  FieldValue,
  Notes,
  NotesFooter,
  ReviewSection,
  ReviewValue,
  SectionHeading,
  Success,
  s,
  useColors,
  useFlowBack,
} from './appointment/Ui';
import {
  AppointmentSheet,
  CalendarSheet,
  FormCheckbox,
  SelectionSheet,
} from './appointment/Sheets';

export default function CallRequest(host: CurrentScreenProps) {
  return (
    <AppointmentHost host={host}>
      <CallFlow host={host} />
    </AppointmentHost>
  );
}
function CallFlow({ host }: { host: CurrentScreenProps }) {
  const text = (key: string, fallback: string) =>
      host.t(`requestCall.${key}`, fallback),
    color = useColors(),
    locale = getAppointmentDateLocale(host.country, host.language);
  const [view, setView] = useState<'form' | 'notes' | 'review' | 'success'>(
      'form',
    ),
    [draft, setDraft] = useState(() => createCallDraft(host.country));
  const [sheet, setSheet] = useState<'reason' | 'detail' | 'interval' | null>(
      null,
    ),
    [choices, setChoices] = useState<string[]>([]),
    [calendar, setCalendar] = useState(false);
  const update = (changes: Partial<RequestCallDraft>) =>
    setDraft(current => ({ ...current, ...changes }));
  const consumeBack = () => {
    if (sheet) {
      setSheet(null);
      return true;
    }
    if (calendar) {
      setCalendar(false);
      return true;
    }
    if (view === 'form' || view === 'success') return false;
    setView(view === 'review' ? 'notes' : 'form');
    return true;
  };
  const back = () => {
    if (!consumeBack()) host.onBack();
  };
  useFlowBack(consumeBack);
  const open = (kind: 'reason' | 'detail' | 'interval') => {
    setChoices(
      kind === 'reason'
        ? draft.reasons
        : kind === 'detail'
        ? draft.details
        : draft.intervals,
    );
    setSheet(kind);
  };
  const toggle = (value: string) =>
    setChoices(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value],
    );
  const confirm = () => {
    if (sheet === 'reason') update({ reasons: choices, details: [] });
    else if (sheet === 'detail') update({ details: choices });
    else update({ intervals: choices });
    setSheet(null);
  };
  const overlays = (
    <>
      {sheet === 'reason' || sheet === 'detail' ? (
        <SelectionSheet
          kind={sheet}
          selected={choices}
          onToggle={toggle}
          onClose={() => setSheet(null)}
          onConfirm={confirm}
          text={text}
        />
      ) : sheet === 'interval' ? (
        <AppointmentSheet
          title={text('contactIntervalsTitle', 'Contact me during')}
          headerGap={12}
          onClose={() => setSheet(null)}
          footer={<Button label={text('select', 'Select')} onPress={confirm} />}
        >
          <View style={styles.intervals}>
            <Copy strong size={14} style={styles.mb8}>
              {text(
                'selectIntervals',
                'Select one or more intervals',
              ).toUpperCase()}
            </Copy>
            {CONTACT_INTERVALS.map(interval => (
              <FormCheckbox
                key={interval}
                label={interval}
                checked={choices.includes(interval)}
                onPress={() => toggle(interval)}
              />
            ))}
          </View>
        </AppointmentSheet>
      ) : null}
      {calendar ? (
        <CalendarSheet
          title={text('preferredDate', 'Preferred callback date')}
          todayLabel={text('today', 'Today')}
          selectedDate={draft.callbackDate}
          locale={locale}
          onClose={() => setCalendar(false)}
          onConfirm={callbackDate => update({ callbackDate })}
        />
      ) : null}
    </>
  );
  if (view === 'form')
    return (
      <AppointmentPage
        title={text('title', 'Request a call')}
        onBack={back}
        overlays={overlays}
        footer={
          <Button
            label={text('continue', 'Continue')}
            disabled={!canContinueCall(draft)}
            onPress={() => setView('notes')}
          />
        }
      >
        <View style={s.form}>
          <SectionHeading>
            {text('reasonSection', 'Contact reason')}
          </SectionHeading>
          <View style={s.mb28}>
            <FieldValue
              label={text('reasonPrompt', 'What do you want to talk about?')}
              value={draft.reasons.join(', ')}
              helper={text(
                'reasonHelper',
                'This will help the advisor to be prepared for the meeting',
              )}
              onPress={() => open('reason')}
            />
            {draft.reasons.length ? (
              <View style={styles.mt16}>
                <FieldValue
                  label={text(
                    'detailPrompt',
                    'Give us more details about your request',
                  )}
                  value={draft.details.join(', ')}
                  helper={text(
                    'detailHelper',
                    'This will help the advisor to be prepared with everything that is required',
                  )}
                  onPress={() => open('detail')}
                />
              </View>
            ) : null}
          </View>
          <SectionHeading>
            {text('preferredMoment', 'Preferred contact moment')}
          </SectionHeading>
          <View style={s.mb24}>
            <FieldValue
              label={text('preferredDate', 'Preferred callback date')}
              value={formatAppointmentDate(draft.callbackDate, locale)}
              helper={text(
                'dateHelper',
                'We’ll try to call you on the date you choose, but we cannot guarantee it. We’re closed on Bank Holidays',
              )}
              trailingIconName="insurance-calendar"
              onPress={() => setCalendar(true)}
            />
          </View>
          <View style={s.mb28}>
            <FieldValue
              label={text('contactMeDuring', 'Contact me during')}
              value={draft.intervals.join(', ')}
              helper={text(
                'intervalHelper',
                'We’ll try to call you during the time you select.',
              )}
              onPress={() => open('interval')}
            />
          </View>
          <SectionHeading>
            {text('yourContactNumber', 'Your contact number')}
          </SectionHeading>
          <View style={styles.phoneRow}>
            <View
              style={[
                styles.phoneField,
                styles.country,
                { borderBottomColor: color('--uc-border') },
              ]}
            >
              <Copy size={14} color={color('--uc-text-muted')}>
                {text('country', 'Country')}
              </Copy>
              <Copy style={s.mt2}>{draft.countryCode}</Copy>
            </View>
            <View
              style={[
                styles.phoneField,
                styles.grow,
                { borderBottomColor: color('--uc-border') },
              ]}
            >
              <Copy size={14} color={color('--uc-text-muted')}>
                {text('mobileNumber', 'Mobile number')}
              </Copy>
              <TextInput
                accessibilityLabel={text('mobileNumber', 'Mobile number')}
                keyboardType="phone-pad"
                inputMode="tel"
                value={draft.phoneNumber}
                onChangeText={phoneNumber => update({ phoneNumber })}
                style={[styles.phoneInput, { color: color('--uc-text') }]}
              />
            </View>
          </View>
          <Copy size={14} color={color('--uc-text-muted')} style={s.mt6}>
            {text('phoneHelper', 'We will call you on the number you provide')}
          </Copy>
        </View>
      </AppointmentPage>
    );
  if (view === 'notes')
    return (
      <AppointmentPage
        title={text('notesTitle', 'Do you want to send a specific message?')}
        onBack={back}
        footer={
          <NotesFooter
            notes={draft.notes}
            text={text}
            onContinue={() => setView('review')}
            onSkip={() => {
              update({ notes: '' });
              setView('review');
            }}
          />
        }
      >
        <Notes
          value={draft.notes}
          onChange={notes => update({ notes })}
          text={text}
        />
      </AppointmentPage>
    );
  if (view === 'review')
    return (
      <AppointmentPage
        title={text('reviewTitle', 'Request a call review')}
        onBack={back}
        footer={
          <Button
            label={text('confirm', 'Confirm')}
            onPress={() => setView('success')}
          />
        }
      >
        <View style={s.review}>
          <Copy size={14} color={color('--uc-text-muted')}>
            {text(
              'reviewIntro',
              'Review the details of the appointment before confirming',
            )}
          </Copy>
          <ReviewSection title={text('reasonSection', 'Contact reason')}>
            <ReviewValue
              label={text('category', 'Category')}
              value={draft.reasons.join(', ')}
            />
            <ReviewValue
              label={text('subcategory', 'Subcategory')}
              value={draft.details.join(', ')}
            />
            {draft.notes.trim() ? (
              <ReviewValue
                label={text('reviewNotes', 'Additional notes')}
                value={draft.notes.trim()}
              />
            ) : null}
          </ReviewSection>
          <ReviewSection title={text('contactDetails', 'Your contact details')}>
            <ReviewValue
              label={text('yourPhoneNumber', 'Your phone number')}
              value={`${draft.countryCode} ${draft.phoneNumber}`}
            />
            <ReviewValue
              label={text('preferredDate', 'Preferred callback date')}
              value={formatAppointmentDate(draft.callbackDate, locale)}
            />
            <ReviewValue
              label={text('contactMeDuring', 'Contact me during')}
              value={draft.intervals.join(', ')}
            />
          </ReviewSection>
        </View>
      </AppointmentPage>
    );
  return (
    <Success
      title={text('successTitle', 'Request a call successfully confirmed')}
      thanks={text(
        'successThanks',
        'Thank you for requesting this contact with us',
      )}
      paragraphs={[
        text(
          'successBody',
          'Our advisor will try to contact you in the specified interval. If there is no answer, the advisor will call again the following day in the same interval.',
        ),
      ]}
      label={text('okGotIt', 'Ok, got it')}
      onDone={host.onBack}
    />
  );
}
const styles = StyleSheet.create({
  mt16: { marginTop: 16 },
  mb8: { marginBottom: 8 },
  intervals: { paddingBottom: 8 },
  phoneRow: { flexDirection: 'row', gap: 16 },
  country: { width: 72 },
  phoneField: { borderBottomWidth: 1, paddingVertical: 6, minHeight: 52 },
  grow: { flex: 1, minWidth: 0 },
  phoneInput: {
    outlineWidth: 0,
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    padding: 0,
    marginTop: 3,
    height: 17,
  },
});
