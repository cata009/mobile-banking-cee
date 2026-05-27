import { AppIcon } from "@/app/components/icons";

// Chevron icon component - exact dimensions from Figma
export default function ChevronIcon() {
  return (
    <div className="w-[32px] h-[32px] flex items-center justify-center shrink-0">
      <AppIcon name="chevron-right" color="var(--uc-static-white)" />
    </div>
  );
}
