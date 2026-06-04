import { cn } from "@/app/components/ui/utils";

export function typeClass(tokenClassName: string, className?: string) {
  return cn(tokenClassName, className);
}
