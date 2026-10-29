import React from 'react';
import Svg, { Path } from 'react-native-svg';

/** Romanian bill payment icons supplied by the user. */
export function RoBillIcon({
  kind,
  color = '#262626',
}: {
  kind: 'new-bill' | 'direct-debit' | 'scan-paycode';
  color?: string;
}) {
  const first = kind === 'new-bill';
  const d = first
    ? 'M5.6248 4.27051V0.833008C5.6248 0.833008 8.7496 0.833008 8.7496 3.12467V4.27051H10C15.625 4.27051 17.5 5.98926 17.5 11.1455H12.4996C12.4996 9.42676 11.875 8.85384 10 8.85384H2.5V4.27051H5.6248ZM12.4996 16.8707C12.4996 15.1559 14.9998 12.2913 14.9998 12.2913C14.9998 12.2913 17.5 15.1559 17.5 16.8707C17.5 18.0205 16.2496 19.1663 14.9998 19.1663C13.6168 19.1663 12.4996 18.0205 12.4996 16.8707Z'
    : kind === 'direct-debit'
      ? 'M19.5944 6H8V22.875C8 24.6009 9.39911 26 11.125 26H23.625V10.0312L19.5944 6ZM11.125 19.125H20.5V17.875H11.125V19.125ZM20.5 22.25H11.125V21H20.5V22.25ZM11.125 16H16.125V14.75H11.125V16ZM18.625 7.25V11H22.375L18.625 7.25Z'
      : 'M8.49992 24.5H6V9.5H8.49992V24.5ZM9.74988 24.5H10.9998V9.5H9.74988V24.5ZM15.9997 24.5H17.2496V9.5H15.9997V24.5ZM19.7496 24.5H18.4996V9.5H19.7496V24.5ZM20.9996 24.5H22.2495V9.5H20.9996V24.5ZM14.7504 24.5H12.2498V9.5H14.7504V24.5ZM23.4994 24.5H26V9.5H23.4994V24.5Z';
  return (
    <Svg
      width={first ? 20 : 32}
      height={first ? 20 : 32}
      viewBox={first ? '0 0 20 20' : '0 0 32 32'}
      fill="none"
    >
      <Path d={d} fillRule="evenodd" clipRule="evenodd" fill={color} />
    </Svg>
  );
}
