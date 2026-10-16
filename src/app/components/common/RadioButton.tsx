import { AppIcon } from "@/app/components/icons";
import type { RadioButtonOptions } from '@/app/components/contracts/radioButton';
import { radioButtonWeb } from '@/app/components/contracts/radioButtonWeb';

interface RadioButtonProps extends RadioButtonOptions {
  onClick: () => void;
  label: string;
  className?: string;
}

export default function RadioButton({ 
  selected, 
  onClick, 
  label,
  className = '',
  variant = 'standard',
}: RadioButtonProps) {
  const web = radioButtonWeb({ selected, variant }, className);
  const Mark = web.markTag;
  return (
    <button
      type="button"
      onClick={onClick}
      className={web.buttonClass}
      aria-label={web.explicitLabel ? label : undefined}
      role="radio"
      aria-checked={selected}
    >
      <Mark className={web.markClass} aria-hidden={web.markHidden}>
        <AppIcon name={web.selectedIcon} color={`var(${web.iconToken})`} />
      </Mark>
      
      <span className={web.labelClass}>
        {label}
      </span>
    </button>
  );
}
