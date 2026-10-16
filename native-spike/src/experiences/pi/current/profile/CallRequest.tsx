import React, { useState } from 'react';
import { StyleSheet, Pressable, View, ScrollView } from 'react-native';
import {
  APPOINTMENT_DETAIL_OPTIONS,
  APPOINTMENT_REASON_OPTIONS,
  formatAppointmentDate,
  getAppointmentDateLocale,
  fromAppointmentDateKey,
  isAppointmentWeekend,
  toAppointmentDateKey,
} from '@/app/screens/appointments/appointmentModel';
import { TextInput } from '../../../../universal/Typography';
import {
  FieldValue,
  FormHeading,
  ReviewSection,
  ReviewValue,
} from './AppointmentFields';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { CalendarPanel } from '../../../../universal/DateField';
import { ModalPanel } from '../../../../universal/ModalPanel';
import type { CurrentScreenProps } from '../contracts';
import {
  Button,
  Copy,
  Page,
  useCurrentTokens,
  useLocalBack,
} from './Primitives';
import { useProfileHost, useProfileTranslation } from './Host';
import { ChoiceSheet } from './ChoiceSheet';
import {
  canContinueCall,
  contactIntervals,
  createCallDraft,
  toggleChoice,
  type CallDraft,
} from './requestCall';
export default function CallRequest(props: CurrentScreenProps) {
  const t = useProfileTranslation(),
    tokens = useCurrentTokens(),
    { language } = useProfileHost();
  const text = (key: string, fallback: string) =>
    t(`requestCall.${key}`, fallback);
  const [view, setView] = useState<'form' | 'notes' | 'review' | 'success'>(
      'form',
    ),
    [draft, setDraft] = useState(() => createCallDraft(props.country)),
    [sheet, setSheet] = useState<'reason' | 'detail' | 'interval' | null>(null),
    [selection, setSelection] = useState<string[]>([]),
    [calendar, setCalendar] = useState(false),
    [dateError, setDateError] = useState(''),
    [notesHeight, setNotesHeight] = useState(28);
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
          ? text('reasonSheetTitle', 'What do you want to talk about?')
          : sheet === 'detail'
          ? text('detailSheetTitle', 'Give us more details about your request')
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
  useLocalBack(back, props.isActive && view === 'success');
  if (view === 'form')
    return (
      <Page
        fixedTitle
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
        <View style={callStyles.form}>
          <FormHeading>{text('reasonSection', 'Contact reason')}</FormHeading>
          <View style={callStyles.mb28}>
            <FieldValue
              label={text('reasonPrompt', 'What do you want to talk about?')}
              value={draft.reasons.join(', ')}
              helper={text(
                'reasonHelper',
                'This will help the advisor to be prepared for the meeting',
              )}
              onPress={() => open('reason')}
            />
            {draft.reasons.length > 0 ? (
              <View style={callStyles.mt16}>
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
          <FormHeading>
            {text('preferredMoment', 'Preferred contact moment')}
          </FormHeading>
          <View style={callStyles.mb24}>
            <FieldValue
              label={text('preferredDate', 'Preferred callback date')}
              value={formatAppointmentDate(
                draft.callbackDate,
                getAppointmentDateLocale(props.country, language),
              )}
              helper={text(
                'dateHelper',
                'We’ll try to call you on the date you choose, but we cannot guarantee it. We’re closed on Bank Holidays',
              )}
              trailingIconName="insurance-calendar"
              onPress={() => {
                setDateError('');
                setCalendar(true);
              }}
            />
          </View>
          <View style={callStyles.mb28}>
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
          <FormHeading>
            {text('yourContactNumber', 'Your contact number')}
          </FormHeading>
          <View style={callStyles.numberRow}>
            <View
              style={[
                callStyles.phoneField,
                callStyles.country,
                { borderColor: tokens.border },
              ]}
            >
              <Copy size={14} lineHeight={15.5} color={tokens.muted}>
                {text('country', 'Country')}
              </Copy>
              <View style={callStyles.mt2}>
                <Copy lineHeight={17.5}>{draft.countryCode}</Copy>
              </View>
            </View>
            <View
              style={[
                callStyles.phoneField,
                callStyles.grow,
                { borderColor: tokens.border },
              ]}
            >
              <Copy size={14} lineHeight={15.5} color={tokens.muted}>
                {text('mobileNumber', 'Mobile number')}
              </Copy>
              <TextInput
                accessibilityLabel={text('mobileNumber', 'Mobile number')}
                value={draft.phoneNumber}
                onChangeText={phoneNumber => update({ phoneNumber })}
                keyboardType="phone-pad"
                style={[
                  callStyles.phoneInput,
                  { fontFamily: tokens.font, color: tokens.text },
                ]}
              />
            </View>
          </View>
          <View style={callStyles.mt6}>
            <Copy size={14} lineHeight={15.5} color={tokens.muted}>
              {text(
                'phoneHelper',
                'We will call you on the number you provide',
              )}
            </Copy>
          </View>
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
              locale={getAppointmentDateLocale(props.country, language)}
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
        fixedTitle
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={text(
                'skipNotes',
                'Continue without any notes',
              )}
              onPress={() => {
                update({ notes: '' });
                setView('review');
              }}
              style={callStyles.skip}
            >
              <Copy strong lineHeight={17.5} color={tokens.accent}>
                {text('skipNotes', 'Continue without any notes')}
              </Copy>
            </Pressable>
          </>
        }
      >
        <View style={callStyles.notes}>
          <Copy lineHeight={17.5}>
            {text('additionalNotes', 'Additional notes')}
          </Copy>
          <TextInput
            accessibilityLabel={text('additionalNotes', 'Additional notes')}
            value={draft.notes}
            onChangeText={notes => update({ notes })}
            multiline
            maxLength={500}
            onContentSizeChange={event =>
              setNotesHeight(Math.max(28, event.nativeEvent.contentSize.height))
            }
            style={[
              callStyles.notesInput,
              {
                height: notesHeight,
                fontFamily: tokens.font,
                borderColor: tokens.border,
                color: tokens.text,
              },
            ]}
          />
          <View style={callStyles.mt6}>
            <Copy size={14} lineHeight={15.5} color={tokens.muted}>
              {text(
                'notesHelper',
                'Our colleagues will take care of your notes and get prepared with all the requested answers',
              )}
            </Copy>
          </View>
        </View>
      </Page>
    );
  if (view === 'review')
    return (
      <Page
        fixedTitle
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
        <View style={callStyles.review}>
          <View style={callStyles.mb24}>
            <Copy size={14} lineHeight={15.5} color={tokens.muted}>
              {text(
                'reviewIntro',
                'Review the details of the appointment before confirming',
              )}
            </Copy>
          </View>
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
              value={formatAppointmentDate(
                draft.callbackDate,
                getAppointmentDateLocale(props.country, language),
              )}
            />
            <ReviewValue
              label={text('contactMeDuring', 'Contact me during')}
              value={draft.intervals.join(', ')}
            />
          </ReviewSection>
        </View>
      </Page>
    );
  return (
    <View style={[callStyles.success, { backgroundColor: tokens.surface }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          callStyles.successContent,
          { paddingTop: props.screenTopInset + 16 },
        ]}
      >
        <Copy strong size={28} lineHeight={31}>
          {text('successTitle', 'Request a call successfully confirmed')}
        </Copy>
        <View style={callStyles.successMarkWrap}>
          <View style={callStyles.successMark}>
            <SourceCustomIcon name="check" size={56} color="#43854f" />
          </View>
        </View>
        <View style={callStyles.thanks}>
          <Copy strong lineHeight={17.5}>
            {text(
              'successThanks',
              'Thank you for requesting this contact with us',
            )}
          </Copy>
        </View>
        <Copy size={18} lineHeight={20}>
          {text(
            'successBody',
            'Our advisor will try to contact you in the specified interval. If there is no answer, the advisor will call again the following day in the same interval.',
          )}
        </Copy>
      </ScrollView>
      <View style={callStyles.footer}>
        <Button label={text('okGotIt', 'Ok, got it')} onPress={props.onBack} />
      </View>
    </View>
  );
}
const callStyles = StyleSheet.create({
  form: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  mb28: { marginBottom: 28 },
  mb24: { marginBottom: 24 },
  mt16: { marginTop: 16 },
  numberRow: { flexDirection: 'row', gap: 16 },
  country: { width: 72 },
  grow: { flex: 1 },
  phoneField: { borderBottomWidth: 1, paddingVertical: 6 },
  mt2: { marginTop: 2 },
  mt6: { marginTop: 6 },
  phoneInput: {
    marginTop: 2,
    padding: 0,
    fontSize: 16,
    lineHeight: 17.5,
    height: 17.5,
  },
  notes: { paddingHorizontal: 24, paddingTop: 24 },
  notesInput: {
    marginTop: 4,
    paddingHorizontal: 0,
    paddingVertical: 4,
    borderBottomWidth: 1,
    fontSize: 16,
    lineHeight: 20,
  },
  skip: { alignItems: 'center' },
  review: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  success: { flex: 1 },
  successContent: { paddingHorizontal: 24, paddingBottom: 24 },
  successMarkWrap: { alignItems: 'center', marginVertical: 52 },
  successMark: {
    width: 96,
    height: 96,
    borderWidth: 6,
    borderColor: '#43854f',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thanks: { marginBottom: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
});
