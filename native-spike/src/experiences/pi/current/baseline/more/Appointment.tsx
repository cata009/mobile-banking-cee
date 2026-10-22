import React, { useState } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import {
  addAppointmentDays,
  createAppointmentId,
  formatAppointmentDate,
  fromAppointmentDateKey,
  getAppointmentDateLocale,
  getAppointmentSlots,
  getNextAppointmentDateWithSlots,
  isAppointmentWeekend,
  sortAppointments,
  toAppointmentDateKey,
  type AppointmentDraft,
  type AppointmentRecord,
} from '@/app/screens/appointments/appointmentModel';
import {
  canContinueBooking,
  completeFeedback,
  createAppointmentDraft,
  isPastAppointment,
  validAppointmentEmail,
} from '@/features/profile/evoAppointments';
import type { CurrentScreenProps } from '../../contracts';
import {
  loadAppointments,
  saveAppointments,
} from '../../profile/appointmentStorage';
import {
  AppointmentHost,
  AppointmentPage,
  Button,
  Copy,
  FieldValue,
  Link,
  Notes,
  NotesFooter,
  SectionHeading,
  Success,
  s,
  useFlowBack,
} from './appointment/Ui';
import { CalendarSheet, SelectionSheet } from './appointment/Sheets';
import {
  AppointmentListRow,
  AppointmentMap,
  AppointmentReview,
  DeleteMeeting,
  MeetingChoice,
  MeetingDetail,
  MeetingTabs,
  SlotDateBar,
  Slots,
} from './appointment/MeetingViews';
import {
  FeedbackForm,
  feedbackDetails,
  feedbackReasons,
} from './appointment/Feedback';

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
export interface AppointmentStore {
  load: () => AppointmentRecord[];
  save: (records: AppointmentRecord[]) => void;
}

export default function Appointment(
  host: CurrentScreenProps & {
    appointmentStore?: AppointmentStore;
    advisorPhoto?: ImageSourcePropType;
    clientEmail?: string;
  },
) {
  return (
    <AppointmentHost host={host} advisorPhoto={host.advisorPhoto}>
      <AppointmentFlow host={host} appointmentStore={host.appointmentStore} clientEmail={host.clientEmail} />
    </AppointmentHost>
  );
}
function AppointmentFlow({
  host,
  appointmentStore,
  clientEmail,
}: {
  host: CurrentScreenProps;
  appointmentStore?: AppointmentStore;
  clientEmail?: string;
}) {
  const text = (key: string, fallback: string) =>
      host.t(`appointments.${key}`, fallback),
    locale = getAppointmentDateLocale(host.country, host.language);
  const advisor = host.t('prime.advisor.name', 'David Novak'),
    phone = host.t('prime.advisor.phone', '+420 602 123 456'),
    branch = host.t('prime.advisor.branch', 'UniCredit Branch 34'),
    address = host.t(
      'prime.advisor.address',
      'Želetavská 1525/1, 140 92, Praha 4',
    );
  const loadRecords = () =>
    appointmentStore ? appointmentStore.load() : loadAppointments(host.country);
  const [records, setRecords] = useState(loadRecords);
  const [view, setView] = useState<ViewId>(() =>
    loadRecords().length ? 'list' : 'booking',
  );
  const createDraft = () => ({
    ...createAppointmentDraft(branch, address),
    ...(clientEmail === undefined ? {} : { email: clientEmail }),
  });
  const [draft, setDraft] = useState(createDraft);
  const [tab, setTab] = useState<'active' | 'past'>('active'),
    [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'reason' | 'detail' | null>(null),
    [choices, setChoices] = useState<string[]>([]),
    [calendar, setCalendar] = useState(false),
    [moreSlots, setMoreSlots] = useState(false),
    [confirmDelete, setConfirmDelete] = useState(false);
  const [mapReturn, setMapReturn] = useState<'booking' | 'detail' | 'review'>(
      'booking',
    ),
    [mapReadonly, setMapReadonly] = useState(false);
  const [rating, setRating] = useState(0),
    [comment, setComment] = useState(''),
    [reason, setReason] = useState(''),
    [detail, setDetail] = useState('');
  const selected = records.find(record => record.id === selectedId);
  const update = (changes: Partial<AppointmentDraft>) =>
    setDraft(current => ({ ...current, ...changes }));
  const save = (next: AppointmentRecord[]) => {
    if (appointmentStore) appointmentStore.save(next);
    else saveAppointments(host.country, next);
    setRecords(next);
    host.onChanged();
  };
  const consumeBack = () => {
    if (sheet) {
      setSheet(null);
      return true;
    }
    if (calendar) {
      setCalendar(false);
      return true;
    }
    if (confirmDelete) {
      setConfirmDelete(false);
      return true;
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
    if (!parent[view]) return false;
    setView(parent[view]!);
    return true;
  };
  const back = () => {
    if (!consumeBack()) host.onBack();
  };
  useFlowBack(consumeBack);
  const directSlots = getAppointmentSlots(draft.appointmentDate),
    slotDate = directSlots.length
      ? draft.appointmentDate
      : getNextAppointmentDateWithSlots(draft.appointmentDate),
    slots = getAppointmentSlots(slotDate);
  const openSelection = (kind: 'reason' | 'detail') => {
    setChoices(kind === 'reason' ? draft.reasons : draft.details);
    setSheet(kind);
  };
  const openMap = (returnView: typeof mapReturn, readOnly = false) => {
    setMapReturn(returnView);
    setMapReadonly(readOnly);
    setView('map');
  };
  const resetFeedback = () => {
    setRating(0);
    setComment('');
    setReason('');
    setDetail('');
    setView('feedback');
  };
  const overlays = (
    <>
      {sheet ? (
        <SelectionSheet
          kind={sheet}
          selected={choices}
          onToggle={value =>
            setChoices(current =>
              current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value],
            )
          }
          onClose={() => setSheet(null)}
          onConfirm={() => {
            update(
              sheet === 'reason' ? { reasons: choices } : { details: choices },
            );
            setSheet(null);
          }}
          text={text}
        />
      ) : null}
      {calendar ? (
        <CalendarSheet
          selectedDate={draft.appointmentDate}
          locale={locale}
          onClose={() => setCalendar(false)}
          onConfirm={date =>
            update({
              appointmentDate: date,
              selectedSlotDate: date,
              selectedTime: '',
            })
          }
        />
      ) : null}
    </>
  );
  const page = (
    title: string,
    children: React.ReactNode,
    footer?: React.ReactNode,
    topContent?: React.ReactNode,
  ) => (
    <AppointmentPage
      title={title}
      onBack={back}
      footer={footer}
      topContent={topContent}
      overlays={overlays}
    >
      {children}
    </AppointmentPage>
  );
  if (view === 'map')
    return (
      <AppointmentMap
        branch={selected?.branchName ?? draft.branchName}
        address={selected?.branchAddress ?? draft.branchAddress}
        readOnly={mapReadonly}
        onBack={back}
        onDone={() => setView(mapReturn)}
      />
    );
  if (view === 'booking')
    return page(
      text('bookingTitle', 'Select the location and date of the appointment'),
      <View style={s.form}>
        <SectionHeading>
          {text('reasonSection', 'Appointment reason')}
        </SectionHeading>
        <View style={styles.mb20}>
          <FieldValue
            label={text('reasonPrompt', 'What do you want to talk about?')}
            value={draft.reasons.join(', ')}
            helper={text(
              'reasonHelper',
              'This will help the advisor to be prepared for the meeting',
            )}
            onPress={() => openSelection('reason')}
          />
        </View>
        <View style={s.mb28}>
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
            onPress={() => openSelection('detail')}
          />
        </View>
        <SectionHeading>
          {text('appointmentDetails', 'Appointment details')}
        </SectionHeading>
        <View style={s.mb28}>
          <FieldValue
            label={text('appointmentDate', 'Appointment date')}
            value={formatAppointmentDate(draft.appointmentDate, locale)}
            helper={text(
              'dateHelper',
              'Tell us when you would prefer to discuss',
            )}
            trailingIconName="insurance-calendar"
            onPress={() => setCalendar(true)}
          />
        </View>
        <View style={styles.meetings}>
          <MeetingChoice
            selected={draft.meetingType === 'branch'}
            type="branch"
            title={text('branchMeeting', 'Branch meeting')}
            description={draft.branchName}
            detail={draft.branchAddress}
            onPress={() => update({ meetingType: 'branch' })}
          />
          {draft.meetingType === 'branch' ? (
            <Link
              uppercase
              label={text('seeLocation', 'See location on the map')}
              onPress={() => openMap('booking')}
              style={styles.location}
            />
          ) : null}
          <MeetingChoice
            selected={draft.meetingType === 'online'}
            type="online"
            title={text('onlineMeeting', 'Online meeting')}
            description={text(
              'onlineMeetingDescription',
              'We will send you a link to join an online meeting',
            )}
            onPress={() => update({ meetingType: 'online' })}
          />
        </View>
      </View>,
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
      text('slotsTitle', 'Select available interval'),
      <Slots
        draft={draft}
        slotDate={slotDate}
        slots={slots}
        directSlots={directSlots}
        locale={locale}
        advisor={advisor}
        advisorPhone={phone}
        more={moreSlots}
        onMore={() => setMoreSlots(current => !current)}
        onSelect={time =>
          update({ selectedTime: time, selectedSlotDate: slotDate })
        }
        text={text}
      />,
      <Button
        label={text('continue', 'Continue')}
        disabled={!draft.selectedTime}
        onPress={() => setView('notes')}
      />,
      <SlotDateBar
        date={draft.appointmentDate}
        locale={locale}
        text={text}
        onCalendar={() => setCalendar(true)}
        onShift={days => {
          let date = addAppointmentDays(
            fromAppointmentDateKey(draft.appointmentDate),
            days,
          );
          while (isAppointmentWeekend(date))
            date = addAppointmentDays(date, days);
          const key = toAppointmentDateKey(date);
          if (key >= toAppointmentDateKey(new Date()))
            update({
              appointmentDate: key,
              selectedSlotDate: key,
              selectedTime: '',
            });
        }}
      />,
    );
  if (view === 'notes')
    return page(
      text('notesTitle', 'Do you want to send a specific message?'),
      <Notes
        value={draft.notes}
        onChange={notes => update({ notes })}
        text={text}
      />,
      <NotesFooter
        notes={draft.notes}
        text={text}
        onContinue={() => setView('review')}
        onSkip={() => {
          update({ notes: '' });
          setView('review');
        }}
      />,
    );
  if (view === 'review')
    return page(
      text('reviewTitle', 'Appointment review'),
      <AppointmentReview
        draft={draft}
        slotDate={slotDate}
        locale={locale}
        onEmail={email => update({ email })}
        onMap={() => openMap('review', true)}
        text={text}
      />,
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
    return (
      <Success
        title={text(
          'successTitle',
          'Appointment request was successfully sent',
        )}
        thanks={text(
          'successThanks',
          'Thank you for requesting this appointment with us',
        )}
        paragraphs={[
          text(
            'successConfirmation',
            'Our advisor will confirm this appointment and you will receive an email and/or push notification.',
          ),
          text(
            'successCancel',
            'After the meeting is confirmed, if you cannot make it, you can always cancel the meeting from the app and reschedule a new one.',
          ),
        ]}
        label={text('okGotIt', 'Ok, got it')}
        onDone={() => {
          setTab('active');
          setView('list');
        }}
      />
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
      <View style={styles.list}>
        {filtered.length ? (
          filtered.map(record => (
            <AppointmentListRow
              key={record.id}
              record={record}
              locale={locale}
              onPress={() => {
                setSelectedId(record.id);
                if (record.status === 'completed' && !record.feedback)
                  resetFeedback();
                else setView('detail');
              }}
            />
          ))
        ) : (
          <Copy size={14} color={host.tokens.muted}>
            {text('noMeetings', 'You have no meetings')}
          </Copy>
        )}
      </View>,
      <Button
        label={text('bookAppointment', 'Book an appointment')}
        onPress={() => {
          setDraft(createDraft());
          setView('booking');
        }}
      />,
      <MeetingTabs active={tab} onChange={setTab} text={text} />,
    );
  }
  if (view === 'detail' && selected)
    return (
      <MeetingDetail
        record={selected}
        locale={locale}
        text={text}
        onBack={back}
        onMap={() => openMap('detail', true)}
        onDelete={() => setConfirmDelete(true)}
        onFeedback={resetFeedback}
        feedbackLabel={(value, isDetail) => {
          const item = (isDetail ? feedbackDetails : feedbackReasons).find(
            option => option.value === value,
          );
          return item ? text(item.key, item.label) : value;
        }}
        overlay={
          confirmDelete ? (
            <DeleteMeeting
              text={text}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={() => {
                save(records.filter(record => record.id !== selected.id));
                setConfirmDelete(false);
                setSelectedId(null);
                setView('list');
              }}
            />
          ) : undefined
        }
      />
    );
  if (view === 'feedback' && selected)
    return page(
      text('feedbackTitle', 'Your feedback matters'),
      <FeedbackForm
        rating={rating}
        comment={comment}
        reason={reason}
        detail={detail}
        text={text}
        onComment={setComment}
        onRating={value => {
          setRating(value);
          if (value > 2) {
            setReason('');
            setDetail('');
          }
        }}
        onReason={value => {
          setReason(value);
          if (value !== 'organizedMeeting') setDetail('');
        }}
        onDetail={setDetail}
      />,
      <Button
        label={text('submit', 'Submit')}
        disabled={!completeFeedback(rating, reason, detail)}
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
                      ...(rating <= 2 && detail
                        ? { reasonDetail: detail }
                        : {}),
                    },
                  }
                : record,
            ),
          );
          setView('feedback-success');
        }}
      />,
    );
  if (view === 'feedback-success')
    return (
      <Success
        feedback
        title={text(
          'feedbackSuccessTitle',
          'Your feedback was successfully sent',
        )}
        thanks={text('feedbackThanks', 'Thank you for letting us know')}
        paragraphs={[
          text(
            'feedbackNext',
            'We are collecting all the feedback and we are making it better for your next meeting.',
          ),
        ]}
        label={text('okGotIt', 'Ok, got it')}
        onDone={() => setView('list')}
      />
    );
  return <View style={s.root} />;
}
const styles = StyleSheet.create({
  mb20: { marginBottom: 20 },
  meetings: { gap: 20 },
  location: { marginLeft: 57, marginTop: -12, alignSelf: 'flex-start' },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
});
