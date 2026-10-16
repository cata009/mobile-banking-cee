import React, { useState } from 'react';
import { StyleSheet, Pressable, View, Image } from 'react-native';
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
  sortAppointments,
  toAppointmentDateKey,
  type AppointmentDraft,
  type AppointmentRecord,
} from '@/app/screens/appointments/appointmentModel';
import { CalendarPanel } from '../../../../universal/DateField';
import { FormField } from '../../../../universal/FormField';
import { ModalPanel, Tabs } from '../../../../universal/controls';
import { FieldValue, FormHeading, MeetingIcon } from './AppointmentFields';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { advisorPhoto } from './assets';
import AppointmentSuccess from './AppointmentSuccess';
import type { CurrentScreenProps } from '../contracts';
import {
  Button,
  Confirm,
  Copy,
  Page,
  Row,
  Section,
  s,
  useCurrentTokens,
} from './Primitives';
import { useProfileHost, useProfileTranslation } from './Host';
import { ChoiceSheet } from './ChoiceSheet';
import { toggleChoice } from './requestCall';
import { loadAppointments, saveAppointments } from './appointmentStorage';
import {
  canContinueBooking,
  completeFeedback,
  createAppointmentDraft,
  isPastAppointment,
  validAppointmentEmail,
} from '@/features/profile/evoAppointments';
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

export default function Appointments(props: CurrentScreenProps) {
  const t = useProfileTranslation(),
    tokens = useCurrentTokens(),
    { language } = useProfileHost();
  const text = (key: string, fallback: string) =>
      t(`appointments.${key}`, fallback),
    locale = getAppointmentDateLocale(props.country, language);
  const branch = t('prime.advisor.branch', 'Branch name 36'),
    address = t('prime.advisor.address', 'Želetavská 1525/1, 140 92, Praha 4'),
    advisor = t('prime.advisor.name', 'David Novak');
  const [records, setRecords] = useState(() => loadAppointments(props.country)),
    [view, setView] = useState<ViewId>(() =>
      loadAppointments(props.country).length ? 'list' : 'booking',
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
    saveAppointments(props.country, next);
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
              ? text('reasonSheetTitle', 'What do you want to talk about?')
              : text(
                  'detailSheetTitle',
                  'Give us more details about your request',
                )
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
    fixedTop?: React.ReactNode,
  ) => (
    <Page
      fixedTitle
      title={title}
      onBack={back}
      topInset={props.screenTopInset}
      active={props.isActive}
      footer={footer}
      fixedTop={fixedTop}
      overlay={overlays}
    >
      {children}
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
      <View style={appointmentStyles.form}>
        <FormHeading>{text('reasonSection', 'Appointment reason')}</FormHeading>
        <View style={appointmentStyles.mb20}>
          <FieldValue
            label={text('reasonPrompt', 'What do you want to talk about?')}
            value={draft.reasons.join(', ')}
            helper={text(
              'reasonHelper',
              'This will help the advisor to be prepared for the meeting',
            )}
            onPress={() => open('reason')}
          />
        </View>
        <View style={appointmentStyles.mb28}>
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
        <FormHeading>
          {text('appointmentDetails', 'Appointment details')}
        </FormHeading>
        <View style={appointmentStyles.mb28}>
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
        <View style={appointmentStyles.meetingOptions}>
          {(['branch', 'online'] as const).map(type => (
            <React.Fragment key={type}>
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={
                  type === 'branch'
                    ? text('branchMeeting', 'Branch meeting')
                    : text('onlineMeeting', 'Online meeting')
                }
                accessibilityState={{ selected: draft.meetingType === type }}
                onPress={() => update({ meetingType: type })}
                style={appointmentStyles.meeting}
              >
                <View style={appointmentStyles.meetingIcon}>
                  <MeetingIcon type={type} />
                </View>
                <View style={appointmentStyles.grow}>
                  <Copy strong size={14} lineHeight={15.5}>
                    {(type === 'branch'
                      ? text('branchMeeting', 'Branch meeting')
                      : text('onlineMeeting', 'Online meeting')
                    ).toUpperCase()}
                  </Copy>
                  <View style={appointmentStyles.mt3}>
                    <Copy size={14} lineHeight={15.5}>
                      {type === 'branch'
                        ? draft.branchName
                        : text(
                            'onlineMeetingDescription',
                            'We will send you a link to join an online meeting',
                          )}
                    </Copy>
                  </View>
                  {type === 'branch' ? (
                    <View style={appointmentStyles.mt2}>
                      <Copy size={14} lineHeight={15.5}>
                        {draft.branchAddress}
                      </Copy>
                    </View>
                  ) : null}
                </View>
                <SourceCustomIcon
                  name={
                    draft.meetingType === type
                      ? 'radio-selected'
                      : 'radio-unselected'
                  }
                  size={24}
                  color={
                    draft.meetingType === type ? tokens.accent : tokens.text
                  }
                />
              </Pressable>
              {type === 'branch' && draft.meetingType === 'branch' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={text(
                    'seeLocation',
                    'See location on the map',
                  )}
                  onPress={() => openMap('booking')}
                  style={appointmentStyles.locationLink}
                >
                  <Copy
                    strong
                    size={14}
                    lineHeight={15.5}
                    color={tokens.accent}
                  >
                    {text(
                      'seeLocation',
                      'See location on the map',
                    ).toUpperCase()}
                  </Copy>
                </Pressable>
              ) : null}
            </React.Fragment>
          ))}
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
      text('slotsTitle', 'Select a time slot'),
      <View style={appointmentStyles.slots}>
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
        <View style={appointmentStyles.slotInstruction}>
          <Copy size={18} lineHeight={20}>
            {text(
              'slotInstruction',
              'Just tap on one of the available time slots from your advisor to pick a time that works for you!',
            )}
          </Copy>
        </View>
        <View style={appointmentStyles.mb8}>
          <Copy strong lineHeight={17.5}>
            {text('availableSlots', 'Available slots')} (
            {new Intl.DateTimeFormat(locale, {
              day: '2-digit',
              month: 'long',
            }).format(fromAppointmentDateKey(slotDate))}
            )
          </Copy>
        </View>
        <View
          style={[
            appointmentStyles.slotDivider,
            { backgroundColor: tokens.border },
          ]}
        />
        <View style={appointmentStyles.slotCard}>
          <View style={appointmentStyles.advisor}>
            <Image
              source={advisorPhoto}
              accessibilityLabel={advisor}
              style={appointmentStyles.advisorPhoto}
            />
            <View>
              <Copy strong size={14} lineHeight={15.5}>
                YOUR ADVISOR
              </Copy>
              <View style={appointmentStyles.mt2}>
                <Copy size={14} lineHeight={15.5}>
                  {advisor}
                </Copy>
              </View>
            </View>
          </View>
          <View
            style={[
              appointmentStyles.cardDivider,
              { backgroundColor: tokens.border },
            ]}
          />
          <View style={appointmentStyles.mb12}>
            <Copy size={14} lineHeight={15.5}>
              {text('selectSlot', 'Select from available slots')}
            </Copy>
          </View>
          <View style={appointmentStyles.slotRows}>
            {Array.from(
              {
                length: Math.ceil(
                  (moreSlots ? slots.length : Math.min(8, slots.length)) / 4,
                ),
              },
              (_, row) => (
                <View key={row} style={appointmentStyles.slotRow}>
                  {slots.slice(row * 4, row * 4 + 4).map(slot => {
                    const chosen =
                      draft.selectedTime === slot &&
                      draft.selectedSlotDate === slotDate;
                    return (
                      <Pressable
                        key={slot}
                        accessibilityRole="button"
                        accessibilityLabel={slot}
                        accessibilityState={{ selected: chosen }}
                        onPress={() =>
                          update({
                            selectedTime: slot,
                            selectedSlotDate: slotDate,
                          })
                        }
                        style={[
                          appointmentStyles.slot,
                          {
                            borderColor: chosen ? tokens.accent : tokens.text,
                            backgroundColor: chosen
                              ? tokens.accent
                              : tokens.surface,
                          },
                        ]}
                      >
                        <Copy
                          strong
                          lineHeight={17.5}
                          color={chosen ? '#ffffff' : tokens.text}
                        >
                          {slot}
                        </Copy>
                      </Pressable>
                    );
                  })}
                </View>
              ),
            )}
          </View>
          {slots.length > 8 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                moreSlots
                  ? text('seeLess', 'See less slots')
                  : text('seeMore', 'See more slots')
              }
              accessibilityState={{ expanded: moreSlots }}
              onPress={() => setMoreSlots(current => !current)}
              style={appointmentStyles.moreSlots}
            >
              <Copy strong size={14} lineHeight={15.5} color={tokens.accent}>
                {(moreSlots
                  ? text('seeLess', 'See less slots')
                  : text('seeMore', 'See more slots')
                ).toUpperCase()}
              </Copy>
            </Pressable>
          ) : null}
        </View>
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
    return (
      <AppointmentSuccess
        host={props}
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

const appointmentStyles = StyleSheet.create({
  form: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  mb20: { marginBottom: 20 },
  mb28: { marginBottom: 28 },
  meetingOptions: { gap: 20 },
  meeting: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  meetingIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1, minWidth: 0 },
  mt3: { marginTop: 3 },
  mt2: { marginTop: 2 },
  locationLink: { marginLeft: 57, marginTop: -12 },
  slots: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  slotInstruction: { marginTop: 18, marginBottom: 28 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  slotDivider: { height: 1, marginBottom: 18 },
  slotCard: { borderRadius: 8, backgroundColor: '#f5f5f5', padding: 16 },
  cardDivider: { height: 1, marginVertical: 16 },
  slotRows: { gap: 12 },
  slotRow: { flexDirection: 'row', gap: 8 },
  slot: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreSlots: { marginTop: 18, alignItems: 'center' },
  advisor: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  advisorPhoto: { width: 64, height: 64, borderRadius: 32 },
});
