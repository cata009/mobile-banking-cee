import {
  ICON_REGISTRY,
  resolveDefaultDimensions,
  type IconName,
} from '@/app/components/icons/iconRegistry';

/** Read Source's standard/non-square icon policy; the Native renderer owns no copy of that list. */
export function sourceIconDimensions(name: string) {
  const registeredName = name as IconName;
  const definition = ICON_REGISTRY[registeredName];
  return definition
    ? resolveDefaultDimensions(registeredName, definition)
    : { width: 20, height: 20 };
}
