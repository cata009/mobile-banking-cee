/**
 * RO Teens theme picker — a compact bottom sheet over the shared HU theme engine.
 * Applying is live so teens can try looks instantly. (Engine reused, not edited.)
 */
import { BottomSheet } from "@/app/components/BottomSheet";
import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import { HU_THEME_PRESETS, type HuThemeId } from "../../hu/theme";

export function RoThemeSheet({
  appliedThemeId,
  onApply,
  onClose,
}: {
  appliedThemeId: HuThemeId;
  onApply: (themeId: HuThemeId) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet title="Personalizează aspectul" onClose={onClose}>
      <p className="mb-[14px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
        Alege o temă. Se aplică instant — poți schimba oricând.
      </p>
      <div className="grid grid-cols-2 gap-[12px] pb-[8px]">
        {HU_THEME_PRESETS.map((preset) => {
          const active = preset.id === appliedThemeId;
          return (
            <button
              key={preset.id}
              type="button"
              aria-label={`Temă ${preset.name}`}
              aria-pressed={active}
              className={cn(
                "flex flex-col gap-[10px] rounded-[16px] border p-[10px] text-left transition",
                active
                  ? "border-[var(--hu-theme-accent-strong)] ring-2 ring-[color-mix(in_srgb,var(--hu-theme-accent-strong)_28%,transparent)]"
                  : "border-[var(--uc-border-muted)]",
              )}
              onClick={() => onApply(preset.id)}
            >
              <span
                className="relative h-[72px] w-full overflow-hidden rounded-[12px]"
                style={{ background: preset.swatchBackground }}
              >
                {active ? (
                  <span className="absolute right-[6px] top-[6px] grid size-[22px] place-items-center rounded-full bg-[var(--uc-static-white)] text-[var(--uc-green-success)] shadow">
                    <AppIcon name="check" size={14} />
                  </span>
                ) : null}
              </span>
              <span className="flex flex-col">
                <span className="text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{preset.name}</span>
                <span className="text-[12px] leading-[15px] text-[var(--uc-text-muted)]">{preset.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
