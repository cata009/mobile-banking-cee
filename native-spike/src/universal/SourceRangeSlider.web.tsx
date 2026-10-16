import React from 'react';
import type { SourceRangeProps } from './SourceRangeSlider';
export { sourceRangeValue } from './sourceRangeValue';
/** RNWeb keeps Source's actual browser range control and its keyboard behavior. */
export function SourceRangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  color,
}: SourceRangeProps) {
  return (
    <input
      aria-label={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={event => onChange(Number(event.target.value))}
      style={{ ...exactSourceStyles.inline1, accentColor: color }}
    />
  );
}

const exactSourceStyles: Record<string, React.CSSProperties> = {
  inline1: { height: 20, width: '100%', cursor: 'pointer', margin: 0 },
};
