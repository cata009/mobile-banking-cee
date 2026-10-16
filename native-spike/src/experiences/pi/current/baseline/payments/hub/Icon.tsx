import React from 'react';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { sourceIconDimensions } from '../../../../../../universal/sourceIconDimensions';

/** Source AppIcon's default dimensions are independent of its layout slot. */
export function PaymentIcon(
  props: React.ComponentProps<typeof SourceCustomIcon>,
) {
  return <SourceCustomIcon {...sourceIconDimensions(props.name)} {...props} />;
}
