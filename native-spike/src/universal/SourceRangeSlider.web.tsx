import React, { useState } from 'react';
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
  presentation = 'source',
}: SourceRangeProps) {
  const [focused, setFocused] = useState(false);
  if (presentation === 'feedback') {
    const fraction = Math.max(
      0,
      Math.min(1, (value - min) / Math.max(1, max - min)),
    );
    return (
      <div
        style={{
          height: 24,
          width: '100%',
          position: 'relative',
          outline: focused ? `2px solid ${color}` : undefined,
          outlineOffset: 2,
        }}
      >
        <style>{feedbackRangeCss}</style>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 8,
            height: 8,
            borderRadius: 4,
            border: '1px solid #909090',
            background: '#e5e5e5',
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 8,
            height: 8,
            width: `calc((100% - 24px) * ${fraction} + 1px)`,
            borderRadius: 4,
            background: color,
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: `calc((100% - 24px) * ${fraction})`,
            top: 0,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: color,
            pointerEvents: 'none',
          }}
        />
        <input
          className="source-feedback-range"
          aria-label={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={event => onChange(Number(event.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: 24,
            margin: 0,
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </div>
    );
  }
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

const feedbackRangeCss = `.source-feedback-range{-webkit-appearance:none;appearance:none;background:transparent}.source-feedback-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:24px;height:24px;border:0}.source-feedback-range::-moz-range-thumb{width:24px;height:24px;border:0}`;

const exactSourceStyles: Record<string, React.CSSProperties> = {
  inline1: { height: 20, width: '100%', cursor: 'pointer', margin: 0 },
};
