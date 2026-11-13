import React from 'react';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { sourceColor } from '../../../../../universal/sourceColor';

/** Source-specific spacing/tone composed through the existing shared divider. */
export function OnboardingSectionDivider({
  softRule = false,
  ...props
}: React.ComponentProps<typeof BaselineSectionDivider> & {
  softRule?: boolean;
}) {
  return (
    <BaselineSectionDivider
      {...props}
      headingStyle={{ color: sourceColor('var(--uc-text)'), lineHeight: 15 }}
      lineStyle={{
        marginTop: props.ruleOnly ? 0 : 4,
        backgroundColor: sourceColor(
          softRule ? 'var(--uc-border-muted)' : 'var(--uc-text-muted)',
        ),
      }}
    />
  );
}
