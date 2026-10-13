import React, { useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import {
  APPOINTMENT_DETAIL_OPTIONS,
  APPOINTMENT_REASON_OPTIONS,
  formatAppointmentDate,
  getAppointmentDateLocale,
  fromAppointmentDateKey,
  isAppointmentWeekend,
  toAppointmentDateKey,
} from '@/app/screens/appointments/appointmentModel';
import { FormField } from '../../../../../universal/FormField';
import { CalendarPanel } from '../../../../../universal/DateField';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import type { CzechNativeScreenProps } from '../contracts';
import {
  Button,
  Copy,
  Page,
  Section,
  s,
  useCurrentTokens,
} from '../profile/Primitives';
import {
  useCzechPreferences,
  useCzechTranslation,
} from '../profile/features/preferences';
import { ChoiceSheet } from './ChoiceSheet';
import {
  canContinueCall,
  contactIntervals,
  createCallDraft,
  toggleChoice,
  type CallDraft,
} from './features/requestCall';
export default function CallRequest(props: CzechNativeScreenProps) {
  const t = useCzechTranslation(),
    tokens = useCurrentTokens(),
    { language } = useCzechPreferences();
  const text = (key: string, fallback: string) =>
    t(`requestCall.${key}`, fallback);
  const [view, setView] = useState<'form' | 'notes' | 'review' | 'success'>(
      'form',
    ),
    [draft, setDraft] = useState(createCallDraft),
    [sheet, setSheet] = useState<'reason' | 'detail' | 'interval' | null>(null),
    [selection, setSelection] = useState<string[]>([]),
    [calendar, setCalendar] = useState(false),
    [dateError, setDateError] = useState('');
  const update = (changes: Partial<CallDraft>) =>
    setDraft(previous => ({ ...previous, ...changes }));
  const back = () => {
    if (calendar) {
      setCalendar(false);
      return;
    }
    if (sheet) {
      setSheet(null);
      return;
    }
    if (view === 'form' || view === 'success') props.onBack();
    else setView(view === 'review' ? 'notes' : 'form');
  };
  const open = (kind: 'reason' | 'detail' | 'interval') => {
    setSelection(
      kind === 'reason'
        ? draft.reasons
        : kind === 'detail'
        ? draft.details
        : draft.intervals,
    );
    setSheet(kind);
  };
  const confirmSelection = () => {
    if (sheet === 'reason') update({ reasons: selection, details: [] });
    if (sheet === 'detail') update({ details: selection });
    if (sheet === 'interval') update({ intervals: selection });
    setSheet(null);
  };
  const choiceItems =
    sheet === 'reason'
      ? APPOINTMENT_REASON_OPTIONS.map(item => ({
          value: item.title,
          label: item.title,
          description: item.description,
        }))
      : sheet === 'detail'
      ? APPOINTMENT_DETAIL_OPTIONS.map(value => ({ value, label: value }))
      : contactIntervals.map(value => ({ value, label: value }));
  const overlay = sheet ? (
    <ChoiceSheet
      title={
        sheet === 'reason'
          ? text('contactReason', 'Contact reason')
          : sheet === 'detail'
          ? text('details', 'Details')
          : text('contactMeDuring', 'Contact me during')
      }
      items={choiceItems}
      selected={selection}
      onToggle={value => setSelection(current => toggleChoice(current, value))}
      onClose={() => setSheet(null)}
      onConfirm={confirmSelection}
      confirmLabel={text('select', 'Select')}
    />
  ) : null;
  const field = (
    label: string,
    value: string,
    helper: string,
    onPress: () => void,
  ) => (
    <View style={callStyles.field}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
      >
        <View pointerEvents="none">
          <FormField
            tokens={tokens}
            label={label}
            value={value}
            onChange={() => {}}
            inputProps={{ editable: false }}
            containerStyle={callStyles.readonly}
          />
        </View>
      </Pressable>
      <Copy size={14} color={tokens.muted}>
        {helper}
      </Copy>
    </View>
  );
  if (view === 'form')
    return (
      <Page
        title={text('title', 'Request a call')}
        onBack={back}
        topInset={props.screenTopInset}
        active={props.isActive}
        footer={
          <Button
            label={text('continue', 'Continue')}
            disabled={!canContinueCall(draft)}
            onPress={() => setView('notes')}
          />
        }
      >
        <View style={s.pad}>
          <Copy strong size={14}>
            {text('reasonSection', 'Contact reason').toUpperCase()}
          </Copy>
          {field(
            text('reasonPrompt', 'What do you want to talk about?'),
            draft.reasons.join(', '),
            text(
              'reasonHelper',
              'This will help the advisor to be prepared for the meeting',
            ),
            () => open('reason'),
          )}
          {draft.reasons.length
            ? field(
                text('detailPrompt', 'Give us more details about your request'),
                draft.details.join(', '),
                text(
                  'detailHelper',
                  'This will help the advisor to be prepared with everything that is required',
                ),
                () => open('detail'),
              )
            : null}
          <Copy strong size={14}>
            {text('preferredMoment', 'Preferred contact moment').toUpperCase()}
          </Copy>
          {field(
            text('preferredDate', 'Preferred callback date'),
            formatAppointmentDate(
              draft.callbackDate,
              getAppointmentDateLocale('CZ', language),
            ),
            text(
              'dateHelper',
              'We’ll try to call you on the date you choose, but we cannot guarantee it. We’re closed on Bank Holidays',
            ),
            () => {
              setDateError('');
              setCalendar(true);
            },
          )}
          {field(
            text('contactMeDuring', 'Contact me during'),
            draft.intervals.join(', '),
            text(
              'intervalHelper',
              'We’ll try to call you during the time you select.',
            ),
            () => open('interval'),
          )}
          <Copy strong size={14}>
            {text('yourContactNumber', 'Your contact number').toUpperCase()}
          </Copy>
          <View style={s.horizontal}>
            <View style={callStyles.country}>
              <Copy size={14} color={tokens.muted}>
                {text('country', 'Country')}
              </Copy>
              <Copy>{draft.countryCode}</Copy>
            </View>
            <View style={s.grow}>
              <FormField
                tokens={tokens}
                label={text('mobileNumber', 'Mobile number')}
                value={draft.phoneNumber}
                onChange={phoneNumber => update({ phoneNumber })}
                inputProps={{ keyboardType: 'phone-pad' }}
              />
            </View>
          </View>
          <Copy size={14} color={tokens.muted}>
            {text('phoneHelper', 'We will call you on the number you provide')}
          </Copy>
        </View>
        {overlay}
        {calendar ? (
          <ModalPanel
            tokens={tokens}
            title={text('preferredDate', 'Preferred callback date')}
            visible
            onClose={() => setCalendar(false)}
          >
            <CalendarPanel
              compact
              title={text('preferredDate', 'Preferred callback date')}
              tokens={tokens}
              value={draft.callbackDate}
              locale={getAppointmentDateLocale('CZ', language)}
              min={toAppointmentDateKey(new Date())}
              onClose={() => setCalendar(false)}
              onSelect={callbackDate => {
                if (
                  isAppointmentWeekend(fromAppointmentDateKey(callbackDate))
                ) {
                  setDateError('Choose a weekday.');
                  return;
                }
                update({ callbackDate });
                setCalendar(false);
              }}
            />
            {dateError ? <Copy color="#e2001a">{dateError}</Copy> : null}
          </ModalPanel>
        ) : null}
      </Page>
    );
  if (view === 'notes')
    return (
      <Page
        title={text('notesTitle', 'Do you want to send a specific message?')}
        onBack={back}
        topInset={props.screenTopInset}
        active={props.isActive}
        footer={
          <>
            <Button
              label={text('continue', 'Continue')}
              disabled={!draft.notes.trim()}
              onPress={() => setView('review')}
            />
            <Button
              secondary
              label={text('skipNotes', 'Continue without any notes')}
              onPress={() => {
                update({ notes: '' });
                setView('review');
              }}
            />
          </>
        }
      >
        <View style={s.pad}>
          <FormField
            tokens={tokens}
            label={text('additionalNotes', 'Additional notes')}
            value={draft.notes}
            onChange={notes => update({ notes })}
            inputProps={{ multiline: true, maxLength: 500 }}
          />
          <Copy size={14}>
            {text(
              'notesHelper',
              'Our colleagues will take care of your notes and get prepared with all the requested answers',
            )}
          </Copy>
        </View>
      </Page>
    );
  if (view === 'review')
    return (
      <Page
        title={text('reviewTitle', 'Request a call review')}
        onBack={back}
        topInset={props.screenTopInset}
        active={props.isActive}
        footer={
          <Button
            label={text('confirm', 'Confirm')}
            onPress={() => setView('success')}
          />
        }
      >
        <Section title={text('reasonSection', 'Contact reason')}>
          <View style={s.pad}>
            <Copy strong>{draft.reasons.join(', ')}</Copy>
            <Copy>{draft.details.join(', ')}</Copy>
            {draft.notes.trim() ? <Copy>{draft.notes.trim()}</Copy> : null}
          </View>
        </Section>
        <Section title={text('contactDetails', 'Your contact details')}>
          <View style={s.pad}>
            <Copy>
              {draft.countryCode} {draft.phoneNumber}
            </Copy>
            <Copy>
              {formatAppointmentDate(
                draft.callbackDate,
                getAppointmentDateLocale('CZ', language),
              )}
            </Copy>
            <Copy>{draft.intervals.join(', ')}</Copy>
          </View>
        </Section>
      </Page>
    );
  return (
    <Page
      title={text('successTitle', 'Request a call successfully confirmed')}
      onBack={back}
      topInset={props.screenTopInset}
      active={props.isActive}
      footer={
        <Button label={text('okGotIt', 'Ok, got it')} onPress={props.onBack} />
      }
    >
      <View style={[s.pad, s.center]}>
        <Copy strong size={56} color="#43854f">
          ✓
        </Copy>
        <Copy strong>
          {text(
            'successThanks',
            'Thank you for requesting this contact with us',
          )}
        </Copy>
        <Copy size={18}>
          {text(
            'successBody',
            'Our advisor will try to contact you in the specified interval. If there is no answer, the advisor will call again the following day in the same interval.',
          )}
        </Copy>
        <Copy size={14}>Demo request — no real callback has been booked.</Copy>
      </View>
    </Page>
  );
}
const callStyles = StyleSheet.create({
  field: { marginBottom: 12 },
  readonly: { marginBottom: 6 },
  country: { width: 72, gap: 4 },
});
