import React, { useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import {
  APPOINTMENT_DETAIL_OPTIONS,
  APPOINTMENT_REASON_OPTIONS,
  createAppointmentId,
  formatAppointmentDate,
  fromAppointmentDateKey,
  getAppointmentDateLocale,
  getAppointmentSlots,
  getNextAppointmentDateWithSlots,
  isAppointmentWeekend,
  loadAppointments,
  saveAppointments,
  sortAppointments,
  toAppointmentDateKey,
  type AppointmentDraft,
  type AppointmentRecord,
} from '@/app/screens/appointments/appointmentModel';
import { CalendarPanel } from '../../../../../universal/DateField';
import { FormField } from '../../../../../universal/FormField';
import { ModalPanel, Tabs } from '../../../../../universal/controls';
import type { CzechNativeScreenProps } from '../contracts';
import {
  Button,
  Confirm,
  Copy,
  Page,
  Row,
  Section,
  s,
  useCurrentTokens,
} from '../profile/Primitives';
import {
  useCzechPreferences,
  useCzechTranslation,
} from '../profile/features/preferences';
import { ChoiceSheet } from './ChoiceSheet';
import { toggleChoice } from './features/requestCall';
import {
  canContinueBooking,
  completeFeedback,
  createAppointmentDraft,
  isPastAppointment,
  validAppointmentEmail,
} from './features/appointments';
type ViewId =
  | 'booking'
  | 'slots'
  | 'notes'
  | 'review'
  | 'success'
  | 'list'
  | 'detail'
  | 'map'
  | 'feedback'
  | 'feedback-success';
const feedbackReasons = [
  {
    value: 'organizedMeeting',
    key: 'feedbackIssueMeeting',
    label: 'There was a problem related with the organized meeting',
  },
  {
    value: 'advisor',
    key: 'feedbackIssueAdvisor',
    label: 'There was a problem with the advisor',
  },
  {
    value: 'expectedOutcome',
    key: 'feedbackIssueOutcome',
    label: 'There was a problem related to the expected outcome of the meeting',
  },
  { value: 'otherReason', key: 'feedbackIssueOther', label: 'Other reason' },
];
const feedbackDetails = [
  {
    value: 'waitingTime',
    key: 'feedbackIssueWaitingTime',
    label: 'The waiting time was not respected and I had to wait',
  },
  {
    value: 'bureaucracy',
    key: 'feedbackIssueBureaucracy',
    label: 'Too much bureaucracy',
  },
  {
    value: 'technicalIssues',
    key: 'feedbackIssueTechnical',
    label: 'Technical issues with the meeting',
  },
  {
    value: 'privacy',
    key: 'feedbackIssuePrivacy',
    label: 'There was no privacy for the meeting',
  },
];

export default function Appointments(props: CzechNativeScreenProps) {
  const t = useCzechTranslation(),
    tokens = useCurrentTokens(),
    { language } = useCzechPreferences();
  const text = (key: string, fallback: string) =>
      t(`appointments.${key}`, fallback),
    locale = getAppointmentDateLocale('CZ', language);
  const branch = t('prime.advisor.branch', 'Branch name 36'),
    address = t('prime.advisor.address', 'Želetavská 1525/1, 140 92, Praha 4'),
    advisor = t('prime.advisor.name', 'David Novak');
  const [records, setRecords] = useState(() => loadAppointments('CZ')),
    [view, setView] = useState<ViewId>(() =>
      loadAppointments('CZ').length ? 'list' : 'booking',
    ),
    [draft, setDraft] = useState(() => createAppointmentDraft(branch, address)),
    [tab, setTab] = useState<'active' | 'past'>('active'),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [sheet, setSheet] = useState<'reason' | 'detail' | null>(null),
    [choices, setChoices] = useState<string[]>([]),
    [calendar, setCalendar] = useState(false),
    [dateError, setDateError] = useState(''),
    [moreSlots, setMoreSlots] = useState(false),
    [confirmDelete, setConfirmDelete] = useState(false),
    [mapReturn, setMapReturn] = useState<'booking' | 'detail' | 'review'>(
      'booking',
    ),
    [rating, setRating] = useState(0),
    [comment, setComment] = useState(''),
    [reason, setReason] = useState(''),
    [reasonDetail, setReasonDetail] = useState('');
  const selected = records.find(record => record.id === selectedId);
  const feedbackLabel = (items: typeof feedbackReasons, value?: string) => {
    const item = items.find(option => option.value === value);
    return item ? text(item.key, item.label) : '';
  };
  const update = (changes: Partial<AppointmentDraft>) =>
    setDraft(current => ({ ...current, ...changes }));
  const save = (next: AppointmentRecord[]) => {
    saveAppointments('CZ', next);
    setRecords(next);
    props.onChanged();
  };
  const back = () => {
    if (sheet) {
      setSheet(null);
      return;
    }
    if (calendar) {
      setCalendar(false);
      return;
    }
    if (confirmDelete) {
      setConfirmDelete(false);
      return;
    }
    const parent: Partial<Record<ViewId, ViewId>> = {
      slots: 'booking',
      notes: 'slots',
      review: 'notes',
      success: 'list',
      detail: 'list',
      map: mapReturn,
      feedback: 'detail',
      'feedback-success': 'detail',
    };
    if (parent[view]) setView(parent[view]!);
    else props.onBack();
  };
  const directSlots = getAppointmentSlots(draft.appointmentDate),
    slotDate = directSlots.length
      ? draft.appointmentDate
      : getNextAppointmentDateWithSlots(draft.appointmentDate),
    slots = getAppointmentSlots(slotDate);
  const open = (kind: 'reason' | 'detail') => {
    setChoices(kind === 'reason' ? draft.reasons : draft.details);
    setSheet(kind);
  };
  const changeDate = (date: string) => {
    if (
      date < toAppointmentDateKey(new Date()) ||
      isAppointmentWeekend(fromAppointmentDateKey(date))
    ) {
      setDateError('Choose a weekday on or after today.');
      return;
    }
    update({ appointmentDate: date, selectedSlotDate: date, selectedTime: '' });
    setDateError('');
    setCalendar(false);
  };
  const overlays = (
    <>
      {sheet ? (
        <ChoiceSheet
          title={
            sheet === 'reason'
              ? text('reasonSection', 'Contact reason')
              : text('detailPrompt', 'Details')
          }
          items={
            sheet === 'reason'
              ? APPOINTMENT_REASON_OPTIONS.map(item => ({
                  value: item.title,
                  label: item.title,
                  description: item.description,
                }))
              : APPOINTMENT_DETAIL_OPTIONS.map(value => ({
                  value,
                  label: value,
                }))
          }
          selected={choices}
          onToggle={value =>
            setChoices(current => toggleChoice(current, value))
          }
          onClose={() => setSheet(null)}
          onConfirm={() => {
            update(
              sheet === 'reason' ? { reasons: choices } : { details: choices },
            );
            setSheet(null);
          }}
          confirmLabel={text('select', 'Select')}
        />
      ) : null}
      {calendar ? (
        <ModalPanel
          tokens={tokens}
          title={text('date', 'Date')}
          visible
          onClose={() => setCalendar(false)}
        >
          <CalendarPanel
            compact
            title={text('date', 'Date')}
            tokens={tokens}
            value={draft.appointmentDate}
            locale={locale}
            min={toAppointmentDateKey(new Date())}
            onSelect={changeDate}
            onClose={() => setCalendar(false)}
          />
          {dateError ? <Copy color="#e2001a">{dateError}</Copy> : null}
        </ModalPanel>
      ) : null}
    </>
  );
  const page = (
    title: string,
    children: React.ReactNode,
    footer?: React.ReactNode,
  ) => (
    <Page
      title={title}
      onBack={back}
      topInset={props.screenTopInset}
      active={props.isActive}
      footer={footer}
    >
      {children}
      {overlays}
    </Page>
  );
  const openMap = (returnView: typeof mapReturn) => {
    setMapReturn(returnView);
    setView('map');
  };
  const resetFeedback = () => {
    setRating(0);
    setComment('');
    setReason('');
    setReasonDetail('');
    setView('feedback');
  };
  if (view === 'map')
    return page(
      'Map',
      <View style={s.pad}>
        <View style={fidelityStyles.s0}>
          <Copy strong size={48}>
            ⌖
          </Copy>
          <Copy>Demo branch map</Copy>
        </View>
        <Copy strong>{selected?.branchName ?? draft.branchName}</Copy>
        <Copy>{selected?.branchAddress ?? draft.branchAddress}</Copy>
        <Copy>60m</Copy>
      </View>,
      <Button
        label={mapReturn === 'booking' ? 'Take me there' : 'Close map'}
        onPress={() => setView(mapReturn)}
      />,
    );
  if (view === 'booking')
    return page(
      text('bookingTitle', 'Select the location and date of the appointment'),
      <>
        <Row
          title="Contact reason"
          description={draft.reasons.join(', ')}
          onPress={() => open('reason')}
        />
        <Row
          title="Details"
          description={draft.details.join(', ')}
          onPress={() => open('detail')}
        />
        <View style={s.pad}>
          <Copy strong>{text('locationSection', 'Appointment location')}</Copy>
          {(['branch', 'online'] as const).map(type => (
            <Pressable
              key={type}
              accessibilityRole="radio"
              accessibilityLabel={
                type === 'branch' ? 'Branch meeting' : 'Online meeting'
              }
              accessibilityState={{ selected: draft.meetingType === type }}
              onPress={() => update({ meetingType: type })}
              style={s.horizontal}
            >
              <Copy size={24}>{draft.meetingType === type ? '◉' : '○'}</Copy>
              <Copy>
                {type === 'branch'
                  ? text('branchMeeting', 'Branch Meeting')
                  : text('onlineMeeting', 'Online Meeting')}
              </Copy>
            </Pressable>
          ))}
        </View>
        {draft.meetingType === 'branch' ? (
          <Row
            title={draft.branchName}
            description={draft.branchAddress}
            onPress={() => openMap('booking')}
          />
        ) : null}
        <Row
          title="Date"
          description={formatAppointmentDate(draft.appointmentDate, locale)}
          onPress={() => setCalendar(true)}
        />
      </>,
      <Button
        label={text('continue', 'Continue')}
        disabled={!canContinueBooking(draft)}
        onPress={() => {
          update({ selectedTime: '' });
          setMoreSlots(false);
          setView('slots');
        }}
      />,
    );
  if (view === 'slots')
    return page(
      text('slotsTitle', 'Select a time slot'),
      <View style={s.pad}>
        <Row
          title="Date"
          description={formatAppointmentDate(draft.appointmentDate, locale)}
          onPress={() => setCalendar(true)}
        />
        {directSlots.length === 0 ? (
          <Copy>
            {text('noSlots', 'There are no available slots on this date.')}{' '}
            {formatAppointmentDate(slotDate, locale)}
          </Copy>
        ) : null}
        <Copy size={18}>
          {text(
            'slotInstruction',
            'Just tap on one of the available time slots from your advisor to pick a time that works for you!',
          )}
        </Copy>
        <Copy strong>{advisor}</Copy>
        <View style={[s.horizontal, fidelityStyles.s1]}>
          {slots.slice(0, moreSlots ? slots.length : 8).map(slot => (
            <Pressable
              key={slot}
              accessibilityRole="button"
              accessibilityLabel={slot}
              accessibilityState={{
                selected:
                  draft.selectedTime === slot &&
                  draft.selectedSlotDate === slotDate,
              }}
              onPress={() =>
                update({ selectedTime: slot, selectedSlotDate: slotDate })
              }
              style={[
                fidelityStyles.s2,
                {
                  borderColor: tokens.text,
                  backgroundColor:
                    draft.selectedTime === slot
                      ? tokens.accent
                      : tokens.background,
                },
              ]}
            >
              <Copy
                strong
                color={draft.selectedTime === slot ? '#ffffff' : tokens.text}
              >
                {slot}
              </Copy>
            </Pressable>
          ))}
        </View>
        {slots.length > 8 ? (
          <Button
            secondary
            label={
              moreSlots
                ? text('seeLess', 'See less slots')
                : text('seeMore', 'See more slots')
            }
            onPress={() => setMoreSlots(current => !current)}
          />
        ) : null}
      </View>,
      <Button
        label={text('continue', 'Continue')}
        disabled={!draft.selectedTime}
        onPress={() => setView('notes')}
      />,
    );
  if (view === 'notes')
    return page(
      text('notesTitle', 'Do you want to send a specific message?'),
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
      </View>,
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
      </>,
    );
  if (view === 'review')
    return page(
      text('reviewTitle', 'Appointment review'),
      <View style={s.pad}>
        <Copy strong>{draft.reasons.join(', ')}</Copy>
        <Copy>{draft.details.join(', ')}</Copy>
        {draft.notes.trim() ? <Copy>{draft.notes.trim()}</Copy> : null}
        <Copy strong>
          {draft.meetingType === 'branch'
            ? text('branchMeeting', 'Branch Meeting')
            : text('onlineMeeting', 'Online Meeting')}
        </Copy>
        {draft.meetingType === 'branch' ? (
          <Row
            title={draft.branchName}
            description={draft.branchAddress}
            onPress={() => openMap('review')}
          />
        ) : (
          <Copy>Microsoft Teams</Copy>
        )}
        <Copy>
          {formatAppointmentDate(draft.selectedSlotDate || slotDate, locale)} -{' '}
          {draft.selectedTime}
        </Copy>
        <FormField
          tokens={tokens}
          label={text(
            'invitationAddress',
            'Your address where we send the invitation',
          )}
          value={draft.email}
          onChange={email => update({ email })}
          inputProps={{ keyboardType: 'email-address', autoCapitalize: 'none' }}
        />
      </View>,
      <Button
        label={text('confirm', 'Confirm')}
        disabled={!validAppointmentEmail(draft.email)}
        onPress={() => {
          if (!draft.meetingType || !draft.selectedTime) return;
          const record: AppointmentRecord = {
            id: createAppointmentId(),
            reasons: draft.reasons,
            details: draft.details,
            appointmentDate: draft.selectedSlotDate || slotDate,
            meetingType: draft.meetingType,
            branchName: draft.branchName,
            branchAddress: draft.branchAddress,
            selectedTime: draft.selectedTime,
            notes: draft.notes.trim(),
            email: draft.email.trim(),
            advisorName: advisor,
            status: 'pending',
            createdAt: Date.now(),
          };
          save([record, ...records]);
          setSelectedId(record.id);
          setView('success');
        }}
      />,
    );
  if (view === 'success')
    return page(
      text('successTitle', 'Appointment successfully requested'),
      <View style={[s.pad, s.center]}>
        <Copy size={56} color="#43854f">
          ✓
        </Copy>
        <Copy size={18}>Demo appointment requested successfully.</Copy>
        <Copy>
          {text('successBody', 'Your advisor will confirm your appointment.')}
        </Copy>
      </View>,
      <Button
        label={text('okGotIt', 'Ok, got it')}
        onPress={() => {
          setTab('active');
          setView('list');
        }}
      />,
    );
  if (view === 'list') {
    const filtered = sortAppointments(
      records.filter(record =>
        tab === 'past' ? isPastAppointment(record) : !isPastAppointment(record),
      ),
    );
    if (tab === 'past') filtered.reverse();
    return page(
      text('listTitle', 'My appointments'),
      <>
        <Tabs
          tokens={tokens}
          value={tab}
          items={[
            {
              value: 'active',
              label: text('activeMeetings', 'Active meetings'),
            },
            { value: 'past', label: text('pastMeetings', 'Past meetings') },
          ]}
          onChange={setTab}
        />
        {filtered.length ? (
          filtered.map(record => (
            <Row
              key={record.id}
              title={`${record.advisorName} · ${record.status}`}
              description={`${formatAppointmentDate(
                record.appointmentDate,
                locale,
              )} - ${record.selectedTime}`}
              onPress={() => {
                setSelectedId(record.id);
                if (record.status === 'completed' && !record.feedback)
                  resetFeedback();
                else setView('detail');
              }}
            />
          ))
        ) : (
          <View style={s.pad}>
            <Copy>{text('noMeetings', 'You have no meetings')}</Copy>
          </View>
        )}
      </>,
      <Button
        label={text('bookAppointment', 'Book an appointment')}
        onPress={() => {
          setDraft(createAppointmentDraft(branch, address));
          setView('booking');
        }}
      />,
    );
  }
  if (view === 'feedback-success')
    return page(
      text('feedbackSuccess', 'Feedback saved'),
      <View style={s.pad}>
        <Copy>✓</Copy>
        <Copy>
          {text('feedbackSuccessBody', 'Thank you for your feedback')}
        </Copy>
      </View>,
      <Button
        label={text('okGotIt', 'Ok, got it')}
        onPress={() => setView('detail')}
      />,
    );
  if (view === 'feedback' && selected)
    return page(
      text('feedbackTitle', 'Rate your experience'),
      <View style={s.pad}>
        <Copy strong>{selected.advisorName}</Copy>
        <View style={s.horizontal}>
          {[1, 2, 3, 4, 5].map(value => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={`${value} stars`}
              accessibilityState={{ selected: rating === value }}
              onPress={() => {
                setRating(value);
                if (value > 2) {
                  setReason('');
                  setReasonDetail('');
                }
              }}
            >
              <Copy size={32} color={tokens.accent}>
                {value <= rating ? '★' : '☆'}
              </Copy>
            </Pressable>
          ))}
        </View>
        <FormField
          tokens={tokens}
          label={text('feedbackComment', 'Your comment on the experience')}
          value={comment}
          onChange={setComment}
          inputProps={{ multiline: true, maxLength: 500 }}
        />
        {rating > 0 && rating <= 2
          ? feedbackReasons.map(item => (
              <View key={item.value}>
                <Row
                  title={text(item.key, item.label)}
                  onPress={() => {
                    setReason(item.value);
                    setReasonDetail('');
                  }}
                  icon={<Copy>{reason === item.value ? '◉' : '○'}</Copy>}
                />
                {reason === 'organizedMeeting' && item.value === reason
                  ? feedbackDetails.map(detail => (
                      <Row
                        key={detail.value}
                        title={text(detail.key, detail.label)}
                        onPress={() => setReasonDetail(detail.value)}
                        icon={
                          <Copy>
                            {reasonDetail === detail.value ? '◉' : '○'}
                          </Copy>
                        }
                      />
                    ))
                  : null}
              </View>
            ))
          : null}
      </View>,
      <Button
        label={text('sendFeedback', 'Send feedback')}
        disabled={!completeFeedback(rating, reason, reasonDetail)}
        onPress={() => {
          save(
            records.map(record =>
              record.id === selected.id
                ? {
                    ...record,
                    status: 'completed',
                    feedback: {
                      rating,
                      comment: comment.trim(),
                      ...(rating <= 2 && reason ? { reason } : {}),
                      ...(rating <= 2 && reasonDetail ? { reasonDetail } : {}),
                    },
                  }
                : record,
            ),
          );
          setView('feedback-success');
        }}
      />,
    );
  if (selected)
    return page(
      text('meetingDetails', 'Meeting details'),
      <>
        <View style={s.pad}>
          <Copy strong size={18}>
            {selected.advisorName}
          </Copy>
          <Copy>{selected.status}</Copy>
          <Copy>
            {formatAppointmentDate(selected.appointmentDate, locale)} -{' '}
            {selected.selectedTime}
          </Copy>
          {!isPastAppointment(selected) ? (
            <Button
              secondary
              label={text('deleteMeeting', 'Delete meeting')}
              onPress={() => setConfirmDelete(true)}
            />
          ) : null}
        </View>
        <Section title={text('locationSection', 'Appointment location')}>
          <View style={s.pad}>
            {selected.meetingType === 'branch' ? (
              <Row
                title={selected.branchName}
                description={selected.branchAddress}
                onPress={() => openMap('detail')}
              />
            ) : (
              <Copy>Microsoft Teams</Copy>
            )}
            <Copy>
              {selected.email ||
                text('noClientEmail', 'No client email provided')}
            </Copy>
          </View>
        </Section>
        <View style={s.pad}>
          <Copy>{selected.reasons.join(', ')}</Copy>
          <Copy>{selected.details.join(', ')}</Copy>
          <Copy>{selected.notes}</Copy>
          {selected.feedback ? (
            <>
              <Copy>{'★'.repeat(selected.feedback.rating)}</Copy>
              <Copy>
                {feedbackLabel(feedbackReasons, selected.feedback.reason)}
              </Copy>
              <Copy>
                {feedbackLabel(feedbackDetails, selected.feedback.reasonDetail)}
              </Copy>
              <Copy>{selected.feedback.comment}</Copy>
            </>
          ) : null}
        </View>
        {confirmDelete ? (
          <Confirm
            title={text('deleteMeeting', 'Delete meeting')}
            body={text(
              'deleteMeetingBody',
              'Are you sure you want to delete this meeting?',
            )}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              save(records.filter(record => record.id !== selected.id));
              setConfirmDelete(false);
              setSelectedId(null);
              setView('list');
            }}
            confirmLabel={text('delete', 'Delete')}
            cancelLabel={text('cancel', 'Cancel')}
          />
        ) : null}
      </>,
      selected.status === 'completed' && !selected.feedback ? (
        <Button
          label={text('rateExperience', 'Rate your experience')}
          onPress={resetFeedback}
        />
      ) : undefined,
    );
  return page(
    text('listTitle', 'My appointments'),
    <Copy>{text('noMeetings', 'You have no meetings')}</Copy>,
  );
}

const fidelityStyles = StyleSheet.create({
  s0: {
    height: 280,
    backgroundColor: '#eef1ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s1: { flexWrap: 'wrap' },
  s2: {
    width: '22%',
    height: 48,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
