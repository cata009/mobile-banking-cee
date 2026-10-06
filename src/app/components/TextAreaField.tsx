import AutoGrowTextArea from "@/app/components/AutoGrowTextArea";

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  maxLength?: number;
}

export default function TextAreaField({ id, label, value, onChange, helperText, maxLength }: TextAreaFieldProps) {
  return (
    <div className="w-full" data-component="TextAreaField">
      <label htmlFor={id} className="block uc-type-n5 text-[var(--uc-text-muted)]">
        {label}
      </label>
      <AutoGrowTextArea
        id={id}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        ariaLabel={label}
        className="mt-[4px] block w-full resize-none border-0 border-b border-[var(--uc-text-subtle)] bg-transparent px-0 pb-[3px] uc-type-p1 text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
      />
      {helperText ? <p className="mt-[6px] uc-type-p2 text-[var(--uc-text-muted)]">{helperText}</p> : null}
    </div>
  );
}
