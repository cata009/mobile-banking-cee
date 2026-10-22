import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  addAppointmentDays,
  formatAppointmentDate,
  formatAppointmentDateShort,
  fromAppointmentDateKey,
  isAppointmentWeekend,
  toAppointmentDateKey,
  type AppointmentDraft,
  type AppointmentRecord,
} from '@/app/screens/appointments/appointmentModel';
import { isPastAppointment } from '@/features/profile/evoAppointments';
import { MeetingIcon } from '../../../profile/AppointmentFields';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { TextInput } from '../../../../../../universal/Typography';
import { serviceDark } from '../ServicePrimitives';
import { SlotExpansion } from './SlotExpansion';
import {
  AppointmentPage,
  Button,
  Copy,
  Link,
  ReviewSection,
  ReviewValue,
  s,
  useAppointmentHost,
  useAppointmentAdvisorPhoto,
  useColors,
  webInputOutline,
} from './Ui';

type TextFn = (key: string, fallback: string) => string;
const transparentColor = 'transparent',
  white = '#ffffff',
  waitingColor = '#ef7a00',
  confirmedColor = '#43854f';
const dateBlock: TextStyle & { whiteSpace?: 'nowrap' } =
  Platform.OS === 'web'
    ? { width: 28, textAlign: 'center', whiteSpace: 'nowrap' }
    : {};
export function MeetingChoice({
  selected,
  type,
  title,
  description,
  detail,
  onPress,
}: {
  selected: boolean;
  type: 'branch' | 'online';
  title: string;
  description: string;
  detail?: string;
  onPress: () => void;
}) {
  const color = useColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={styles.meetingChoice}
    >
      <View style={styles.meetingIcon}>
        <MeetingIcon type={type} />
      </View>
      <View style={styles.grow}>
        <Copy strong size={14}>
          {title.toUpperCase()}
        </Copy>
        <Copy size={14} style={styles.mt3}>
          {description}
        </Copy>
        {detail ? (
          <Copy size={14} style={s.mt2}>
            {detail}
          </Copy>
        ) : null}
      </View>
      <SourceCustomIcon
        name={selected ? 'radio-selected' : 'radio-unselected'}
        size={24}
        color={color(selected ? '--uc-action' : '--uc-text')}
        variables={{
          '--uc-surface': color('--uc-surface'),
          '--uc-action': color('--uc-action'),
        }}
      />
    </Pressable>
  );
}
export function MeetingTabs({
  active,
  onChange,
  text,
}: {
  active: 'active' | 'past';
  onChange: (tab: 'active' | 'past') => void;
  text: TextFn;
}) {
  const color = useColors();
  return (
    <View style={[styles.tabs, { borderBottomColor: color('--uc-border') }]}>
      {(['active', 'past'] as const).map(tab => (
        <Pressable
          key={tab}
          accessibilityRole="button"
          accessibilityLabel={
            tab === 'active'
              ? text('activeMeetings', 'Active meetings')
              : text('pastMeetings', 'Past meetings')
          }
          accessibilityState={{ selected: active === tab }}
          onPress={() => onChange(tab)}
          style={[
            styles.tab,
            {
              borderBottomColor:
                active === tab ? color('--uc-text') : transparentColor,
            },
          ]}
        >
          <Copy
            strong
            color={color(active === tab ? '--uc-text' : '--uc-text-muted')}
          >
            {tab === 'active'
              ? text('activeMeetings', 'Active meetings')
              : text('pastMeetings', 'Past meetings')}
          </Copy>
        </Pressable>
      ))}
    </View>
  );
}
export function AppointmentListRow({
  record,
  locale,
  onPress,
}: {
  record: AppointmentRecord;
  locale: string;
  onPress: () => void;
}) {
  const date = formatAppointmentDateShort(record.appointmentDate, locale),
    color = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open appointment ${record.id}`}
      onPress={onPress}
      style={styles.listRow}
    >
      <View style={styles.listDate}>
        <Copy strong>{date.day}</Copy>
        <Copy
          color={color('--uc-text-muted')}
          style={[styles.inheritedN6, dateBlock]}
        >
          {date.month}
        </Copy>
      </View>
      <View style={styles.meetingIcon}>
        <MeetingIcon type={record.meetingType} />
      </View>
      <View style={styles.listCopy}>
        <Copy size={14} style={styles.listText}>
          {record.meetingType === 'branch'
            ? 'Branch Meeting'
            : 'Online Meeting'}
          {' - '}
          {record.selectedTime}
        </Copy>
        <Copy strong numberOfLines={1} style={[s.mt2, styles.listText]}>
          {record.reasons.join(', ')}
        </Copy>
        <Copy
          numberOfLines={1}
          color={color('--uc-text-muted')}
          style={[s.mt2, styles.inheritedN6, styles.listText]}
        >
          {record.advisorName.toUpperCase()}
        </Copy>
      </View>
    </Pressable>
  );
}
export function SlotDateBar({
  date,
  locale,
  onCalendar,
  onShift,
  text,
}: {
  date: string;
  locale: string;
  onCalendar: () => void;
  onShift: (offset: number) => void;
  text: TextFn;
}) {
  const color = useColors();
  let previous = addAppointmentDays(fromAppointmentDateKey(date), -1);
  while (isAppointmentWeekend(previous))
    previous = addAppointmentDays(previous, -1);
  return (
    <View style={styles.dateBar}>
      {toAppointmentDateKey(previous) >= toAppointmentDateKey(new Date()) ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={text('previousDay', 'Previous day')}
          onPress={() => onShift(-1)}
          style={styles.dateAction}
        >
          <SourceCustomIcon
            name="chevron-left"
            size={24}
            color={color('--uc-text')}
          />
        </Pressable>
      ) : (
        <View style={styles.dateAction} />
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select appointment date"
        onPress={onCalendar}
        style={styles.dateValue}
      >
        <Copy strong>
          {new Intl.DateTimeFormat(locale, {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
          }).format(fromAppointmentDateKey(date))}
        </Copy>
        <SourceCustomIcon
          name="chevron-down"
          size={20}
          color={color('--uc-text')}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={text('nextDay', 'Next day')}
        onPress={() => onShift(1)}
        style={styles.dateAction}
      >
        <SourceCustomIcon
          name="chevron-right"
          size={24}
          color={color('--uc-text')}
        />
      </Pressable>
    </View>
  );
}
export function Slots({
  draft,
  slotDate,
  slots,
  directSlots,
  locale,
  advisor,
  advisorPhone,
  more,
  onMore,
  onSelect,
  text,
}: {
  draft: AppointmentDraft;
  slotDate: string;
  slots: readonly string[];
  directSlots: readonly string[];
  locale: string;
  advisor: string;
  advisorPhone: string;
  more: boolean;
  onMore: () => void;
  onSelect: (time: string) => void;
  text: TextFn;
}) {
  const color = useColors();
  const advisorPhoto = useAppointmentAdvisorPhoto();
  const renderRows = (times: readonly string[], disabled = false) =>
    Array.from({ length: Math.ceil(times.length / 4) }, (_row, row) => (
      <View key={row} style={styles.slotRow}>
        {Array.from({ length: 4 }, (_column, column) => {
          const time = times[row * 4 + column];
          if (!time) return <View key={column} style={styles.emptySlot} />;
          const selected =
            draft.selectedTime === time && draft.selectedSlotDate === slotDate;
          return (
            <Pressable
              key={time}
              accessibilityRole="button"
              accessibilityLabel={time}
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onSelect(time)}
              style={[
                styles.slot,
                {
                  borderColor: selected
                    ? color('--uc-action-strong')
                    : color('--uc-text'),
                  backgroundColor: selected
                    ? color('--uc-action-strong')
                    : white,
                },
              ]}
            >
              <Copy strong color={selected ? '#ffffff' : color('--uc-text')}>
                {time}
              </Copy>
            </Pressable>
          );
        })}
      </View>
    ));
  return (
    <View style={styles.slots}>
      {!directSlots.length ? (
        <View style={[styles.noSlots, { borderColor: color('--uc-border') }]}>
          <View style={styles.noSlotsRow}>
            <SourceCustomIcon
              name="info-circle"
              width={10}
              height={24}
              color={color('--uc-text')}
            />
            <View style={styles.grow}>
              <Copy strong>
                {text('noSlotsTitle', 'No available time slots for')}{' '}
                {formatAppointmentDate(draft.appointmentDate, locale)}
              </Copy>
              <Copy size={14} color={color('--uc-text-muted')} style={s.mt4}>
                {text(
                  'noSlotsBody',
                  'Here are the first available time slots for your advisor. If the date does not work for you, feel free to pick a different date.',
                )}
              </Copy>
              <Copy
                size={14}
                color={color('--uc-text-muted')}
                style={styles.mt16}
              >
                {text(
                  'phoneHelp',
                  'If you need to get in touch, you can call the Infoline service',
                )}
              </Copy>
              <Link
                label={advisorPhone}
                size={16}
                href={`tel:${advisorPhone.replace(/[^+\d]/g, '')}`}
                style={s.mt8}
              />
            </View>
          </View>
        </View>
      ) : null}
      <Copy
        size={18}
        style={[
          styles.slotInstruction,
          directSlots.length ? undefined : styles.instructionAfterAlert,
        ]}
      >
        {text(
          'slotInstruction',
          'Just tap on one of the available time slots from your advisor to pick a time that works for you!',
        )}
      </Copy>
      <Copy strong style={styles.mb8}>
        {text('availableSlots', 'Available slots')} (
        {new Intl.DateTimeFormat(locale, {
          day: '2-digit',
          month: 'long',
        }).format(fromAppointmentDateKey(slotDate))}
        )
      </Copy>
      <View
        style={[
          styles.divider,
          { backgroundColor: color('--uc-border-muted') },
        ]}
      />
      <View style={styles.slotCard}>
        <View style={styles.advisor}>
          <Image
            source={advisorPhoto}
            accessibilityLabel={advisor}
            style={styles.advisorPhoto}
          />
          <View>
            <Copy strong size={14}>
              YOUR ADVISOR
            </Copy>
            <Copy size={14} style={s.mt2}>
              {advisor}
            </Copy>
          </View>
        </View>
        <View
          style={[
            styles.cardDivider,
            { backgroundColor: color('--uc-border-muted') },
          ]}
        />
        <Copy size={14} style={styles.mb12}>
          {text('selectSlot', 'Select from available slots')}
        </Copy>
        <View style={styles.slotGrid}>{renderRows(slots.slice(0, 8))}</View>
        {slots.length > 8 ? (
          <SlotExpansion expanded={more}>
            <View style={styles.slotGrid}>
              {renderRows(slots.slice(8), !more)}
            </View>
          </SlotExpansion>
        ) : null}
        {slots.length > 8 ? (
          <Link
            uppercase
            label={
              more
                ? text('seeLess', 'See less slots')
                : text('seeMore', 'See more slots')
            }
            onPress={onMore}
            expanded={more}
            style={styles.more}
          />
        ) : null}
      </View>
    </View>
  );
}
export function AppointmentReview({
  draft,
  slotDate,
  locale,
  onEmail,
  onMap,
  text,
}: {
  draft: AppointmentDraft;
  slotDate: string;
  locale: string;
  onEmail: (email: string) => void;
  onMap: () => void;
  text: TextFn;
}) {
  const color = useColors();
  const [emailFocused, setEmailFocused] = useState(false);
  return (
    <View style={s.review}>
      <Copy size={14} color={color('--uc-text-muted')}>
        {text(
          'reviewIntro',
          'Review the details of the appointment before confirming',
        )}
      </Copy>
      <ReviewSection title={text('reasonSection', 'Appointment reason')}>
        <ReviewValue
          label={text('category', 'Category')}
          value={draft.reasons.join(', ')}
        />
        {draft.details.length ? (
          <ReviewValue
            label={text('subcategory', 'Subcategory')}
            value={draft.details.join(', ')}
          />
        ) : null}
        {draft.notes.trim() ? (
          <ReviewValue
            label={text('reviewNotes', 'Additional notes')}
            value={draft.notes.trim()}
          />
        ) : null}
      </ReviewSection>
      <ReviewSection title={text('locationSection', 'Appointment location')}>
        <ReviewValue
          label={text('meetingType', 'Type of meeting')}
          value={
            draft.meetingType === 'branch'
              ? text('branchMeeting', 'Branch Meeting')
              : text('onlineMeeting', 'Online Meeting')
          }
        />
        {draft.meetingType === 'branch' ? (
          <>
            <ReviewValue
              label={text('branchName', 'Branch name')}
              value={draft.branchName}
            />
            <ReviewValue label={text('branchAddress', 'Branch address')}>
              <Copy strong style={s.mt2}>
                {draft.branchAddress}
              </Copy>
              <Link
                uppercase
                label={text('seeLocation', 'See location on the map')}
                onPress={onMap}
                style={[s.mt8, styles.inlineMapLink]}
              />
            </ReviewValue>
          </>
        ) : (
          <>
            <ReviewValue
              label={text('onlinePlatform', 'Online platform')}
              value="Microsoft Teams"
            />
            <ReviewValue
              label={text(
                'invitationAddress',
                'Your address where we send the invitation',
              )}
              value={draft.email}
            />
          </>
        )}
        <ReviewValue
          label={text('requestedSlot', 'Requested slot')}
          value={`${formatAppointmentDate(
            draft.selectedSlotDate || slotDate,
            locale,
          )} - ${draft.selectedTime}`}
        />
      </ReviewSection>
      <ReviewSection
        title={text('deliverySection', 'Appointment confirmation delivery')}
      >
        <ReviewValue label={text('emailAddress', 'Your email address')}>
          <TextInput
            accessibilityLabel={text('emailAddress', 'Your email address')}
            keyboardType="email-address"
            autoCapitalize="none"
            value={draft.email}
            placeholder="name@example.com"
            onChangeText={onEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            style={[
              styles.email,
              webInputOutline,
              {
                borderBottomColor: color(
                  emailFocused ? '--uc-action' : '--uc-border',
                ),
                color: color('--uc-text'),
              },
            ]}
          />
          <Copy size={14} color={color('--uc-text-muted')} style={s.mt6}>
            {text(
              'emailHelper',
              'You will receive an invitation on your email address for the meeting',
            )}
          </Copy>
        </ReviewValue>
      </ReviewSection>
    </View>
  );
}
export function MeetingDetail({
  record,
  locale,
  onBack,
  onMap,
  onDelete,
  onFeedback,
  text,
  feedbackLabel,
  overlay,
}: {
  record: AppointmentRecord;
  locale: string;
  onBack: () => void;
  onMap: () => void;
  onDelete: () => void;
  onFeedback: () => void;
  text: TextFn;
  feedbackLabel: (value: string, detail?: boolean) => string;
  overlay?: React.ReactNode;
}) {
  const color = useColors(),
    advisorPhoto = useAppointmentAdvisorPhoto(),
    past = isPastAppointment(record),
    waiting = record.status === 'pending' && !past;
  const meetingType =
    record.meetingType === 'branch' ? 'BRANCH MEETING' : 'ONLINE MEETING';
  const status =
    record.status === 'cancelled'
      ? text('cancelled', 'Cancelled')
      : past
      ? meetingType
      : `${
          record.status === 'confirmed'
            ? text('confirmed', 'CONFIRMED')
            : text('waiting', 'WAITING FOR CONFIRMATION')
        } - ${meetingType}`;
  return (
    <AppointmentPage
      title=""
      showLargeTitle={false}
      headerVariant="gray"
      onBack={onBack}
      overlays={overlay}
      footer={
        record.status === 'completed' && !record.feedback ? (
          <Button
            label={text('rateExperience', 'Rate your experience')}
            onPress={onFeedback}
          />
        ) : undefined
      }
    >
      <View
        style={[styles.detailHero, { backgroundColor: color('--uc-app-bg') }]}
      >
        <Image
          source={advisorPhoto}
          accessibilityLabel={record.advisorName}
          style={styles.detailPhoto}
        />
        <Copy strong size={18} style={styles.detailName}>
          {record.advisorName}
        </Copy>
        <View
          style={[
            styles.status,
            { backgroundColor: waiting ? waitingColor : confirmedColor },
          ]}
        >
          <Copy strong size={12} color="#ffffff" style={styles.statusLabel}>
            {status.toUpperCase()}
          </Copy>
        </View>
        <Copy size={14} style={styles.detailDate}>
          {formatAppointmentDate(record.appointmentDate, locale)}
          {' - '}
          {record.selectedTime}
        </Copy>
        {!past ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={text('deleteMeeting', 'Delete meeting')}
            onPress={onDelete}
            style={styles.delete}
          >
            <SourceCustomIcon
              name="trash-2"
              size={24}
              color={color('--uc-text')}
            />
            <Copy size={14} style={styles.deleteCopy}>
              {text('deleteMeeting', 'Delete meeting')}
            </Copy>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.detailBody}>
        <Copy strong size={18}>
          {text('meetingDetails', 'Meeting details')}
        </Copy>
        <View style={styles.detailFields}>
          {record.meetingType === 'branch' ? (
            <>
              <ReviewValue
                label={text('branchName', 'Branch name')}
                value={record.branchName}
              />
              <ReviewValue label={text('branchAddress', 'Branch address')}>
                <Copy strong style={s.mt2}>
                  {record.branchAddress}
                </Copy>
                <Link
                  uppercase
                  label={text('seeLocation', 'See location on the map')}
                  onPress={onMap}
                  style={[s.mt8, styles.inlineMapLink]}
                />
              </ReviewValue>
            </>
          ) : (
            <ReviewValue
              label={text('onlinePlatform', 'Platform meeting')}
              value="Microsoft Teams"
            />
          )}
          <ReviewValue
            label={text(
              'invitationAddress',
              'Your address where we send the invitation',
            )}
            value={
              record.email || text('noClientEmail', 'No client email provided')
            }
          />
        </View>
        <Copy strong size={18} style={styles.detailReasonTitle}>
          {text('reasonSection', 'Appointment reason')}
        </Copy>
        <View style={styles.detailReasonFields}>
          <ReviewValue
            label={text('category', 'Category')}
            value={record.reasons.join(', ')}
          />
          {record.details.length ? (
            <ReviewValue
              label={text('subcategory', 'Subcategory')}
              value={record.details.join(', ')}
            />
          ) : null}
          {record.notes ? (
            <ReviewValue
              label={text('additionalNotes', 'Additional notes')}
              value={record.notes}
            />
          ) : null}
          {record.feedback ? (
            <ReviewValue
              label={text('yourRating', 'Your rating')}
              value={`${'★'.repeat(record.feedback.rating)}${'☆'.repeat(
                5 - record.feedback.rating,
              )}`}
            />
          ) : null}
          {record.feedback?.reason ? (
            <ReviewValue
              label={text('feedbackIssueTitle', 'What went wrong today?')}
              value={feedbackLabel(record.feedback.reason)}
            />
          ) : null}
          {record.feedback?.reasonDetail ? (
            <ReviewValue
              label={text('feedbackIssueDetail', 'Meeting issue')}
              value={feedbackLabel(record.feedback.reasonDetail, true)}
            />
          ) : null}
          {record.feedback?.comment ? (
            <ReviewValue
              label={text('feedbackComment', 'Your comment on the experience')}
              value={record.feedback.comment}
            />
          ) : null}
        </View>
      </View>
    </AppointmentPage>
  );
}
export function DeleteMeeting({
  onCancel,
  onConfirm,
  text,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  text: TextFn;
}) {
  const color = useColors();
  return (
    <View style={styles.deleteOverlay}>
      <View
        role="alertdialog"
        aria-modal
        accessibilityViewIsModal
        style={styles.deleteDialog}
      >
        <View style={styles.deleteDialogCopy}>
          <Copy strong style={styles.center}>
            {text(
              'deleteConfirmTitle',
              'Are you sure you want to delete the meeting?',
            )}
          </Copy>
          <Copy style={[s.mt8, styles.center, styles.inheritedN6]}>
            {text('deleteConfirmBody', 'You will have to reschedule a new one')}
          </Copy>
        </View>
        <View
          style={[
            styles.deleteActions,
            { borderTopColor: color('--uc-border-muted') },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={text('ok', 'OK')}
            onPress={onConfirm}
            style={[
              styles.deleteAction,
              styles.deleteConfirm,
              {
                borderRightColor: color('--uc-border-muted'),
              },
            ]}
          >
            <Copy color="#1685d9">{text('ok', 'OK')}</Copy>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={text('cancel', 'Cancel')}
            onPress={onCancel}
            style={styles.deleteAction}
          >
            <Copy color="#1685d9">{text('cancel', 'Cancel')}</Copy>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const mapBackground: ViewStyle & { backgroundImage?: string } =
  Platform.OS === 'web'
    ? {
        backgroundImage:
          'linear-gradient(28deg, transparent 47%, #fff 47.5%, #fff 49%, transparent 49.5%), linear-gradient(104deg, transparent 38%, #fff 38.5%, #fff 40%, transparent 40.5%), linear-gradient(160deg, transparent 70%, #fff 70.5%, #fff 72%, transparent 72.5%), linear-gradient(8deg, transparent 22%, #e6ece7 22.5%, #e6ece7 26%, transparent 26.5%), repeating-linear-gradient(0deg, transparent 0 54px, rgb(219 225 221 / 55%) 55px 57px), repeating-linear-gradient(90deg, transparent 0 72px, rgb(219 225 221 / 45%) 73px 75px)',
      }
    : {};
export function AppointmentMap({
  branch,
  address,
  readOnly,
  onBack,
  onDone,
}: {
  branch: string;
  address: string;
  readOnly: boolean;
  onBack: () => void;
  onDone: () => void;
}) {
  const host = useAppointmentHost(),
    color = useColors();
  return (
    <View style={[s.root, { backgroundColor: color('--uc-surface') }]}>
      <View style={styles.mapHeader}>
        <BaselinePageHeader
          title=""
          onBack={onBack}
          showHelp={false}
          includeSafeArea
          renderLargeTitle={false}
          safeAreaReserve={host.screenTopInset}
          dark={serviceDark(host)}
        />
      </View>
      <View
        accessibilityLabel="Map preview"
        style={[styles.map, mapBackground]}
      >
        {Platform.OS !== 'web' ? (
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 375 600"
            preserveAspectRatio="none"
          >
            <Path
              d="M0 180L375 410 M80 0L210 600 M0 490L375 90"
              stroke="#ffffff"
              strokeWidth={10}
            />
            {Array.from({ length: 12 }, (_, i) => (
              <Path
                key={i}
                d={`M0 ${i * 55}H375 M${i * 73} 0V600`}
                stroke="#dbe1dd"
                strokeWidth={2}
                opacity={0.5}
              />
            ))}
          </Svg>
        ) : null}
        <View
          style={[
            styles.mapPinPrimary,
            { backgroundColor: color('--uc-action-strong') },
          ]}
        >
          <SourceCustomIcon name="landmark" size={22} color="#ffffff" />
        </View>
        <View
          style={[styles.mapPinTop, { backgroundColor: color('--uc-brand') }]}
        >
          <SourceCustomIcon name="landmark" size={18} color="#ffffff" />
        </View>
        <View
          style={[
            styles.mapPinBottom,
            { backgroundColor: color('--uc-brand') },
          ]}
        >
          <SourceCustomIcon name="landmark" size={18} color="#ffffff" />
        </View>
      </View>
      <View
        style={[styles.mapCard, { backgroundColor: color('--uc-surface') }]}
      >
        <View
          style={[styles.mapHandle, { backgroundColor: color('--uc-border') }]}
        />
        <View style={styles.mapBranch}>
          <Copy strong size={18} style={styles.grow}>
            {branch}
          </Copy>
          <Copy
            strong
            size={14}
            color={color('--uc-text-muted')}
            style={styles.mapOpen}
          >
            OPEN
          </Copy>
        </View>
        <Copy size={14} color={color('--uc-text-muted')}>
          {address}
        </Copy>
        <Copy strong style={styles.mt12}>
          60m
        </Copy>
        <View style={styles.mt24}>
          <Button
            label={readOnly ? 'Close map' : 'Take me there'}
            onPress={onDone}
          />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  grow: { flex: 1, minWidth: 0 },
  deleteConfirm: { borderRightWidth: 1 },
  inheritedN6: { fontWeight: '500', lineHeight: 24 },
  mt3: { marginTop: 3 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  center: { textAlign: 'center' },
  meetingChoice: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  meetingIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: {
    flex: 1,
    height: 48,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRow: {
    minHeight: 80,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listDate: { width: 28, alignItems: 'center' },
  listCopy: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  listText: { width: '100%', textAlign: 'right' },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  dateAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateValue: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slots: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  slotInstruction: { marginBottom: 28, marginTop: 18 },
  instructionAfterAlert: { marginTop: 0 },
  inlineMapLink: { height: 19 },
  divider: { height: 1, marginBottom: 18 },
  slotCard: { padding: 16, borderRadius: 8, backgroundColor: '#f5f5f5' },
  advisor: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  advisorPhoto: { width: 64, height: 64, borderRadius: 32 },
  cardDivider: { marginVertical: 16, height: 1 },
  slotGrid: { gap: 12 },
  slotRow: { flexDirection: 'row', gap: 8 },
  emptySlot: { flex: 1, borderWidth: 1, borderColor: 'transparent' },
  slot: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  more: { marginTop: 18, alignItems: 'center', paddingBottom: 4 },
  noSlots: { marginBottom: 22, borderRadius: 8, borderWidth: 1, padding: 16 },
  noSlotsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  email: {
    borderBottomWidth: 1,
    paddingHorizontal: 0,
    paddingVertical: 4,
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
  },
  detailHero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  detailPhoto: { width: 64, height: 64, borderRadius: 32 },
  detailName: { marginTop: 12, width: '100%', textAlign: 'center' },
  status: {
    marginTop: 12,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusLabel: { lineHeight: 16 },
  detailDate: { marginTop: 10, width: '100%', textAlign: 'center' },
  delete: { marginTop: 24, width: 72, gap: 2, alignItems: 'center' },
  deleteCopy: { width: '100%', textAlign: 'center' },
  detailBody: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  detailFields: { marginTop: 20, gap: 24 },
  detailReasonTitle: { marginBottom: 20, marginTop: 36 },
  detailReasonFields: { gap: 24 },
  deleteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.52)',
    paddingHorizontal: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteDialog: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    boxShadow:
      '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  },
  deleteDialogCopy: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 22,
  },
  deleteActions: { flexDirection: 'row', borderTopWidth: 1 },
  deleteAction: {
    height: 44,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  map: { flex: 1, overflow: 'hidden', backgroundColor: '#f3f4f2' },
  mapPinPrimary: {
    position: 'absolute',
    left: '18%',
    top: '35%',
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow:
      '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  },
  mapPinTop: {
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    position: 'absolute',
    right: '20%',
    top: '23%',
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinBottom: {
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    position: 'absolute',
    right: '30%',
    top: '58%',
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCard: {
    marginTop: -16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 24,
    boxShadow: '0 -8px 24px rgba(0,0,0,0.18)',
  },
  mapHandle: {
    width: 32,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  mapBranch: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  mapOpen: { paddingTop: 4 },
});
