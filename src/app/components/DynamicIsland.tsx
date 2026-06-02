interface DynamicIslandProps {
  variant?: "light" | "dark";
}

export default function DynamicIsland({ variant = "dark" }: DynamicIslandProps) {
  const shellColor = variant === "light" ? "#262626" : "#1F1F1F";
  const sensorColor = variant === "light" ? "#131313" : "#0E0E0E";

  return (
    <div className="pointer-events-none absolute left-1/2 top-[13px] z-[45] -translate-x-1/2">
      <div
        className="relative h-[37px] w-[126px] rounded-[19px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={{ backgroundColor: shellColor }}
      >
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[15px]">
          <div className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: sensorColor }} />
          <div className="h-[6px] w-[8px] rounded-full" style={{ backgroundColor: sensorColor }} />
        </div>
      </div>
    </div>
  );
}
