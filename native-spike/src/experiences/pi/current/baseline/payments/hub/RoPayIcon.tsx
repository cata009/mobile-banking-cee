import React from 'react';
import Svg, { Path } from 'react-native-svg';

/** RoPay mark supplied by the user for the baseline payment sheet. */
export function RoPayIcon({ color = '#262626' }: { color?: string }) {
  return (
    <Svg width={16} height={24} viewBox="0 0 16 24" fill="none">
      <Path
        d="M6.8403 15.2529L12.4177 10.0259C12.4408 10.004 12.4652 9.98449 12.4895 9.96503L14.94 12.0042L10.4527 16.2104L14.5616 20.6697L12.453 22.4254C12.4408 22.4157 12.4287 22.4059 12.4177 22.3962L6.8403 17.1692C6.2575 16.6217 6.2575 15.798 6.8403 15.2529Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
      />
      <Path
        d="M12.8568 5.28784L7.27933 0.0608358C7.25621 0.0389349 7.23188 0.0194674 7.20754 0L4.75708 2.03922L9.24432 6.2454L5.13548 10.7047L7.24405 12.4604C7.25621 12.4506 7.26838 12.4409 7.27933 12.4312L12.8568 7.20417C13.4396 6.65665 13.4396 5.83415 12.8568 5.28784Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
      />
      <Path
        d="M3.67433 20.7682V2.74139L1.08394 4.5032C0.368515 4.98988 -0.0342173 5.74911 0.00228418 6.54241L0.734746 22.1212L3.67433 20.7682Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
      />
    </Svg>
  );
}
