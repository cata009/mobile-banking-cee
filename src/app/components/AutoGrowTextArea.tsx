import { useLayoutEffect, useRef } from "react";

interface AutoGrowTextAreaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  className?: string;
  ariaLabel?: string;
}

export default function AutoGrowTextArea({
  id,
  value,
  onChange,
  maxLength,
  className = "",
  ariaLabel,
}: AutoGrowTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      id={id}
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      maxLength={maxLength}
      rows={1}
      className={className}
      style={{ overflowY: "hidden" }}
    />
  );
}
