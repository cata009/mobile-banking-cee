"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";
import { checkboxWeb } from '../contracts/checkbox';

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  const web = checkboxWeb({ checked: props.checked ?? props.defaultChecked, disabled: props.disabled, invalid: props['aria-invalid'] !== undefined && props['aria-invalid'] !== false && props['aria-invalid'] !== 'false' });
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        web.rootClass,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={web.indicatorClass}
      >
        <CheckIcon className={web.iconClass} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

