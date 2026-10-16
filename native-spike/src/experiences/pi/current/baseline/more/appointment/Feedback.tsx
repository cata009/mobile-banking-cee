import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { TextInput } from '../../../../../../universal/Typography';
import { Copy, useColors, useAutoGrow, webInputOutline } from './Ui';

export const feedbackReasons = [
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
] as const;
export const feedbackDetails = [
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
] as const;
function FeedbackReason({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  const color = useColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={styles.reason}
    >
      <View style={[styles.radio, { backgroundColor: color('--uc-surface') }]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <Copy size={18} style={styles.reasonLabel}>
        {label}
      </Copy>
    </Pressable>
  );
}
export function FeedbackForm({
  rating,
  comment,
  reason,
  detail,
  onRating,
  onComment,
  onReason,
  onDetail,
  text,
}: {
  rating: number;
  comment: string;
  reason: string;
  detail: string;
  onRating: (value: number) => void;
  onComment: (value: string) => void;
  onReason: (value: string) => void;
  onDetail: (value: string) => void;
  text: (key: string, fallback: string) => string;
}) {
  const color = useColors(),
    grow = useAutoGrow(comment, 23);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.form}>
      <Copy size={18}>
        {text(
          'feedbackIntro',
          'Help us become better and rate the appointment you just had.',
        )}
      </Copy>
      <Copy strong style={styles.prompt}>
        {text('ratePrompt', 'Rate your appointment experience.')}
      </Copy>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={text(
          'ratePrompt',
          'Rate your appointment experience.',
        )}
        style={styles.stars}
      >
        {[1, 2, 3, 4, 5].map(value => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={`${value} ${text('stars', 'stars')}`}
            accessibilityState={{ checked: rating === value }}
            onPress={() => onRating(value)}
            style={styles.star}
          >
            <Svg width={35} height={35} viewBox="0 0 35 35" fill="none">
              <Path
                d="M18.5068 0.5L18.6152 0.852539L21.7383 11.002L29.082 10.9307H29.126C31.113 10.9307 32.8648 12.2434 33.4766 14.168L33.585 14.5088L33.2969 14.7217L24.876 20.9307L27.2148 28.1299C27.8414 30.0632 27.1791 32.1957 25.5674 33.4004L25.2656 33.626L24.9658 33.3984L16.667 27.1006L10.4648 32.5518L10.4521 32.5635L10.4375 32.5732C9.62789 33.1908 8.6684 33.4999 7.70703 33.5C6.76311 33.5 5.81922 33.2017 5.01855 32.6055L4.73242 32.3916L4.8418 32.0508L8.41309 20.9375L2.41016 16.5293C0.788007 15.3378 0.110591 13.2102 0.722656 11.2725L0.833984 10.9199L1.20312 10.9229L11.5488 11.002L13.7725 3.7793V3.77832C14.3718 1.83434 16.1326 0.500044 18.1377 0.5H18.5068Z"
                fill={rating >= value ? '#007A91' : 'none'}
                stroke={rating >= value ? '#007A91' : '#626262'}
              />
            </Svg>
          </Pressable>
        ))}
      </View>
      <View style={styles.comment}>
        <Copy size={14} color={color('--uc-text-muted')}>
          {text('feedbackComment', 'Your comment on the experience.')}
        </Copy>
        <TextInput
          ref={grow.ref}
          accessibilityLabel={text(
            'feedbackComment',
            'Your comment on the experience.',
          )}
          value={comment}
          onChangeText={onComment}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          numberOfLines={1}
          maxLength={500}
          onContentSizeChange={grow.onContentSizeChange}
          style={[
            styles.commentInput,
            webInputOutline,
            {
              height: grow.height,
              color: color('--uc-text'),
              borderBottomColor: color(
                focused ? '--uc-action' : '--uc-text-subtle',
              ),
            },
          ]}
        />
        <Copy size={14} color={color('--uc-text-muted')} style={styles.helper}>
          {text(
            'feedbackHelper',
            'We may send you a more detailed email regarding this (to which you can respond only if you wish) as part of the same effort to measure customer satisfaction.',
          )}
        </Copy>
      </View>
      {rating > 0 && rating <= 2 ? (
        <View style={styles.issues}>
          <Copy strong>
            {text('feedbackIssueTitle', 'What went wrong today?')}
          </Copy>
          <View accessibilityRole="radiogroup" style={styles.issueOptions}>
            {feedbackReasons.map(item => (
              <View key={item.value}>
                <FeedbackReason
                  selected={reason === item.value}
                  label={text(item.key, item.label)}
                  onPress={() => onReason(item.value)}
                />
                {item.value === 'organizedMeeting' && reason === item.value ? (
                  <View
                    accessibilityRole="radiogroup"
                    accessibilityLabel={text(
                      'feedbackIssueMeeting',
                      'Organized meeting issue',
                    )}
                    style={[
                      styles.details,
                      { borderLeftColor: color('--uc-border-muted') },
                    ]}
                  >
                    {feedbackDetails.map(option => (
                      <FeedbackReason
                        key={option.value}
                        selected={detail === option.value}
                        label={text(option.key, option.label)}
                        onPress={() => onDetail(option.value)}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  form: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 },
  prompt: { marginBottom: 16, marginTop: 24 },
  stars: { flexDirection: 'row', gap: 8 },
  star: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comment: { marginTop: 24 },
  commentInput: {
    outlineWidth: 0,
    marginTop: 4,
    paddingHorizontal: 0,
    paddingBottom: 3,
    paddingTop: 0,
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    borderBottomWidth: 1,
  },
  helper: { marginTop: 6 },
  issues: { marginTop: 28 },
  issueOptions: { marginTop: 14 },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 48,
    paddingVertical: 8,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#007A91',
  },
  reasonLabel: { flex: 1, minWidth: 0 },
  details: { marginLeft: 28, borderLeftWidth: 1, paddingLeft: 12 },
});
